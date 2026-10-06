import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import type { Assignment, AssignmentInput, Priority, Status } from '../../types/assignment'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Field, Input, Select, Textarea } from '../ui/FormField'
import { TagInput } from './TagInput'
import { AddPdfButton, MAX_ATTACHMENTS, PdfChip } from './Attachments'
import { checkPdf } from '../../services/files'
import { useAssignments } from '../../hooks/useAssignments'
import { useSettings } from '../../hooks/useSettings'
import { PRIORITY_LABELS, STATUS_LABELS, getSubjects } from '../../utils/assignmentUtils'
import { addDaysISO } from '../../utils/dateUtils'
import { cn } from '../../utils/cn'

interface AssignmentFormModalProps {
  open: boolean
  /** When given, the form edits this assignment. Otherwise it creates a new one. */
  assignment?: Assignment
  initialDueDate?: string
  onClose: () => void
}

const FORM_ID = 'assignment-form'

export function AssignmentFormModal({ open, assignment, initialDueDate, onClose }: AssignmentFormModalProps) {
  const isEdit = assignment !== undefined
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={isEdit ? 'Edit assignment' : 'New assignment'}
      description={isEdit ? 'Update the details below.' : 'Add the details and start tracking your progress.'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form={FORM_ID} variant="brand">
            {isEdit ? 'Save changes' : 'Create assignment'}
          </Button>
        </>
      }
    >
      {/* Rendered only while open, so the form starts fresh every time. */}
      <AssignmentForm assignment={assignment} initialDueDate={initialDueDate} onDone={onClose} />
    </Modal>
  )
}

const PRIORITIES: Priority[] = ['low', 'medium', 'high']
const STATUSES: Status[] = ['not-started', 'in-progress', 'completed']

const PRIORITY_STYLES: Record<Priority, string> = {
  low: 'border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-400/40 dark:bg-sky-400/10 dark:text-sky-300',
  medium: 'border-brand-300 bg-brand-50 text-brand-700 dark:border-brand-400/40 dark:bg-brand-400/10 dark:text-brand-300',
  high: 'border-pink-300 bg-pink-50 text-pink-700 dark:border-pink-400/40 dark:bg-pink-400/10 dark:text-pink-300',
}

