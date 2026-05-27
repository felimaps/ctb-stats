import { Link } from 'react-router-dom'
import { Crown, PlusCircle } from 'lucide-react'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { Button } from '../components/ui/Button'
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
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

export function Titulos() {
  const { titles, matches, loading } = useMatches()
  const stats = calcularStatsTitulos(titles, matches)
  const catStats = calcularStatsCategorias(matches, titles)

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl bg-white border border-ctb-border p-6 sm:p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50/30 via-transparent to-ctb-light/20 pointer-events-none" />
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
          <Link to="/nova-partida">
            <Button variant="secondary" className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Registrar título
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="ctb-card p-4 bg-amber-50/30 border-amber-100">
          <p className="text-3xl font-bold text-amber-700">{stats.total}</p>
          <p className="text-xs text-ctb-muted mt-1">Total de títulos</p>
        </div>
        <div className="ctb-card p-4">
          <p className="text-3xl font-bold text-ctb-dark">{stats.porAno.length}</p>
          <p className="text-xs text-ctb-muted mt-1">Anos com título</p>
        </div>
        <div className="ctb-card p-4">
          <p className="text-3xl font-bold text-ctb-dark">{stats.porCategoria.length}</p>
          <p className="text-xs text-ctb-muted mt-1">Categorias</p>
        </div>
        <div className="ctb-card p-4">
          <p className="text-3xl font-bold text-ctb-dark">{stats.maiorSequenciaTitulos}</p>
          <p className="text-xs text-ctb-muted mt-1">Maior sequência</p>
        </div>
      </div>

      {stats.porCategoria.length > 0 && (
        <div className="rounded-2xl border border-slate-100 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-3">
            Por categoria do torneio
          </h2>
          <div className="flex flex-wrap gap-2">
            {stats.porCategoria.map((c) => (
              <span
                key={c.categoria}
                className="px-3 py-1.5 rounded-full bg-amber-50 text-amber-800 text-sm font-medium border border-amber-100"
              >
                {c.categoria} ({c.count})
              </span>
            ))}
          </div>
        </div>
      )}

      {catStats.titulosPorCategoria.length > 0 && (
        <div className="rounded-2xl border border-amber-100 bg-white p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">
            Títulos por categoria do jogo
          </h2>
          <div className="flex flex-wrap gap-2">
            {catStats.titulosPorCategoria.map((c) => (
              <span
                key={c.label}
                className="px-3 py-1.5 rounded-full bg-amber-50 text-amber-800 text-sm font-medium border border-amber-300"
              >
                {c.label} ({c.count})
              </span>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={catStats.titulosPorCategoria}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#d97706" name="Títulos" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-800">Galeria de troféus</h2>
          {titles.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/30 p-12 text-center">
              <p className="text-amber-800 font-medium">Nenhum título ainda</p>
              <p className="text-sm text-slate-500 mt-2">
                Marque &quot;Esta partida conquistou o título&quot; ao registrar uma final
                vencida.
              </p>
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

        <div className="rounded-2xl border border-amber-100 bg-gradient-to-b from-amber-50/50 to-white p-5">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Linha do tempo</h2>
          <TitleTimeline titles={titles} />
        </div>
      </div>

      <div className="rounded-2xl border border-amber-100 bg-amber-50/30 p-4 text-center">
        <p className="text-sm text-slate-600">
          Aproveitamento em finais:{' '}
          <strong className="text-amber-800">{stats.aproveitamentoFinais}%</strong>
          {stats.finaisJogadas > 0 && (
            <span className="text-slate-500">
              {' '}
              ({stats.finaisVencidas}V / {stats.finaisPerdidas}D em {stats.finaisJogadas}{' '}
              finais)
            </span>
          )}
        </p>
      </div>
    </div>
  )
}
