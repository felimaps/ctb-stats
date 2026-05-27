import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Match, RivalStats, RivalEvolucaoPonto, TipoQuadra, Title } from '../types'
import { labelCorpo, labelHumor } from '../types'
import { adversarioSlug, isPartidaFinal, margemPlacar, slugParaBusca } from './matchUtils'
import { statsCategoriaPorRival } from './categories'

function maisFrequente(itens: string[]): string | null {
  if (itens.length === 0) return null
  const freq = new Map<string, number>()
  for (const i of itens) freq.set(i, (freq.get(i) ?? 0) + 1)
  return [...freq.entries()].sort((a, b) => b[1] - a[1])[0][0]
}

function maisFrequenteQuadra(
  jogos: Match[]
): { quadra: TipoQuadra | null; taxa: number } {
  const map = new Map<TipoQuadra, number>()
  for (const j of jogos) {
    map.set(j.tipo_quadra, (map.get(j.tipo_quadra) ?? 0) + 1)
  }

  if (map.size === 0) return { quadra: null, taxa: 0 }

  // Se empatar frequência, desempata pelo melhor aproveitamento
  let melhorQuadra: TipoQuadra | null = null
  let melhorCount = -1
  let melhorTaxa = -1

  for (const [quadra, count] of map.entries()) {
    const comQuadra = jogos.filter((j) => j.tipo_quadra === quadra)
    const v = comQuadra.filter((j) => j.resultado === 'vitoria').length
    const taxa = comQuadra.length > 0 ? Math.round((v / comQuadra.length) * 100) : 0

    if (count > melhorCount || (count === melhorCount && taxa > melhorTaxa)) {
      melhorQuadra = quadra
      melhorCount = count
      melhorTaxa = taxa
    }
  }

  return { quadra: melhorQuadra, taxa: Math.max(0, melhorTaxa) }
}

