import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  User,
  PlusCircle,
  History,
  BarChart3,
  Trophy,
  Crown,
  Swords,
  Rss,
  LogOut,
  TrendingUp,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { UserAvatar } from '../profile/UserAvatar'

const links = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/nova-partida', icon: PlusCircle, label: 'Nova Partida' },
  { to: '/historico', icon: History, label: 'Histórico' },
  { to: '/estatisticas', icon: BarChart3, label: 'Estatísticas' },
  { to: '/rivalidades', icon: Swords, label: 'Rivalidades' },
  { to: '/titulos', icon: Crown, label: 'Títulos' },
  { to: '/ranking', icon: Trophy, label: 'Ranking' },
  { to: '/melhore-seu-jogo', icon: TrendingUp, label: 'Melhore seu jogo' },
  { to: '/feed', icon: Rss, label: 'Feed' },
  { to: '/perfil', icon: User, label: 'Perfil' },
]

export function Sidebar() {
  const { user, signOut, isDemoMode } = useAuth()

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-[260px] lg:fixed lg:inset-y-0 bg-white border-r border-ctb-border">
      <div className="px-5 py-6 border-b border-ctb-border">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ctb-light text-lg">
            🎾
          </div>
          <div>
            <p className="font-bold text-ctb-dark text-lg leading-tight tracking-tight">
              CTB Stats
            </p>
            <p className="text-xs text-ctb-muted">Tênis amador</p>
          </div>
        </div>
      </div>

      {isDemoMode && (
        <div className="mx-4 mt-4 rounded-xl bg-amber-50 border border-amber-100 px-3 py-2 text-xs text-amber-800 font-medium">
          Modo demonstração
        </div>
      )}

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'ctb-nav-active'
                  : 'text-ctb-muted hover:bg-ctb-bg hover:text-ctb-dark'
              }`
            }
          >
            <Icon className="h-5 w-5 shrink-0" strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-ctb-border">
        <div className="flex items-center gap-3 mb-3 px-1">
          <UserAvatar user={user} size="md" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-ctb-dark truncate">{user?.nome}</p>
            <p className="text-xs text-ctb-muted truncate">{user?.cidade}</p>
          </div>
        </div>
        <button
          onClick={() => signOut()}
          className="flex w-full items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-ctb-muted hover:bg-red-50 hover:text-red-500 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </aside>
  )
}
