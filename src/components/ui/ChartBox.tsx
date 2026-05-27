import type { ReactElement } from 'react'
import { ResponsiveContainer } from 'recharts'

interface ChartBoxProps {
  height?: number
  children: ReactElement
}

/** Container com altura fixa — evita gráficos colapsando no mobile */
export function ChartBox({ height = 220, children }: ChartBoxProps) {
  return (
    <div className="w-full min-w-0" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  )
}
