import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react'
import type { UserProfile } from '../types'
import * as api from '../lib/api'
import { getSupabase, isSupabaseConfigured } from '../lib/supabase'

interface AuthContextValue {
  user: UserProfile | null
  loading: boolean
  authError: string | null
  isSupabaseConnected: boolean
  refreshProfile: () => Promise<void>
  signOut: () => Promise<void>
  setUser: (user: UserProfile | null) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const AUTH_LOADING_TIMEOUT_MS = 15_000

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const resolvingRef = useRef(false)

  const resolveSessionUser = useCallback(async (userId: string) => {
    if (resolvingRef.current) return
    resolvingRef.current = true
    try {
      const { profile, error } = await api.loadProfileWithTimeout(userId)
      if (error) {
        console.error('[CTB Auth]', error)
        setAuthError(error)
        setUser(null)
        return
      }
      setAuthError(null)
      setUser(profile)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Erro ao carregar perfil'
      console.error('[CTB Auth]', e)
      setAuthError(message)
      setUser(null)
    } finally {
      resolvingRef.current = false
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setUser(null)
      setAuthError(null)
      return
    }
    const userId = await api.getSessionUserId()
    if (!userId) {
      setUser(null)
      return
    }
    await resolveSessionUser(userId)
  }, [resolveSessionUser])

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      setUser(null)
      setAuthError(null)
      return
    }

    let active = true
    const sb = getSupabase()

    const finishLoading = () => {
      if (active) setLoading(false)
    }

    const safetyTimer = window.setTimeout(() => {
      if (!active) return
      console.warn('[CTB Auth] timeout ao restaurar sessão')
      setAuthError((prev) =>
        prev ?? 'Tempo esgotado ao carregar a sessão. Tente novamente.'
      )
      finishLoading()
    }, AUTH_LOADING_TIMEOUT_MS)

    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange(async (event, session) => {
      if (!active) return

      try {
        if (session?.user) {
          await resolveSessionUser(session.user.id)
        } else if (event === 'SIGNED_OUT' || event === 'INITIAL_SESSION') {
          setUser(null)
          setAuthError(null)
        }
      } catch (e) {
        console.error('[CTB Auth] onAuthStateChange:', event, e)
        setAuthError(
          e instanceof Error ? e.message : 'Erro ao verificar sessão. Tente novamente.'
        )
        setUser(null)
      } finally {
        if (event === 'INITIAL_SESSION' || event === 'SIGNED_OUT') {
          finishLoading()
        }
      }
    })

    sb.auth.getSession().then(({ data: { session }, error }) => {
      if (!active) return
      if (error) console.error('[CTB Auth] getSession:', error.message)
      if (!session) finishLoading()
    })

    return () => {
      active = false
      window.clearTimeout(safetyTimer)
      subscription.unsubscribe()
    }
  }, [resolveSessionUser])

  const signOut = async () => {
    await api.signOut()
    setUser(null)
    setAuthError(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authError,
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
