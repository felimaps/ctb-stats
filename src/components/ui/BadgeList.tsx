import type { Badge } from '../../types'

export function BadgeList({ badges }: { badges: Badge[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {badges.map((b) => (
        <div
          key={b.id}
          className={`rounded-2xl border p-4 text-center transition-all duration-200 ${
            b.desbloqueada
              ? 'border-ctb-primary/20 bg-ctb-light/50'
              : 'border-ctb-border bg-ctb-bg/50 opacity-45 grayscale'
          }`}
        >
          <span className="text-3xl">{b.icone}</span>
          <p className="mt-2 text-sm font-semibold text-ctb-dark">{b.titulo}</p>
          <p className="text-xs text-ctb-muted mt-0.5">{b.descricao}</p>
        </div>
      ))}
    </div>
  )
}
