import { getYear, parseISO } from 'date-fns'
import type { Match, Title, CategoriaJogo } from '../types'
import { CATEGORIA_JOGO_OPTIONS, getCategoriaDisplay } from '../types'

export interface CategoriaStatsRow {
  key: string
  label: string
  jogos: number
  vitorias: number
  derrotas: number
  aproveitamento: number
}

export interface CategoriaEvolutionYear {
  ano: string
  categoriaPrincipal: string
  rank: number
}

export interface CategoriaDashboardInfo {
  categoriaAtual: string | null
  categoriaAtualKey: CategoriaJogo | null
  maisJogada: string | null
  melhorAproveitamento: string | null
  melhorTaxa: number
}

export interface CategoriaStatsFull {
  porCategoria: CategoriaStatsRow[]
  categoriaMaisJogada: string | null
  melhorCategoria: string | null
  melhorTaxa: number
  evolucaoAnos: CategoriaEvolutionYear[]
  titulosPorCategoria: { label: string; count: number }[]
}

export const CATEGORY_RANK: Record<CategoriaJogo, number> = {
  iniciante: 1,
  intermediario: 2,
  avancado: 3,
  classe_4: 4,
  classe_3: 5,
  classe_2: 6,
  classe_1: 7,
  livre: 8,
  senior: 9,
  dupla: 5,
  outra: 0,
}

function rankOf(m: Match): number {
  if (!m.categoria_jogo) return 0
  if (m.categoria_jogo === 'outra') return 5
  return CATEGORY_RANK[m.categoria_jogo] ?? 0
}

export function calcularStatsCategorias(
  matches: Match[],
  titles: Title[] = []
): CategoriaStatsFull {
  const comCat = matches.filter((m) => m.categoria_jogo)
  const map = new Map<string, { v: number; d: number }>()

  for (const m of comCat) {
    const label = getCategoriaDisplay(m)
    const cur = map.get(label) ?? { v: 0, d: 0 }
    if (m.resultado === 'vitoria') cur.v++
    else cur.d++
    map.set(label, cur)
  }

  const porCategoria: CategoriaStatsRow[] = [...map.entries()]
    .map(([label, { v, d }]) => {
      const total = v + d
      const key =
        CATEGORIA_JOGO_OPTIONS.find((o) => o.label === label)?.value ??
        `outra:${label}`
      return {
        key,
        label,
        jogos: total,
        vitorias: v,
        derrotas: d,
        aproveitamento: total > 0 ? Math.round((v / total) * 100) : 0,
      }
    })
    .sort((a, b) => b.jogos - a.jogos)

  const comMin2 = porCategoria.filter((c) => c.jogos >= 1)
  const melhor = [...comMin2]
    .filter((c) => c.jogos >= 2)
    .sort((a, b) => b.aproveitamento - a.aproveitamento)[0]

  const porAno = new Map<string, Map<string, number>>()
  for (const m of comCat) {
    const ano = String(getYear(parseISO(m.data)))
    const label = getCategoriaDisplay(m)
    const anoMap = porAno.get(ano) ?? new Map()
    anoMap.set(label, (anoMap.get(label) ?? 0) + 1)
    porAno.set(ano, anoMap)
  }

  const evolucaoAnos: CategoriaEvolutionYear[] = [...porAno.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([ano, cats]) => {
      const top = [...cats.entries()].sort((a, b) => b[1] - a[1])[0]
      const opt = CATEGORIA_JOGO_OPTIONS.find((o) => o.label === top[0])
      const rank = opt ? CATEGORY_RANK[opt.value] : 0
      return { ano, categoriaPrincipal: top[0], rank }
    })

  const titulosMap = new Map<string, number>()
  for (const t of titles) {
    const m = matches.find((x) => x.id === t.match_id)
    const label = m ? getCategoriaDisplay(m) : t.categoria
    titulosMap.set(label, (titulosMap.get(label) ?? 0) + 1)
  }

  return {
    porCategoria,
    categoriaMaisJogada: porCategoria[0]?.label ?? null,
    melhorCategoria: melhor?.label ?? porCategoria[0]?.label ?? null,
    melhorTaxa: melhor?.aproveitamento ?? porCategoria[0]?.aproveitamento ?? 0,
    evolucaoAnos,
    titulosPorCategoria: [...titulosMap.entries()].map(([label, count]) => ({
      label,
      count,
    })),
  }
}

