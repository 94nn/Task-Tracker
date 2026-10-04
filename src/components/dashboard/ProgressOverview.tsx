import { Card } from '../ui/Card'
import { ProgressRing } from '../ui/ProgressRing'
import type { AssignmentStats } from '../../utils/assignmentUtils'
import { progressMessage } from '../../utils/assignmentUtils'

export function ProgressOverview({ stats }: { stats: AssignmentStats }) {
  const rows = [
    { label: 'Completed', value: stats.completed, color: 'bg-emerald-300' },
    { label: 'In progress', value: stats.inProgress, color: 'bg-orange-300' },
    { label: 'Not started', value: stats.notStarted, color: 'bg-line' },
  ]

  return (
    <Card className="animate-fade-up p-5 sm:p-6" style={{ animationDelay: '120ms' }}>
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold">Overall Progress</h2>
        <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-400/10 dark:text-brand-300">
          {progressMessage(stats.completionRate)}
        </span>
      </div>

      <div className="mt-6 flex flex-col items-center">
        <ProgressRing value={stats.completionRate} />
        <p className="mt-4 text-sm text-muted">
          <span className="font-bold text-ink">{stats.completed}</span> of{' '}
          <span className="font-bold text-ink">{stats.total}</span> assignments completed
        </p>
      </div>

      {/* Stacked breakdown bar */}
      <div className="mt-6">
        <div className="flex h-2 overflow-hidden rounded-full bg-surface-muted" aria-hidden>
          {stats.total > 0 &&
            rows.map((r) => (
              <div key={r.label} className={`${r.color} transition-all duration-700`} style={{ width: `${(r.value / stats.total) * 100}%` }} />
            ))}
        </div>
        <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
          {rows.map((r) => (
            <div key={r.label}>
              <dt className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-muted">
                <span className={`size-2 rounded-full ${r.color}`} aria-hidden />
                {r.label}
              </dt>
              <dd className="mt-0.5 text-sm font-bold tabular-nums">{r.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Card>
  )
}
