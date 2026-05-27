import type { Match, Title } from '../../types'

/** Categorias de recomendação — extensível para IA futura */
export type CoachingCategory =
  | 'mental'
  | 'fisico'
  | 'tatico'
  | 'consistencia'
  | 'quadra'
  | 'rivalidades'
  | 'competicao'
  | 'recuperacao'

export type CoachingPriority = 'alta' | 'media' | 'baixa'

export type CoachingTone = 'positivo' | 'alerta' | 'neutro' | 'dica'

export interface CoachingRecommendation {
  id: string
  titulo: string
  descricao: string
  categoria: CoachingCategory
  prioridade: CoachingPriority
  tom: CoachingTone
  icone: string
  /** Score 0–100 para ordenação; maior = mais relevante */
  relevancia: number
  /** Metadados para futura camada de IA */
  meta?: Record<string, unknown>
}

export interface FocusArea {
  id: string
  label: string
  score: number
  hint: string
}

export interface GeneralTip {
  id: string
  titulo: string
  descricao: string
  categoria: CoachingCategory
  icone: string
}

export interface CoachingReport {
  recommendations: CoachingRecommendation[]
  focusAreas: FocusArea[]
  insightOfDay: CoachingRecommendation | null
  hasEnoughData: boolean
  generatedAt: string
}

/** Contexto de entrada — padronizado para plugar IA depois */
export interface CoachingInput {
  matches: Match[]
  titles: Title[]
  /** Override opcional (ex.: resposta de API de IA) */
  externalRecommendations?: CoachingRecommendation[]
}

export const COACHING_CATEGORY_LABELS: Record<CoachingCategory, string> = {
  mental: 'Mental',
  fisico: 'Físico',
  tatico: 'Tático',
  consistencia: 'Consistência',
  quadra: 'Quadra',
  rivalidades: 'Rivalidades',
  competicao: 'Competição',
  recuperacao: 'Recuperação',
}

export const COACHING_PRIORITY_LABELS: Record<CoachingPriority, string> = {
  alta: 'Prioridade alta',
  media: 'Prioridade média',
  baixa: 'Dica rápida',
}
