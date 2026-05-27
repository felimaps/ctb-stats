import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-2">
      <div>
        <h1 className="ctb-page-title">{title}</h1>
        {subtitle && <p className="ctb-page-subtitle">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
