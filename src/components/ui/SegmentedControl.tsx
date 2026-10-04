import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'

export interface SegmentOption<T extends string> {
  value: T
  label: string
  icon?: ReactNode
  count?: number
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[]
  value: T
  onChange: (value: T) => void
  label: string
  className?: string
}

/** A row of toggle buttons where exactly one is selected (used for tabs and theme). */
export function SegmentedControl<T extends string>({ options, value, onChange, label, className }: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn('inline-flex gap-1 overflow-x-auto rounded-xl border border-line bg-surface-muted p-1', className)}
    >
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-semibold whitespace-nowrap transition-all duration-150',
              active ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink',
            )}
          >
            {option.icon}
            {option.label}
            {option.count !== undefined && (
              <span
                className={cn(
                  'rounded-full px-1.5 text-xs tabular-nums',
                  active ? 'bg-brand-100 text-brand-700 dark:bg-brand-400/15 dark:text-brand-300' : 'bg-line/70',
                )}
              >
                {option.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
