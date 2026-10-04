import { CalendarClock, Hash } from 'lucide-react'
import type { Assignment } from '../../types/assignment'
import { getUrgency, subjectColor, type Urgency } from '../../utils/assignmentUtils'
import { formatShortDate, relativeDueLabel } from '../../utils/dateUtils'
import { cn } from '../../utils/cn'
import type { ProgressTone } from '../ui/ProgressBar'

/** Small coloured label for the subject / module. */
export function SubjectChip({ subject, className }: { subject: string; className?: string }) {
  if (!subject) return <span className={cn('text-xs font-medium text-subtle', className)}>No subject</span>
  return (
    <span
      className={cn('inline-block max-w-full truncate rounded-md px-2 py-0.5 text-xs font-semibold', subjectColor(subject), className)}
    >
      {subject}
    </span>
  )
}

const URGENCY_STYLES: Record<Urgency, string> = {
  normal: 'bg-sky-50 text-sky-700 dark:bg-sky-400/10 dark:text-sky-300',
  soon: 'bg-orange-50 text-orange-700 dark:bg-orange-400/10 dark:text-orange-300',
  overdue: 'bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300',
  completed: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300',
}

/** "Due Oct 8 · 3 days left" pill, coloured by urgency (blue → orange → red). */
export function DueLabel({ assignment, compact }: { assignment: Assignment; compact?: boolean }) {
  const urgency = getUrgency(assignment)
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap',
        URGENCY_STYLES[urgency],
      )}
    >
      <CalendarClock className="size-3.5" aria-hidden />
      {compact ? formatShortDate(assignment.dueDate) : `Due ${formatShortDate(assignment.dueDate)}`}
      {urgency !== 'completed' && (
        <>
          <span className="opacity-40" aria-hidden>
            ·
          </span>
          {relativeDueLabel(assignment.dueDate)}
        </>
      )}
    </span>
  )
}

export function urgencyTone(assignment: Assignment): ProgressTone {
  const tones: Record<Urgency, ProgressTone> = { normal: 'brand', soon: 'orange', overdue: 'red', completed: 'green' }
  return tones[getUrgency(assignment)]
}

/** Coloured strip on the left edge of a card that signals urgency. */
export const URGENCY_ACCENT: Record<Urgency, string> = {
  normal: 'bg-sky-300 dark:bg-sky-400/60',
  soon: 'bg-orange-300 dark:bg-orange-400/60',
  overdue: 'bg-rose-400 dark:bg-rose-400/70',
  completed: 'bg-emerald-300 dark:bg-emerald-400/60',
}

export function TagList({ tags, max = 3 }: { tags: string[]; max?: number }) {
  if (tags.length === 0) return null
  const shown = tags.slice(0, max)
  return (
    <div className="flex flex-wrap items-center gap-1">
      {shown.map((tag) => (
        <span key={tag} className="inline-flex items-center text-xs font-medium text-subtle">
          <Hash className="size-3" aria-hidden />
          {tag}
        </span>
      ))}
      {tags.length > max && <span className="text-xs text-subtle">+{tags.length - max}</span>}
    </div>
  )
}
