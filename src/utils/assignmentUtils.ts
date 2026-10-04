import type { Assignment, Priority, Status, Subtask } from '../types/assignment'
import { daysUntil, todayISO } from './dateUtils'

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

export const STATUS_LABELS: Record<Status, string> = {
  'not-started': 'Not Started',
  'in-progress': 'In Progress',
  completed: 'Completed',
}

export const PRIORITY_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 }

/** Number of days before a deadline when it counts as "due soon". */
export const DUE_SOON_DAYS = 3

export type Urgency = 'completed' | 'overdue' | 'soon' | 'normal'

export function getUrgency(assignment: Assignment): Urgency {
  if (assignment.status === 'completed') return 'completed'
  const days = daysUntil(assignment.dueDate)
  if (days < 0) return 'overdue'
  if (days <= DUE_SOON_DAYS) return 'soon'
  return 'normal'
}

export function isOverdue(assignment: Assignment): boolean {
  return getUrgency(assignment) === 'overdue'
}

export function subtaskProgress(subtasks: Subtask[]): number {
  if (subtasks.length === 0) return 0
  const done = subtasks.filter((s) => s.completed).length
  return Math.round((done / subtasks.length) * 100)
}

/**
 * Picks a status that matches a new progress value:
 * 100% → completed, dropping below 100% → in progress, starting work → in progress.
 */
export function statusForProgress(current: Status, progress: number): Status {
  if (progress >= 100) return 'completed'
  if (current === 'completed') return 'in-progress'
  if (progress > 0 && current === 'not-started') return 'in-progress'
  return current
}

/**
 * Keeps derived fields consistent. Called before every save.
 * - Progress comes from subtasks when there are any.
 * - Assignments without subtasks are 100% once completed.
 * - completedAt is set / cleared to match the status.
 */
export function normalizeAssignment(assignment: Assignment): Assignment {
  const next = { ...assignment }

  if (next.subtasks.length > 0) {
    next.progress = subtaskProgress(next.subtasks)
  } else if (next.status === 'completed') {
    next.progress = 100
  }
  next.progress = Math.min(100, Math.max(0, Math.round(next.progress)))

  if (next.status === 'completed') {
    next.completedAt = next.completedAt ?? new Date().toISOString()
  } else {
    next.completedAt = null
  }
  return next
}

export interface AssignmentStats {
  total: number
  dueThisWeek: number
  inProgress: number
  notStarted: number
  completed: number
  overdue: number
  completionRate: number
}

export function getStats(assignments: Assignment[]): AssignmentStats {
  const total = assignments.length
  const completed = assignments.filter((a) => a.status === 'completed').length
  return {
    total,
    completed,
    inProgress: assignments.filter((a) => a.status === 'in-progress').length,
    notStarted: assignments.filter((a) => a.status === 'not-started').length,
    overdue: assignments.filter(isOverdue).length,
    dueThisWeek: assignments.filter((a) => {
      const days = daysUntil(a.dueDate)
      return a.status !== 'completed' && days >= 0 && days <= 7
    }).length,
    completionRate: total === 0 ? 0 : Math.round((completed / total) * 100),
  }
}

export function progressMessage(percent: number): string {
  if (percent >= 100) return 'Everything completed! 🎉'
  if (percent > 75) return 'Almost there!'
  if (percent > 50) return "You're doing great!"
  if (percent > 25) return "You're making progress!"
  return "Let's get started 🚀"
}

/** Incomplete assignments ordered by nearest deadline (overdue first). */
export function getUpcoming(assignments: Assignment[]): Assignment[] {
  return assignments
    .filter((a) => a.status !== 'completed')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
}

export type SortOption = 'dueDate' | 'priority' | 'progress' | 'recent'

export const SORT_LABELS: Record<SortOption, string> = {
  dueDate: 'Due date',
  priority: 'Priority',
  progress: 'Progress',
  recent: 'Recently added',
}

export function sortAssignments(assignments: Assignment[], sort: SortOption): Assignment[] {
  const list = [...assignments]
  switch (sort) {
    case 'dueDate':
      // Open assignments first (nearest deadline on top), completed ones at the end.
      return list.sort(
        (a, b) =>
          Number(a.status === 'completed') - Number(b.status === 'completed') || a.dueDate.localeCompare(b.dueDate),
      )
    case 'priority':
      return list.sort(
        (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] || a.dueDate.localeCompare(b.dueDate),
      )
    case 'progress':
      return list.sort((a, b) => b.progress - a.progress)
    case 'recent':
      return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }
}

export function matchesSearch(assignment: Assignment, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return [assignment.title, assignment.subject, assignment.description, ...assignment.tags].some((field) =>
    field.toLowerCase().includes(q),
  )
}

export function getSubjects(assignments: Assignment[]): string[] {
  return [...new Set(assignments.map((a) => a.subject).filter(Boolean))].sort((a, b) => a.localeCompare(b))
}

/** A subtask together with the assignment it belongs to — used by the Tasks page. */
export interface TaskItem {
  subtask: Subtask
  assignment: Assignment
  /** The subtask's own due date, or the assignment's when it has none. */
  dueDate: string
}

export function getAllTasks(assignments: Assignment[]): TaskItem[] {
  return assignments
    .flatMap((assignment) =>
      assignment.subtasks.map((subtask) => ({
        subtask,
        assignment,
        dueDate: subtask.dueDate ?? assignment.dueDate,
      })),
    )
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
}

/** Open tasks that are due today or already overdue. */
export function isTaskDueToday(task: TaskItem): boolean {
  return !task.subtask.completed && task.dueDate <= todayISO()
}

/** Soft colour classes per subject so each module is easy to recognise. */
const SUBJECT_COLORS = [
  'bg-violet-100 text-violet-700 dark:bg-violet-400/15 dark:text-violet-300',
  'bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300',
  'bg-pink-100 text-pink-700 dark:bg-pink-400/15 dark:text-pink-300',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300',
  'bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300',
  'bg-indigo-100 text-indigo-700 dark:bg-indigo-400/15 dark:text-indigo-300',
  'bg-teal-100 text-teal-700 dark:bg-teal-400/15 dark:text-teal-300',
]

export function subjectColor(subject: string): string {
  let hash = 0
  for (const char of subject) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return SUBJECT_COLORS[hash % SUBJECT_COLORS.length]
}
