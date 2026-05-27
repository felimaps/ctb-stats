import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  accent?: 'primary' | 'success' | 'danger' | 'gold' | 'neutral'
}

const accents = {
  primary: 'bg-ctb-light text-ctb-primary',
  success: 'bg-emerald-50 text-emerald-500',
  danger: 'bg-red-50 text-red-400',
  gold: 'bg-amber-50 text-amber-500',
  neutral: 'bg-ctb-bg text-ctb-muted',
}

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = 'primary',
}: StatCardProps) {
  return (
    <div className="ctb-stat">
      <div className="flex items-start justify-between gap-2 pl-1">
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-ctb-muted uppercase tracking-wide">
            {label}
          </p>
          <p className="mt-1.5 text-2xl font-bold text-ctb-dark tabular-nums">{value}</p>
        </div>
        <div className={`rounded-xl p-2 shrink-0 ${accents[accent]}`}>
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
      </div>
    </div>
  )
}
