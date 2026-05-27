import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  title?: string
  subtitle?: string
  accent?: boolean
  padding?: 'sm' | 'md' | 'lg'
}

const paddingMap = {
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
}

export function Card({
  children,
  className = '',
  title,
  subtitle,
  accent = false,
  padding = 'md',
}: CardProps) {
  return (
    <div
      className={`ctb-card ${accent ? 'ctb-card-accent' : ''} ${paddingMap[padding]} ${className}`}
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-base font-semibold text-ctb-dark">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-ctb-muted mt-0.5">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </div>
  )
}
