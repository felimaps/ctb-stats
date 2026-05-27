import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts'
import { Brain, Heart, Lightbulb } from 'lucide-react'
import { Card } from '../ui/Card'
import type { Match } from '../../types'
import { calcularWellnessStats, gerarInsights } from '../../lib/wellness'

function FreqList({
  title,
  items,
  emptyText,
}: {
  title: string
  items: { nome: string; count: number; pct: number }[]
  emptyText: string
}) {
  return (
    <Card title={title}>
      {items.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-4">{emptyText}</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.nome} className="flex items-center gap-3">
              <span className="text-sm text-slate-700 flex-1">{item.nome}</span>
              <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-court-500 rounded-full"
                  style={{ width: `${item.pct}%` }}
                />
              </div>
              <span className="text-xs text-slate-500 w-10 text-right">{item.pct}%</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

function ComparacaoChart({
  title,
  chartData,
}: {
  title: string
  chartData: { nome: string; taxa: number }[]
}) {
  const data = chartData.slice(0, 6)

  if (data.length === 0) {
    return (
      <Card title={title}>
        <p className="text-sm text-slate-500 text-center py-6">
          Registre estados em pelo menos 2 partidas para comparar.
        </p>
      </Card>
    )
  }

  return (
    <Card title={title}>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="nome" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={60} />
          <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" />
          <Tooltip />
          <Bar dataKey="taxa" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.taxa >= 50 ? '#0d9488' : '#f87171'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}

export function CorpoMenteSection({ matches }: { matches: Match[] }) {
  const stats = calcularWellnessStats(matches)
  const insights = gerarInsights(matches)

  const humorChartData = stats.comparacaoHumor.map((h) => ({
    nome: h.humor,
    taxa: h.taxaVitoria,
  }))

  const corpoChartData = stats.comparacaoCorpo.map((c) => ({
    nome: c.sintoma,
    taxa: c.taxaVitoria,
  }))

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-violet-50 p-2.5">
          <Brain className="h-6 w-6 text-violet-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Corpo e mente</h2>
          <p className="text-sm text-slate-500">
            Como seu estado emocional e físico influencia os resultados
          </p>
        </div>
      </div>

      <Card title="Insights automáticos">
        <ul className="space-y-2">
          {insights.map((ins, i) => (
            <li
              key={i}
              className={`flex items-start gap-2 text-sm rounded-xl px-3 py-2.5 ${
                ins.tipo === 'positivo'
                  ? 'bg-emerald-50 text-emerald-800'
                  : ins.tipo === 'negativo'
                    ? 'bg-red-50 text-red-800'
                    : 'bg-slate-50 text-slate-700'
              }`}
            >
              <Lightbulb className="h-4 w-4 shrink-0 mt-0.5" />
              {ins.texto}
            </li>
          ))}
        </ul>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <FreqList
          title="Humores antes das vitórias"
          items={stats.humorAntesVitorias}
          emptyText="Sem dados de humor antes das vitórias"
        />
        <FreqList
          title="Humores antes das derrotas"
          items={stats.humorAntesDerrotas}
          emptyText="Sem dados de humor antes das derrotas"
        />
        <FreqList
          title="Sintomas físicos antes das derrotas"
          items={stats.corpoAntesDerrotas}
          emptyText="Sem dados de corpo antes das derrotas"
        />
        <FreqList
          title="Sintomas físicos depois dos jogos"
          items={stats.corpoDepoisJogos}
          emptyText="Sem dados de corpo depois dos jogos"
        />
      </div>

      <ComparacaoChart
        title="Humor antes do jogo × resultado"
        chartData={humorChartData}
      />
      <ComparacaoChart
        title="Sintomas antes do jogo × resultado"
        chartData={corpoChartData}
      />

      <Card title="Dica">
        <p className="text-sm text-slate-600 flex items-start gap-2">
          <Heart className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
          Ao cadastrar uma partida, marque como você se sentia antes e depois. Com o tempo,
          os insights ficam mais precisos.
        </p>
      </Card>
    </section>
  )
}
