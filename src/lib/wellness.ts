import type { Match, Resultado } from '../types'
import { labelCorpo, labelHumor } from '../types'

export interface FreqItem {
  nome: string
  count: number
  pct: number
}

export interface WellnessStats {
  humorAntesVitorias: FreqItem[]
  humorAntesDerrotas: FreqItem[]
  corpoAntesDerrotas: FreqItem[]
  corpoDepoisJogos: FreqItem[]
  comparacaoHumor: { humor: string; vitorias: number; derrotas: number; taxaVitoria: number }[]
  comparacaoCorpo: { sintoma: string; vitorias: number; derrotas: number; taxaVitoria: number }[]
}

export interface WellnessInsight {
  texto: string
  tipo: 'positivo' | 'negativo' | 'neutro'
}

function contarPorResultado(
  partidas: Match[],
  resultado: Resultado,
  extrair: (m: Match) => string[]
): Map<string, number> {
  const map = new Map<string, number>()
  const filtradas = partidas.filter((p) => p.resultado === resultado)
  for (const p of filtradas) {
    for (const item of extrair(p)) {
      map.set(item, (map.get(item) ?? 0) + 1)
    }
  }
  return map
}

function mapParaLista(map: Map<string, number>, total: number): FreqItem[] {
  return [...map.entries()]
    .map(([nome, count]) => ({
      nome: nome.includes('_') ? labelCorpo(nome) : labelHumor(nome),
      count,
      pct: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
}

function compararTag(
  partidas: Match[],
  extrair: (m: Match) => string[],
  labelFn: (v: string) => string
): { label: string; vitorias: number; derrotas: number; taxaVitoria: number }[] {
  const tags = new Set<string>()
  for (const p of partidas) {
    for (const t of extrair(p)) tags.add(t)
  }

  return [...tags]
    .map((tag) => {
      const comTag = partidas.filter((p) => extrair(p).includes(tag))
      const v = comTag.filter((p) => p.resultado === 'vitoria').length
      const d = comTag.length - v
      return {
        label: labelFn(tag),
        vitorias: v,
        derrotas: d,
        taxaVitoria:
          comTag.length > 0 ? Math.round((v / comTag.length) * 100) : 0,
      }
    })
    .filter((x) => x.vitorias + x.derrotas >= 2)
    .sort((a, b) => b.taxaVitoria - a.taxaVitoria)
}

export function calcularWellnessStats(partidas: Match[]): WellnessStats {
  const comHumor = partidas.filter((p) => (p.humor_antes?.length ?? 0) > 0)
  const comCorpo = partidas.filter((p) => (p.corpo_antes?.length ?? 0) > 0)
  const comCorpoDepois = partidas.filter((p) => (p.corpo_depois?.length ?? 0) > 0)

  const haV = contarPorResultado(comHumor, 'vitoria', (m) => m.humor_antes ?? [])
  const haD = contarPorResultado(comHumor, 'derrota', (m) => m.humor_antes ?? [])
  const caD = contarPorResultado(comCorpo, 'derrota', (m) => m.corpo_antes ?? [])

  const cdAll = new Map<string, number>()
  for (const p of comCorpoDepois) {
    for (const c of p.corpo_depois ?? []) {
      cdAll.set(c, (cdAll.get(c) ?? 0) + 1)
    }
  }

  const humorComp = compararTag(comHumor, (m) => m.humor_antes ?? [], labelHumor).map(
    ({ label, vitorias, derrotas, taxaVitoria }) => ({
      humor: label,
      vitorias,
      derrotas,
      taxaVitoria,
    })
  )

  const corpoComp = compararTag(comCorpo, (m) => m.corpo_antes ?? [], labelCorpo).map(
    ({ label, vitorias, derrotas, taxaVitoria }) => ({
      sintoma: label,
      vitorias,
      derrotas,
      taxaVitoria,
    })
  )

  const totalHaV = [...haV.values()].reduce((a, b) => a + b, 0)
  const totalHaD = [...haD.values()].reduce((a, b) => a + b, 0)
  const totalCaD = [...caD.values()].reduce((a, b) => a + b, 0)
  const totalCd = [...cdAll.values()].reduce((a, b) => a + b, 0)

  return {
    humorAntesVitorias: mapParaLista(haV, totalHaV),
    humorAntesDerrotas: mapParaLista(haD, totalHaD),
    corpoAntesDerrotas: mapParaLista(caD, totalCaD),
    corpoDepoisJogos: mapParaLista(cdAll, totalCd),
    comparacaoHumor: humorComp,
    comparacaoCorpo: corpoComp,
  }
}

export function gerarInsights(partidas: Match[]): WellnessInsight[] {
  const insights: WellnessInsight[] = []
  const comDados = partidas.filter(
    (p) =>
      (p.humor_antes?.length ?? 0) > 0 || (p.corpo_antes?.length ?? 0) > 0
  )

  if (comDados.length < 2) {
    insights.push({
      texto: 'Registre humor e corpo nas partidas para receber insights personalizados.',
      tipo: 'neutro',
    })
    return insights
  }

  const stats = calcularWellnessStats(partidas)

  const topVitoria = stats.comparacaoHumor[0]
  if (topVitoria && topVitoria.taxaVitoria >= 60) {
    insights.push({
      texto: `Você venceu mais jogos quando entrou ${topVitoria.humor.toLowerCase()} (${topVitoria.taxaVitoria}% de aproveitamento).`,
      tipo: 'positivo',
    })
  }

  const cansado = stats.comparacaoCorpo.find(
    (c) => c.sintoma.toLowerCase().includes('cansado')
  )
  if (cansado && cansado.taxaVitoria < 50 && cansado.vitorias + cansado.derrotas >= 2) {
    insights.push({
      texto: `Seu aproveitamento caiu quando marcou cansaço antes da partida (${cansado.taxaVitoria}%).`,
      tipo: 'negativo',
    })
  }

  const ansioso = stats.humorAntesDerrotas.find((h) =>
    h.nome.toLowerCase().includes('ansios')
  )
  if (ansioso) {
    insights.push({
      texto: `Ansiedade apareceu em ${ansioso.pct}% das suas derrotas (humor antes do jogo).`,
      tipo: 'negativo',
    })
  }

  const confiante = stats.humorAntesVitorias.find((h) =>
    h.nome.toLowerCase().includes('confiante')
  )
  if (confiante && confiante.pct >= 30) {
    insights.push({
      texto: `Confiança foi seu humor mais frequente antes das vitórias (${confiante.pct}%).`,
      tipo: 'positivo',
    })
  }

  const longas = partidas.filter((p) => p.duracao != null && p.duracao >= 90)
  const cansadoDepois = longas.filter((p) =>
    (p.corpo_depois ?? []).includes('cansado')
  )
  if (longas.length >= 2 && cansadoDepois.length / longas.length >= 0.5) {
    insights.push({
      texto: 'Você costuma terminar jogos com mais cansaço após partidas longas.',
      tipo: 'neutro',
    })
  }

  const estressado = stats.comparacaoHumor.find((h) =>
    h.humor.toLowerCase().includes('estressado')
  )
  if (estressado && estressado.taxaVitoria < 40) {
    insights.push({
      texto: `Estresse antes do jogo correlacionou com apenas ${estressado.taxaVitoria}% de vitórias.`,
      tipo: 'negativo',
    })
  }

  if (insights.length === 0) {
    insights.push({
      texto: 'Continue registrando seu estado emocional e físico para insights mais precisos.',
      tipo: 'neutro',
    })
  }

  return insights
}
