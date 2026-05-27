import { GENERAL_TIPS } from '../../lib/coaching/tipsLibrary'
import { COACHING_CATEGORY_LABELS } from '../../lib/coaching/types'

export function TipsLibrarySection() {
  return (
    <section>
      <h2 className="text-lg font-bold text-ctb-dark">Biblioteca de dicas</h2>
      <p className="text-sm text-ctb-muted mt-0.5 mb-4">
        Dicas rápidas para o dia a dia em quadra
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {GENERAL_TIPS.map((tip) => (
          <div
            key={tip.id}
            className="ctb-card p-4 hover:ring-1 hover:ring-ctb-primary/10 transition-all"
          >
            <span className="text-2xl" aria-hidden>
              {tip.icone}
            </span>
            <span className="block text-[10px] font-bold uppercase text-ctb-primary mt-2">
              {COACHING_CATEGORY_LABELS[tip.categoria]}
            </span>
            <h3 className="font-semibold text-ctb-dark text-sm mt-0.5">{tip.titulo}</h3>
            <p className="text-xs text-ctb-muted mt-1 leading-relaxed">{tip.descricao}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
