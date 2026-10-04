import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Assignment } from '../../types/assignment'
import { Button, IconButton } from '../ui/Button'
import { getUrgency, type Urgency } from '../../utils/assignmentUtils'
import { WEEKDAY_LABELS, getMonthGrid, toISODate, todayISO } from '../../utils/dateUtils'
import { cn } from '../../utils/cn'

const DOT_COLORS: Record<Urgency, string> = {
  normal: 'bg-sky-400',
  soon: 'bg-orange-400',
  overdue: 'bg-rose-400',
  completed: 'bg-emerald-400',
}

const CHIP_COLORS: Record<Urgency, string> = {
  normal: 'bg-sky-50 text-sky-800 dark:bg-sky-400/10 dark:text-sky-200',
  soon: 'bg-orange-50 text-orange-800 dark:bg-orange-400/10 dark:text-orange-200',
  overdue: 'bg-rose-50 text-rose-800 dark:bg-rose-400/10 dark:text-rose-200',
  completed: 'bg-emerald-50 text-emerald-800 line-through decoration-emerald-800/30 dark:bg-emerald-400/10 dark:text-emerald-200',
}

interface MonthCalendarProps {
  year: number
  month: number
  selected: string
  byDate: Map<string, Assignment[]>
  onSelect: (date: string) => void
  onChangeMonth: (year: number, month: number) => void
}

/** A lightweight monthly calendar grid (weeks start on Monday). */
export function MonthCalendar({ year, month, selected, byDate, onSelect, onChangeMonth }: MonthCalendarProps) {
  const days = getMonthGrid(year, month)
  const today = todayISO()
  const monthLabel = new Date(year, month, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })

  const shift = (delta: number) => {
    const d = new Date(year, month + delta, 1)
    onChangeMonth(d.getFullYear(), d.getMonth())
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-2 pb-4">
        <h2 className="text-lg font-bold tracking-tight" aria-live="polite">
          {monthLabel}
        </h2>
        <div className="flex items-center gap-1">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              const now = new Date()
              onChangeMonth(now.getFullYear(), now.getMonth())
              onSelect(today)
            }}
          >
            Today
          </Button>
          <IconButton label="Previous month" size="sm" onClick={() => shift(-1)}>
            <ChevronLeft className="size-4.5" />
          </IconButton>
          <IconButton label="Next month" size="sm" onClick={() => shift(1)}>
            <ChevronRight className="size-4.5" />
          </IconButton>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 pb-2" aria-hidden>
        {WEEKDAY_LABELS.map((d) => (
          <div key={d} className="text-center text-[11px] font-semibold tracking-wide text-subtle uppercase">
            <span className="sm:hidden">{d[0]}</span>
            <span className="hidden sm:inline">{d}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1" role="group" aria-label={monthLabel}>
        {days.map(({ date, inMonth }) => {
          const iso = toISODate(date)
          const items = byDate.get(iso) ?? []
          const isToday = iso === today
          const isSelected = iso === selected
          const label = `${date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}${
            items.length ? `, ${items.length} assignment${items.length > 1 ? 's' : ''} due` : ''
          }`

          return (
            <button
              key={iso}
              type="button"
              aria-pressed={isSelected}
              aria-label={label}
              onClick={() => onSelect(iso)}
              className={cn(
                'group flex aspect-square flex-col items-center rounded-xl border p-1 text-left transition-all duration-150 sm:aspect-auto sm:min-h-24 sm:items-stretch sm:p-1.5',
                isSelected
                  ? 'border-brand-300 bg-brand-50/70 ring-2 ring-brand-200 dark:border-brand-400/50 dark:bg-brand-400/10 dark:ring-brand-400/20'
                  : 'border-transparent hover:border-line hover:bg-surface-muted/70',
                !inMonth && 'opacity-40',
              )}
            >
              <span
                className={cn(
                  'flex size-7 items-center justify-center rounded-full text-sm font-semibold tabular-nums sm:size-6 sm:text-xs',
                  isToday && 'bg-ink text-canvas',
                  !isToday && isSelected && 'text-brand-700 dark:text-brand-200',
                )}
              >
                {date.getDate()}
              </span>

              {/* Phones: small dots */}
              {items.length > 0 && (
                <span className="mt-auto mb-1 flex gap-0.5 sm:hidden">
                  {items.slice(0, 3).map((a) => (
                    <span key={a.id} className={cn('size-1.5 rounded-full', DOT_COLORS[getUrgency(a)])} />
                  ))}
                </span>
              )}

              {/* Larger screens: title chips */}
              <span className="mt-1 hidden flex-col gap-0.5 sm:flex">
                {items.slice(0, 2).map((a) => (
                  <span key={a.id} className={cn('truncate rounded-md px-1.5 py-0.5 text-[11px] font-semibold', CHIP_COLORS[getUrgency(a)])}>
                    {a.title}
                  </span>
                ))}
                {items.length > 2 && <span className="px-1.5 text-[11px] font-semibold text-subtle">+{items.length - 2} more</span>}
              </span>
            </button>
          )
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted">
        {(
          [
            ['normal', 'Upcoming'],
            ['soon', 'Due soon'],
            ['overdue', 'Overdue'],
            ['completed', 'Completed'],
          ] as [Urgency, string][]
        ).map(([u, label]) => (
          <span key={u} className="inline-flex items-center gap-1.5">
            <span className={cn('size-2 rounded-full', DOT_COLORS[u])} aria-hidden />
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
