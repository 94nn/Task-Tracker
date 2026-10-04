import { useNavigate } from 'react-router'
import { Copy, Ellipsis, Eye, Pencil, Trash2 } from 'lucide-react'
import type { Assignment } from '../../types/assignment'
import { DropdownMenu } from '../ui/DropdownMenu'
import { useAssignments } from '../../hooks/useAssignments'
import { useUI } from '../../hooks/useUI'
import { cn } from '../../utils/cn'

interface AssignmentActionsProps {
  assignment: Assignment
  /** Hide "View details" when already on the details page. */
  showView?: boolean
  onDeleted?: () => void
  className?: string
}

/** "…" menu with View, Edit, Duplicate and Delete. */
export function AssignmentActions({ assignment, showView = true, onDeleted, className }: AssignmentActionsProps) {
  const navigate = useNavigate()
  const { duplicateAssignment } = useAssignments()
  const { openEdit, confirmDelete } = useUI()

  const items = [
    ...(showView
      ? [{ label: 'View details', icon: <Eye className="size-4" />, onSelect: () => navigate(`/assignments/${assignment.id}`) }]
      : []),
    { label: 'Edit', icon: <Pencil className="size-4" />, onSelect: () => openEdit(assignment) },
    { label: 'Duplicate', icon: <Copy className="size-4" />, onSelect: () => duplicateAssignment(assignment.id) },
    {
      label: 'Delete',
      icon: <Trash2 className="size-4" />,
      danger: true,
      onSelect: () => confirmDelete(assignment, onDeleted),
    },
  ]

  return (
    <DropdownMenu
      items={items}
      trigger={(props) => (
        <button
          type="button"
          aria-label={`Actions for ${assignment.title}`}
          className={cn(
            'flex size-9 items-center justify-center rounded-lg text-subtle transition-colors hover:bg-surface-muted hover:text-ink',
            className,
          )}
          {...props}
        >
          <Ellipsis className="size-5" />
        </button>
      )}
    />
  )
}
