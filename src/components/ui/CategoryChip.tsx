import type { Match } from '../../types'
import { getCategoriaDisplay } from '../../types'
import { isCategoriaAntiga } from '../../lib/categories'
import type { CategoriaJogo } from '../../types'

type ChipVariant = 'default' | 'titulo' | 'antiga'

const styles: Record<ChipVariant, string> = {
  default: 'bg-ctb-light text-ctb-primary border-ctb-primary/20',
  titulo: 'bg-amber-50 text-amber-800 border-amber-200',
  antiga: 'bg-ctb-bg text-ctb-muted border-ctb-border',
}

interface CategoryChipProps {
  match: Match
  categoriaAtualKey?: CategoriaJogo | null
  className?: string
}

export function CategoryChip({
  match,
  categoriaAtualKey = null,
  className = '',
}: CategoryChipProps) {
  if (!match.categoria_jogo) return null

  let variant: ChipVariant = 'default'
  if (match.conquistou_titulo && match.vale_titulo) variant = 'titulo'
  else if (isCategoriaAntiga(match, categoriaAtualKey)) variant = 'antiga'

  const label = getCategoriaDisplay(match)

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[variant]} ${className}`}
    >
      {label}
    </span>
  )
}

export function CategoryLabelChip({
  label,
  variant = 'default',
}: {
  label: string
  variant?: ChipVariant
}) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[variant]}`}
    >
      {label}
    </span>
  )
}
