import {
  format,
  startOfWeek,
  startOfMonth,
  startOfYear,
  parseISO,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Match } from '../types'

export interface ChartPoint {
  periodo: string
  vitorias: number
  derrotas: number
  partidas: number
  aproveitamento: number
}

function agrupar(
  partidas: Match[],
  fn: (d: Date) => string,
  labelFn: (key: string) => string
): ChartPoint[] {
  const map = new Map<string, { v: number; d: number }>()

  for (const p of partidas) {
    const key = fn(parseISO(p.data))
    const cur = map.get(key) ?? { v: 0, d: 0 }
    if (p.resultado === 'vitoria') cur.v++
    else cur.d++
    map.set(key, cur)
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, { v, d }]) => {
      const total = v + d
      return {
        periodo: labelFn(key),
        vitorias: v,
        derrotas: d,
        partidas: total,
        aproveitamento: total > 0 ? Math.round((v / total) * 100) : 0,
      }
    })
}

export function vitoriasPorSemana(partidas: Match[]): ChartPoint[] {
  return agrupar(
    partidas,
    (d) => format(startOfWeek(d, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
    (key) => {
      const d = parseISO(key)
      return `Sem ${format(d, 'dd/MM', { locale: ptBR })}`
    }
  )
}

export function vitoriasPorMes(partidas: Match[]): ChartPoint[] {
  return agrupar(
    partidas,
    (d) => format(startOfMonth(d), 'yyyy-MM'),
    (key) => format(parseISO(key + '-01'), 'MMM yyyy', { locale: ptBR })
  )
}

export function vitoriasPorAno(partidas: Match[]): ChartPoint[] {
  return agrupar(
    partidas,
    (d) => format(startOfYear(d), 'yyyy'),
    (key) => key
  )
}

export function aproveitamentoAoLongoDoTempo(partidas: Match[]): ChartPoint[] {
  const ordenadas = [...partidas].sort(
    (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()
  )
  let v = 0
  let t = 0

  return ordenadas.map((p) => {
    t++
    if (p.resultado === 'vitoria') v++
    return {
      periodo: format(parseISO(p.data), 'dd/MM/yy', { locale: ptBR }),
      vitorias: v,
      derrotas: t - v,
      partidas: t,
      aproveitamento: Math.round((v / t) * 100),
    }
  })
}
