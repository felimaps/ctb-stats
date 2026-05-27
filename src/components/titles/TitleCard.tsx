import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Trophy } from 'lucide-react'
import type { Title } from '../../types'
import { QUADRA_LABELS, NIVEL_TORNEIO_LABELS } from '../../types'
import { CategoryLabelChip } from '../ui/CategoryChip'

export function TitleCard({
  title,
  categoriaJogoLabel,
}: {
  title: Title
  categoriaJogoLabel?: string | null
}) {
  const ano = format(parseISO(title.data_titulo), 'yyyy')

  return (
    <article className="ctb-card p-5 border-amber-100/60 hover:border-amber-200/50 transition-all">
      <div className="flex items-start gap-4">
        <div className="rounded-xl bg-amber-50 p-2.5">
          <Trophy className="h-5 w-5 text-amber-500" strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold text-amber-600/80 uppercase tracking-widest">
            {ano} · {NIVEL_TORNEIO_LABELS[title.nivel_torneio]}
          </p>
          <h3 className="font-bold text-ctb-dark text-lg mt-0.5 leading-tight">
            {title.nome_torneio}
          </h3>
          <p className="text-sm text-ctb-muted mt-0.5">{title.categoria}</p>
          {categoriaJogoLabel && (
            <div className="mt-2">
              <CategoryLabelChip label={categoriaJogoLabel} variant="titulo" />
            </div>
          )}
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-ctb-border space-y-1 text-sm">
        <p className="text-ctb-dark">
          <span className="text-ctb-muted">Final:</span>{' '}
          <span className="font-semibold">{title.placar_final}</span>
          <span className="text-ctb-muted"> vs {title.adversario_final}</span>
        </p>
        <p className="text-xs text-ctb-muted">
          {QUADRA_LABELS[title.tipo_quadra]} ·{' '}
          {format(parseISO(title.data_titulo), "d 'de' MMMM yyyy", { locale: ptBR })}
        </p>
      </div>
    </article>
  )
}
