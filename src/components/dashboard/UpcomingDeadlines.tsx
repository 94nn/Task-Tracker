import { Link } from 'react-router'
import { ArrowRight, PartyPopper } from 'lucide-react'
import type { Assignment } from '../../types/assignment'
import { Card } from '../ui/Card'
import { PriorityBadge, StatusBadge } from '../ui/Badge'
import { ProgressBar } from '../ui/ProgressBar'
import { EmptyState } from '../ui/EmptyState'
import { DueLabel, SubjectChip, URGENCY_ACCENT, urgencyTone } from '../assignments/AssignmentBits'
import { getUrgency } from '../../utils/assignmentUtils'
import { cn } from '../../utils/cn'

export function UpcomingDeadlines({ assignments }: { assignments: Assignment[] }) {
  return (
    <Card className="animate-fade-up p-5 sm:p-6" style={{ animationDelay: '80ms' }}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold">Upcoming Deadlines</h2>
          <p className="mt-0.5 text-xs text-muted">Ordered by what's due first</p>
        </div>
        <Link
          to="/assignments"
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-semibold text-brand-600 transition-colors hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-brand-400/10"
        >
          View all <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>

      {assignments.length === 0 ? (
        <EmptyState
          icon={PartyPopper}
          title="No upcoming deadlines"
          description="Every assignment is done. Enjoy the free time — you've earned it."
          className="py-10"
        />
      ) : (
        <ul className="mt-5 grid gap-3 md:grid-cols-2">
          {assignments.map((a, i) => (
            <li key={a.id} className="animate-fade-up" style={{ animationDelay: `${120 + i * 50}ms` }}>
              <UpcomingCard assignment={a} />
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

function UpcomingCard({ assignment }: { assignment: Assignment }) {
  return (
    <Link
      to={`/assignments/${assignment.id}`}
      className="relative flex h-full flex-col gap-3 overflow-hidden rounded-xl border border-line bg-surface p-4 pl-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-soft dark:hover:border-brand-400/30"
    >
      <span className={cn('absolute inset-y-3 left-0 w-1 rounded-r-full', URGENCY_ACCENT[getUrgency(assignment)])} aria-hidden />
      <div className="min-w-0">
        <p className="truncate text-sm font-bold">{assignment.title}</p>
        <SubjectChip subject={assignment.subject} className="mt-1.5" />
      </div>
      <div className="flex flex-wrap gap-1.5">
        <DueLabel assignment={assignment} />
      </div>
      <div className="mt-auto flex items-center gap-3">
        <ProgressBar value={assignment.progress} tone={urgencyTone(assignment)} label={`${assignment.title} progress`} />
        <span className="text-xs font-bold tabular-nums">{assignment.progress}%</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <PriorityBadge priority={assignment.priority} />
        <StatusBadge status={assignment.status} />
      </div>
    </Link>
  )
}
