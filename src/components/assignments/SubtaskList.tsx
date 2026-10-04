import { useState, type FormEvent } from 'react'
import { CalendarPlus, ListChecks, Plus, Trash2 } from 'lucide-react'
import type { Assignment, Subtask } from '../../types/assignment'
import { Checkbox } from '../ui/Checkbox'
import { Button } from '../ui/Button'
import { useAssignments } from '../../hooks/useAssignments'
import { daysUntil, formatShortDate } from '../../utils/dateUtils'
import { cn } from '../../utils/cn'

/** Checklist of subtasks with inline add, rename, due date and delete. */
export function SubtaskList({ assignment }: { assignment: Assignment }) {
  const { addSubtask } = useAssignments()
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [showDate, setShowDate] = useState(false)

  const done = assignment.subtasks.filter((s) => s.completed).length

  function handleAdd(event: FormEvent) {
    event.preventDefault()
    if (!title.trim()) return
    addSubtask(assignment.id, title.trim(), dueDate || null)
    setTitle('')
    setDueDate('')
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base font-bold">
          <ListChecks className="size-5 text-brand-500" aria-hidden />
          Subtasks
        </h2>
        {assignment.subtasks.length > 0 && (
          <span className="text-sm font-semibold text-muted tabular-nums">
            {done} / {assignment.subtasks.length} completed
          </span>
        )}
      </div>

      {assignment.subtasks.length === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed border-line px-4 py-6 text-center text-sm text-muted">
          Break this assignment into smaller steps. Progress will update automatically as you tick them off.
        </p>
      ) : (
        <ul className="mt-3 space-y-1">
          {assignment.subtasks.map((subtask) => (
            <SubtaskItem key={subtask.id} assignmentId={assignment.id} subtask={subtask} />
          ))}
        </ul>
      )}

      <form onSubmit={handleAdd} className="mt-4 flex flex-col gap-2 sm:flex-row">
        <label htmlFor="new-subtask" className="sr-only">
          New subtask
        </label>
        <div className="flex flex-1 items-center gap-1 rounded-xl border border-line bg-surface pr-1 transition-colors focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-400/15">
          <Plus className="ml-3 size-4 shrink-0 text-subtle" aria-hidden />
          <input
            id="new-subtask"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a subtask…"
            className="h-11 min-w-0 flex-1 bg-transparent px-2 text-sm placeholder:text-subtle focus:outline-none"
            autoComplete="off"
          />
          {showDate ? (
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              aria-label="Subtask due date (optional)"
              className="h-9 rounded-lg bg-surface-muted px-2 text-xs text-muted focus:outline-none"
            />
          ) : (
            <button
              type="button"
              onClick={() => setShowDate(true)}
              className="flex h-9 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-subtle transition-colors hover:bg-surface-muted hover:text-ink"
              aria-label="Add a due date"
            >
              <CalendarPlus className="size-4" aria-hidden />
              <span className="hidden sm:inline">Due date</span>
            </button>
          )}
        </div>
        <Button type="submit" disabled={!title.trim()}>
          Add
        </Button>
      </form>
    </div>
  )
}

function SubtaskItem({ assignmentId, subtask }: { assignmentId: string; subtask: Subtask }) {
  const { toggleSubtask, updateSubtask, deleteSubtask } = useAssignments()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(subtask.title)

  function save() {
    const value = draft.trim()
    if (value && value !== subtask.title) updateSubtask(assignmentId, subtask.id, { title: value })
    else setDraft(subtask.title)
    setEditing(false)
  }

  const overdue = !subtask.completed && subtask.dueDate !== null && daysUntil(subtask.dueDate) < 0

  return (
    <li className="group flex animate-fade-up items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-surface-muted/70">
      <Checkbox
        checked={subtask.completed}
        onChange={() => toggleSubtask(assignmentId, subtask.id)}
        label={`Mark “${subtask.title}” as ${subtask.completed ? 'not done' : 'done'}`}
      />

      {editing ? (
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === 'Enter') save()
            if (e.key === 'Escape') {
              e.stopPropagation()
              setDraft(subtask.title)
              setEditing(false)
            }
          }}
          aria-label="Subtask title"
          autoFocus
          className="h-8 min-w-0 flex-1 rounded-lg border border-brand-300 bg-surface px-2 text-sm focus:outline-none"
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          title="Click to rename"
          className={cn(
            'min-w-0 flex-1 truncate text-left text-sm font-medium transition-colors',
            subtask.completed && 'text-subtle line-through decoration-subtle/60',
          )}
        >
          {subtask.title}
        </button>
      )}

      <label
        className={cn(
          'relative shrink-0 cursor-pointer rounded-md px-1.5 py-0.5 text-xs font-medium',
          subtask.dueDate
            ? overdue
              ? 'bg-rose-50 text-rose-600 dark:bg-rose-400/10 dark:text-rose-300'
              : 'bg-surface-muted text-muted'
            : 'text-subtle opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 max-sm:opacity-100',
        )}
      >
        {subtask.dueDate ? formatShortDate(subtask.dueDate) : <CalendarPlus className="size-4" aria-hidden />}
        <input
          type="date"
          value={subtask.dueDate ?? ''}
          onChange={(e) => updateSubtask(assignmentId, subtask.id, { dueDate: e.target.value || null })}
          onClick={(e) => {
            try {
              e.currentTarget.showPicker()
            } catch {
              // Older browsers: the native input still opens on its own.
            }
          }}
          aria-label={`Due date for ${subtask.title}`}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      </label>

      <button
        type="button"
        onClick={() => deleteSubtask(assignmentId, subtask.id)}
        aria-label={`Delete subtask ${subtask.title}`}
        className="shrink-0 rounded-lg p-1.5 text-subtle opacity-100 transition-all hover:bg-rose-50 hover:text-rose-500 sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100 dark:hover:bg-rose-400/10"
      >
        <Trash2 className="size-4" />
      </button>
    </li>
  )
}
