import { createContext, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Assignment, AssignmentInput, Attachment, Subtask } from '../types/assignment'
import { checkPdf, deleteFile, readFile, saveFile } from '../services/files'
import * as storage from '../services/storage'
import { normalizeAssignment, statusForProgress, subtaskProgress } from '../utils/assignmentUtils'
import { createId } from '../utils/id'
import { useToast } from '../hooks/useToast'
import { useAuth } from '../hooks/useAuth'
import { firebaseEnabled, loadCloud } from '../services/firebase'

export interface AssignmentsContextValue {
  assignments: Assignment[]
  /** False until the signed-in account's assignments have loaded. */
  ready: boolean
  getAssignment: (id: string) => Assignment | undefined
  createAssignment: (input: AssignmentInput) => Assignment
  updateAssignment: (id: string, input: AssignmentInput) => void
  deleteAssignment: (id: string) => void
  duplicateAssignment: (id: string) => Assignment | undefined
  setProgress: (id: string, progress: number) => void
  addSubtask: (assignmentId: string, title: string, dueDate: string | null) => void
  updateSubtask: (assignmentId: string, subtaskId: string, changes: Partial<Omit<Subtask, 'id'>>) => void
  toggleSubtask: (assignmentId: string, subtaskId: string) => void
  deleteSubtask: (assignmentId: string, subtaskId: string) => void
  clearAll: () => void
  /** PDFs currently being uploaded (shown as "Uploading…" until they finish). */
  uploads: PendingUpload[]
  /** Uploads PDFs and attaches them to the assignment. Invalid files are skipped with a message. */
  attachFiles: (assignmentId: string, files: File[]) => Promise<void>
  removeAttachment: (assignmentId: string, attachmentId: string) => void
  /** Downloads an attached PDF's contents. */
  readAttachment: (attachment: Attachment) => Promise<Blob>
}

export interface PendingUpload {
  id: string
  assignmentId: string
  name: string
}

export const AssignmentsContext = createContext<AssignmentsContextValue | null>(null)

