import { Link } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronRight, Swords } from 'lucide-react'
import { RivalMiniChart } from './RivalMiniChart'
import type { RivalStats } from '../../types'
import { QUADRA_LABELS } from '../../types'
import { getRivalBadge } from '../../lib/rivalBadge'

const badgeStyles = {
  fire: 'bg-orange-50 text-orange-700 border-orange-100',
  hard: 'bg-red-50 text-red-700 border-red-100',
  classic: 'bg-ctb-light text-ctb-primary border-ctb-primary/20',
}

export function RivalCard({
  rival,
  allRivals,
}: {
  rival: RivalStats
  allRivals: RivalStats[]
}) {
  const badge = getRivalBadge(rival, allRivals)

  return (
    <article className="ctb-card overflow-hidden hover:ring-1 hover:ring-ctb-primary/10 transition-all duration-200">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="rounded-2xl bg-ctb-light p-3 shrink-0">
              <Swords className="h-6 w-6 text-ctb-primary" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <h3 className="text-xl font-bold text-ctb-dark ctb-break-words line-clamp-2">{rival.adversario}</h3>
              {badge && (
                <span
                  className={`inline-flex items-center gap-1 mt-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${badgeStyles[badge.variant]}`}
                >
                  {badge.emoji} {badge.label}
                </span>
              )}
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-3xl font-bold text-ctb-primary tabular-nums">
              {rival.aproveitamento}%
            </p>
            <p className="text-[10px] font-semibold text-ctb-muted uppercase tracking-wide">
              aproveit.
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4 text-sm">
          <div className="flex gap-3">
            <span className="font-bold text-emerald-600">{rival.vitorias}V</span>
            <span className="text-ctb-muted">·</span>
            <span className="font-bold text-red-500">{rival.derrotas}D</span>
            <span className="text-ctb-muted">·</span>
            <span className="text-ctb-muted">{rival.jogos} jogos</span>
          </div>
        </div>

        <div className="mt-3 h-2 bg-ctb-bg rounded-full overflow-hidden">
          <div
            className="h-full bg-ctb-primary rounded-full transition-all duration-500"
            style={{ width: `${rival.aproveitamento}%` }}
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-xl bg-ctb-bg/80 px-3 py-2.5">
            <p className="text-ctb-muted font-medium">Último jogo</p>
            <p className="font-bold text-ctb-dark mt-0.5">{rival.ultimoPlacar}</p>
            <p className="text-ctb-muted mt-0.5">
              {format(parseISO(rival.ultimaData), 'dd MMM yyyy', { locale: ptBR })}
            </p>
          </div>
          <div className="rounded-xl bg-ctb-bg/80 px-3 py-2.5">
            <p className="text-ctb-muted font-medium">Quadra frequente</p>
            <p className="font-bold text-ctb-dark mt-0.5">
              {rival.quadraMaisFrequente ? QUADRA_LABELS[rival.quadraMaisFrequente] : '—'}
            </p>
          </div>
        </div>

        {(rival.humorAntesComum || rival.corpoAntesComum) && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {rival.humorAntesComum && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-ctb-light text-ctb-primary font-medium">
                {rival.humorAntesComum}
              </span>
            )}
            {rival.corpoAntesComum && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-ctb-bg text-ctb-muted font-medium">
                {rival.corpoAntesComum}
              </span>
            )}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-ctb-border/60">
          <RivalMiniChart data={rival.evolucao} />
          <div className="mt-4 flex justify-end">
            <Link
              to={`/rivalidades/${rival.slug}`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-ctb-primary hover:gap-2 transition-all"
            >
              Ver detalhes
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}
