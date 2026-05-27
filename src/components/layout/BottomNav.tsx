import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  PlusCircle,
  BarChart3,
  User,
  Swords,
} from 'lucide-react'

const links = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Início' },
  { to: '/nova-partida', icon: PlusCircle, label: 'Jogar' },
  { to: '/estatisticas', icon: BarChart3, label: 'Stats' },
  { to: '/rivalidades', icon: Swords, label: 'Rivais' },
  { to: '/perfil', icon: User, label: 'Perfil' },
]

export function BottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 safe-area-pb bg-white/90 backdrop-blur-lg border-t border-ctb-border">
      <div className="flex items-stretch justify-around px-1 pt-1 pb-2">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center justify-center gap-0.5 py-2 rounded-xl text-[10px] font-semibold transition-all min-w-0 ${
                isActive ? 'text-ctb-primary' : 'text-ctb-muted'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
                    isActive ? 'bg-ctb-light' : ''
                  }`}
                >
                  <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                </span>
                <span className="truncate max-w-full px-0.5">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
