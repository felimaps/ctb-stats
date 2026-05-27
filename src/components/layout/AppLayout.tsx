import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'

export function AppLayout() {
  return (
    <div className="min-h-dvh bg-ctb-bg">
      <Sidebar />
      <main className="lg:pl-[260px] pb-24 lg:pb-10">
        <div className="max-w-4xl mx-auto px-4 py-6 lg:py-10 ctb-animate-in">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
