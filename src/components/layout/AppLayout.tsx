import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import { X } from 'lucide-react'
import { Header } from './Header'
import { MobileNav } from './MobileNav'
import { SidebarContent } from './SidebarContent'
import { IconButton } from '../ui/Button'

export function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { pathname } = useLocation()

  // Scroll to the top whenever the page changes.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  useEffect(() => {
    if (!drawerOpen) return
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setDrawerOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [drawerOpen])

  return (
    <div className="min-h-dvh">
      {/* Soft background glow */}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-80 bg-gradient-to-b from-brand-100/50 via-pink-50/30 to-transparent dark:from-brand-500/[0.06] dark:via-transparent"
        aria-hidden
      />

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-line bg-surface-muted/50 backdrop-blur lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <div className="absolute inset-0 animate-fade-in bg-slate-900/30 backdrop-blur-[2px]" onClick={() => setDrawerOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] animate-slide-in-left border-r border-line bg-canvas shadow-lift">
            <IconButton label="Close menu" onClick={() => setDrawerOpen(false)} className="absolute top-5 right-3">
              <X className="size-5" />
            </IconButton>
            <SidebarContent onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      <div className="lg:pl-64">
        <Header onOpenMenu={() => setDrawerOpen(true)} />
        <main className="px-4 pt-6 pb-28 sm:px-6 lg:px-10 lg:pt-8 lg:pb-12">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  )
}
