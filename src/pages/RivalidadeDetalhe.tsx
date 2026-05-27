import { Link, useParams } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  ArrowLeft,
  Trophy,
  Target,
  TrendingUp,
  Brain,
  Activity,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts'
import { Card } from '../components/ui/Card'
import { StatCard } from '../components/ui/StatCard'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { useMatches } from '../hooks/useMatches'
import { encontrarRival } from '../lib/rivalries'
import { calcularWellnessStats, gerarInsights } from '../lib/wellness'
import {
  QUADRA_LABELS,
  RESULTADO_LABELS,
  labelHumor,
  labelCorpo,
  getCategoriaDisplay,
} from '../types'
import type { HumorOpcao, CorpoOpcao } from '../types'

function ChipTags({ items, variant }: { items: string[]; variant: 'humor' | 'corpo' }) {
  if (items.length === 0) return <span className="text-xs text-slate-400">—</span>
  const cls =
    variant === 'humor'
      ? 'bg-sky-50 text-sky-700'
      : 'bg-court-50 text-court-700'
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((i) => (
        <span key={i} className={`text-xs px-2 py-0.5 rounded-full ${cls}`}>
          {variant === 'humor' ? labelHumor(i) : labelCorpo(i)}
        </span>
      ))}
    </div>
  )
}

