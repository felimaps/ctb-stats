import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { SupabaseConfigGuard } from './components/layout/SupabaseConfigGuard'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { AppLayout } from './components/layout/AppLayout'
import { AuthLayout } from './components/layout/AuthLayout'
import { LoadingSpinner } from './components/ui/LoadingSpinner'
import { Login } from './pages/Login'
import { Cadastro } from './pages/Cadastro'
import { Dashboard } from './pages/Dashboard'
import { Perfil } from './pages/Perfil'
import { NovaPartida } from './pages/NovaPartida'
import { Historico } from './pages/Historico'
import { Estatisticas } from './pages/Estatisticas'
import { Ranking } from './pages/Ranking'
import { Rivalidades } from './pages/Rivalidades'
import { RivalidadeDetalhe } from './pages/RivalidadeDetalhe'
import { Feed } from './pages/Feed'
import { Titulos } from './pages/Titulos'
import { MelhoreSeuJogo } from './pages/MelhoreSeuJogo'

function PublicOnly({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }
  if (user) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <SupabaseConfigGuard>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
          <Route element={<AuthLayout />}>
            <Route
              path="/login"
              element={
                <PublicOnly>
                  <Login />
                </PublicOnly>
              }
            />
            <Route
              path="/cadastro"
              element={
                <PublicOnly>
                  <Cadastro />
                </PublicOnly>
              }
            />
          </Route>

          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/nova-partida" element={<NovaPartida />} />
            <Route path="/historico" element={<Historico />} />
            <Route path="/estatisticas" element={<Estatisticas />} />
            <Route path="/ranking" element={<Ranking />} />
            <Route path="/titulos" element={<Titulos />} />
            <Route path="/rivalidades" element={<Rivalidades />} />
            <Route path="/rivalidades/:adversario" element={<RivalidadeDetalhe />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/melhore-seu-jogo" element={<MelhoreSeuJogo />} />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </SupabaseConfigGuard>
  )
}
