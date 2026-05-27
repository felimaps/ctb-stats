import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { Card } from '../ui/Card'
import { ChartBox } from '../ui/ChartBox'
import type { ChartPoint } from '../../lib/charts'

const CHART_PRIMARY = '#3B82F6'
const CHART_SECONDARY = '#60A5FA'
const CHART_WIN = '#34D399'
const CHART_LOSS = '#FCA5A5'
const CHART_GRID = '#F1F5F9'

interface ChartBlockProps {
  title: string
  data: ChartPoint[]
  type?: 'bar' | 'line'
  dataKey?: 'vitorias' | 'partidas' | 'aproveitamento'
}

function ChartBlock({
  title,
  data,
  type = 'bar',
  dataKey = 'vitorias',
}: ChartBlockProps) {
  if (data.length === 0) {
    return (
      <Card title={title} accent>
        <p className="text-sm text-ctb-muted text-center py-10">
          Sem dados suficientes para exibir o gráfico.
        </p>
      </Card>
    )
  }

  return (
    <Card title={title} accent>
      <ChartBox height={200}>
        {type === 'bar' ? (
          <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
            <XAxis dataKey="periodo" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={28} />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                boxShadow: '0 2px 8px rgba(30,41,59,0.06)',
              }}
            />
            {dataKey === 'vitorias' && (
              <>
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="vitorias" fill={CHART_WIN} name="Vitórias" radius={[6, 6, 0, 0]} />
                <Bar dataKey="derrotas" fill={CHART_LOSS} name="Derrotas" radius={[6, 6, 0, 0]} />
              </>
            )}
            {dataKey === 'partidas' && (
              <Bar dataKey="partidas" fill={CHART_SECONDARY} name="Partidas" radius={[6, 6, 0, 0]} />
            )}
          </BarChart>
        ) : (
          <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
            <XAxis dataKey="periodo" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} domain={[0, 100]} axisLine={false} tickLine={false} width={32} />
            <Tooltip
              formatter={(v) => [`${v}%`, 'Aproveitamento']}
              contentStyle={{
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                boxShadow: '0 2px 8px rgba(30,41,59,0.06)',
              }}
            />
            <Line
              type="monotone"
              dataKey="aproveitamento"
              stroke={CHART_PRIMARY}
              strokeWidth={2.5}
              dot={{ r: 3, fill: CHART_SECONDARY, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: CHART_PRIMARY }}
              name="Aproveitamento %"
            />
          </LineChart>
        )}
      </ChartBox>
    </Card>
  )
}

interface StatsChartsProps {
  porSemana: ChartPoint[]
  porMes: ChartPoint[]
  porAno: ChartPoint[]
  partidasPorMes: ChartPoint[]
  aproveitamento: ChartPoint[]
}

export function StatsCharts({
  porSemana,
  porMes,
  porAno,
  partidasPorMes,
  aproveitamento,
}: StatsChartsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <ChartBlock title="Vitórias por semana" data={porSemana} />
      <ChartBlock title="Vitórias por mês" data={porMes} />
      <ChartBlock title="Vitórias por ano" data={porAno} />
      <ChartBlock title="Partidas por mês" data={partidasPorMes} dataKey="partidas" />
      <div className="sm:col-span-2 min-w-0">
        <ChartBlock title="Aproveitamento ao longo do tempo" data={aproveitamento} type="line" dataKey="aproveitamento" />
      </div>
    </div>
  )
}
