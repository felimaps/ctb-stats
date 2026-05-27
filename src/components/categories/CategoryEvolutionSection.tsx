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
import { Layers, Lightbulb } from 'lucide-react'
import { Card } from '../ui/Card'
import type { Match, Title } from '../../types'
import {
  calcularStatsCategorias,
  gerarInsightsCategorias,
} from '../../lib/categories'

export function CategoryEvolutionSection({
  matches,
  titles = [],
}: {
  matches: Match[]
  titles?: Title[]
}) {
  const stats = calcularStatsCategorias(matches, titles)
  const insights = gerarInsightsCategorias(matches, titles)

  const chartPartidas = stats.porCategoria.map((c) => ({
    nome: c.label.length > 12 ? c.label.slice(0, 11) + '…' : c.label,
    nomeFull: c.label,
    jogos: c.jogos,
    vitorias: c.vitorias,
  }))

  const chartAproveitamento = stats.porCategoria
    .filter((c) => c.jogos >= 1)
    .map((c) => ({
      nome: c.label.length > 12 ? c.label.slice(0, 11) + '…' : c.label,
      taxa: c.aproveitamento,
    }))

  const timelineData = stats.evolucaoAnos.map((e) => ({
    ano: e.ano,
    rank: e.rank,
    categoria: e.categoriaPrincipal,
  }))

  if (stats.porCategoria.length === 0) {
    return (
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-sky-50 p-2.5">
            <Layers className="h-6 w-6 text-sky-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Evolução por categoria</h2>
            <p className="text-sm text-slate-500">
              Cadastre a categoria nas partidas para ver estatísticas
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-sky-50 p-2.5">
          <Layers className="h-6 w-6 text-sky-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Evolução por categoria</h2>
          <p className="text-sm text-slate-500">Desempenho em cada nível de jogo</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-2xl bg-white border border-slate-100 p-4">
          <p className="text-xs text-slate-500">Mais jogada</p>
          <p className="text-sm font-bold text-slate-800 mt-1">
            {stats.categoriaMaisJogada ?? '—'}
          </p>
        </div>
        <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
          <p className="text-xs text-emerald-600">Melhor aproveitamento</p>
          <p className="text-sm font-bold text-emerald-800 mt-1">
            {stats.melhorCategoria ?? '—'}
          </p>
          {stats.melhorTaxa > 0 && (
            <p className="text-xs text-emerald-600">{stats.melhorTaxa}%</p>
          )}
        </div>
        <div className="rounded-2xl bg-white border border-slate-100 p-4 col-span-2">
          <p className="text-xs text-slate-500">Resumo por categoria</p>
          <p className="text-sm text-slate-700 mt-1">
            {stats.porCategoria.length} categorias ·{' '}
            {stats.porCategoria.reduce((s, c) => s + c.jogos, 0)} jogos registrados
          </p>
        </div>
      </div>

      <Card title="Detalhamento por categoria">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-slate-500">
                <th className="pb-2 font-medium">Categoria</th>
                <th className="pb-2 font-medium">Jogos</th>
                <th className="pb-2 font-medium">V</th>
                <th className="pb-2 font-medium">D</th>
                <th className="pb-2 font-medium">%</th>
              </tr>
            </thead>
            <tbody>
              {stats.porCategoria.map((c) => (
                <tr key={c.key} className="border-b border-slate-50">
                  <td className="py-2 font-medium text-slate-800">{c.label}</td>
                  <td className="py-2">{c.jogos}</td>
                  <td className="py-2 text-emerald-600">{c.vitorias}</td>
                  <td className="py-2 text-red-500">{c.derrotas}</td>
                  <td className="py-2 font-semibold text-court-600">{c.aproveitamento}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {insights.length > 0 && (
        <Card title="Insights">
          <ul className="space-y-2">
            {insights.map((ins, i) => (
              <li
                key={i}
                className={`flex items-start gap-2 text-sm rounded-xl px-3 py-2.5 ${
                  ins.tipo === 'positivo'
                    ? 'bg-emerald-50 text-emerald-800'
                    : ins.tipo === 'info'
                      ? 'bg-sky-50 text-sky-800'
                      : 'bg-slate-50 text-slate-700'
                }`}
              >
                <Lightbulb className="h-4 w-4 shrink-0 mt-0.5" />
                {ins.texto}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {chartPartidas.length > 0 && (
        <Card title="Partidas por categoria">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartPartidas}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="nome" tick={{ fontSize: 10 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip labelFormatter={(_, p) => p?.[0]?.payload?.nomeFull} />
              <Legend />
              <Bar dataKey="jogos" fill="#0ea5e9" name="Partidas" radius={[4, 4, 0, 0]} />
              <Bar dataKey="vitorias" fill="#0d9488" name="Vitórias" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {chartAproveitamento.length > 0 && (
        <Card title="Aproveitamento por categoria">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartAproveitamento}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="nome" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="taxa" name="Aproveitamento %" radius={[4, 4, 0, 0]}>
                {chartAproveitamento.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.taxa >= 50 ? '#0d9488' : '#f87171'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {timelineData.length >= 2 && (
        <Card
          title="Evolução ao longo dos anos"
          subtitle="Nível da categoria principal por ano (quanto maior, mais avançado)"
        >
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="ano" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="rank"
                stroke="#0ea5e9"
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Nível"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}
    </section>
  )
}
