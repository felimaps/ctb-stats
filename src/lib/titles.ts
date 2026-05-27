import { format, parseISO, getYear } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Match, Title, TipoQuadra } from '../types'
import { isPartidaFinal } from './matchUtils'

export interface TitleStats {
  total: number
  porAno: { ano: string; count: number }[]
  porCategoria: { categoria: string; count: number }[]
  maiorSequenciaTitulos: number
  finaisJogadas: number
  finaisVencidas: number
  finaisPerdidas: number
  aproveitamentoFinais: number
  titulosPorQuadra: { quadra: string; count: number }[]
  titulosPorAnoChart: { ano: string; count: number }[]
}

export function calcularStatsTitulos(
  titles: Title[],
  matches: Match[]
): TitleStats {
  const ordenados = [...titles].sort(
    (a, b) => new Date(a.data_titulo).getTime() - new Date(b.data_titulo).getTime()
  )

  const porAnoMap = new Map<string, number>()
  const porCatMap = new Map<string, number>()
  const porQuadraMap = new Map<string, number>()

  for (const t of ordenados) {
    const ano = String(getYear(parseISO(t.data_titulo)))
    porAnoMap.set(ano, (porAnoMap.get(ano) ?? 0) + 1)
    porCatMap.set(t.categoria, (porCatMap.get(t.categoria) ?? 0) + 1)
    porQuadraMap.set(t.tipo_quadra, (porQuadraMap.get(t.tipo_quadra) ?? 0) + 1)
  }

  let maiorSeq = 0
  let seq = 1
  for (let i = 1; i < ordenados.length; i++) {
    const diff =
      new Date(ordenados[i].data_titulo).getTime() -
      new Date(ordenados[i - 1].data_titulo).getTime()
    if (diff <= 120 * 24 * 60 * 60 * 1000) {
      seq++
    } else {
      maiorSeq = Math.max(maiorSeq, seq)
      seq = 1
    }
  }
  maiorSeq = Math.max(maiorSeq, seq, ordenados.length > 0 ? 1 : 0)

  const finais = matches.filter(isPartidaFinal)
  const finaisVencidas = finais.filter((m) => m.resultado === 'vitoria').length
  const finaisPerdidas = finais.length - finaisVencidas

  return {
    total: titles.length,
    porAno: [...porAnoMap.entries()]
      .map(([ano, count]) => ({ ano, count }))
      .sort((a, b) => a.ano.localeCompare(b.ano)),
    porCategoria: [...porCatMap.entries()]
      .map(([categoria, count]) => ({ categoria, count }))
      .sort((a, b) => b.count - a.count),
    maiorSequenciaTitulos: ordenados.length > 0 ? Math.max(maiorSeq, 1) : 0,
    finaisJogadas: finais.length,
    finaisVencidas,
    finaisPerdidas,
    aproveitamentoFinais:
      finais.length > 0 ? Math.round((finaisVencidas / finais.length) * 100) : 0,
    titulosPorQuadra: [...porQuadraMap.entries()].map(([quadra, count]) => ({
      quadra,
      count,
    })),
    titulosPorAnoChart: [...porAnoMap.entries()]
      .map(([ano, count]) => ({ ano, count }))
      .sort((a, b) => a.ano.localeCompare(b.ano)),
  }
}

export function titleFromForm(
  userId: string,
  form: {
    nome_torneio: string
    categoria_torneio: string
    nivel_torneio: Title['nivel_torneio']
    adversario: string
    placar: string
    tipo_quadra: TipoQuadra
    data: string
  },
  matchId: string | null
): Omit<Title, 'id' | 'created_at'> {
  return {
    user_id: userId,
    nome_torneio: form.nome_torneio,
    categoria: form.categoria_torneio,
    nivel_torneio: form.nivel_torneio,
    adversario_final: form.adversario,
    placar_final: form.placar,
    tipo_quadra: form.tipo_quadra,
    data_titulo: form.data,
    match_id: matchId,
  }
}

export function formatTituloTimelineDate(data: string): string {
  return format(parseISO(data), "MMM yyyy", { locale: ptBR })
}
