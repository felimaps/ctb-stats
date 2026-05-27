import { Outlet, Link } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className="min-h-dvh flex flex-col bg-ctb-bg">
      <header className="px-6 py-5">
        <Link to="/login" className="flex items-center gap-3 w-fit">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ctb-primary text-lg">
            🎾
          </div>
          <span className="font-bold text-ctb-dark text-xl tracking-tight">CTB Stats</span>
        </Link>
      </header>
      <main className="flex-1 w-full px-4 py-6 sm:py-10 pb-12 flex flex-col items-center justify-start md:justify-center">
        <Outlet />
      </main>
    </div>
  )
}
