import { Link } from 'react-router-dom'
import {
  History,
  Crown,
  Rss,
  Trophy,
  TrendingUp,
  X,
} from 'lucide-react'

const links = [
  { to: '/historico', icon: History, label: 'Histórico' },
  { to: '/titulos', icon: Crown, label: 'Títulos' },
  { to: '/melhore-seu-jogo', icon: TrendingUp, label: 'Melhore seu jogo' },
  { to: '/feed', icon: Rss, label: 'Feed' },
  { to: '/ranking', icon: Trophy, label: 'Ranking' },
]

interface MobileMenuSheetProps {
  open: boolean
  onClose: () => void
}

export function MobileMenuSheet({ open, onClose }: MobileMenuSheetProps) {
  if (!open) return null

  return (
    <div className="lg:hidden fixed inset-0 z-[60]" role="dialog" aria-modal="true">
      <button
        type="button"
        className="absolute inset-0 bg-ctb-dark/20 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Fechar menu"
      />
      <div className="absolute bottom-0 inset-x-0 bg-white rounded-t-2xl border-t border-ctb-border shadow-lg safe-area-pb animate-[ctb-fade-in_0.2s_ease-out]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-ctb-border">
          <p className="font-semibold text-ctb-dark">Mais opções</p>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-ctb-muted hover:bg-ctb-bg min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="p-3 grid grid-cols-1 gap-1 max-h-[50vh] overflow-y-auto">
          {links.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-ctb-dark font-medium hover:bg-ctb-light transition-colors min-h-[48px]"
            >
              <Icon className="h-5 w-5 text-ctb-primary shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}
