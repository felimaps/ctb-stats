import { Link } from 'react-router-dom'
import { Sparkles, ChevronRight } from 'lucide-react'
import type { CoachingRecommendation } from '../../lib/coaching/types'

interface InsightOfDayCardProps {
  insight: CoachingRecommendation | null
  compact?: boolean
}

export function InsightOfDayCard({ insight, compact = false }: InsightOfDayCardProps) {
  if (!insight) return null

  if (compact) {
    return (
      <Link
        to="/melhore-seu-jogo"
        className="flex items-center gap-3 group"
      >
        <div className="rounded-lg bg-ctb-primary p-2 shrink-0">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-ctb-primary">
            Insight do dia
          </p>
          <p className="text-sm font-medium text-ctb-dark line-clamp-1 group-hover:text-ctb-primary transition-colors">
            {insight.titulo}
          </p>
        </div>
        <ChevronRight className="h-4 w-4 text-ctb-muted shrink-0 group-hover:text-ctb-primary" />
      </Link>
    )
  }

  return (
    <Link
      to="/melhore-seu-jogo"
      className="block ctb-card ctb-card-accent p-4 hover:ring-1 hover:ring-ctb-primary/10 group transition-all"
    >
      <div className="flex items-start gap-3 pl-2">
        <div className="rounded-xl bg-ctb-primary p-2.5 shrink-0">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-ctb-primary">
            Insight do dia
          </p>
          <p className="font-semibold text-ctb-dark mt-1 leading-snug group-hover:text-ctb-primary transition-colors">
            {insight.titulo}
          </p>
          <p className="text-sm text-ctb-muted mt-0.5 line-clamp-2">{insight.descricao}</p>
        </div>
        <ChevronRight className="h-5 w-5 text-ctb-muted shrink-0 mt-1 group-hover:text-ctb-primary transition-colors" />
      </div>
    </Link>
  )
}
