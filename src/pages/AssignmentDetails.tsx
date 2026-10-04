import { useNavigate, useParams } from 'react-router'
import { ArrowLeft, CalendarDays, CircleCheck, Clock, FileQuestion, Pencil, RotateCcw, User } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { PriorityBadge, StatusBadge } from '../components/ui/Badge'
import { ProgressBar } from '../components/ui/ProgressBar'
import { EmptyState } from '../components/ui/EmptyState'
import { AssignmentActions } from '../components/assignments/AssignmentActions'
import { DueLabel, SubjectChip, urgencyTone } from '../components/assignments/AssignmentBits'
import { SubtaskList } from '../components/assignments/SubtaskList'
import { useAssignments } from '../hooks/useAssignments'
import { useUI } from '../hooks/useUI'
import { formatLongDate, formatTimestamp } from '../utils/dateUtils'
import { STATUS_LABELS } from '../utils/assignmentUtils'
import type { Status } from '../types/assignment'
import type { ReactNode } from 'react'

export default function AssignmentDetails() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { getAssignment, setProgress, updateAssignment } = useAssignments()
  const { openEdit } = useUI()
  const assignment = getAssignment(id)

  if (!assignment) {
    return (
      <Card>
        <EmptyState
          icon={FileQuestion}
          title="Assignment not found"
          description="It may have been deleted, or the link is incorrect."
          action={
            <Button variant="secondary" onClick={() => navigate('/assignments')}>
              Back to assignments
            </Button>
          }
        />
      </Card>
    )
  }

  const hasSubtasks = assignment.subtasks.length > 0
  const isCompleted = assignment.status === 'completed'

  const changeStatus = (status: Status) => {
    const { title, description, subject, lecturer, dueDate, priority, tags } = assignment
    updateAssignment(assignment.id, { title, description, subject, lecturer, dueDate, priority, tags, status })
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/assignments'))}
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-semibold text-muted transition-colors hover:bg-surface-muted hover:text-ink"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back
        </button>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={<Pencil className="size-4" />} onClick={() => openEdit(assignment)}>
            Edit
          </Button>
          <AssignmentActions
            assignment={assignment}
            showView={false}
            onDeleted={() => navigate('/assignments', { replace: true })}
            className="border border-line bg-surface"
          />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card className="animate-fade-up p-5 sm:p-7">
            <SubjectChip subject={assignment.subject} />
            <h2 className="mt-3 text-xl font-bold tracking-tight sm:text-2xl">{assignment.title}</h2>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <DueLabel assignment={assignment} />
              <PriorityBadge priority={assignment.priority} />
              <StatusBadge status={assignment.status} />
            </div>

            <div className="mt-6">
              <h3 className="text-xs font-semibold tracking-wide text-subtle uppercase">Description</h3>
              <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-muted">
                {assignment.description || 'No description added yet.'}
              </p>
            </div>

            {assignment.tags.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-1.5">
                {assignment.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg bg-surface-muted px-2.5 py-1 text-xs font-semibold text-muted"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </Card>

          <Card className="animate-fade-up p-5 sm:p-7" style={{ animationDelay: '60ms' }}>
            <SubtaskList assignment={assignment} />
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="animate-fade-up p-5 sm:p-6" style={{ animationDelay: '100ms' }}>
            <div className="flex items-end justify-between">
              <h3 className="text-base font-bold">Progress</h3>
              <span className="text-3xl font-bold tracking-tight tabular-nums">{assignment.progress}%</span>
            </div>
            <ProgressBar value={assignment.progress} tone={urgencyTone(assignment)} size="md" className="mt-3" label="Assignment progress" />
            {hasSubtasks ? (
              <p className="mt-3 text-xs text-muted">
                Calculated from subtasks — {assignment.subtasks.filter((s) => s.completed).length} of{' '}
                {assignment.subtasks.length} done.
              </p>
            ) : (
              <div className="mt-4">
                <label htmlFor="manual-progress" className="text-xs font-semibold text-muted">
                  No subtasks yet — set progress manually
                </label>
                <input
                  id="manual-progress"
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={assignment.progress}
                  onChange={(e) => setProgress(assignment.id, Number(e.target.value))}
                  className="mt-2 w-full accent-brand-500"
                />
              </div>
            )}

            <div className="mt-5 border-t border-line pt-4">
              {isCompleted ? (
                <Button variant="secondary" className="w-full" icon={<RotateCcw className="size-4" />} onClick={() => changeStatus('in-progress')}>
                  Mark as in progress
                </Button>
              ) : (
                <Button variant="brand" className="w-full" icon={<CircleCheck className="size-4" />} onClick={() => changeStatus('completed')}>
                  Mark as completed
                </Button>
              )}
            </div>
          </Card>

          <Card className="animate-fade-up p-5 sm:p-6" style={{ animationDelay: '140ms' }}>
            <h3 className="text-base font-bold">Details</h3>
            <dl className="mt-4 space-y-3.5">
              <DetailRow icon={<CalendarDays className="size-4" />} label="Deadline" value={formatLongDate(assignment.dueDate)} />
              <DetailRow icon={<User className="size-4" />} label="Lecturer" value={assignment.lecturer || '—'} />
              <DetailRow
                icon={<CircleCheck className="size-4" />}
                label="Status"
                value={
                  <select
                    value={assignment.status}
                    onChange={(e) => changeStatus(e.target.value as Status)}
                    aria-label="Change status"
                    className="-mr-1 rounded-lg bg-transparent py-0.5 text-right text-sm font-semibold hover:bg-surface-muted focus:outline-none"
                  >
                    {(Object.keys(STATUS_LABELS) as Status[]).map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                }
              />
              <DetailRow icon={<Clock className="size-4" />} label="Created" value={formatTimestamp(assignment.createdAt)} />
              {assignment.completedAt && (
                <DetailRow icon={<CircleCheck className="size-4" />} label="Completed" value={formatTimestamp(assignment.completedAt)} />
              )}
            </dl>
          </Card>
        </div>
      </div>
    </div>
  )
}

function DetailRow({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <dt className="flex items-center gap-2 text-muted">
        <span className="text-subtle" aria-hidden>
          {icon}
        </span>
        {label}
      </dt>
      <dd className="truncate text-right font-semibold">{value}</dd>
    </div>
  )
}
