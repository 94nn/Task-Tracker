import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { CalendarX, Plus } from 'lucide-react'
import type { Assignment } from '../types/assignment'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { PriorityBadge, StatusBadge } from '../components/ui/Badge'
import { MonthCalendar } from '../components/calendar/MonthCalendar'
import { SubjectChip, URGENCY_ACCENT } from '../components/assignments/AssignmentBits'
import { useAssignments } from '../hooks/useAssignments'
import { useUI } from '../hooks/useUI'
import { getUrgency } from '../utils/assignmentUtils'
import { formatLongDate, parseDate, relativeDueLabel, todayISO } from '../utils/dateUtils'
import { cn } from '../utils/cn'

export default function Calendar() {
  const { assignments } = useAssignments()
  const { openCreate } = useUI()
  const now = new Date()
  const [view, setView] = useState({ year: now.getFullYear(), month: now.getMonth() })
  const [selected, setSelected] = useState(todayISO())

  // Group assignments by due date for quick lookup.
  const byDate = useMemo(() => {
    const map = new Map<string, Assignment[]>()
    for (const a of assignments) map.set(a.dueDate, [...(map.get(a.dueDate) ?? []), a])
    return map
  }, [assignments])

  const selectedItems = byDate.get(selected) ?? []

  function handleSelect(date: string) {
    setSelected(date)
    // Clicking a greyed-out day from another month jumps to that month.
    const d = parseDate(date)
    if (d.getMonth() !== view.month || d.getFullYear() !== view.year) {
      setView({ year: d.getFullYear(), month: d.getMonth() })
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <Card className="animate-fade-up p-3 sm:p-5 lg:col-span-2">
        <MonthCalendar
          year={view.year}
          month={view.month}
          selected={selected}
          byDate={byDate}
          onSelect={handleSelect}
          onChangeMonth={(year, month) => setView({ year, month })}
        />
      </Card>

      <Card className="animate-fade-up self-start p-5 sm:p-6" style={{ animationDelay: '80ms' }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide text-subtle uppercase">Selected day</p>
            <h2 className="mt-1 text-base font-bold">{formatLongDate(selected)}</h2>
          </div>
          <Button variant="secondary" size="sm" icon={<Plus className="size-4" />} onClick={() => openCreate(selected)}>
            Add
          </Button>
        </div>

        {selectedItems.length === 0 ? (
          <div className="mt-6 flex flex-col items-center rounded-xl border border-dashed border-line px-4 py-8 text-center">
            <CalendarX className="mb-2 size-6 text-subtle" aria-hidden />
            <p className="text-sm font-semibold">Nothing due this day</p>
            <p className="mt-0.5 text-xs text-muted">Enjoy the free time, or plan ahead.</p>
          </div>
        ) : (
          <ul className="mt-5 space-y-2.5">
            {selectedItems.map((a) => (
              <li key={a.id}>
                <Link
                  to={`/assignments/${a.id}`}
                  className="relative block overflow-hidden rounded-xl border border-line p-3.5 pl-4.5 transition-all hover:-translate-y-0.5 hover:shadow-soft"
                >
                  <span className={cn('absolute inset-y-2.5 left-0 w-1 rounded-r-full', URGENCY_ACCENT[getUrgency(a)])} aria-hidden />
                  <p className="text-sm font-bold">{a.title}</p>
                  <SubjectChip subject={a.subject} className="mt-1.5" />
                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                    <PriorityBadge priority={a.priority} />
                    <StatusBadge status={a.status} />
                    {a.status !== 'completed' && (
                      <span className="text-xs font-medium text-muted">{relativeDueLabel(a.dueDate)}</span>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
