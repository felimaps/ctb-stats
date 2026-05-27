import { Link, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { Button } from '../ui/Button'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, authError, refreshProfile } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-slate-50">
        <LoadingSpinner />
      </div>
    )
  }

  if (authError) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-ctb-bg px-4">
        <div className="max-w-md w-full rounded-2xl border border-ctb-border bg-white p-6 shadow-md text-center space-y-4">
          <p className="text-lg font-semibold text-ctb-dark">Não foi possível carregar sua conta</p>
          <p className="text-sm text-ctb-muted">{authError}</p>
          <div className="flex flex-col gap-2">
            <Button type="button" onClick={() => refreshProfile()}>
              Tentar novamente
            </Button>
            <Link
              to="/login"
              className="text-sm text-ctb-primary font-semibold hover:underline"
            >
              Voltar ao login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