export function calcularDashboardCategorias(matches: Match[]): CategoriaDashboardInfo {
  const comCat = matches.filter((m) => m.categoria_jogo)
  if (comCat.length === 0) {
    return {
      categoriaAtual: null,
      categoriaAtualKey: null,
      maisJogada: null,
      melhorAproveitamento: null,
      melhorTaxa: 0,
    }
  }

  const ordenadas = [...comCat].sort(
    (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
  )
  const atual = ordenadas[0]
  const stats = calcularStatsCategorias(matches)

  return {
    categoriaAtual: getCategoriaDisplay(atual),
    categoriaAtualKey: atual.categoria_jogo,
    maisJogada: stats.categoriaMaisJogada,
    melhorAproveitamento: stats.melhorCategoria,
    melhorTaxa: stats.melhorTaxa,
  }
}

export function isCategoriaAntiga(match: Match, categoriaAtualKey: CategoriaJogo | null): boolean {
  if (!match.categoria_jogo || !categoriaAtualKey) return false
  if (match.categoria_jogo === categoriaAtualKey) return false
  return rankOf(match) < CATEGORY_RANK[categoriaAtualKey]
}

export function statsCategoriaPorRival(
  jogos: Match[]
): { label: string; jogos: number; vitorias: number; derrotas: number; aproveitamento: number }[] {
  const map = new Map<string, { v: number; d: number }>()
  for (const m of jogos.filter((j) => j.categoria_jogo)) {
    const label = getCategoriaDisplay(m)
    const cur = map.get(label) ?? { v: 0, d: 0 }
    if (m.resultado === 'vitoria') cur.v++
    else cur.d++
    map.set(label, cur)
  }
  return [...map.entries()]
    .map(([label, { v, d }]) => {
      const t = v + d
      return {
        label,
        jogos: t,
        vitorias: v,
        derrotas: d,
        aproveitamento: t > 0 ? Math.round((v / t) * 100) : 0,
      }
    })
    .sort((a, b) => b.jogos - a.jogos)
}

export interface CategoriaInsight {
  texto: string
  tipo: 'positivo' | 'neutro' | 'info'
}

export function gerarInsightsCategorias(
  matches: Match[],
  titles: Title[] = []
): CategoriaInsight[] {
  const insights: CategoriaInsight[] = []
  const comCat = matches.filter((m) => m.categoria_jogo)
  if (comCat.length < 2) {
    insights.push({
      texto: 'Registre a categoria em suas partidas para acompanhar sua evolução.',
      tipo: 'neutro',
    })
    return insights
  }

  const stats = calcularStatsCategorias(matches, titles)
  const ordenadas = [...comCat].sort(
    (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()
  )
  const primeira = ordenadas[0]
  const ultima = ordenadas[ordenadas.length - 1]
  const labelPrimeira = getCategoriaDisplay(primeira)
  const labelUltima = getCategoriaDisplay(ultima)

  if (labelPrimeira !== labelUltima && rankOf(ultima) > rankOf(primeira)) {
    insights.push({
      texto: `Você começou jogando na ${labelPrimeira} e hoje registra jogos na ${labelUltima}.`,
      tipo: 'positivo',
    })
  }

  if (stats.melhorCategoria && stats.melhorTaxa > 0) {
    insights.push({
      texto: `Seu melhor aproveitamento é na categoria ${stats.melhorCategoria} (${stats.melhorTaxa}%).`,
      tipo: 'info',
    })
  }

  const topTitulo = stats.titulosPorCategoria.sort((a, b) => b.count - a.count)[0]
  if (topTitulo && topTitulo.count > 0) {
    insights.push({
      texto: `Você conquistou mais títulos na categoria ${topTitulo.label}.`,
      tipo: 'positivo',
    })
  }

  if (stats.evolucaoAnos.length >= 2) {
    const anosDistintos = new Set(stats.evolucaoAnos.map((e) => e.categoriaPrincipal))
    if (anosDistintos.size > 1) {
      const ultimoAno = stats.evolucaoAnos[stats.evolucaoAnos.length - 1].ano
      insights.push({
        texto: `Sua evolução de categoria ficou mais clara a partir de ${ultimoAno}.`,
        tipo: 'neutro',
      })
    }
  }

  if (stats.categoriaMaisJogada) {
    insights.push({
      texto: `Categoria mais jogada: ${stats.categoriaMaisJogada}.`,
      tipo: 'neutro',
    })
  }

  return insights
}
