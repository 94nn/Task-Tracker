import { Link } from 'react-router'
import { CalendarCheck, ListChecks, Trophy } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { ProgressBar } from '../components/ui/ProgressBar'
import { SubjectChip } from '../components/assignments/AssignmentBits'
import { AssignmentActions } from '../components/assignments/AssignmentActions'
import { useAssignments } from '../hooks/useAssignments'
import { formatTimestamp } from '../utils/dateUtils'

export default function Completed() {
  const { assignments } = useAssignments()
  const completed = assignments
    .filter((a) => a.status === 'completed')
    .sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''))

  if (completed.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={Trophy}
          title="Nothing completed yet."
          description="Finish your first assignment and it'll appear here ✨"
          className="py-20"
        />
      </Card>
    )
  }

  const totalSubtasks = completed.reduce((sum, a) => sum + a.subtasks.length, 0)

  return (
    <div className="space-y-5">
      <Card className="relative animate-fade-up overflow-hidden p-5 sm:p-6">
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-emerald-50 via-sky-50/60 to-brand-50 dark:from-emerald-400/[0.06] dark:via-transparent dark:to-brand-400/[0.06]"
          aria-hidden
        />
        <div className="relative flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-surface shadow-soft">
            <Trophy className="size-6 text-amber-400" aria-hidden />
          </div>
          <div>
            <p className="text-base font-bold">
              {completed.length} assignment{completed.length === 1 ? '' : 's'} finished 🎉
            </p>
            <p className="text-sm text-muted">{totalSubtasks} subtasks ticked off along the way. Celebrate the wins!</p>
          </div>
        </div>
      </Card>

      <ul className="grid gap-3">
        {completed.map((a, i) => (
          <li
            key={a.id}
            className="flex animate-fade-up flex-col gap-4 rounded-2xl border border-line bg-surface p-4 shadow-soft sm:flex-row sm:items-center sm:p-5"
            style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
          >
            <div className="min-w-0 flex-1">
              <Link to={`/assignments/${a.id}`} className="block truncate text-[15px] font-bold hover:text-brand-600 dark:hover:text-brand-300">
                {a.title}
              </Link>
              <SubjectChip subject={a.subject} className="mt-1.5" />
            </div>

            <dl className="grid grid-cols-3 gap-4 text-xs sm:flex sm:items-center sm:gap-8">
              <div>
                <dt className="flex items-center gap-1 text-subtle">
                  <CalendarCheck className="size-3.5" aria-hidden /> Completed
                </dt>
                <dd className="mt-1 font-semibold">{a.completedAt ? formatTimestamp(a.completedAt) : '—'}</dd>
              </div>
              <div className="sm:w-32">
                <dt className="text-subtle">Final progress</dt>
                <dd className="mt-1 flex items-center gap-2 font-semibold">
                  <ProgressBar value={a.progress} tone="green" label={`${a.title} final progress`} />
                  <span className="tabular-nums">{a.progress}%</span>
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1 text-subtle">
                  <ListChecks className="size-3.5" aria-hidden /> Subtasks
                </dt>
                <dd className="mt-1 font-semibold">{a.subtasks.length}</dd>
              </div>
            </dl>

            <AssignmentActions assignment={a} className="hidden sm:flex" />
          </li>
        ))}
      </ul>
    </div>
  )
}