export function RivalidadeDetalhe() {
  const { adversario: slug } = useParams<{ adversario: string }>()
  const { matches, titles, loading } = useMatches()
  const rival = slug ? encontrarRival(matches, slug, titles) : null

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner />
      </div>
    )
  }

  if (!rival) {
    return (
      <div className="space-y-4">
        <Link
          to="/rivalidades"
          className="inline-flex items-center gap-1 text-sm text-court-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
        <Card>
          <p className="text-center text-slate-500 py-6">Adversário não encontrado.</p>
        </Card>
      </div>
    )
  }

  const wellnessPartidas = rival.partidas
  const wellnessStats = calcularWellnessStats(wellnessPartidas)
  const insights = gerarInsights(wellnessPartidas)

  const chartTimeline = rival.evolucao.map((e) => ({
    ...e,
    resultadoNum: e.resultado === 'vitoria' ? 1 : 0,
  }))

  return (
    <div className="space-y-6">
      <Link
        to="/rivalidades"
        className="inline-flex items-center gap-1 text-sm text-court-600 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Todas as rivalidades
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-slate-800">vs {rival.adversario}</h1>
        <p className="text-sm text-court-600 font-medium mt-0.5">{rival.sequenciaLabel}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Jogos" value={rival.jogos} icon={Target} accent="primary" />
        <StatCard label="Vitórias" value={rival.vitorias} icon={Trophy} accent="success" />
        <StatCard label="Derrotas" value={rival.derrotas} icon={Target} accent="danger" />
        <StatCard
          label="Aproveitamento"
          value={`${rival.aproveitamento}%`}
          icon={TrendingUp}
          accent="success"
        />
      </div>

      {rival.categoriasContra.length > 0 && (
        <Card title="Categorias nos confrontos">
          <ul className="space-y-2">
            {rival.categoriasContra.map((c) => (
              <li
                key={c.label}
                className="flex items-center justify-between text-sm py-2 border-b border-slate-50 last:border-0"
              >
                <span className="font-medium text-slate-800">{c.label}</span>
                <span className="text-slate-500">
                  {c.jogos} jogos · {c.vitorias}V · {c.derrotas}D ·{' '}
                  <strong className="text-court-600">{c.aproveitamento}%</strong>
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {(rival.finaisDisputadas > 0 || rival.titulosContra > 0) && (
        <Card title="Finais e títulos contra este adversário">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div>
              <p className="text-2xl font-bold text-slate-800">{rival.finaisDisputadas}</p>
              <p className="text-xs text-slate-500">Finais disputadas</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600">{rival.finaisVencidas}</p>
              <p className="text-xs text-slate-500">Finais vencidas</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-500">{rival.finaisPerdidas}</p>
              <p className="text-xs text-slate-500">Finais perdidas</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{rival.titulosContra}</p>
              <p className="text-xs text-slate-500">Títulos contra ele</p>
            </div>
          </div>
          <p className="text-sm text-center text-slate-600 mt-3">
            Aproveitamento em finais:{' '}
            <strong className="text-court-600">{rival.aproveitamentoFinais}%</strong>
          </p>
        </Card>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {rival.melhorVitoria && (
          <Card title="Maior vitória">
            <p className="text-lg font-semibold text-emerald-600">{rival.melhorVitoria}</p>
          </Card>
        )}
        {rival.piorDerrota && (
          <Card title="Pior derrota">
            <p className="text-lg font-semibold text-red-500">{rival.piorDerrota}</p>
          </Card>
        )}
        {rival.melhorQuadra && (
          <Card title="Melhor desempenho">
            <p className="text-slate-800 font-medium">
              {QUADRA_LABELS[rival.melhorQuadra]} — {rival.melhorQuadraTaxa}%
            </p>
          </Card>
        )}
      </div>

      <Card title="Evolução dos confrontos">
        {chartTimeline.length < 2 ? (
          <p className="text-sm text-slate-500 text-center py-6">Poucos jogos para gráfico.</p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartTimeline} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="vitoriasAcum"
                stroke="#0d9488"
                name="Vitórias"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="derrotasAcum"
                stroke="#f87171"
                name="Derrotas"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      <Card title="Resultado por confronto">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartTimeline} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 11 }} domain={[0, 1]} ticks={[0, 1]} />
            <Tooltip />
            <Bar dataKey="resultadoNum" radius={[4, 4, 0, 0]}>
              {chartTimeline.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.resultado === 'vitoria' ? '#0d9488' : '#f87171'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card title="Corpo e mente contra este adversário">
        <div className="grid gap-4 sm:grid-cols-2 mb-4">
          <div className="flex items-start gap-2">
            <Brain className="h-4 w-4 text-violet-500 mt-0.5" />
            <div>
              <p className="text-xs text-slate-500">Humor antes (mais comum)</p>
              <p className="text-sm font-medium">{rival.humorAntesComum ?? '—'}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Brain className="h-4 w-4 text-violet-500 mt-0.5" />
            <div>
              <p className="text-xs text-slate-500">Humor depois (mais comum)</p>
              <p className="text-sm font-medium">{rival.humorDepoisComum ?? '—'}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Activity className="h-4 w-4 text-court-500 mt-0.5" />
            <div>
              <p className="text-xs text-slate-500">Corpo antes (mais comum)</p>
              <p className="text-sm font-medium">{rival.corpoAntesComum ?? '—'}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Activity className="h-4 w-4 text-court-500 mt-0.5" />
            <div>
              <p className="text-xs text-slate-500">Corpo depois (mais comum)</p>
              <p className="text-sm font-medium">{rival.corpoDepoisComum ?? '—'}</p>
            </div>
          </div>
        </div>

        {insights.length > 0 && (
          <ul className="space-y-2 border-t border-slate-100 pt-4">
            {insights.slice(0, 4).map((ins, i) => (
              <li key={i} className="text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2">
                {ins.texto}
              </li>
            ))}
          </ul>
        )}

        {wellnessStats.comparacaoHumor.length > 0 && (
          <p className="text-xs text-slate-400 mt-3">
            Humor com melhor taxa contra {rival.adversario}:{' '}
            <strong>{wellnessStats.comparacaoHumor[0].humor}</strong> (
            {wellnessStats.comparacaoHumor[0].taxaVitoria}%)
          </p>
        )}
      </Card>

      <Card title="Histórico de confrontos" subtitle={`${rival.partidas.length} partidas`}>
        <div className="space-y-4">
          {rival.partidas.map((m) => (
            <div
              key={m.id}
              className="border-b border-slate-50 last:border-0 pb-4 last:pb-0"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      m.resultado === 'vitoria'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-600'
                    }`}
                  >
                    {RESULTADO_LABELS[m.resultado]}
                  </span>
                  <p className="font-semibold text-slate-800 mt-1">{m.placar}</p>
                  <p className="text-xs text-slate-500">
                    {format(parseISO(m.data), "dd 'de' MMMM yyyy", { locale: ptBR })} ·{' '}
                    {QUADRA_LABELS[m.tipo_quadra]}
                    {m.duracao ? ` · ${m.duracao} min` : ''}
                    {' '}
                    · Categoria: {getCategoriaDisplay({ categoria_jogo: m.categoria_jogo, categoria_personalizada: m.categoria_personalizada })}
                  </p>
                </div>
              </div>

              {((m.humor_antes?.length ?? 0) > 0 ||
                (m.corpo_antes?.length ?? 0) > 0 ||
                (m.humor_depois?.length ?? 0) > 0 ||
                (m.corpo_depois?.length ?? 0) > 0) && (
                <div className="mt-3 grid gap-2 sm:grid-cols-2 text-xs">
                  <div>
                    <p className="text-slate-400 mb-1">Antes</p>
                    <ChipTags items={m.humor_antes as HumorOpcao[]} variant="humor" />
                    <div className="mt-1">
                      <ChipTags items={m.corpo_antes as CorpoOpcao[]} variant="corpo" />
                    </div>
                  </div>
                  <div>
                    <p className="text-slate-400 mb-1">Depois</p>
                    <ChipTags items={m.humor_depois as HumorOpcao[]} variant="humor" />
                    <div className="mt-1">
                      <ChipTags items={m.corpo_depois as CorpoOpcao[]} variant="corpo" />
                    </div>
                  </div>
                </div>
              )}

              {m.observacoes && (
                <p className="text-sm text-slate-500 mt-2 italic">{m.observacoes}</p>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
