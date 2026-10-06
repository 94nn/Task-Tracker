import { useRef } from 'react'
import { FileText, Loader2, Paperclip, Trash2 } from 'lucide-react'
import type { Assignment, Attachment } from '../../types/assignment'
import { Button } from '../ui/Button'
import { useAssignments } from '../../hooks/useAssignments'
import { useToast } from '../../hooks/useToast'
import { formatFileSize } from '../../services/files'

/** Most PDFs an assignment can hold. */
export const MAX_ATTACHMENTS = 10

/** "Add PDF" button that opens the file picker (PDFs only, several at once). */
export function AddPdfButton({
  onPick,
  disabled,
  size = 'sm',
}: {
  onPick: (files: File[]) => void
  disabled?: boolean
  size?: 'sm' | 'md'
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <>
      <Button
        variant="secondary"
        size={size}
        icon={<Paperclip className="size-4" aria-hidden />}
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
      >
        Add PDF
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        multiple
        hidden
        onChange={(e) => {
          onPick(Array.from(e.target.files ?? []))
          e.target.value = '' // allow picking the same file again
        }}
      />
    </>
  )
}

/** One PDF row: icon, name and size, with optional click and remove actions. */
export function PdfChip({
  name,
  size,
  onOpen,
  onRemove,
  pending,
}: {
  name: string
  size?: number
  onOpen?: () => void
  onRemove?: () => void
  pending?: boolean
}) {
  const body = (
    <>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-500 dark:bg-rose-400/10">
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <FileText className="size-4" aria-hidden />}
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="block truncate text-sm font-semibold">{name}</span>
        <span className="block text-xs text-subtle">{pending ? 'Uploading…' : size !== undefined ? formatFileSize(size) : 'PDF'}</span>
      </span>
    </>
  )

  return (
    <li className="flex items-center gap-1 rounded-xl border border-line bg-surface pr-1.5 transition-colors hover:bg-surface-muted/60">
      {onOpen ? (
        <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 items-center gap-3 p-2" title={`Open ${name}`}>
          {body}
        </button>
      ) : (
        <div className="flex min-w-0 flex-1 items-center gap-3 p-2">{body}</div>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${name}`}
          className="shrink-0 rounded-lg p-2 text-subtle transition-colors hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-400/10"
        >
          <Trash2 className="size-4" />
        </button>
      )}
    </li>
  )
}

/** Opens an attached PDF in a new tab. */
export function useOpenAttachment() {
  const { readAttachment } = useAssignments()
  const { toast } = useToast()

  return async (attachment: Attachment) => {
    // Open the tab right away, during the click — browsers block tabs opened after a download.
    const tab = window.open('', '_blank')
    if (tab) tab.document.title = `Opening ${attachment.name}…`
    try {
      const url = URL.createObjectURL(await readAttachment(attachment))
      if (tab) {
        tab.location.href = url
      } else {
        // Pop-ups blocked entirely: download the file instead.
        const link = Object.assign(document.createElement('a'), { href: url, download: attachment.name })
        link.click()
      }
      setTimeout(() => URL.revokeObjectURL(url), 60_000)
    } catch (error) {
      tab?.close()
      console.error('Could not open PDF:', error)
      toast('Couldn’t open PDF', { description: 'Check your connection and try again.', variant: 'danger' })
    }
  }
}

/** Attachments section on the assignment details page. */
export function AttachmentsSection({ assignment }: { assignment: Assignment }) {
  const { uploads, attachFiles, removeAttachment } = useAssignments()
  const open = useOpenAttachment()
  const pending = uploads.filter((u) => u.assignmentId === assignment.id)
  const total = assignment.attachments.length + pending.length

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-base font-bold">
          <Paperclip className="size-5 text-brand-500" aria-hidden />
          Attachments
        </h2>
        <AddPdfButton onPick={(files) => attachFiles(assignment.id, files.slice(0, MAX_ATTACHMENTS - total))} disabled={total >= MAX_ATTACHMENTS} />
      </div>

      {total === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed border-line px-4 py-6 text-center text-sm text-muted">
          Attach the assignment brief, rubric or your notes as PDFs (up to 5 MB each).
        </p>
      ) : (
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {assignment.attachments.map((file) => (
            <PdfChip
              key={file.id}
              name={file.name}
              size={file.size}
              onOpen={() => open(file)}
              onRemove={() => removeAttachment(assignment.id, file.id)}
            />
          ))}
          {pending.map((u) => (
            <PdfChip key={u.id} name={u.name} pending />
          ))}
        </ul>
      )}
    </div>
  )
}
