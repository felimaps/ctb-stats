import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  PlusCircle,
  BarChart3,
  Swords,
  Menu,
} from 'lucide-react'
import { MobileMenuSheet } from './MobileMenuSheet'

const links = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Início' },
  { to: '/nova-partida', icon: PlusCircle, label: 'Jogar' },
  { to: '/rivalidades', icon: Swords, label: 'Rivais' },
  { to: '/estatisticas', icon: BarChart3, label: 'Stats' },
]

export function BottomNav() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 safe-area-pb bg-white/95 backdrop-blur-lg border-t border-ctb-border">
        <div className="flex items-stretch justify-around px-1 pt-1 pb-2">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center justify-center gap-0.5 py-2 rounded-xl text-[11px] font-semibold transition-all min-w-0 min-h-[56px] ${
                  isActive ? 'text-ctb-primary' : 'text-ctb-muted'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                      isActive ? 'bg-ctb-light' : ''
                    }`}
                  >
                    <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                  </span>
                  <span className="truncate max-w-[4.5rem] px-0.5">{label}</span>
                </>
              )}
            </NavLink>
          ))}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 rounded-xl text-[11px] font-semibold text-ctb-muted min-h-[56px]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl">
              <Menu className="h-5 w-5" />
            </span>
            <span>Mais</span>
          </button>
        </div>
      </nav>
      <MobileMenuSheet open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}
