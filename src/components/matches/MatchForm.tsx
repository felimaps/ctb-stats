import { useState, type FormEvent } from 'react'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Textarea } from '../ui/Textarea'
import { Button } from '../ui/Button'
import { ChipSelect } from '../ui/ChipSelect'
import { Checkbox } from '../ui/Checkbox'
import type {
  Match,
  MatchFormData,
  Resultado,
  TipoQuadra,
  HumorOpcao,
  CorpoOpcao,
  NivelTorneio,
  FasePartida,
  CategoriaJogo,
} from '../../types'
import {
  HUMOR_OPCOES,
  CORPO_OPCOES,
  NIVEL_TORNEIO_LABELS,
  FASE_PARTIDA_LABELS,
  CATEGORIA_JOGO_OPTIONS,
} from '../../types'

interface MatchFormProps {
  initial?: Match
  onSubmit: (data: MatchFormData) => Promise<void>
  submitLabel?: string
}

export function MatchForm({
  initial,
  onSubmit,
  submitLabel = 'Salvar partida',
}: MatchFormProps) {
  const [adversario, setAdversario] = useState(initial?.adversario ?? '')
  const [data, setData] = useState(
    initial?.data ?? new Date().toISOString().split('T')[0]
  )
  const [placar, setPlacar] = useState(initial?.placar ?? '')
  const [resultado, setResultado] = useState<Resultado>(
    initial?.resultado ?? 'vitoria'
  )
  const [tipoQuadra, setTipoQuadra] = useState<TipoQuadra>(
    initial?.tipo_quadra ?? 'saibro'
  )
  const [duracao, setDuracao] = useState(
    initial?.duracao != null ? String(initial.duracao) : ''
  )
  const [observacoes, setObservacoes] = useState(initial?.observacoes ?? '')
  const [humorAntes, setHumorAntes] = useState<HumorOpcao[]>(initial?.humor_antes ?? [])
  const [corpoAntes, setCorpoAntes] = useState<CorpoOpcao[]>(initial?.corpo_antes ?? [])
  const [humorDepois, setHumorDepois] = useState<HumorOpcao[]>(
    initial?.humor_depois ?? []
  )
  const [corpoDepois, setCorpoDepois] = useState<CorpoOpcao[]>(initial?.corpo_depois ?? [])
  const [valeTitulo, setValeTitulo] = useState(initial?.vale_titulo ?? false)
  const [nomeTorneio, setNomeTorneio] = useState(initial?.nome_torneio ?? '')
  const [categoriaTorneio, setCategoriaTorneio] = useState(
    initial?.categoria_torneio ?? ''
  )
  const [nivelTorneio, setNivelTorneio] = useState<NivelTorneio>(
    initial?.nivel_torneio ?? 'clube'
  )
  const [fasePartida, setFasePartida] = useState<FasePartida>(
    initial?.fase_partida ?? 'fase_grupos'
  )
  const [conquistouTitulo, setConquistouTitulo] = useState(
    initial?.conquistou_titulo ?? false
  )
  const [categoriaJogo, setCategoriaJogo] = useState<CategoriaJogo | ''>(
    initial?.categoria_jogo ?? ''
  )
  const [categoriaPersonalizada, setCategoriaPersonalizada] = useState(
    initial?.categoria_personalizada ?? ''
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const validate = () => {
    const e: Record<string, string> = {}
    if (!adversario.trim()) e.adversario = 'Informe o adversário'
    if (!data) e.data = 'Informe a data'
    if (!placar.trim()) e.placar = 'Informe o placar'
    if (valeTitulo) {
      if (!nomeTorneio.trim()) e.nome_torneio = 'Informe o nome do torneio'
      if (!categoriaTorneio.trim()) e.categoria = 'Informe a categoria'
    }
    if (conquistouTitulo && resultado !== 'vitoria') {
      e.conquistou_titulo = 'Só é possível conquistar título em uma vitória'
    }
    if (conquistouTitulo && fasePartida !== 'final') {
      e.fase = 'Marque fase "Final" para registrar um título'
    }
    if (categoriaJogo === 'outra' && !categoriaPersonalizada.trim()) {
      e.categoria_personalizada = 'Informe o nome da categoria'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault()
    if (!validate()) return
    setSaving(true)
    await onSubmit({
      adversario: adversario.trim(),
      data,
      placar: placar.trim(),
      resultado,
      tipo_quadra: tipoQuadra,
      duracao: duracao ? parseInt(duracao, 10) : null,
      observacoes: observacoes.trim() || null,
      humor_antes: humorAntes,
      corpo_antes: corpoAntes,
      humor_depois: humorDepois,
      corpo_depois: corpoDepois,
      vale_titulo: valeTitulo,
      nome_torneio: valeTitulo ? nomeTorneio.trim() : null,
      categoria_torneio: valeTitulo ? categoriaTorneio.trim() : null,
      nivel_torneio: valeTitulo ? nivelTorneio : null,
      fase_partida: valeTitulo ? fasePartida : null,
      conquistou_titulo: valeTitulo && conquistouTitulo,
      categoria_jogo: categoriaJogo || null,
      categoria_personalizada:
        categoriaJogo === 'outra' ? categoriaPersonalizada.trim() : null,
    })
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">
          Dados da partida
        </h3>
        <Input
          label="Adversário"
          value={adversario}
          onChange={(e) => setAdversario(e.target.value)}
          placeholder="Nome do oponente"
          required
          error={errors.adversario}
        />
        <Input
          label="Data da partida"
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          required
          error={errors.data}
        />
        <Input
          label="Placar"
          value={placar}
          onChange={(e) => setPlacar(e.target.value)}
          placeholder="Ex: 6-4, 6-3"
          required
          error={errors.placar}
        />
        <Select
          label="Resultado"
          value={resultado}
          onChange={(e) => setResultado(e.target.value as Resultado)}
          required
          options={[
            { value: 'vitoria', label: 'Vitória' },
            { value: 'derrota', label: 'Derrota' },
          ]}
        />
        <Select
          label="Tipo de quadra"
          value={tipoQuadra}
          onChange={(e) => setTipoQuadra(e.target.value as TipoQuadra)}
          required
          options={[
            { value: 'saibro', label: 'Saibro' },
            { value: 'rapida', label: 'Rápida' },
            { value: 'grama', label: 'Grama' },
            { value: 'indoor', label: 'Indoor' },
          ]}
        />
        <Select
          label="Categoria do jogo"
          value={categoriaJogo}
          onChange={(e) => {
            const v = e.target.value as CategoriaJogo | ''
            setCategoriaJogo(v)
            if (v !== 'outra') setCategoriaPersonalizada('')
          }}
          options={[
            { value: '', label: 'Selecione (opcional)' },
            ...CATEGORIA_JOGO_OPTIONS,
          ]}
        />
        {categoriaJogo === 'outra' && (
          <Input
            label="Nome da categoria"
            value={categoriaPersonalizada}
            onChange={(e) => setCategoriaPersonalizada(e.target.value)}
            placeholder="Ex: Sub-18, Categoria C..."
            required
            error={errors.categoria_personalizada}
          />
        )}
        <Input
          label="Duração (minutos)"
          type="number"
          min={1}
          value={duracao}
          onChange={(e) => setDuracao(e.target.value)}
          placeholder="Opcional — ex: 90"
        />
        <Textarea
          label="Observações"
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          placeholder="Opcional — como foi o jogo?"
        />
      </div>

      <div className="space-y-4 rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/80 to-yellow-50/40 p-4">
        <h3 className="text-sm font-semibold text-amber-900 flex items-center gap-2">
          🏆 Torneio e títulos
        </h3>
        <Checkbox
          label="A partida vale título?"
          checked={valeTitulo}
          onChange={(v) => {
            setValeTitulo(v)
            if (!v) setConquistouTitulo(false)
          }}
          description="Ative para informar dados do torneio"
        />

        {valeTitulo && (
          <div className="space-y-4 pt-2 border-t border-amber-200/50">
            <Input
              label="Nome do torneio"
              value={nomeTorneio}
              onChange={(e) => setNomeTorneio(e.target.value)}
              placeholder="Ex: Clube Primavera"
              required
              error={errors.nome_torneio}
            />
            <Input
              label="Categoria do torneio"
              value={categoriaTorneio}
              onChange={(e) => setCategoriaTorneio(e.target.value)}
              placeholder="Ex: Masculino B, Duplas mistas..."
              required
              error={errors.categoria}
            />
            <Select
              label="Nível do torneio"
              value={nivelTorneio}
              onChange={(e) => setNivelTorneio(e.target.value as NivelTorneio)}
              required
              options={Object.entries(NIVEL_TORNEIO_LABELS).map(([v, l]) => ({
                value: v,
                label: l,
              }))}
            />
            <Select
              label="Fase da partida"
              value={fasePartida}
              onChange={(e) => {
                setFasePartida(e.target.value as FasePartida)
                if (e.target.value !== 'final') setConquistouTitulo(false)
              }}
              required
              options={Object.entries(FASE_PARTIDA_LABELS).map(([v, l]) => ({
                value: v,
                label: l,
              }))}
            />
            {errors.fase && <p className="text-xs text-red-500">{errors.fase}</p>}

            <div className="rounded-xl bg-amber-100/50 border border-amber-300/50 p-3">
              <Checkbox
                label="Esta partida conquistou o título"
                checked={conquistouTitulo}
                onChange={setConquistouTitulo}
                description="Registra automaticamente um título no seu hall da fama (final + vitória)"
              />
              {errors.conquistou_titulo && (
                <p className="text-xs text-red-500 mt-2">{errors.conquistou_titulo}</p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4 rounded-2xl border border-sky-100 bg-sky-50/40 p-4">
        <h3 className="text-sm font-semibold text-sky-800">Antes do jogo</h3>
        <p className="text-xs text-sky-600 -mt-2">Opcional — selecione um ou mais</p>
        <ChipSelect
          label="Humor antes do jogo"
          options={HUMOR_OPCOES}
          selected={humorAntes}
          onChange={(v) => setHumorAntes(v as HumorOpcao[])}
          variant="humor"
        />
        <ChipSelect
          label="Corpo antes do jogo"
          options={CORPO_OPCOES}
          selected={corpoAntes}
          onChange={(v) => setCorpoAntes(v as CorpoOpcao[])}
          variant="corpo"
        />
      </div>

      <div className="space-y-4 rounded-2xl border border-court-100 bg-court-50/40 p-4">
        <h3 className="text-sm font-semibold text-court-800">Depois do jogo</h3>
        <p className="text-xs text-court-600 -mt-2">Opcional — selecione um ou mais</p>
        <ChipSelect
          label="Humor depois do jogo"
          options={HUMOR_OPCOES}
          selected={humorDepois}
          onChange={(v) => setHumorDepois(v as HumorOpcao[])}
          variant="humor"
        />
        <ChipSelect
          label="Corpo depois do jogo"
          options={CORPO_OPCOES}
          selected={corpoDepois}
          onChange={(v) => setCorpoDepois(v as CorpoOpcao[])}
          variant="corpo"
        />
      </div>

      <Button type="submit" fullWidth size="lg" disabled={saving}>
        {saving ? 'Salvando...' : submitLabel}
      </Button>
    </form>
  )
}
