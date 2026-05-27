import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import * as api from '../lib/api'
import { useAuth } from '../context/AuthContext'
import type { Nivel, MaoDominante } from '../types'
import { defaultHealthPrivacy } from '../lib/profileUtils'

export function Cadastro() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [cidade, setCidade] = useState('')
  const [nivel, setNivel] = useState<Nivel>('iniciante')
  const [maoDominante, setMaoDominante] = useState<MaoDominante>('direita')
  const [estiloJogo, setEstiloJogo] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setUser } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!nome.trim() || !email || !password || !cidade.trim()) {
      setError('Preencha todos os campos obrigatórios')
      return
    }
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      return
    }
    setLoading(true)
    const { user, error: err } = await api.signUp(email, password, {
      nome: nome.trim(),
      foto_url: null,
      cidade: cidade.trim(),
      nivel,
      mao_dominante: maoDominante,
      estilo_jogo: estiloJogo.trim() || 'Não informado',
      tipo_sanguineo: null,
      alergias: null,
      lesoes_recorrentes: null,
      observacoes_medicas: null,
      contato_emergencia: null,
      telefone_emergencia: null,
      medicacao_continua: null,
      restricoes_fisicas: null,
      ...defaultHealthPrivacy,
    })
    setLoading(false)
    if (err || !user) {
      setError(err ?? 'Erro ao cadastrar')
      return
    }
    setUser(user)
    navigate('/dashboard', { replace: true })
  }

  return (
    <Card className="w-full max-w-md shadow-md">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Criar conta</h1>
        <p className="text-sm text-slate-500 mt-1">Comece a registrar suas partidas</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
        <Input label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
        <Input
          label="E-mail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Senha"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Input label="Cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} required />
        <Select
          label="Nível"
          value={nivel}
          onChange={(e) => setNivel(e.target.value as Nivel)}
          options={[
            { value: 'iniciante', label: 'Iniciante' },
            { value: 'intermediario', label: 'Intermediário' },
            { value: 'avancado', label: 'Avançado' },
          ]}
        />
        <Select
          label="Mão dominante"
          value={maoDominante}
          onChange={(e) => setMaoDominante(e.target.value as MaoDominante)}
          options={[
            { value: 'direita', label: 'Direita' },
            { value: 'esquerda', label: 'Esquerda' },
          ]}
        />
        <Input
          label="Estilo de jogo"
          value={estiloJogo}
          onChange={(e) => setEstiloJogo(e.target.value)}
          placeholder="Ex: jogo de fundo, saque e voleio..."
        />
        {error && (
          <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}
        <Button type="submit" fullWidth size="lg" disabled={loading}>
          {loading ? 'Cadastrando...' : 'Criar conta'}
        </Button>
      </form>
      <p className="text-center text-sm text-slate-500 mt-4">
        Já tem conta?{' '}
        <Link to="/login" className="text-court-600 font-medium hover:underline">
          Entrar
        </Link>
      </p>
    </Card>
  )
}
