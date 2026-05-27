import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { RivalEvolucaoPonto } from '../../types'

const CHART_WIN = '#60A5FA'
const CHART_LOSS = '#FCA5A5'

export function RivalMiniChart({ data }: { data: RivalEvolucaoPonto[] }) {
  if (data.length < 2) {
    return (
      <p className="text-xs text-ctb-muted text-center py-6">
        Jogue mais confrontos para ver a evolução
      </p>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={88}>
      <LineChart data={data} margin={{ top: 4, right: 4, left: -32, bottom: 0 }}>
        <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#94a3b8' }} interval="preserveStartEnd" axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} allowDecimals={false} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{
            borderRadius: 10,
            border: '1px solid #E2E8F0',
            fontSize: 12,
          }}
        />
        <Line type="monotone" dataKey="vitoriasAcum" stroke={CHART_WIN} strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="derrotasAcum" stroke={CHART_LOSS} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
