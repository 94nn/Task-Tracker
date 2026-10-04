/**
 * The only place in the app that talks to localStorage.
 * Components use the AssignmentsContext / SettingsContext, which call these functions.
 */
import type { Assignment, Settings } from '../types/assignment'
import { createSampleAssignments } from '../data/sampleData'

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

/**
 * Loads all assignments. On the very first launch (nothing stored yet) the
 * sample assignments are saved and returned, so the dashboard isn't empty.
 */
export function loadAssignments(): Assignment[] {
  const stored = readJSON<Assignment[]>(ASSIGNMENTS_KEY)
  if (Array.isArray(stored)) return stored

  const samples = createSampleAssignments()
  saveAssignments(samples)
  return samples
}

export function saveAssignments(assignments: Assignment[]): void {
  writeJSON(ASSIGNMENTS_KEY, assignments)
}

export function addAssignment(assignments: Assignment[], assignment: Assignment): Assignment[] {
  const next = [assignment, ...assignments]
  saveAssignments(next)
  return next
}

export function updateAssignment(assignments: Assignment[], updated: Assignment): Assignment[] {
  const next = assignments.map((a) => (a.id === updated.id ? updated : a))
  saveAssignments(next)
  return next
}

export function deleteAssignment(assignments: Assignment[], id: string): Assignment[] {
  const next = assignments.filter((a) => a.id !== id)
  saveAssignments(next)
  return next
}

/** Replaces everything with fresh sample data. */
export function resetToSampleData(): Assignment[] {
  const samples = createSampleAssignments()
  saveAssignments(samples)
  return samples
}

/* ---------- Settings ---------- */

export function loadSettings(): Settings {
  const stored = readJSON<Partial<Settings>>(SETTINGS_KEY)
  return { ...DEFAULT_SETTINGS, ...(stored ?? {}) }
}

export function saveSettings(settings: Settings): void {
  writeJSON(SETTINGS_KEY, settings)
}
