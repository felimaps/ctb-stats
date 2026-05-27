import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import * as api from '../lib/api'
import { useAuth } from '../context/AuthContext'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/dashboard'

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Preencha e-mail e senha')
      return
    }
    setLoading(true)
    const { user, error: err } = await api.signIn(email, password)
    setLoading(false)
    if (err || !user) {
      setError(err ?? 'Erro ao entrar')
      return
    }
    setUser(user)
    navigate(from, { replace: true })
  }

  return (
    <Card className="w-full max-w-md shadow-md">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-ctb-dark">Bem-vindo de volta</h1>
        <p className="text-sm text-ctb-muted mt-1">Entre para acompanhar suas partidas</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="E-mail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          required
        />
        <Input
          label="Senha"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
        {error && (
          <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}
        <Button type="submit" fullWidth size="lg" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>
      <p className="text-center text-sm text-ctb-muted mt-4">
        Não tem conta?{' '}
        <Link to="/cadastro" className="text-ctb-primary font-semibold hover:underline">
          Cadastre-se
        </Link>
      </p>
    </Card>
  )
}
