import type { ReactNode } from 'react'
import { Circle, CircleCheck, CircleDashed, Flag } from 'lucide-react'
import type { Priority, Status } from '../../types/assignment'
import { PRIORITY_LABELS, STATUS_LABELS } from '../../utils/assignmentUtils'
import { cn } from '../../utils/cn'

export type Tone = 'neutral' | 'blue' | 'orange' | 'red' | 'green' | 'lavender' | 'pink'

const TONES: Record<Tone, string> = {
  neutral: 'bg-surface-muted text-muted',
  blue: 'bg-sky-50 text-sky-700 dark:bg-sky-400/10 dark:text-sky-300',
  orange: 'bg-orange-50 text-orange-700 dark:bg-orange-400/10 dark:text-orange-300',
  red: 'bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300',
  green: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300',
  lavender: 'bg-brand-50 text-brand-700 dark:bg-brand-400/10 dark:text-brand-300',
  pink: 'bg-pink-50 text-pink-700 dark:bg-pink-400/10 dark:text-pink-300',
}

interface BadgeProps {
  tone?: Tone
  icon?: ReactNode
  className?: string
  children: ReactNode
}

export function Badge({ tone = 'neutral', icon, className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap',
        TONES[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  )
}

const PRIORITY_TONES: Record<Priority, Tone> = { low: 'blue', medium: 'lavender', high: 'pink' }

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <Badge tone={PRIORITY_TONES[priority]} icon={<Flag className="size-3" aria-hidden />}>
      {PRIORITY_LABELS[priority]}
    </Badge>
  )
}

const STATUS_TONES: Record<Status, Tone> = {
  'not-started': 'neutral',
  'in-progress': 'orange',
  completed: 'green',
}

const STATUS_ICONS: Record<Status, ReactNode> = {
  'not-started': <Circle className="size-3" aria-hidden />,
  'in-progress': <CircleDashed className="size-3" aria-hidden />,
  completed: <CircleCheck className="size-3" aria-hidden />,
}

export function StatusBadge({ status }: { status: Status }) {
  return (
    <Badge tone={STATUS_TONES[status]} icon={STATUS_ICONS[status]}>
      {STATUS_LABELS[status]}
    </Badge>
  )
}
