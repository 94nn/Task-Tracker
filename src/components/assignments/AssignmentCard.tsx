import { Link } from 'react-router'
import { ListChecks, Paperclip, User } from 'lucide-react'
import type { Assignment } from '../../types/assignment'
import { PriorityBadge, StatusBadge } from '../ui/Badge'
import { ProgressBar } from '../ui/ProgressBar'
import { AssignmentActions } from './AssignmentActions'
import { DueLabel, SubjectChip, TagList, URGENCY_ACCENT, urgencyTone } from './AssignmentBits'
import { getUrgency } from '../../utils/assignmentUtils'
import { formatTimestamp } from '../../utils/dateUtils'
import { cn } from '../../utils/cn'

interface AssignmentCardProps {
  assignment: Assignment
  /** Delay (ms) for the staggered fade-in. */
  delay?: number
}

export function AssignmentCard({ assignment, delay = 0 }: AssignmentCardProps) {
  const done = assignment.subtasks.filter((s) => s.completed).length
  const urgency = getUrgency(assignment)

  return (
    <article
      className="group relative flex animate-fade-up flex-col overflow-hidden rounded-2xl border border-line bg-surface p-5 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className={cn('absolute inset-y-4 left-0 w-1 rounded-r-full', URGENCY_ACCENT[urgency])} aria-hidden />

      <div className="flex items-start justify-between gap-3">
        <SubjectChip subject={assignment.subject} />
        {/* Sits above the full-card link so the menu stays clickable. */}
        <AssignmentActions assignment={assignment} className="relative z-10 -mt-1.5 -mr-2" />
      </div>

      <h3 className="mt-2.5 text-[15px] leading-snug font-bold">
        <Link
          to={`/assignments/${assignment.id}`}
          className="after:absolute after:inset-0 after:content-[''] focus:outline-none focus-visible:after:rounded-2xl focus-visible:after:ring-2 focus-visible:after:ring-brand-400"
        >
          {assignment.title}
        </Link>
      </h3>
      {assignment.lecturer && (
        <p className="mt-1 inline-flex items-center gap-1 text-xs text-subtle">
          <User className="size-3.5" aria-hidden />
          {assignment.lecturer}
        </p>
      )}
      {assignment.description && <p className="mt-2 line-clamp-2 text-sm text-muted">{assignment.description}</p>}

      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        <DueLabel assignment={assignment} />
        <PriorityBadge priority={assignment.priority} />
        <StatusBadge status={assignment.status} />
      </div>

      <div className="mt-auto pt-5">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-medium text-muted">Progress</span>
          <span className="font-bold tabular-nums">{assignment.progress}%</span>
        </div>
        <ProgressBar value={assignment.progress} tone={urgencyTone(assignment)} label={`${assignment.title} progress`} />

        <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-line pt-3.5 text-xs text-subtle">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1" title="Subtasks completed">
              <ListChecks className="size-3.5" aria-hidden />
              {assignment.subtasks.length > 0 ? `${done}/${assignment.subtasks.length}` : 'No subtasks'}
            </span>
            {assignment.attachments.length > 0 && (
              <span className="inline-flex items-center gap-1" title="Attached PDFs">
                <Paperclip className="size-3.5" aria-hidden />
                {assignment.attachments.length}
              </span>
            )}
            <span>Added {formatTimestamp(assignment.createdAt)}</span>
          </div>
          <TagList tags={assignment.tags} max={2} />
        </div>
      </div>
    </article>
  )
}
