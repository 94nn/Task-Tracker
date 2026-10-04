import { Link } from 'react-router'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Card } from '../ui/Card'
import { TaskRow } from '../tasks/TaskRow'
import type { TaskItem } from '../../utils/assignmentUtils'

/** Subtasks due today (or overdue) that haven't been ticked off yet. */
export function TodayFocus({ tasks }: { tasks: TaskItem[] }) {
  const shown = tasks.slice(0, 5)
  return (
    <Card className="animate-fade-up p-5 sm:p-6" style={{ animationDelay: '160ms' }}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold">Today's Focus</h2>
          <p className="mt-0.5 text-xs text-muted">
            {tasks.length === 0 ? 'Nothing due today' : `${tasks.length} task${tasks.length === 1 ? '' : 's'} need attention`}
          </p>
        </div>
        <Link
          to="/tasks"
          aria-label="View all tasks"
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-semibold text-brand-600 transition-colors hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-brand-400/10"
        >
          Tasks <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>

      {shown.length === 0 ? (
        <div className="mt-5 flex items-center gap-3 rounded-xl bg-surface-muted p-4">
          <Sparkles className="size-5 shrink-0 text-brand-400" aria-hidden />
          <p className="text-sm text-muted">You're all caught up for today!</p>
        </div>
      ) : (
        <ul className="mt-3 -mx-2 divide-y divide-line">
          {shown.map((task) => (
            <TaskRow key={task.subtask.id} task={task} compact />
          ))}
        </ul>
      )}
    </Card>
  )
}
