import { NavLink } from 'react-router'
import { BookOpen, CalendarDays, LayoutDashboard, ListChecks, Plus } from 'lucide-react'
import { useUI } from '../../hooks/useUI'
import { cn } from '../../utils/cn'

const LEFT = [
  { to: '/', label: 'Home', icon: LayoutDashboard },
  { to: '/assignments', label: 'Assignments', icon: BookOpen },
]
const RIGHT = [
  { to: '/tasks', label: 'Tasks', icon: ListChecks },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
]

/** Bottom tab bar for phones and tablets, with a central "add" button. */
export function MobileNav() {
  const { openCreate } = useUI()

  const renderLink = ({ to, label, icon: Icon }: (typeof LEFT)[number]) => (
    <NavLink
      key={to}
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        cn(
          'flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-semibold transition-colors',
          isActive ? 'text-brand-600 dark:text-brand-300' : 'text-subtle',
        )
      }
    >
      <Icon className="size-[22px]" aria-hidden />
      {label}
    </NavLink>
  )

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg lg:hidden"
    >
      <div className="mx-auto flex h-16 max-w-lg items-stretch px-2">
        {LEFT.map(renderLink)}
        <div className="flex flex-1 items-center justify-center">
          <button
            type="button"
            onClick={() => openCreate()}
            aria-label="Add assignment"
            className="-mt-6 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-600/30 ring-4 ring-canvas transition-transform active:scale-95"
          >
            <Plus className="size-6" strokeWidth={2.5} />
          </button>
        </div>
        {RIGHT.map(renderLink)}
      </div>
    </nav>
  )
}