function sequenciaContra(jogos: Match[]): { valor: number; label: string } {
  const ordenados = [...jogos].sort(
    (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
  )
  if (ordenados.length === 0) return { valor: 0, label: '—' }

  const ultimo = ordenados[0].resultado
  let count = 0
  for (const j of ordenados) {
    if (j.resultado !== ultimo) break
    count++
  }

  if (ultimo === 'vitoria') {
    return {
      valor: count,
      label: count === 1 ? '1 vitória seguida' : `${count} vitórias seguidas`,
    }
  }
  return {
    valor: -count,
    label: count === 1 ? '1 derrota seguida' : `${count} derrotas seguidas`,
  }
}

function melhorQuadraContra(jogos: Match[]): {
  quadra: TipoQuadra | null
  taxa: number
} {
  const map = new Map<TipoQuadra, { v: number; t: number }>()
  for (const j of jogos) {
    const cur = map.get(j.tipo_quadra) ?? { v: 0, t: 0 }
    cur.t++
    if (j.resultado === 'vitoria') cur.v++
    map.set(j.tipo_quadra, cur)
  }

  let melhor: TipoQuadra | null = null
  let melhorTaxa = -1
  for (const [quadra, { v, t }] of map) {
    const taxa = Math.round((v / t) * 100)
    if (taxa > melhorTaxa || (taxa === melhorTaxa && t > (map.get(melhor!)?.t ?? 0))) {
      melhorTaxa = taxa
      melhor = quadra
    }
  }
  return { quadra: melhor, taxa: melhorTaxa >= 0 ? melhorTaxa : 0 }
}

function buildEvolucao(jogos: Match[]): RivalEvolucaoPonto[] {
  const ordenados = [...jogos].sort(
    (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()
  )
  let v = 0
  let d = 0
  return ordenados.map((j) => {
    if (j.resultado === 'vitoria') v++
    else d++
    return {
      data: j.data,
      label: format(parseISO(j.data), 'dd/MM/yy', { locale: ptBR }),
      resultado: j.resultado,
      placar: j.placar,
      vitoriasAcum: v,
      derrotasAcum: d,
    }
  })
}

function analiseEmocional(jogos: Match[]) {
  const humorAntes: string[] = []
  const humorDepois: string[] = []
  const corpoAntes: string[] = []
  const corpoDepois: string[] = []

  for (const j of jogos) {
    humorAntes.push(...(j.humor_antes ?? []))
    humorDepois.push(...(j.humor_depois ?? []))
    corpoAntes.push(...(j.corpo_antes ?? []))
    corpoDepois.push(...(j.corpo_depois ?? []))
  }

  const ha = maisFrequente(humorAntes)
  const hd = maisFrequente(humorDepois)
  const ca = maisFrequente(corpoAntes)
  const cd = maisFrequente(corpoDepois)

  return {
    humorAntesComum: ha ? labelHumor(ha) : null,
    humorDepoisComum: hd ? labelHumor(hd) : null,
    corpoAntesComum: ca ? labelCorpo(ca) : null,
    corpoDepoisComum: cd ? labelCorpo(cd) : null,
  }
}

export function calcularRivalidadesDetalhadas(
  partidas: Match[],
  titles: Title[] = []
): RivalStats[] {
  const map = new Map<string, Match[]>()

  for (const p of partidas) {
    const key = p.adversario.trim().toLowerCase()
    const lista = map.get(key) ?? []
    lista.push(p)
    map.set(key, lista)
  }

  return Array.from(map.entries())
    .map(([, jogos]) => {
      const ordenadosDesc = [...jogos].sort(
        (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
      )
      const adv = ordenadosDesc[0].adversario
      const vitorias = jogos.filter((j) => j.resultado === 'vitoria')
      const derrotas = jogos.filter((j) => j.resultado === 'derrota')
      const seq = sequenciaContra(jogos)
      const { quadra, taxa } = melhorQuadraContra(jogos)
      const { quadra: quadraMaisFrequente } = maisFrequenteQuadra(jogos)
      const categoriasContra = statsCategoriaPorRival(jogos)
      const categoriaMaisFrequente = categoriasContra[0]?.label ?? null

      const melhorVitoria =
        vitorias.length > 0
          ? [...vitorias].sort((a, b) => margemPlacar(b.placar) - margemPlacar(a.placar))[0]
              .placar
          : null

      const piorDerrota =
        derrotas.length > 0
          ? [...derrotas].sort((a, b) => margemPlacar(a.placar) - margemPlacar(b.placar))[0]
              .placar
          : null

      const emocional = analiseEmocional(jogos)
      const finais = jogos.filter(isPartidaFinal)
      const finaisVencidas = finais.filter((f) => f.resultado === 'vitoria').length
      const finaisPerdidas = finais.length - finaisVencidas
      const advLower = adv.toLowerCase()
      const titulosContra = titles.filter(
        (t) => t.adversario_final.toLowerCase() === advLower
      ).length

      return {
        adversario: adv,
        slug: adversarioSlug(adv),
        jogos: jogos.length,
        vitorias: vitorias.length,
        derrotas: derrotas.length,
        aproveitamento:
          jogos.length > 0
            ? Math.round((vitorias.length / jogos.length) * 100)
            : 0,
        ultimoPlacar: ordenadosDesc[0].placar,
        ultimaData: ordenadosDesc[0].data,
        sequenciaAtual: seq.valor,
        sequenciaLabel: seq.label,
        melhorVitoria,
        piorDerrota,
        melhorQuadra: quadra,
        melhorQuadraTaxa: taxa,
        evolucao: buildEvolucao(jogos),
        ...emocional,
        finaisDisputadas: finais.length,
        finaisVencidas,
        finaisPerdidas,
        aproveitamentoFinais:
          finais.length > 0 ? Math.round((finaisVencidas / finais.length) * 100) : 0,
        titulosContra,
        categoriasContra,
        quadraMaisFrequente,
        categoriaMaisFrequente,
        partidas: ordenadosDesc,
      }
    })
    .sort((a, b) => b.jogos - a.jogos)
}

export function encontrarRival(
  partidas: Match[],
  slug: string,
  titles: Title[] = []
): RivalStats | null {
  const busca = slugParaBusca(slug)
  const todas = calcularRivalidadesDetalhadas(partidas, titles)
  return (
    todas.find((r) => r.slug === slug || r.adversario.toLowerCase() === busca) ??
    null
  )
}
