import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'

export function AppLayout() {
  return (
    <div className="min-h-dvh bg-ctb-bg overflow-x-hidden">
      <Sidebar />
      <main className="lg:pl-[260px] pb-28 lg:pb-10 min-w-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-5 py-6 lg:py-10 ctb-animate-in w-full min-w-0">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
