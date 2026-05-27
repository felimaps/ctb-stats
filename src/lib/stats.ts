import type { Match, MatchStats } from '../types'

export function calcularEstatisticas(partidas: Match[]): MatchStats {
  const ordenadas = [...partidas].sort(
    (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()
  )

  const vitorias = ordenadas.filter((p) => p.resultado === 'vitoria').length
  const derrotas = ordenadas.length - vitorias
  const totalPartidas = ordenadas.length
  const aproveitamento =
    totalPartidas > 0 ? Math.round((vitorias / totalPartidas) * 100) : 0

  let sequenciaAtual = 0
  let melhorSequencia = 0
  let atual = 0

  for (const p of ordenadas) {
    if (p.resultado === 'vitoria') {
      atual++
      melhorSequencia = Math.max(melhorSequencia, atual)
    } else {
      atual = 0
    }
  }

  // Sequência atual: do fim para o início
  for (let i = ordenadas.length - 1; i >= 0; i--) {
    if (ordenadas[i].resultado === 'vitoria') sequenciaAtual++
    else break
  }

  const pontuacao = vitorias * 10 + derrotas * 2

  return {
    totalPartidas,
    vitorias,
    derrotas,
    aproveitamento,
    sequenciaAtual,
    melhorSequencia,
    pontuacao,
  }
}

export function calcularPontuacao(vitorias: number, derrotas: number): number {
  return vitorias * 10 + derrotas * 2
}
