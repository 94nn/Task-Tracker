import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { Bell, BellOff, CircleCheck } from 'lucide-react'
import { IconButton } from '../ui/Button'
import { useAssignments } from '../../hooks/useAssignments'
import { useSettings } from '../../hooks/useSettings'
import { getUpcoming, getUrgency } from '../../utils/assignmentUtils'
import { relativeDueLabel } from '../../utils/dateUtils'
import { cn } from '../../utils/cn'

/** Bell icon with a panel listing overdue and due-soon assignments. */
export function NotificationsMenu() {
  const { assignments } = useAssignments()
  const { settings } = useSettings()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const alerts = getUpcoming(assignments).filter((a) => {
    const urgency = getUrgency(a)
    return urgency === 'overdue' || urgency === 'soon'
  })
  const showDot = settings.notifications && alerts.length > 0

  useEffect(() => {
    if (!open) return
    const close = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <IconButton
        label={showDot ? `Notifications (${alerts.length} need attention)` : 'Notifications'}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <Bell className="size-5" />
        {showDot && (
          <span className="absolute top-2.5 right-2.5 flex size-2.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-rose-400 opacity-60" />
            <span className="relative inline-flex size-2.5 rounded-full bg-rose-400 ring-2 ring-canvas" />
          </span>
        )}
      </IconButton>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="fixed inset-x-4 top-16 z-40 animate-scale-in rounded-2xl border border-line bg-surface shadow-lift sm:absolute sm:inset-x-auto sm:top-full sm:right-0 sm:mt-2 sm:w-80"
        >
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="text-sm font-bold">Notifications</p>
            {settings.notifications && alerts.length > 0 && (
              <span className="rounded-full bg-rose-50 px-2 py-px text-xs font-bold text-rose-600 dark:bg-rose-400/10 dark:text-rose-300">
                {alerts.length}
              </span>
            )}
          </div>

          {!settings.notifications ? (
            <div className="flex flex-col items-center px-6 py-8 text-center">
              <BellOff className="mb-2 size-6 text-subtle" aria-hidden />
              <p className="text-sm font-semibold">Notifications are off</p>
              <Link
                to="/settings"
                onClick={() => setOpen(false)}
                className="mt-1 text-xs font-semibold text-brand-600 hover:underline dark:text-brand-300"
              >
                Turn them on in Settings
              </Link>
            </div>
          ) : alerts.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-8 text-center">
              <CircleCheck className="mb-2 size-6 text-emerald-400" aria-hidden />
              <p className="text-sm font-semibold">You're all caught up!</p>
              <p className="mt-0.5 text-xs text-muted">No deadlines in the next few days.</p>
            </div>
          ) : (
            <ul className="max-h-80 overflow-y-auto p-1.5">
              {alerts.map((a) => {
                const overdue = getUrgency(a) === 'overdue'
                return (
                  <li key={a.id}>
                    <Link
                      to={`/assignments/${a.id}`}
                      onClick={() => setOpen(false)}
                      className="flex gap-3 rounded-xl px-2.5 py-2.5 transition-colors hover:bg-surface-muted"
                    >
                      <span
                        className={cn('mt-1.5 size-2 shrink-0 rounded-full', overdue ? 'bg-rose-400' : 'bg-orange-300')}
                        aria-hidden
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">{a.title}</span>
                        <span
                          className={cn(
                            'text-xs font-medium',
                            overdue ? 'text-rose-600 dark:text-rose-300' : 'text-orange-600 dark:text-orange-300',
                          )}
                        >
                          {relativeDueLabel(a.dueDate)}
                        </span>
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
