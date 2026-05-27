import { Link } from 'react-router-dom'
import { Crown, PlusCircle } from 'lucide-react'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { Button } from '../components/ui/Button'
import { ChartBox } from '../components/ui/ChartBox'
import { TitleCard } from '../components/titles/TitleCard'
import { TitleTimeline } from '../components/titles/TitleTimeline'
import { useMatches } from '../hooks/useMatches'
import { calcularStatsTitulos } from '../lib/titles'
import { calcularStatsCategorias } from '../lib/categories'
import { getCategoriaDisplay } from '../types'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'

export function Titulos() {
  const { titles, matches, loading } = useMatches()
  const stats = calcularStatsTitulos(titles, matches)
  const catStats = calcularStatsCategorias(matches, titles)

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="ctb-card p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50/25 via-transparent to-ctb-light/30 pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-600/90 mb-2">
              <Crown className="h-5 w-5" />
              <span className="text-xs font-semibold uppercase tracking-widest">
                Hall da Fama
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-ctb-dark">Meus Títulos</h1>
            <p className="text-ctb-muted text-sm mt-1">
              {stats.total} {stats.total === 1 ? 'conquista' : 'conquistas'} registradas
            </p>
          </div>
          <Link to="/nova-partida" className="w-full sm:w-auto">
            <Button variant="secondary" className="gap-2 w-full sm:w-auto">
              <PlusCircle className="h-4 w-4" />
              Registrar título
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="ctb-card p-4 bg-amber-50/40 border-amber-100">
          <p className="text-2xl sm:text-3xl font-bold text-amber-700 tabular-nums">{stats.total}</p>
          <p className="text-xs text-ctb-muted mt-1">Total de títulos</p>
        </div>
        <div className="ctb-card p-4">
          <p className="text-2xl sm:text-3xl font-bold text-ctb-dark tabular-nums">{stats.porAno.length}</p>
          <p className="text-xs text-ctb-muted mt-1">Anos com título</p>
        </div>
        <div className="ctb-card p-4">
          <p className="text-2xl sm:text-3xl font-bold text-ctb-dark tabular-nums">{stats.porCategoria.length}</p>
          <p className="text-xs text-ctb-muted mt-1">Categorias</p>
        </div>
        <div className="ctb-card p-4">
          <p className="text-2xl sm:text-3xl font-bold text-ctb-dark tabular-nums">{stats.maiorSequenciaTitulos}</p>
          <p className="text-xs text-ctb-muted mt-1">Maior sequência</p>
        </div>
      </div>

      {stats.porCategoria.length > 0 && (
        <div className="ctb-card p-5">
          <h2 className="text-sm font-semibold text-ctb-dark mb-3">Por categoria do torneio</h2>
          <div className="flex flex-wrap gap-2">
            {stats.porCategoria.map((c) => (
              <span
                key={c.categoria}
                className="px-3 py-1.5 rounded-full bg-amber-50/80 text-amber-800 text-sm font-medium border border-amber-100"
              >
                {c.categoria} ({c.count})
              </span>
            ))}
          </div>
        </div>
      )}

      {catStats.titulosPorCategoria.length > 0 && (
        <div className="ctb-card p-5 space-y-4 min-w-0">
          <h2 className="text-sm font-semibold text-ctb-dark">Títulos por categoria do jogo</h2>
          <div className="flex flex-wrap gap-2">
            {catStats.titulosPorCategoria.map((c) => (
              <span
                key={c.label}
                className="px-3 py-1.5 rounded-full bg-ctb-light text-ctb-primary text-sm font-medium border border-ctb-border"
              >
                {c.label} ({c.count})
              </span>
            ))}
          </div>
          <ChartBox height={200}>
            <BarChart data={catStats.titulosPorCategoria} margin={{ top: 4, right: 8, left: -20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 9, fill: '#94a3b8' }}
                interval={0}
                angle={-25}
                textAnchor="end"
                height={50}
                axisLine={false}
                tickLine={false}
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={28} />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid #E2E8F0',
                }}
              />
              <Bar dataKey="count" fill="#FACC15" stroke="#EAB308" strokeWidth={1} name="Títulos" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ChartBox>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4 min-w-0">
          <h2 className="text-lg font-bold text-ctb-dark">Galeria de troféus</h2>
          {titles.length === 0 ? (
            <div className="ctb-card border-dashed border-amber-200/80 bg-amber-50/20 p-10 sm:p-12 text-center">
              <p className="text-amber-800/90 font-medium">Nenhum título ainda</p>
              <p className="text-sm text-ctb-muted mt-2 max-w-sm mx-auto">
                Marque &quot;Esta partida conquistou o título&quot; ao registrar uma final vencida.
              </p>
              <Link to="/nova-partida" className="inline-block mt-4">
                <Button size="sm">Registrar partida</Button>
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {titles.map((t) => {
                const m = matches.find((x) => x.id === t.match_id)
                return (
                  <TitleCard
                    key={t.id}
                    title={t}
                    categoriaJogoLabel={m ? getCategoriaDisplay(m) : null}
                  />
                )
              })}
            </div>
          )}
        </div>

        <div className="ctb-card p-5 bg-gradient-to-b from-amber-50/20 to-white min-w-0">
          <h2 className="text-lg font-bold text-ctb-dark mb-4">Linha do tempo</h2>
          <TitleTimeline titles={titles} />
        </div>
      </div>

      <div className="ctb-card p-4 text-center bg-ctb-light/30">
        <p className="text-sm text-ctb-muted">
          Aproveitamento em finais:{' '}
          <strong className="text-ctb-primary">{stats.aproveitamentoFinais}%</strong>
          {stats.finaisJogadas > 0 && (
            <span>
              {' '}
              ({stats.finaisVencidas}V / {stats.finaisPerdidas}D em {stats.finaisJogadas} finais)
            </span>
          )}
        </p>
      </div>
    </div>
  )
}
