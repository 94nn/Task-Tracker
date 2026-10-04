import { Link } from 'react-router'
import { CalendarClock } from 'lucide-react'
import { Checkbox } from '../ui/Checkbox'
import { PriorityBadge } from '../ui/Badge'
import { useAssignments } from '../../hooks/useAssignments'
import type { TaskItem } from '../../utils/assignmentUtils'
import { daysUntil, formatShortDate } from '../../utils/dateUtils'
import { cn } from '../../utils/cn'

function dueText(dueDate: string): { text: string; className: string } {
  const days = daysUntil(dueDate)
  if (days < 0) return { text: `Overdue · ${formatShortDate(dueDate)}`, className: 'text-rose-600 dark:text-rose-300' }
  if (days === 0) return { text: 'Today', className: 'text-orange-600 dark:text-orange-300' }
  if (days === 1) return { text: 'Tomorrow', className: 'text-muted' }
  return { text: formatShortDate(dueDate), className: 'text-muted' }
}

/** One subtask with its checkbox, parent assignment link, due date and priority. */
export function TaskRow({ task, compact }: { task: TaskItem; compact?: boolean }) {
  const { toggleSubtask } = useAssignments()
  const { subtask, assignment } = task
  const due = dueText(task.dueDate)

  return (
    <li className={cn('flex items-center gap-3 rounded-xl px-2 transition-colors hover:bg-surface-muted/60', compact ? 'py-2.5' : 'py-3')}>
      <Checkbox
        checked={subtask.completed}
        onChange={() => toggleSubtask(assignment.id, subtask.id)}
        label={`Mark “${subtask.title}” as ${subtask.completed ? 'not done' : 'done'}`}
      />
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'truncate text-sm font-semibold transition-colors',
            subtask.completed && 'text-subtle line-through decoration-subtle/60',
          )}
        >
          {subtask.title}
        </p>
        <div className="mt-0.5 flex min-w-0 items-center gap-2 text-xs">
          <Link
            to={`/assignments/${assignment.id}`}
            className="truncate font-medium text-brand-600 hover:underline dark:text-brand-300"
          >
            {assignment.title}
          </Link>
          {!subtask.completed && (
            <span className={cn('inline-flex shrink-0 items-center gap-1 font-medium', due.className)}>
              <CalendarClock className="size-3" aria-hidden />
              {due.text}
            </span>
          )}
        </div>
      </div>
      {!compact && (
        <div className="shrink-0">
          <PriorityBadge priority={assignment.priority} />
        </div>
      )}
    </li>
  )
}
