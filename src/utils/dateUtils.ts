/**
 * Due dates are stored as "YYYY-MM-DD" strings. These helpers always treat them as
 * local calendar days so a deadline never shifts by a day because of time zones.
 */

const DAY_MS = 24 * 60 * 60 * 1000

/** Turns "2026-10-08" into a Date at local midnight. */
export function parseDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/** Turns a Date into "YYYY-MM-DD" using local time. */
export function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function todayISO(): string {
  return toISODate(new Date())
}

/** Returns "YYYY-MM-DD" for today plus `days` (can be negative). */
export function addDaysISO(days: number, from: Date = new Date()): string {
  return toISODate(new Date(from.getFullYear(), from.getMonth(), from.getDate() + days))
}

/** Whole days from today until the given date. Negative when the date has passed. */
export function daysUntil(value: string): number {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.round((parseDate(value).getTime() - today.getTime()) / DAY_MS)
}

/** "Oct 8" */
export function formatShortDate(value: string): string {
  return parseDate(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

/** "Thu, Oct 8, 2026" */
export function formatLongDate(value: string): string {
  return parseDate(value).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/** Formats an ISO timestamp such as createdAt: "Oct 4, 2026" */
export function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

/** "3 days left", "Due today", "2 days overdue" … */
export function relativeDueLabel(value: string): string {
  const days = daysUntil(value)
  if (days === 0) return 'Due today'
  if (days === 1) return 'Due tomorrow'
  if (days > 1) return `${days} days left`
  if (days === -1) return '1 day overdue'
  return `${Math.abs(days)} days overdue`
}

/** Greeting that matches the time of day. */
export function getGreeting(date: Date = new Date()): string {
  const hour = date.getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/**
 * Builds the days shown in a month view, starting on Monday.
 * Includes days from the neighbouring months so the grid always has complete weeks.
 */
export function getMonthGrid(year: number, month: number): { date: Date; inMonth: boolean }[] {
  const first = new Date(year, month, 1)
  const offset = (first.getDay() + 6) % 7 // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const totalCells = Math.ceil((offset + daysInMonth) / 7) * 7

  return Array.from({ length: totalCells }, (_, i) => {
    const date = new Date(year, month, 1 - offset + i)
    return { date, inMonth: date.getMonth() === month }
  })
}
