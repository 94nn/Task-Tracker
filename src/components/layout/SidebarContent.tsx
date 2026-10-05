import { NavLink, useNavigate } from 'react-router'
import { ChevronsUpDown, Keyboard, LogOut, Settings as SettingsIcon } from 'lucide-react'
import { Logo } from './Logo'
import { NAV_ITEMS } from './navItems'
import { Avatar } from '../ui/Avatar'
import { DropdownMenu } from '../ui/DropdownMenu'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { useAssignments } from '../../hooks/useAssignments'
import { useSettings } from '../../hooks/useSettings'
import { getAllTasks, isTaskDueToday } from '../../utils/assignmentUtils'
import { cn } from '../../utils/cn'

/** Logo, navigation and profile. Used by the desktop sidebar and the mobile drawer. */
export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { assignments } = useAssignments()
  const { settings } = useSettings()
  const { user, signOut } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const counts: Record<string, number> = {
    '/assignments': assignments.filter((a) => a.status !== 'completed').length,
    '/tasks': getAllTasks(assignments).filter(isTaskDueToday).length,
  }

  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pt-6 pb-8">
        <Logo />
      </div>

      <nav aria-label="Main navigation" className="flex-1 px-3">
        <p className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-subtle uppercase">Menu</p>
        <ul className="space-y-0.5">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'group flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-all duration-200',
                    isActive
                      ? 'bg-surface text-ink shadow-soft ring-1 ring-line'
                      : 'text-muted hover:bg-surface/60 hover:text-ink',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={cn(
                        'size-[18px] transition-colors',
                        isActive ? 'text-brand-500' : 'text-subtle group-hover:text-muted',
                      )}
                      aria-hidden
                    />
                    <span className="flex-1">{label}</span>
                    {counts[to] > 0 && (
                      <span
                        className={cn(
                          'rounded-full px-2 py-px text-[11px] font-bold tabular-nums',
                          isActive
                            ? 'bg-brand-100 text-brand-700 dark:bg-brand-400/15 dark:text-brand-300'
                            : 'bg-line/70 text-muted',
                        )}
                      >
                        {counts[to]}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="mx-1 mt-8 hidden rounded-2xl border border-dashed border-line p-4 lg:block">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold text-muted">
            <Keyboard className="size-4 text-brand-400" aria-hidden /> Shortcuts
          </div>
          <dl className="space-y-1.5 text-xs text-muted">
            {[
              ['Search', '/'],
              ['New assignment', 'N'],
            ].map(([label, key]) => (
              <div key={label} className="flex items-center justify-between">
                <dt>{label}</dt>
                <dd>
                  <kbd className="rounded-md border border-line bg-surface px-1.5 py-px font-sans text-[11px] font-semibold">
                    {key}
                  </kbd>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </nav>

      <div className="p-3">
        {user ? (
          // Signed in: profile with a menu for Settings and Sign out.
          <DropdownMenu
            align="left"
            side="top"
            items={[
              {
                label: 'Settings',
                icon: <SettingsIcon className="size-4" />,
                onSelect: () => {
                  navigate('/settings')
                  onNavigate?.()
                },
              },
              {
                label: 'Sign out',
                icon: <LogOut className="size-4" />,
                danger: true,
                onSelect: async () => {
                  onNavigate?.()
                  await signOut()
                  toast('Signed out', { description: 'See you soon!', variant: 'info' })
                },
              },
            ]}
            trigger={(props) => (
              <button
                type="button"
                {...props}
                className="flex w-full items-center gap-3 rounded-2xl p-2.5 text-left transition-colors hover:bg-surface/70"
                aria-label={`Account: ${user.email}. Open account menu`}
              >
                <Avatar name={settings.name} photoURL={user.photoURL} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{settings.name}</p>
                  <p className="truncate text-xs text-subtle">{user.email}</p>
                </div>
                <ChevronsUpDown className="size-4 shrink-0 text-subtle" aria-hidden />
              </button>
            )}
          />
        ) : (
          <NavLink
            to="/settings"
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-2xl p-2.5 transition-colors hover:bg-surface/70"
            aria-label={`Profile: ${settings.name}. Open settings`}
          >
            <Avatar name={settings.name} />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{settings.name}</p>
              <p className="text-xs text-subtle">University student</p>
            </div>
          </NavLink>
        )}
      </div>
    </div>
  )
}
