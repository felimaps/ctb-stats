import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { Card } from '../ui/Card'
import { calcularStatsTitulos } from '../../lib/titles'
import type { Match, Title } from '../../types'
import { QUADRA_LABELS } from '../../types'

export function TitlesStatsSection({
  titles,
  matches,
}: {
  titles: Title[]
  matches: Match[]
}) {
  const stats = calcularStatsTitulos(titles, matches)

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Estatísticas de títulos</h2>
        <p className="text-sm text-slate-500">Desempenho em finais e conquistas</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-2xl bg-white border border-slate-100 p-4 text-center">
          <p className="text-2xl font-bold text-slate-800">{stats.finaisJogadas}</p>
          <p className="text-xs text-slate-500 mt-1">Finais jogadas</p>
        </div>
        <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-center">
          <p className="text-2xl font-bold text-emerald-700">{stats.finaisVencidas}</p>
          <p className="text-xs text-emerald-600 mt-1">Finais vencidas</p>
        </div>
        <div className="rounded-2xl bg-red-50 border border-red-100 p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{stats.finaisPerdidas}</p>
          <p className="text-xs text-red-500 mt-1">Finais perdidas</p>
        </div>
        <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4 text-center">
          <p className="text-2xl font-bold text-amber-700">{stats.aproveitamentoFinais}%</p>
          <p className="text-xs text-amber-600 mt-1">Aproveit. finais</p>
        </div>
      </div>

      {stats.titulosPorAnoChart.length > 0 && (
        <Card title="Títulos ao longo do tempo">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.titulosPorAnoChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="ano" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#d97706" name="Títulos" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {stats.titulosPorQuadra.length > 0 && (
        <Card title="Títulos por tipo de quadra">
          <ul className="space-y-2">
            {stats.titulosPorQuadra.map((q) => (
              <li key={q.quadra} className="flex justify-between text-sm">
                <span>{QUADRA_LABELS[q.quadra as keyof typeof QUADRA_LABELS] ?? q.quadra}</span>
                <span className="font-semibold text-amber-700">{q.count}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </section>
  )
}