export function AssignmentsProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast()
  const { status, user } = useAuth()
  const uid = status === 'signed-in' ? user?.uid : undefined
  // Without accounts, data lives in localStorage. With accounts, it loads from the cloud below.
  const [assignments, setAssignments] = useState<Assignment[]>(() => (firebaseEnabled ? [] : storage.loadAssignments()))
  const [ready, setReady] = useState(!firebaseEnabled)

  // Always holds the latest list, so several updates in a row never overwrite each other.
  const latest = useRef(assignments)

  // Signed in: keep the list in sync with Firestore (also picks up changes from other devices).
  useEffect(() => {
    if (!uid) return
    let cancelled = false
    let unsubscribe = () => {}
    loadCloud().then((cloud) => {
      if (cancelled) return
      unsubscribe = cloud.subscribeAssignments(
        uid,
        (list) => {
          latest.current = list
          setAssignments(list)
          setReady(true)
        },
        (error) => {
          console.error('Could not load assignments:', error)
          toast('Couldn’t load your assignments', { description: 'Check your connection and refresh.', variant: 'danger' })
          setReady(true)
        },
      )
    })
    return () => {
      cancelled = true
      unsubscribe()
      latest.current = []
      setAssignments([])
      setReady(false)
    }
  }, [uid, toast])

  /** Updates the screen immediately, then saves to the cloud (signed in) or localStorage. */
  const commit = useCallback(
    (next: Assignment[]) => {
      const previous = latest.current
      latest.current = next
      setAssignments(next)
      if (uid) {
        loadCloud()
          .then((cloud) => cloud.saveAssignmentChanges(uid, previous, next))
          .catch((error) => {
          console.error('Could not save:', error)
          toast('Couldn’t save your change', { description: 'Check your connection and try again.', variant: 'danger' })
        })
      } else if (!firebaseEnabled) {
        storage.saveAssignments(next)
      }
    },
    [uid, toast],
  )

  const find = (id: string) => latest.current.find((a) => a.id === id)

  /** Applies a change to one assignment, normalises it and saves. */
  const patch = useCallback(
    (id: string, change: (a: Assignment) => Assignment) => {
      const current = latest.current.find((a) => a.id === id)
      if (!current) return undefined
      const updated = normalizeAssignment(change(current))
      commit(latest.current.map((a) => (a.id === updated.id ? updated : a)))
      return updated
    },
    [commit],
  )

  /** After subtasks change, move the status along with the new progress. */
  const withSubtasks = (a: Assignment, subtasks: Subtask[]): Assignment => ({
    ...a,
    subtasks,
    status: subtasks.length > 0 ? statusForProgress(a.status, subtaskProgress(subtasks)) : a.status,
  })

  const createAssignment = useCallback(
    (input: AssignmentInput) => {
      const assignment = normalizeAssignment({
        ...input,
        id: createId(),
        progress: 0,
        subtasks: [],
        attachments: [],
        createdAt: new Date().toISOString(),
        completedAt: null,
      })
      commit([assignment, ...latest.current])
      toast('Assignment created', { description: assignment.title })
      return assignment
    },
    [commit, toast],
  )

  const updateAssignment = useCallback(
    (id: string, input: AssignmentInput) => {
      const before = find(id)
      const updated = patch(id, (a) => {
        const next = { ...a, ...input }
        // Without subtasks, progress is manual: keep it in line with a status picked by hand.
        if (next.subtasks.length === 0) {
          if (next.status === 'not-started') next.progress = 0
          else if (next.status === 'in-progress' && next.progress >= 100) next.progress = 90
        }
        return next
      })
      if (!updated) return
      if (updated.status === 'completed' && before?.status !== 'completed') {
        toast('Assignment completed 🎉', { description: updated.title })
      } else {
        toast('Assignment updated', { description: updated.title })
      }
    },
    [patch, toast],
  )

  const deleteAssignment = useCallback(
    (id: string) => {
      const existing = find(id)
      commit(latest.current.filter((a) => a.id !== id))
      toast('Assignment deleted', { description: existing?.title, variant: 'danger' })
      // Free up the space its PDFs used.
      for (const file of existing?.attachments ?? []) {
        deleteFile(uid, file.id).catch((error) => console.error('Could not delete file:', error))
      }
    },
    [commit, toast, uid],
  )

  const duplicateAssignment = useCallback(
    (id: string) => {
      const original = find(id)
      if (!original) return undefined
      const copy = normalizeAssignment({
        ...original,
        id: createId(),
        title: `${original.title} (copy)`,
        subtasks: original.subtasks.map((s) => ({ ...s, id: createId() })),
        tags: [...original.tags],
        // PDFs aren't copied: each file belongs to exactly one assignment.
        attachments: [],
        createdAt: new Date().toISOString(),
      })
      commit([copy, ...latest.current])
      toast('Assignment duplicated', { description: copy.title, variant: 'info' })
      return copy
    },
    [commit, toast],
  )

  const setProgress = useCallback(
    (id: string, progress: number) => {
      const before = find(id)
      const updated = patch(id, (a) => ({ ...a, progress, status: statusForProgress(a.status, progress) }))
      if (updated?.status === 'completed' && before?.status !== 'completed') {
        toast('Assignment completed 🎉', { description: updated.title })
      }
    },
    [patch, toast],
  )

  const addSubtask = useCallback(
    (assignmentId: string, title: string, dueDate: string | null) => {
      patch(assignmentId, (a) => withSubtasks(a, [...a.subtasks, { id: createId(), title, completed: false, dueDate }]))
    },
    [patch],
  )

  const updateSubtask = useCallback(
    (assignmentId: string, subtaskId: string, changes: Partial<Omit<Subtask, 'id'>>) => {
      patch(assignmentId, (a) =>
        withSubtasks(
          a,
          a.subtasks.map((s) => (s.id === subtaskId ? { ...s, ...changes } : s)),
        ),
      )
    },
    [patch],
  )

  const toggleSubtask = useCallback(
    (assignmentId: string, subtaskId: string) => {
      const before = find(assignmentId)
      const subtask = before?.subtasks.find((s) => s.id === subtaskId)
      if (!before || !subtask) return
      const updated = patch(assignmentId, (a) =>
        withSubtasks(
          a,
          a.subtasks.map((s) => (s.id === subtaskId ? { ...s, completed: !s.completed } : s)),
        ),
      )
      if (!subtask.completed) {
        if (updated?.status === 'completed' && before.status !== 'completed') {
          toast('Assignment completed 🎉', { description: `All tasks in “${updated.title}” are done.` })
        } else {
          toast('Task completed', { description: subtask.title })
        }
      }
    },
    [patch, toast],
  )

  const deleteSubtask = useCallback(
    (assignmentId: string, subtaskId: string) => {
      patch(assignmentId, (a) =>
        withSubtasks(
          a,
          a.subtasks.filter((s) => s.id !== subtaskId),
        ),
      )
    },
    [patch],
  )

  const clearAll = useCallback(() => {
    const files = latest.current.flatMap((a) => a.attachments)
    commit([])
    toast('All assignments cleared', { variant: 'danger' })
    for (const file of files) deleteFile(uid, file.id).catch((error) => console.error('Could not delete file:', error))
  }, [commit, toast, uid])

  /* ---------- Attached PDFs ---------- */

  const [uploads, setUploads] = useState<PendingUpload[]>([])

  const attachFiles = useCallback(
    async (assignmentId: string, files: File[]) => {
      const valid: File[] = []
      for (const file of files) {
        const problem = checkPdf(file)
        if (problem) toast('Couldn’t attach file', { description: problem, variant: 'danger' })
        else valid.push(file)
      }

      await Promise.all(
        valid.map(async (file) => {
          const upload = { id: createId(), assignmentId, name: file.name }
          setUploads((list) => [...list, upload])
          try {
            // Save the contents first; only then list it on the assignment.
            await saveFile(uid, upload.id, file)
            const attachment: Attachment = { id: upload.id, name: file.name, size: file.size, addedAt: new Date().toISOString() }
            const updated = patch(assignmentId, (a) => ({ ...a, attachments: [...a.attachments, attachment] }))
            if (updated) toast('PDF attached', { description: file.name })
            else deleteFile(uid, upload.id).catch(() => {}) // the assignment was deleted meanwhile
          } catch (error) {
            console.error('Upload failed:', error)
            toast('Couldn’t upload PDF', { description: `${file.name} — check your connection and try again.`, variant: 'danger' })
          } finally {
            setUploads((list) => list.filter((u) => u.id !== upload.id))
          }
        }),
      )
    },
    [patch, toast, uid],
  )

  const removeAttachment = useCallback(
    (assignmentId: string, attachmentId: string) => {
      const file = find(assignmentId)?.attachments.find((f) => f.id === attachmentId)
      patch(assignmentId, (a) => ({ ...a, attachments: a.attachments.filter((f) => f.id !== attachmentId) }))
      if (file) toast('PDF removed', { description: file.name, variant: 'danger' })
      deleteFile(uid, attachmentId).catch((error) => console.error('Could not delete file:', error))
    },
    [patch, toast, uid],
  )

  const readAttachment = useCallback((attachment: Attachment) => readFile(uid, attachment.id), [uid])

  const getAssignment = useCallback((id: string) => assignments.find((a) => a.id === id), [assignments])

  const value = useMemo<AssignmentsContextValue>(
    () => ({
      assignments,
      ready,
      getAssignment,
      createAssignment,
      updateAssignment,
      deleteAssignment,
      duplicateAssignment,
      setProgress,
      addSubtask,
      updateSubtask,
      toggleSubtask,
      deleteSubtask,
      clearAll,
      uploads,
      attachFiles,
      removeAttachment,
      readAttachment,
    }),
    [
      assignments,
      ready,
      getAssignment,
      createAssignment,
      updateAssignment,
      deleteAssignment,
      duplicateAssignment,
      setProgress,
      addSubtask,
      updateSubtask,
      toggleSubtask,
      deleteSubtask,
      clearAll,
      uploads,
      attachFiles,
      removeAttachment,
      readAttachment,
    ],
  )

  return <AssignmentsContext.Provider value={value}>{children}</AssignmentsContext.Provider>
}
