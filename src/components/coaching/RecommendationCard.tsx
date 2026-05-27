import type { CoachingRecommendation } from '../../lib/coaching/types'
import {
  COACHING_CATEGORY_LABELS,
  COACHING_PRIORITY_LABELS,
} from '../../lib/coaching/types'

const TOM_STYLES = {
  positivo: 'border-emerald-100 bg-gradient-to-br from-white to-emerald-50/30',
  alerta: 'border-amber-100 bg-gradient-to-br from-white to-amber-50/40',
  neutro: 'border-ctb-border bg-white',
  dica: 'border-ctb-border bg-white',
}

const PRIORITY_DOT = {
  alta: 'bg-ctb-accent',
  media: 'bg-ctb-primary',
  baixa: 'bg-ctb-muted/40',
}

interface RecommendationCardProps {
  item: CoachingRecommendation
}

export function RecommendationCard({ item }: RecommendationCardProps) {
  return (
    <article
      className={`ctb-card ctb-card-accent p-4 transition-all duration-200 hover:ring-1 hover:ring-ctb-primary/10 ${TOM_STYLES[item.tom]}`}
    >
      <div className="flex items-start gap-3 pl-2">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ctb-light text-xl"
          aria-hidden
        >
          {item.icone}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ctb-primary bg-ctb-light px-2 py-0.5 rounded-full">
              {COACHING_CATEGORY_LABELS[item.categoria]}
            </span>
            <span
              className="flex items-center gap-1 text-[10px] text-ctb-muted"
              title={COACHING_PRIORITY_LABELS[item.prioridade]}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${PRIORITY_DOT[item.prioridade]}`} />
              {item.prioridade === 'alta' ? 'Prioridade' : item.prioridade === 'media' ? 'Relevante' : 'Dica'}
            </span>
          </div>
          <h3 className="font-semibold text-ctb-dark leading-snug">{item.titulo}</h3>
          <p className="text-sm text-ctb-muted mt-1 leading-relaxed">{item.descricao}</p>
        </div>
      </div>
    </article>
  )
}
