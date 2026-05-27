import { useState, useEffect, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Shield, Trophy } from 'lucide-react'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Textarea } from '../components/ui/Textarea'
import { Button } from '../components/ui/Button'
import { Checkbox } from '../components/ui/Checkbox'
import { Card } from '../components/ui/Card'
import { PhotoUpload } from '../components/profile/PhotoUpload'
import { UserAvatar } from '../components/profile/UserAvatar'
import { CategoryLabelChip } from '../components/ui/CategoryChip'
import { useAuth } from '../context/AuthContext'
import { useMatches } from '../hooks/useMatches'
import * as api from '../lib/api'
import { removeAvatarFile } from '../lib/api'
import { calcularEstatisticas } from '../lib/stats'
import { calcularDashboardCategorias } from '../lib/categories'
import { sanitizeText, sanitizePhone } from '../lib/profileUtils'
import type { Nivel, MaoDominante, TipoSanguineo, UserProfile } from '../types'
import { NIVEL_LABELS, TIPO_SANGUINEO_OPTIONS } from '../types'

export function Perfil() {
  const { user, refreshProfile, setUser } = useAuth()
  const { matches, titles, loading: loadingMatches } = useMatches()
  const stats = calcularEstatisticas(matches)
  const catInfo = calcularDashboardCategorias(matches)

  const [nome, setNome] = useState('')
  const [cidade, setCidade] = useState('')
  const [nivel, setNivel] = useState<Nivel>('iniciante')
  const [maoDominante, setMaoDominante] = useState<MaoDominante>('direita')
  const [estiloJogo, setEstiloJogo] = useState('')
  const [tipoSanguineo, setTipoSanguineo] = useState<TipoSanguineo | ''>('')
  const [alergias, setAlergias] = useState('')
  const [lesoes, setLesoes] = useState('')
  const [obsMedicas, setObsMedicas] = useState('')
  const [contatoEmergencia, setContatoEmergencia] = useState('')
  const [telefoneEmergencia, setTelefoneEmergencia] = useState('')
  const [medicacao, setMedicacao] = useState('')
  const [restricoes, setRestricoes] = useState('')
  const [saudePrivada, setSaudePrivada] = useState(true)
  const [saudeAdmins, setSaudeAdmins] = useState(false)
  const [ocultarTelefone, setOcultarTelefone] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const loadFromUser = (u: UserProfile) => {
    setNome(u.nome)
    setCidade(u.cidade)
    setNivel(u.nivel)
    setMaoDominante(u.mao_dominante)
    setEstiloJogo(u.estilo_jogo)
    setTipoSanguineo(u.tipo_sanguineo ?? '')
    setAlergias(u.alergias ?? '')
    setLesoes(u.lesoes_recorrentes ?? '')
    setObsMedicas(u.observacoes_medicas ?? '')
    setContatoEmergencia(u.contato_emergencia ?? '')
    setTelefoneEmergencia(u.telefone_emergencia ?? '')
    setMedicacao(u.medicacao_continua ?? '')
    setRestricoes(u.restricoes_fisicas ?? '')
    setSaudePrivada(u.saude_privada)
    setSaudeAdmins(u.saude_compartilhar_admins)
    setOcultarTelefone(u.ocultar_telefone_emergencia)
  }

  useEffect(() => {
    if (user) loadFromUser(user)
  }, [user])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!user || !nome.trim() || !cidade.trim()) return
    setSaving(true)
    const updated = await api.updateProfile(user.id, {
      nome: sanitizeText(nome, 120),
      cidade: sanitizeText(cidade, 120),
      nivel,
      mao_dominante: maoDominante,
      estilo_jogo: sanitizeText(estiloJogo, 500),
      tipo_sanguineo: tipoSanguineo || null,
      alergias: sanitizeText(alergias) || null,
      lesoes_recorrentes: sanitizeText(lesoes) || null,
      observacoes_medicas: sanitizeText(obsMedicas) || null,
      contato_emergencia: sanitizeText(contatoEmergencia, 200) || null,
      telefone_emergencia: sanitizePhone(telefoneEmergencia) || null,
      medicacao_continua: sanitizeText(medicacao) || null,
      restricoes_fisicas: sanitizeText(restricoes) || null,
      saude_privada: saudePrivada,
      saude_compartilhar_admins: saudeAdmins,
      ocultar_telefone_emergencia: ocultarTelefone,
    })
    setSaving(false)
    if (updated) {
      setUser(updated)
      await refreshProfile()
      setMessage('Perfil atualizado com sucesso!')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const handlePhotoUploaded = async (fotoUrl: string) => {
    if (!user) return
    const updated = await api.updateProfile(user.id, { foto_url: fotoUrl })
    if (updated) {
      setUser(updated)
      await refreshProfile()
      setMessage('Foto atualizada!')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const handlePhotoRemoved = async () => {
    if (!user) return
    await removeAvatarFile(user.id)
    const updated = await api.updateProfile(user.id, { foto_url: null })
    if (updated) {
      setUser(updated)
      await refreshProfile()
    }
  }

  if (!user) return null

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-800">Meu perfil</h1>

      <Card title="Foto de perfil">
        <PhotoUpload
          user={user}
          onUploaded={handlePhotoUploaded}
          onRemoved={handlePhotoRemoved}
        />
      </Card>

      <div className="flex items-center gap-4">
        <UserAvatar user={user} size="lg" />
        <div>
          <p className="font-semibold text-slate-800">{user.nome}</p>
          <p className="text-sm text-slate-500">{user.email}</p>
          {user.created_at && (
            <p className="text-xs text-slate-400 mt-1">
              Membro desde{' '}
              {format(parseISO(user.created_at), "d 'de' MMMM 'de' yyyy", {
                locale: ptBR,
              })}
            </p>
          )}
        </div>
      </div>

      <Card title="Resumo esportivo">
        {!loadingMatches && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 p-4 rounded-xl bg-slate-50">
            <div>
              <p className="text-xs text-slate-500">Partidas</p>
              <p className="text-lg font-bold">{stats.totalPartidas}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Aproveitamento</p>
              <p className="text-lg font-bold text-court-600">{stats.aproveitamento}%</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Títulos</p>
              <p className="text-lg font-bold text-amber-600">{titles.length}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Pontos</p>
              <p className="text-lg font-bold">{stats.pontuacao}</p>
            </div>
          </div>
        )}

        {catInfo.categoriaAtual && (
          <div className="mb-4">
            <p className="text-xs text-slate-500 mb-1">Categoria atual</p>
            <CategoryLabelChip label={catInfo.categoriaAtual} />
          </div>
        )}

      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
      <Card
        title="Dados pessoais e esportivos"
        subtitle="Nome e cidade; esportivo visível no feed"
      >
        <div className="space-y-4">
          <Input
            label="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
          <Input
            label="Cidade"
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            required
          />
          <Select
            label="Nível"
            value={nivel}
            onChange={(e) => setNivel(e.target.value as Nivel)}
            options={Object.entries(NIVEL_LABELS).map(([v, l]) => ({
              value: v,
              label: l,
            }))}
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
          />
          <Link to="/ranking" className="inline-flex items-center gap-1 text-sm text-court-600">
            <Trophy className="h-4 w-4" />
            Ver ranking geral
          </Link>
        </div>
      </Card>

      <Card
        title="Saúde e segurança"
        subtitle="Somente você vê estes dados — não aparecem no perfil público"
      >
        <div className="mb-4 flex items-center gap-2 text-violet-600">
          <Shield className="h-5 w-5" />
          <p className="text-xs text-slate-500">
            Use em caso de emergência em torneios. Mantenha atualizado.
          </p>
        </div>

        <div className="space-y-4">
          <Select
            label="Tipo sanguíneo"
            value={tipoSanguineo}
            onChange={(e) => setTipoSanguineo(e.target.value as TipoSanguineo | '')}
            options={[
              { value: '', label: 'Não informado' },
              ...TIPO_SANGUINEO_OPTIONS,
            ]}
          />
          <Textarea
            label="Alergias"
            value={alergias}
            onChange={(e) => setAlergias(e.target.value)}
            placeholder="Opcional"
          />
          <Textarea
            label="Lesões recorrentes"
            value={lesoes}
            onChange={(e) => setLesoes(e.target.value)}
            placeholder="Opcional"
          />
          <Textarea
            label="Observações médicas"
            value={obsMedicas}
            onChange={(e) => setObsMedicas(e.target.value)}
            placeholder="Opcional"
          />
          <Input
            label="Contato de emergência"
            value={contatoEmergencia}
            onChange={(e) => setContatoEmergencia(e.target.value)}
            placeholder="Nome do contato"
          />
          <Input
            label="Telefone de emergência"
            type="tel"
            value={telefoneEmergencia}
            onChange={(e) => setTelefoneEmergencia(e.target.value)}
            placeholder="Opcional"
          />
          <Textarea
            label="Medicação contínua"
            value={medicacao}
            onChange={(e) => setMedicacao(e.target.value)}
            placeholder="Opcional"
          />
          <Textarea
            label="Restrições físicas"
            value={restricoes}
            onChange={(e) => setRestricoes(e.target.value)}
            placeholder="Opcional"
          />

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-3">
            <p className="text-sm font-semibold text-slate-700">Privacidade</p>
            <Checkbox
              label="Manter informações médicas privadas"
              description="Nunca exibir para outros jogadores"
              checked={saudePrivada}
              onChange={setSaudePrivada}
            />
            <Checkbox
              label="Permitir compartilhar apenas com administradores"
              description="Quando o clube tiver painel de admin"
              checked={saudeAdmins}
              onChange={setSaudeAdmins}
            />
            <Checkbox
              label="Ocultar telefone de emergência de outros usuários"
              checked={ocultarTelefone}
              onChange={setOcultarTelefone}
            />
          </div>
        </div>
      </Card>

      {message && (
        <p className="text-sm text-court-600 bg-court-50 rounded-lg px-3 py-2">
          {message}
        </p>
      )}
      <Button type="submit" fullWidth size="lg" disabled={saving}>
        {saving ? 'Salvando...' : 'Salvar alterações'}
      </Button>
      </form>
    </div>
  )
}
