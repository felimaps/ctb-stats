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
import { isDemoMode } from '../lib/api'
import { supabase } from '../lib/supabase'

interface AuthContextValue {
  user: UserProfile | null
  loading: boolean
  isDemoMode: boolean
  refreshProfile: () => Promise<void>
  signOut: () => Promise<void>
  setUser: (user: UserProfile | null) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshProfile = useCallback(async () => {
    const userId = await api.getSessionUserId()
    if (!userId) {
      setUser(null)
      return
    }
    const profile = await api.getProfile(userId)
    setUser(profile)
  }, [])

  useEffect(() => {
    refreshProfile().finally(() => setLoading(false))

    if (!isDemoMode && supabase) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(() => {
        refreshProfile()
      })
      return () => subscription.unsubscribe()
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
        isDemoMode,
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
