import { differenceInDays, parseISO } from 'date-fns'
import type { Match } from '../../types'
import { QUADRA_LABELS } from '../../types'
import { calcularEstatisticas } from '../stats'
import { calcularWellnessStats } from '../wellness'
import { calcularStatsCategorias } from '../categories'
import { calcularStatsTitulos } from '../titles'
import { calcularRivalidadesDetalhadas } from '../rivalries'
import { isPartidaFinal } from '../matchUtils'
import type {
  CoachingRecommendation,
  CoachingInput,
  FocusArea,
  CoachingCategory,
  CoachingPriority,
} from './types'

let idCounter = 0
function rid(prefix: string) {
  return `${prefix}-${++idCounter}`
}

function rec(
  titulo: string,
  descricao: string,
  categoria: CoachingCategory,
  prioridade: CoachingPriority,
  tom: CoachingRecommendation['tom'],
  icone: string,
  relevancia: number,
  meta?: Record<string, unknown>
): CoachingRecommendation {
  return {
    id: rid(categoria),
    titulo,
    descricao,
    categoria,
    prioridade,
    tom,
    icone,
    relevancia,
    meta,
  }
}

function taxaQuadra(partidas: Match[], quadra: Match['tipo_quadra']) {
  const jogos = partidas.filter((p) => p.tipo_quadra === quadra)
  if (jogos.length < 2) return null
  const v = jogos.filter((p) => p.resultado === 'vitoria').length
  return { jogos: jogos.length, taxa: Math.round((v / jogos.length) * 100) }
}

function partidasCurtas(partidas: Match[]) {
  const comDuracao = partidas.filter((p) => p.duracao != null)
  if (comDuracao.length < 3) return null
  const curtas = comDuracao.filter((p) => (p.duracao ?? 0) <= 75)
  const longas = comDuracao.filter((p) => (p.duracao ?? 0) > 90)
  if (curtas.length < 2) return null
  const taxaCurta =
    curtas.filter((p) => p.resultado === 'vitoria').length / curtas.length
  const taxaLonga =
    longas.length > 0
      ? longas.filter((p) => p.resultado === 'vitoria').length / longas.length
      : null
  return { taxaCurta: Math.round(taxaCurta * 100), taxaLonga: taxaLonga != null ? Math.round(taxaLonga * 100) : null, n: curtas.length }
}

