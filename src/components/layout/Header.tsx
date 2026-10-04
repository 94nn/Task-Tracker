import { useLocation } from 'react-router'
import { Menu, Plus, Search } from 'lucide-react'
import { Button, IconButton } from '../ui/Button'
import { NotificationsMenu } from './NotificationsMenu'
import { Logo } from './Logo'
import { useSettings } from '../../hooks/useSettings'
import { useUI } from '../../hooks/useUI'
import { getGreeting } from '../../utils/dateUtils'

function usePageMeta(): { title: string; subtitle: string } {
  const { pathname } = useLocation()
  const { settings } = useSettings()
  const firstName = settings.name.trim().split(/\s+/)[0] || 'there'

  if (pathname === '/') {
    return { title: `${getGreeting()}, ${firstName} 👋`, subtitle: "Here's what you need to focus on today." }
  }
  if (pathname.startsWith('/assignments/')) {
    return { title: 'Assignment details', subtitle: 'Break it down and keep moving forward.' }
  }
  const pages: Record<string, { title: string; subtitle: string }> = {
    '/assignments': { title: 'Assignments', subtitle: 'All your coursework in one calm place.' },
    '/calendar': { title: 'Calendar', subtitle: 'See your deadlines at a glance.' },
    '/tasks': { title: 'Tasks', subtitle: 'Every subtask across all your assignments.' },
    '/completed': { title: 'Completed', subtitle: 'A record of everything you’ve finished.' },
    '/settings': { title: 'Settings', subtitle: 'Make the tracker feel like yours.' },
  }
  return pages[pathname] ?? { title: 'Taskly', subtitle: '' }
}

export function Header({ onOpenMenu }: { onOpenMenu: () => void }) {
  const { openCreate, openSearch } = useUI()
  const { title, subtitle } = usePageMeta()

  return (
    <>
      {/* Mobile / tablet top bar */}
      <div className="sticky top-0 z-30 flex h-16 items-center gap-1 border-b border-line bg-canvas/85 px-3 backdrop-blur-lg lg:hidden">
        <IconButton label="Open menu" onClick={onOpenMenu}>
          <Menu className="size-5" />
        </IconButton>
        <div className="flex-1 pl-1">
          <Logo />
        </div>
        <IconButton label="Search" onClick={openSearch}>
          <Search className="size-5" />
        </IconButton>
        <NotificationsMenu />
      </div>

      <header className="flex flex-col gap-4 px-4 pt-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-10 lg:pt-9">
        <div className="min-w-0 animate-fade-up">
          <h1 className="truncate text-2xl font-bold tracking-tight sm:text-[28px]">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted sm:text-[15px]">{subtitle}</p>}
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <button
            type="button"
            onClick={openSearch}
            className="flex h-11 w-56 items-center gap-2.5 rounded-xl border border-line bg-surface px-3.5 text-sm text-subtle shadow-xs transition-colors hover:border-subtle/50 hover:text-muted xl:w-64"
            aria-label="Open search (Ctrl+K)"
          >
            <Search className="size-4" aria-hidden />
            <span className="flex-1 text-left">Search…</span>
            <kbd className="rounded-md border border-line px-1.5 py-px text-[11px] font-semibold">Ctrl K</kbd>
          </button>
          <NotificationsMenu />
          <Button variant="brand" icon={<Plus className="size-4.5" aria-hidden />} onClick={() => openCreate()}>
            Add Assignment
          </Button>
        </div>
      </header>
    </>
  )
}
