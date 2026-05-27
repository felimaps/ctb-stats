import type { Match } from '../types'

/** Normaliza partidas antigas sem campos de corpo/mente */
export function normalizeMatch(m: Record<string, unknown>): Match {
  return {
    ...(m as unknown as Match),
    humor_antes: (m.humor_antes as Match['humor_antes']) ?? [],
    corpo_antes: (m.corpo_antes as Match['corpo_antes']) ?? [],
    humor_depois: (m.humor_depois as Match['humor_depois']) ?? [],
    corpo_depois: (m.corpo_depois as Match['corpo_depois']) ?? [],
    vale_titulo: Boolean(m.vale_titulo),
    nome_torneio: (m.nome_torneio as string) ?? null,
    categoria_torneio: (m.categoria_torneio as string) ?? null,
    nivel_torneio: (m.nivel_torneio as Match['nivel_torneio']) ?? null,
    fase_partida: (m.fase_partida as Match['fase_partida']) ?? null,
    conquistou_titulo: Boolean(m.conquistou_titulo),
    categoria_jogo: (m.categoria_jogo as Match['categoria_jogo']) ?? null,
    categoria_personalizada: (m.categoria_personalizada as string) ?? null,
  }
}

export function isPartidaFinal(m: Match): boolean {
  return Boolean(m.vale_titulo && m.fase_partida === 'final')
}

export function adversarioSlug(nome: string): string {
  return encodeURIComponent(nome.trim().toLowerCase())
}

export function slugParaBusca(slug: string): string {
  try {
    return decodeURIComponent(slug).toLowerCase()
  } catch {
    return slug.toLowerCase()
  }
}

/** Estima margem de jogos a partir do placar (ex: "6-4, 6-3") */
export function margemPlacar(placar: string): number {
  let nos = 0
  let deles = 0
  const sets = placar.split(/[,;]/).map((s) => s.trim())
  for (const set of sets) {
    const parts = set.match(/(\d+)\s*[-–]\s*(\d+)/)
    if (!parts) continue
    const a = parseInt(parts[1], 10)
    const b = parseInt(parts[2], 10)
    if (Number.isNaN(a) || Number.isNaN(b)) continue
    nos += Math.max(a, b)
    deles += Math.min(a, b)
  }
  return nos - deles
}
