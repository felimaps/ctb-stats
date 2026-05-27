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

const fieldClass =
  'py-2.5 px-3.5 text-sm rounded-lg min-h-0'

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
    <Card className="w-full max-w-xl shadow-md border-ctb-border/80" padding="lg">
      <div className="text-center mb-5 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-ctb-dark tracking-tight">
          Criar conta
        </h1>
        <p className="text-sm text-ctb-muted mt-1">
          Leva menos de um minuto para começar
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-3.5">
        <Input
          label="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className={fieldClass}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
          <Input
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={fieldClass}
            required
          />
          <Input
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={fieldClass}
            placeholder="Mín. 6 caracteres"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
          <Input
            label="Cidade"
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            className={fieldClass}
            required
          />
          <Select
            label="Nível"
            value={nivel}
            onChange={(e) => setNivel(e.target.value as Nivel)}
            className={fieldClass}
            options={[
              { value: 'iniciante', label: 'Iniciante' },
              { value: 'intermediario', label: 'Intermediário' },
              { value: 'avancado', label: 'Avançado' },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
          <Select
            label="Mão dominante"
            value={maoDominante}
            onChange={(e) => setMaoDominante(e.target.value as MaoDominante)}
            className={fieldClass}
            options={[
              { value: 'direita', label: 'Direita' },
              { value: 'esquerda', label: 'Esquerda' },
            ]}
          />
          <Input
            label="Estilo de jogo"
            value={estiloJogo}
            onChange={(e) => setEstiloJogo(e.target.value)}
            className={fieldClass}
            placeholder="Opcional"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="pt-1">
          <Button type="submit" fullWidth size="md" disabled={loading}>
            {loading ? 'Cadastrando...' : 'Criar conta'}
          </Button>
        </div>
      </form>

      <p className="text-center text-sm text-ctb-muted mt-5 pt-4 border-t border-ctb-border/60">
        Já tem conta?{' '}
        <Link to="/login" className="text-ctb-primary font-semibold hover:underline">
          Entrar
        </Link>
      </p>
    </Card>
  )
}
