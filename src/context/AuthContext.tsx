import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import type { UserProfile } from '../types'
import * as api from '../lib/api'
import { getSupabase, isSupabaseConfigured } from '../lib/supabase'

interface AuthContextValue {
  user: UserProfile | null
  loading: boolean
  isSupabaseConnected: boolean
  refreshProfile: () => Promise<void>
  signOut: () => Promise<void>
  setUser: (user: UserProfile | null) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshProfile = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setUser(null)
      return
    }
    const userId = await api.getSessionUserId()
    if (!userId) {
      setUser(null)
      return
    }
    const profile = await api.getProfile(userId)
    setUser(profile)
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      setUser(null)
      return
    }

    let active = true
    const sb = getSupabase()

    async function initSession() {
      try {
        const {
          data: { session },
        } = await sb.auth.getSession()

        if (!active) return

        if (session?.user) {
          const profile = await api.getProfile(session.user.id)
          if (active) setUser(profile)
        } else {
          setUser(null)
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    initSession()

    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange(async (_event, session) => {
      if (!active) return
      if (session?.user) {
        const profile = await api.getProfile(session.user.id)
        if (active) setUser(profile)
      } else {
        setUser(null)
      }
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [refreshProfile])

  const signOut = async () => {
    await api.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isSupabaseConnected: isSupabaseConfigured,
        refreshProfile,
        signOut,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