function AssignmentForm({
  assignment,
  initialDueDate,
  onDone,
}: {
  assignment?: Assignment
  initialDueDate?: string
  onDone: () => void
}) {
  const { assignments, createAssignment, updateAssignment, attachFiles } = useAssignments()
  const { settings } = useSettings()
  const navigate = useNavigate()

  const [values, setValues] = useState<AssignmentInput>(() => ({
    title: assignment?.title ?? '',
    description: assignment?.description ?? '',
    subject: assignment?.subject ?? '',
    lecturer: assignment?.lecturer ?? '',
    dueDate: assignment?.dueDate ?? initialDueDate ?? addDaysISO(7),
    priority: assignment?.priority ?? settings.defaultPriority,
    status: assignment?.status ?? 'not-started',
    tags: assignment?.tags ?? [],
  }))
  const [errors, setErrors] = useState<Partial<Record<keyof AssignmentInput, string>>>({})
  // PDFs picked in this form; they upload when the form is saved.
  const [pdfs, setPdfs] = useState<File[]>([])
  const [pdfError, setPdfError] = useState<string | null>(null)
  const existingCount = assignment?.attachments.length ?? 0

  function set<K extends keyof AssignmentInput>(key: K, value: AssignmentInput[K]) {
    setValues((v) => ({ ...v, [key]: value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  function validate() {
    const next: typeof errors = {}
    if (!values.title.trim()) next.title = 'Please give your assignment a title.'
    else if (values.title.trim().length > 120) next.title = 'Keep the title under 120 characters.'
    if (!values.dueDate) next.dueDate = 'Please choose a due date.'
    setErrors(next)
    return next
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const found = validate()
    if (found.title || found.dueDate) {
      document.getElementById(found.title ? 'field-title' : 'field-due')?.focus()
      return
    }
    const cleaned: AssignmentInput = {
      ...values,
      title: values.title.trim(),
      description: values.description.trim(),
      subject: values.subject.trim(),
      lecturer: values.lecturer.trim(),
    }
    if (assignment) {
      updateAssignment(assignment.id, cleaned)
      if (pdfs.length) attachFiles(assignment.id, pdfs)
    } else {
      const created = createAssignment(cleaned)
      // PDFs upload in the background; the details page shows "Uploading…" until they're done.
      if (pdfs.length) attachFiles(created.id, pdfs)
      navigate(`/assignments/${created.id}`)
    }
    onDone()
  }

  function pickPdfs(files: File[]) {
    const problems: string[] = []
    const accepted: File[] = []
    for (const file of files) {
      const problem = checkPdf(file)
      if (problem) problems.push(problem)
      else if (existingCount + pdfs.length + accepted.length >= MAX_ATTACHMENTS) problems.push(`You can attach up to ${MAX_ATTACHMENTS} PDFs.`)
      else accepted.push(file)
    }
    setPdfs((list) => [...list, ...accepted])
    setPdfError(problems.length ? [...new Set(problems)].join(' ') : null)
  }

  const subjects = getSubjects(assignments)

  return (
    <form id={FORM_ID} onSubmit={handleSubmit} noValidate className="grid gap-4 pb-2 sm:grid-cols-2">
      <Field label="Assignment title" htmlFor="field-title" error={errors.title} required className="sm:col-span-2">
        <Input
          id="field-title"
          value={values.title}
          onChange={(e) => set('title', e.target.value)}
          placeholder="e.g. Database Normalization Report"
          invalid={!!errors.title}
          aria-describedby={errors.title ? 'field-title-error' : undefined}
          autoComplete="off"
        />
      </Field>

      <Field label="Description" htmlFor="field-description" className="sm:col-span-2">
        <Textarea
          id="field-description"
          value={values.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder="What does this assignment involve?"
          rows={3}
        />
      </Field>

      <Field label="Subject" htmlFor="field-subject">
        <Input
          id="field-subject"
          list="subject-options"
          value={values.subject}
          onChange={(e) => set('subject', e.target.value)}
          placeholder="e.g. Database Systems"
          autoComplete="off"
        />
        <datalist id="subject-options">
          {subjects.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </Field>

      <Field label="Lecturer" htmlFor="field-lecturer" hint="Optional">
        <Input
          id="field-lecturer"
          value={values.lecturer}
          onChange={(e) => set('lecturer', e.target.value)}
          placeholder="e.g. Dr. Rahman"
          autoComplete="off"
        />
      </Field>

      <Field label="Due date" htmlFor="field-due" error={errors.dueDate} required>
        <Input
          id="field-due"
          type="date"
          value={values.dueDate}
          onChange={(e) => set('dueDate', e.target.value)}
          invalid={!!errors.dueDate}
        />
      </Field>

      <Field label="Status" htmlFor="field-status">
        <Select id="field-status" value={values.status} onChange={(e) => set('status', e.target.value as Status)}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
      </Field>

      <fieldset className="flex flex-col gap-1.5 sm:col-span-2">
        <legend className="mb-1.5 text-sm font-semibold">Priority</legend>
        <div className="grid grid-cols-3 gap-2">
          {PRIORITIES.map((p) => (
            <label
              key={p}
              className={cn(
                'flex h-11 cursor-pointer items-center justify-center rounded-xl border text-sm font-semibold transition-all has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-brand-400/20',
                values.priority === p ? PRIORITY_STYLES[p] : 'border-line text-muted hover:bg-surface-muted',
              )}
            >
              <input
                type="radio"
                name="priority"
                value={p}
                checked={values.priority === p}
                onChange={() => set('priority', p)}
                className="sr-only"
              />
              {PRIORITY_LABELS[p]}
            </label>
          ))}
        </div>
      </fieldset>

      <Field label="Tags" htmlFor="field-tags" className="sm:col-span-2">
        <TagInput id="field-tags" tags={values.tags} onChange={(tags) => set('tags', tags)} />
      </Field>

      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-semibold">
            PDFs <span className="font-normal text-subtle">(optional, up to 5 MB each)</span>
          </span>
          <AddPdfButton onPick={pickPdfs} disabled={existingCount + pdfs.length >= MAX_ATTACHMENTS} />
        </div>
        {pdfError && (
          <p className="text-xs font-medium text-rose-500" role="alert">
            {pdfError}
          </p>
        )}
        {(existingCount > 0 || pdfs.length > 0) && (
          <ul className="mt-1 grid gap-2 sm:grid-cols-2">
            {assignment?.attachments.map((file) => (
              <PdfChip key={file.id} name={file.name} size={file.size} />
            ))}
            {pdfs.map((file, i) => (
              <PdfChip
                key={`${file.name}-${i}`}
                name={file.name}
                size={file.size}
                onRemove={() => setPdfs((list) => list.filter((_, j) => j !== i))}
              />
            ))}
          </ul>
        )}
      </div>
    </form>
  )
}
