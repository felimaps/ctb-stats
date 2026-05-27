import { useMemo, useState } from 'react'
import { TrendingUp } from 'lucide-react'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { PageHeader } from '../components/ui/PageHeader'
import { RecommendationCard } from '../components/coaching/RecommendationCard'
import { FocusNowSection } from '../components/coaching/FocusNowSection'
import { TipsLibrarySection } from '../components/coaching/TipsLibrarySection'
import { useMatches } from '../hooks/useMatches'
import { buildCoachingReport } from '../lib/coaching'
import type { CoachingCategory } from '../lib/coaching/types'
import { COACHING_CATEGORY_LABELS } from '../lib/coaching/types'

const FILTER_CATEGORIES: (CoachingCategory | 'todas')[] = [
  'todas',
  'mental',
  'fisico',
  'tatico',
  'consistencia',
  'quadra',
  'rivalidades',
  'competicao',
  'recuperacao',
]

export function MelhoreSeuJogo() {
  const { matches, titles, loading } = useMatches()
  const [filter, setFilter] = useState<CoachingCategory | 'todas'>('todas')

  const report = useMemo(
    () => buildCoachingReport({ matches, titles }),
    [matches, titles]
  )

  const filtered =
    filter === 'todas'
      ? report.recommendations
      : report.recommendations.filter((r) => r.categoria === filter)

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <header className="rounded-2xl bg-white border border-ctb-border px-6 py-8 overflow-hidden relative">
        <div className="absolute -right-4 -top-4 text-7xl opacity-[0.04] select-none">🎾</div>
        <div className="relative flex items-start gap-4">
          <div className="rounded-2xl bg-ctb-light p-3">
            <TrendingUp className="h-8 w-8 text-ctb-primary" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ctb-dark">
              Melhore seu jogo
            </h1>
            <p className="text-sm text-ctb-muted mt-1 max-w-md">
              Insights e recomendações baseadas no seu desempenho.
            </p>
          </div>
        </div>
      </header>

      <FocusNowSection areas={report.focusAreas} />

      <section>
        <PageHeader
          title="Para você"
          subtitle={
            report.hasEnoughData
              ? 'Recomendações personalizadas'
              : 'Registre mais partidas para desbloquear insights'
          }
        />

        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
          {FILTER_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilter(cat)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                filter === cat
                  ? 'bg-ctb-primary text-white shadow-sm shadow-ctb-primary/25'
                  : 'bg-white text-ctb-muted border border-ctb-border hover:border-ctb-primary/30'
              }`}
            >
              {cat === 'todas' ? 'Todas' : COACHING_CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        <div className="space-y-3 mt-4">
          {filtered.length === 0 ? (
            <p className="text-sm text-ctb-muted text-center py-12 ctb-card">
              Nenhuma recomendação nesta categoria ainda.
            </p>
          ) : (
            filtered.map((item) => <RecommendationCard key={item.id} item={item} />)
          )}
        </div>
      </section>

      <TipsLibrarySection />
    </div>
  )
}
