import type { LucideIcon } from 'lucide-react'
import { cn } from '../../utils/cn'

type StatTone = 'lavender' | 'orange' | 'green' | 'red'

const TONES: Record<StatTone, { icon: string; glow: string }> = {
  lavender: {
    icon: 'bg-brand-100 text-brand-600 dark:bg-brand-400/15 dark:text-brand-300',
    glow: 'from-brand-100/70 dark:from-brand-400/10',
  },
  orange: {
    icon: 'bg-orange-100 text-orange-600 dark:bg-orange-400/15 dark:text-orange-300',
    glow: 'from-orange-100/60 dark:from-orange-400/10',
  },
  green: {
    icon: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300',
    glow: 'from-emerald-100/60 dark:from-emerald-400/10',
  },
  red: {
    icon: 'bg-rose-100 text-rose-600 dark:bg-rose-400/15 dark:text-rose-300',
    glow: 'from-rose-100/60 dark:from-rose-400/10',
  },
}

interface StatCardProps {
  label: string
  value: number
  hint: string
  icon: LucideIcon
  tone: StatTone
  delay?: number
}

export function StatCard({ label, value, hint, icon: Icon, tone, delay = 0 }: StatCardProps) {
  return (
    <div
      className="relative animate-fade-up overflow-hidden rounded-2xl border border-line bg-surface p-4 shadow-soft sm:p-5"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className={cn('pointer-events-none absolute -top-10 -right-10 size-32 rounded-full bg-gradient-to-bl to-transparent blur-xl', TONES[tone].glow)}
        aria-hidden
      />
      <div className="relative flex items-start justify-between gap-2">
        <p className="text-xs font-semibold text-muted sm:text-sm">{label}</p>
        <span className={cn('flex size-8 items-center justify-center rounded-lg sm:size-9 sm:rounded-xl', TONES[tone].icon)}>
          <Icon className="size-4 sm:size-[18px]" aria-hidden />
        </span>
      </div>
      <p className="relative mt-1 text-3xl font-bold tracking-tight tabular-nums">{value}</p>
      <p className="relative mt-1 truncate text-xs font-medium text-subtle">{hint}</p>
    </div>
  )
}