function frequenciaSemanal(partidas: Match[]) {
  if (partidas.length < 4) return null
  const ordenadas = [...partidas].sort(
    (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()
  )
  const span = differenceInDays(
    parseISO(ordenadas[ordenadas.length - 1].data),
    parseISO(ordenadas[0].data)
  )
  if (span < 14) return null
  const semanas = Math.max(1, Math.round(span / 7))
  const porSemana = partidas.length / semanas
  return { porSemana: Math.round(porSemana * 10) / 10, semanas }
}

/** Gera insights a partir dos dados — substituível por IA no futuro */
export function generateDataInsights(input: CoachingInput): CoachingRecommendation[] {
  idCounter = 0
  const { matches, titles } = input
  const list: CoachingRecommendation[] = []

  if (matches.length < 2) {
    list.push(
      rec(
        'Comece a construir seu perfil',
        'Registre mais partidas para receber insights personalizados sobre seu jogo.',
        'consistencia',
        'media',
        'neutro',
        '🎾',
        50
      )
    )
    return list
  }

  const stats = calcularEstatisticas(matches)
  const wellness = calcularWellnessStats(matches)
  const catStats = calcularStatsCategorias(matches, titles)
  const titleStats = calcularStatsTitulos(titles, matches)
  const rivals = calcularRivalidadesDetalhadas(matches, titles)

  // ——— Mental ———
  const ansiosoDerrotas = wellness.humorAntesDerrotas.find((h) =>
    h.nome.toLowerCase().includes('ansios')
  )
  if (ansiosoDerrotas && ansiosoDerrotas.pct >= 25) {
    list.push(
      rec(
        'Ansiedade nas derrotas',
        `Ansiedade apareceu em ${ansiosoDerrotas.pct}% das suas derrotas recentes. Tente rotinas de respiração antes de entrar em quadra.`,
        'mental',
        'alta',
        'alerta',
        '🧠',
        85,
        { tag: 'ansioso', pct: ansiosoDerrotas.pct }
      )
    )
  }

  const confiante = wellness.comparacaoHumor.find((h) =>
    h.humor.toLowerCase().includes('confiante')
  )
  if (confiante && confiante.taxaVitoria >= 55 && confiante.vitorias + confiante.derrotas >= 2) {
    list.push(
      rec(
        'Confiança faz diferença',
        `Você venceu ${confiante.taxaVitoria}% dos jogos quando marcou confiança antes da partida.`,
        'mental',
        'media',
        'positivo',
        '✨',
        78,
        { humor: 'confiante', taxa: confiante.taxaVitoria }
      )
    )
  }

  const estressado = wellness.comparacaoHumor.find((h) =>
    h.humor.toLowerCase().includes('estressado')
  )
  if (estressado && estressado.taxaVitoria < 45 && estressado.vitorias + estressado.derrotas >= 2) {
    list.push(
      rec(
        'Estresse antes do jogo',
        `Seu aproveitamento cai para ${estressado.taxaVitoria}% quando entra estressado.`,
        'mental',
        'alta',
        'alerta',
        '⚠️',
        82
      )
    )
  }

  // ——— Físico ———
  const cansado = wellness.comparacaoCorpo.find((c) =>
    c.sintoma.toLowerCase().includes('cansado')
  )
  if (cansado && cansado.taxaVitoria < 50 && cansado.vitorias + cansado.derrotas >= 2) {
    list.push(
      rec(
        'Cansaço antes da partida',
        `Seu aproveitamento cai quando você joga cansado (${cansado.taxaVitoria}% de vitórias).`,
        'fisico',
        'alta',
        'alerta',
        '🏃',
        88
      )
    )
  }

  const longas = matches.filter((p) => p.duracao != null && p.duracao >= 90)
  const cansadoDepoisLongas = longas.filter((p) =>
    (p.corpo_depois ?? []).includes('cansado')
  )
  if (longas.length >= 2 && cansadoDepoisLongas.length / longas.length >= 0.5) {
    list.push(
      rec(
        'Partidas longas exigem mais',
        'Partidas longas aumentam seus sintomas de cansaço depois do jogo. Planeje recuperação.',
        'fisico',
        'media',
        'neutro',
        '⏱️',
        70
      )
    )
  }

  // ——— Quadra ———
  type QuadraKey = 'saibro' | 'rapida' | 'grama' | 'indoor'
  const quadras = (['saibro', 'rapida', 'grama', 'indoor'] as const)
    .map((q) => {
      const stats = taxaQuadra(matches, q)
      return stats ? { q, ...stats } : null
    })
    .filter((x): x is { q: QuadraKey; jogos: number; taxa: number } => x != null)
    .sort((a, b) => b.taxa - a.taxa)

  if (quadras.length >= 1) {
    const melhor = quadras[0]
    list.push(
      rec(
        `Forte no ${QUADRA_LABELS[melhor.q]}`,
        `Seu melhor aproveitamento é no ${QUADRA_LABELS[melhor.q]} (${melhor.taxa}% em ${melhor.jogos} jogos).`,
        'quadra',
        'media',
        'positivo',
        '🏟️',
        75,
        { quadra: melhor.q }
      )
    )
    if (quadras.length >= 2) {
      const pior = quadras[quadras.length - 1]
      if (pior.q !== melhor.q && pior.taxa < melhor.taxa - 15 && pior.jogos >= 2) {
        list.push(
          rec(
            `Evolua no ${QUADRA_LABELS[pior.q]}`,
            `Seu desempenho em ${QUADRA_LABELS[pior.q]} (${pior.taxa}%) ainda pode evoluir.`,
            'quadra',
            'media',
            'alerta',
            '📉',
            68,
            { quadra: pior.q }
          )
        )
      }
    }
  }

  // ——— Competição ———
  if (titleStats.finaisJogadas >= 2) {
    if (titleStats.aproveitamentoFinais >= 60) {
      list.push(
        rec(
          'Bom em finais',
          `Seu aproveitamento em finais é de ${titleStats.aproveitamentoFinais}% — continue confiando no seu jogo decisivo.`,
          'competicao',
          'media',
          'positivo',
          '🏆',
          72
        )
      )
    } else if (titleStats.aproveitamentoFinais < 45) {
      list.push(
        rec(
          'Finais podem melhorar',
          `Seu aproveitamento em finais está em ${titleStats.aproveitamentoFinais}%. Trabalhe rotina mental nos pontos decisivos.`,
          'competicao',
          'alta',
          'alerta',
          '🎯',
          80
        )
      )
    }
  }

  if (titles.length >= 2) {
    list.push(
      rec(
        'Você sabe vencer torneios',
        `Já conquistou ${titles.length} títulos. Mantenha a rotina que funciona nas finais.`,
        'competicao',
        'baixa',
        'positivo',
        '👑',
        55
      )
    )
  }

  const finais = matches.filter(isPartidaFinal)
  if (finais.length >= 3 && titleStats.aproveitamentoFinais >= 70) {
    list.push(
      rec(
        'Clutch player',
        `Seu aproveitamento em finais é muito alto (${titleStats.aproveitamentoFinais}%).`,
        'competicao',
        'media',
        'positivo',
        '🔥',
        76
      )
    )
  }

  // ——— Consistência ———
  const freq = frequenciaSemanal(matches)
  if (freq && freq.porSemana >= 1) {
    list.push(
      rec(
        'Ritmo de jogo consistente',
        `Você mantém cerca de ${freq.porSemana} partida(s) por semana — frequência ajuda na evolução.`,
        'consistencia',
        'media',
        'positivo',
        '📅',
        65
      )
    )
  } else if (matches.length >= 3 && freq && freq.porSemana < 0.5) {
    list.push(
      rec(
        'Jogue com mais regularidade',
        'Aumentar a frequência semanal tende a melhorar ritmo e confiança em quadra.',
        'consistencia',
        'media',
        'neutro',
        '📆',
        62
      )
    )
  }

  if (stats.sequenciaAtual >= 3) {
    list.push(
      rec(
        'Momento positivo',
        `${stats.sequenciaAtual} vitórias seguidas. Aproveite a confiança, mas mantenha o foco ponto a ponto.`,
        'consistencia',
        'baixa',
        'positivo',
        '🔥',
        60
      )
    )
  }

  // ——— Tático (proxy: duração / placar) ———
  const curtasStats = partidasCurtas(matches)
  if (curtasStats && curtasStats.taxaCurta >= 60) {
    list.push(
      rec(
        'Melhor em partidas curtas',
        `Você joga melhor em partidas até ~75 min (${curtasStats.taxaCurta}% de vitórias).`,
        'tatico',
        'media',
        'positivo',
        '⚡',
        70
      )
    )
  }
  if (curtasStats?.taxaLonga != null && curtasStats.taxaLonga < curtasStats.taxaCurta - 15) {
    list.push(
      rec(
        'Resistência em jogos longos',
        'Em partidas mais longas seu aproveitamento cai. Trabalhe endurance e gestão de energia.',
        'tatico',
        'media',
        'alerta',
        '💪',
        68
      )
    )
  }

  // ——— Rivalidades ———
  const rivalTop = rivals[0]
  if (rivalTop && rivalTop.jogos >= 3) {
    if (rivalTop.aproveitamento < 40) {
      list.push(
        rec(
          `Desafio contra ${rivalTop.adversario}`,
          `Seu aproveitamento contra ${rivalTop.adversario} é ${rivalTop.aproveitamento}%. Estude padrões desse confronto.`,
          'rivalidades',
          'alta',
          'alerta',
          '⚔️',
          77,
          { adversario: rivalTop.adversario }
        )
      )
    } else if (rivalTop.aproveitamento >= 65) {
      list.push(
        rec(
          `Domínio sobre ${rivalTop.adversario}`,
          `Você tem ${rivalTop.aproveitamento}% contra seu rival mais frequente. Mantenha o que funciona.`,
          'rivalidades',
          'baixa',
          'positivo',
          '💪',
          58
        )
      )
    }
  }

  if (catStats.melhorCategoria && catStats.melhorTaxa >= 55) {
    list.push(
      rec(
        'Sua categoria ideal',
        `Melhor desempenho na categoria ${catStats.melhorCategoria} (${catStats.melhorTaxa}% de aproveitamento).`,
        'competicao',
        'media',
        'positivo',
        '🎾',
        64
      )
    )
  }

  // ——— Recuperação ———
  if (wellness.corpoDepoisJogos.some((c) => c.nome.toLowerCase().includes('dor'))) {
    list.push(
      rec(
        'Atenção à recuperação',
        'Dor muscular após jogos aparece com frequência. Alongue e hidrate bem pós-partida.',
        'recuperacao',
        'media',
        'neutro',
        '🩹',
        66
      )
    )
  }

  // ——— Geral desempenho ———
  if (stats.aproveitamento >= 60 && matches.length >= 5) {
    list.push(
      rec(
        'Boa fase',
        `Aproveitamento geral de ${stats.aproveitamento}% — continue registrando para afinar os detalhes.`,
        'consistencia',
        'baixa',
        'positivo',
        '📈',
        50
      )
    )
  }

  return list.sort((a, b) => b.relevancia - a.relevancia)
}

export function computeFocusAreas(input: CoachingInput): FocusArea[] {
  const { matches, titles } = input
  const wellness = calcularWellnessStats(matches)
  const titleStats = calcularStatsTitulos(titles, matches)

  const confiante = wellness.comparacaoHumor.find((h) =>
    h.humor.toLowerCase().includes('confiante')
  )
  const ansioso = wellness.comparacaoHumor.find((h) =>
    h.humor.toLowerCase().includes('ansioso')
  )
  const cansado = wellness.comparacaoCorpo.find((c) =>
    c.sintoma.toLowerCase().includes('cansado')
  )

  let mentalScore = 50
  if (confiante) mentalScore = confiante.taxaVitoria
  if (ansioso && ansioso.taxaVitoria < mentalScore) {
    mentalScore = Math.max(30, 100 - ansioso.taxaVitoria)
  }
  if (wellness.comparacaoHumor.length === 0) mentalScore = 50

  let fisicoScore = 55
  if (cansado) fisicoScore = cansado.taxaVitoria
  if (matches.filter((p) => (p.corpo_antes ?? []).length > 0).length < 2) {
    fisicoScore = 50
  }

  let finaisScore =
    titleStats.finaisJogadas > 0 ? titleStats.aproveitamentoFinais : 50

  const areas: FocusArea[] = [
    {
      id: 'mental',
      label: 'Controle emocional',
      score: Math.min(100, Math.max(0, mentalScore)),
      hint: mentalScore >= 60 ? 'Bom momento mental' : 'Priorize rotina pré-jogo',
    },
    {
      id: 'fisico',
      label: 'Condicionamento',
      score: Math.min(100, Math.max(0, fisicoScore)),
      hint: fisicoScore >= 55 ? 'Corpo respondendo bem' : 'Cuidado com o cansaço',
    },
    {
      id: 'finais',
      label: 'Desempenho em finais',
      score: Math.min(100, Math.max(0, finaisScore)),
      hint:
        titleStats.finaisJogadas > 0
          ? `${titleStats.finaisJogadas} finais registradas`
          : 'Registre finais para medir',
    },
  ]

  return areas.sort((a, b) => a.score - b.score).slice(0, 3)
}
