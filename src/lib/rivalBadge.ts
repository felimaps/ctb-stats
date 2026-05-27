import type { RivalStats } from '../types'

export interface RivalBadge {
  emoji: string
  label: string
  variant: 'fire' | 'hard' | 'classic'
}

export function getRivalBadge(
  rival: RivalStats,
  allRivals: RivalStats[]
): RivalBadge | null {
  if (rival.jogos < 2) return null

  const topByGames = allRivals[0]
  if (topByGames?.adversario === rival.adversario && rival.jogos >= 3) {
    return { emoji: '🔥', label: 'Rival frequente', variant: 'fire' }
  }

  if (rival.jogos >= 3 && rival.aproveitamento <= 40) {
    return { emoji: '🏆', label: 'Adversário difícil', variant: 'hard' }
  }

  if (
    rival.jogos >= 3 &&
    rival.aproveitamento >= 42 &&
    rival.aproveitamento <= 58
  ) {
    return { emoji: '⚡', label: 'Clássico equilibrado', variant: 'classic' }
  }

  return null
}
