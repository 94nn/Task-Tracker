import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Assignment } from '../types/assignment'
import { AssignmentFormModal } from '../components/assignments/AssignmentFormModal'
import { SearchPalette } from '../components/layout/SearchPalette'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { useAssignments } from '../hooks/useAssignments'
import { useAuth } from '../hooks/useAuth'

export interface UIContextValue {
  /** Open the form to add a new assignment, optionally with a pre-filled due date. */
  openCreate: (dueDate?: string) => void
  openEdit: (assignment: Assignment) => void
  /** Ask for confirmation, then delete. `onDeleted` runs after deletion. */
  confirmDelete: (assignment: Assignment, onDeleted?: () => void) => void
  openSearch: () => void
}

export const UIContext = createContext<UIContextValue | null>(null)

type FormState = { mode: 'create'; dueDate?: string } | { mode: 'edit'; assignment: Assignment } | null

export function UIProvider({ children }: { children: ReactNode }) {
  const { deleteAssignment } = useAssignments()
  const [form, setForm] = useState<FormState>(null)
  const [pendingDelete, setPendingDelete] = useState<{ assignment: Assignment; onDeleted?: () => void } | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)

  const openCreate = useCallback((dueDate?: string) => setForm({ mode: 'create', dueDate }), [])
  const openEdit = useCallback((assignment: Assignment) => setForm({ mode: 'edit', assignment }), [])
  const confirmDelete = useCallback(
    (assignment: Assignment, onDeleted?: () => void) => setPendingDelete({ assignment, onDeleted }),
    [],
  )
  const openSearch = useCallback(() => setSearchOpen(true), [])

  // Keyboard shortcuts: Ctrl/⌘ + K or "/" to search, "N" for a new assignment.
  // Only inside the app — not on the sign-up / login pages.
  const { status } = useAuth()
  const appOpen = status === 'signed-in' || status === 'disabled'
  useEffect(() => {
    if (!appOpen) return
    function handleKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement
      const typing = target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
      const dialogOpen = document.querySelector('[role="dialog"]') !== null

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen(true)
        return
      }
      if (typing || dialogOpen || event.metaKey || event.ctrlKey || event.altKey) return
      if (event.key === '/') {
        event.preventDefault()
        setSearchOpen(true)
      } else if (event.key.toLowerCase() === 'n') {
        event.preventDefault()
        setForm({ mode: 'create' })
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [appOpen])

  const value = useMemo(
    () => ({ openCreate, openEdit, confirmDelete, openSearch }),
    [openCreate, openEdit, confirmDelete, openSearch],
  )

  return (
    <UIContext.Provider value={value}>
      {children}

      <AssignmentFormModal
        open={form !== null}
        assignment={form?.mode === 'edit' ? form.assignment : undefined}
        initialDueDate={form?.mode === 'create' ? form.dueDate : undefined}
        onClose={() => setForm(null)}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete assignment?"
        message={
          pendingDelete
            ? `“${pendingDelete.assignment.title}” and its ${pendingDelete.assignment.subtasks.length} subtask(s) will be permanently removed. This can't be undone.`
            : ''
        }
        confirmLabel="Delete assignment"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return
          deleteAssignment(pendingDelete.assignment.id)
          pendingDelete.onDeleted?.()
          setPendingDelete(null)
        }}
      />

      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </UIContext.Provider>
  )
}
