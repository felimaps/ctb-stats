import type { Badge, Match, Title } from '../types'
import { isPartidaFinal } from './matchUtils'

export function calcularBadges(partidas: Match[], titles: Title[] = []): Badge[] {
  const vitorias = partidas.filter((p) => p.resultado === 'vitoria')
  const total = partidas.length

  const ordenadas = [...partidas].sort(
    (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()
  )
  let maxSeq = 0
  let seq = 0
  for (const p of ordenadas) {
    if (p.resultado === 'vitoria') {
      seq++
      maxSeq = Math.max(maxSeq, seq)
    } else seq = 0
  }

  const vitoriasSaibro = vitorias.filter((p) => p.tipo_quadra === 'saibro').length
  const maratonista = partidas.some((p) => p.duracao != null && p.duracao >= 120)

  const finais = partidas.filter(isPartidaFinal)
  const finaisVencidas = finais.filter((f) => f.resultado === 'vitoria').length
  const finaisPerdidas = finais.length - finaisVencidas
  const invictoFinais = finais.length >= 2 && finaisPerdidas === 0
  const taxaFinais =
    finais.length > 0 ? Math.round((finaisVencidas / finais.length) * 100) : 0

  return [
    {
      id: 'primeira-vitoria',
      titulo: 'Primeira Vitória',
      descricao: 'Registrou sua primeira vitória',
      icone: '🏆',
      desbloqueada: vitorias.length >= 1,
    },
    {
      id: '5-vitorias',
      titulo: '5 Vitórias',
      descricao: 'Alcançou 5 vitórias no total',
      icone: '⭐',
      desbloqueada: vitorias.length >= 5,
    },
    {
      id: '10-partidas',
      titulo: '10 Partidas',
      descricao: 'Jogou 10 partidas registradas',
      icone: '🎾',
      desbloqueada: total >= 10,
    },
    {
      id: '3-sequencia',
      titulo: 'Invencível',
      descricao: '3 vitórias seguidas',
      icone: '🔥',
      desbloqueada: maxSeq >= 3,
    },
    {
      id: 'rei-saibro',
      titulo: 'Rei do Saibro',
      descricao: '5 vitórias em quadra de saibro',
      icone: '🏟️',
      desbloqueada: vitoriasSaibro >= 5,
    },
    {
      id: 'maratonista',
      titulo: 'Maratonista',
      descricao: 'Partida com mais de 2 horas',
      icone: '⏱️',
      desbloqueada: maratonista,
    },
    {
      id: 'primeiro-campeao',
      titulo: 'Primeiro Campeão',
      descricao: 'Conquistou seu primeiro título',
      icone: '👑',
      desbloqueada: titles.length >= 1,
    },
    {
      id: 'tricampeao',
      titulo: 'Tricampeão',
      descricao: '3 títulos conquistados',
      icone: '🏅',
      desbloqueada: titles.length >= 3,
    },
    {
      id: 'rei-finais',
      titulo: 'Rei das Finais',
      descricao: '5 finais vencidas',
      icone: '🎖️',
      desbloqueada: finaisVencidas >= 5,
    },
    {
      id: 'invicto-finais',
      titulo: 'Invicto em Finais',
      descricao: 'Venceu todas as finais (mín. 2)',
      icone: '🛡️',
      desbloqueada: invictoFinais,
    },
    {
      id: 'especialista-decisoes',
      titulo: 'Especialista em Decisões',
      descricao: '80%+ de aproveitamento em finais (mín. 3)',
      icone: '⚡',
      desbloqueada: finais.length >= 3 && taxaFinais >= 80,
    },
  ]
}
