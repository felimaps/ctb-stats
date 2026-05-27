import type { CoachingReport, CoachingInput, CoachingRecommendation } from './types'
import { generateDataInsights, computeFocusAreas } from './insightsGenerator'

/**
 * Motor de coaching — hoje baseado em regras.
 * Futuro: mesclar `externalRecommendations` de uma API de IA aqui.
 */
export function buildCoachingReport(input: CoachingInput): CoachingReport {
  const dataInsights = generateDataInsights(input)
  const external = input.externalRecommendations ?? []

  const merged = mergeRecommendations(dataInsights, external)
  const focusAreas = computeFocusAreas(input)
  const insightOfDay = pickInsightOfDay(merged, input)

  return {
    recommendations: merged,
    focusAreas,
    insightOfDay,
    hasEnoughData: input.matches.length >= 2,
    generatedAt: new Date().toISOString(),
  }
}

function mergeRecommendations(
  primary: CoachingRecommendation[],
  external: CoachingRecommendation[]
): CoachingRecommendation[] {
  const byId = new Map<string, CoachingRecommendation>()
  for (const r of [...external, ...primary]) {
    if (!byId.has(r.id)) byId.set(r.id, r)
  }
  return [...byId.values()].sort((a, b) => b.relevancia - a.relevancia)
}

/** Insight estável por dia (mesmo usuário vê o mesmo no dashboard) */
export function pickInsightOfDay(
  recommendations: CoachingRecommendation[],
  input: CoachingInput
): CoachingRecommendation | null {
  if (recommendations.length === 0) {
    if (input.matches.length === 0) return null
    return {
      id: 'empty',
      titulo: 'Registre sua primeira partida',
      descricao: 'Quanto mais dados, melhores ficam suas recomendações personalizadas.',
      categoria: 'consistencia',
      prioridade: 'media',
      tom: 'neutro',
      icone: '🎾',
      relevancia: 0,
    }
  }

  const pool = recommendations.filter((r) => r.tom === 'positivo' || r.prioridade === 'alta')
  const list = pool.length > 0 ? pool : recommendations
  const daySeed = new Date().toISOString().slice(0, 10)
  const hash = daySeed.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return list[hash % list.length]
}

export function getInsightOfDay(input: CoachingInput): CoachingRecommendation | null {
  const report = buildCoachingReport(input)
  return report.insightOfDay
}
