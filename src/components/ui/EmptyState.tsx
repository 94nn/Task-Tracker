import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../../utils/cn'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex animate-fade-up flex-col items-center px-6 py-14 text-center', className)}>
      <div className="relative mb-5">
        <div className="absolute inset-0 scale-150 rounded-full bg-gradient-to-br from-pink-200/50 via-brand-200/50 to-sky-200/50 blur-2xl dark:from-pink-500/10 dark:via-brand-500/15 dark:to-sky-500/10" />
        <div className="relative flex size-16 items-center justify-center rounded-2xl border border-line bg-surface shadow-soft">
          <Icon className="size-7 text-brand-500" aria-hidden />
        </div>
      </div>
      <h3 className="text-base font-bold">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
