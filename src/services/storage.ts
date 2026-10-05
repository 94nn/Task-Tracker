/**
 * The only place in the app that talks to localStorage.
 * Components use the AssignmentsContext / SettingsContext, which call these functions.
 */
import type { Assignment, Settings } from '../types/assignment'

const ASSIGNMENTS_KEY = 'att.assignments'
const SETTINGS_KEY = 'att.settings'

export const DEFAULT_SETTINGS: Settings = {
  name: 'Student',
  theme: 'system',
  defaultPriority: 'medium',
  notifications: true,
}

function readJSON<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? null : (JSON.parse(raw) as T)
  } catch {
    // Corrupted JSON or storage disabled (e.g. some private browsing modes).
    return null
  }
}

function writeJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.warn(`Could not save "${key}" to localStorage.`, error)
  }
}

/* ---------- Assignments ---------- */

/** Loads all assignments saved in this browser (an empty list on first launch). */
export function loadAssignments(): Assignment[] {
  const stored = readJSON<Assignment[]>(ASSIGNMENTS_KEY)
  return Array.isArray(stored) ? stored : []
}

export function saveAssignments(assignments: Assignment[]): void {
  writeJSON(ASSIGNMENTS_KEY, assignments)
}

/**
 * Removes this browser's local assignments — called after they've been moved into a
 * new account, so the next person to sign up on this browser starts fresh.
 */
export function clearLocalAssignments(): void {
  try {
    localStorage.removeItem(ASSIGNMENTS_KEY)
  } catch {
    // Storage unavailable — nothing to clear.
  }
}

/* ---------- Accounts ---------- */

const HAS_ACCOUNT_KEY = 'att.hasSignedIn'

/** Whether someone has signed in on this browser before (decides: show "Log in" or "Sign up" first). */
export function hasSignedInBefore(): boolean {
  return readJSON<boolean>(HAS_ACCOUNT_KEY) === true
}

export function markSignedIn(): void {
  writeJSON(HAS_ACCOUNT_KEY, true)
}

/* ---------- Settings ---------- */

export function loadSettings(): Settings {
  const stored = readJSON<Partial<Settings>>(SETTINGS_KEY)
  return { ...DEFAULT_SETTINGS, ...(stored ?? {}) }
}

export function saveSettings(settings: Settings): void {
  writeJSON(SETTINGS_KEY, settings)
}
