import type { FocusArea } from '../../lib/coaching/types'

interface FocusNowSectionProps {
  areas: FocusArea[]
}

export function FocusNowSection({ areas }: FocusNowSectionProps) {
  return (
    <section className="ctb-card p-6 bg-gradient-to-br from-ctb-light/80 to-white">
      <p className="text-[10px] font-bold uppercase tracking-widest text-ctb-primary">
        Foque nisso agora
      </p>
      <p className="text-sm text-ctb-muted mt-1 mb-6">
        Três áreas com maior potencial de evolução
      </p>
      <div className="space-y-5">
        {areas.map((area) => (
          <div key={area.id}>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-medium text-ctb-dark">{area.label}</span>
              <span className="font-bold tabular-nums text-ctb-primary">{area.score}%</span>
            </div>
            <div className="h-2 rounded-full bg-ctb-border/60 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-ctb-secondary to-ctb-primary transition-all duration-700 ease-out"
                style={{ width: `${area.score}%` }}
              />
            </div>
            <p className="text-xs text-ctb-muted mt-1.5">{area.hint}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
