import { useEffect, useState } from 'react'
import { cn } from '../../utils/cn'

export type ProgressTone = 'brand' | 'blue' | 'orange' | 'red' | 'green'

const TONES: Record<ProgressTone, string> = {
  brand: 'from-brand-400 to-brand-500',
  blue: 'from-sky-300 to-sky-400',
  orange: 'from-orange-300 to-orange-400',
  red: 'from-rose-300 to-rose-400',
  green: 'from-emerald-300 to-emerald-400',
}

interface ProgressBarProps {
  value: number
  tone?: ProgressTone
  size?: 'sm' | 'md'
  label?: string
  className?: string
}

export function ProgressBar({ value, tone = 'brand', size = 'sm', label = 'Progress', className }: ProgressBarProps) {
  // Start at 0 and grow to the real value so the bar animates in on first render.
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const frame = requestAnimationFrame(() => setWidth(value))
    return () => cancelAnimationFrame(frame)
  }, [value])

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn('w-full overflow-hidden rounded-full bg-surface-muted', size === 'sm' ? 'h-1.5' : 'h-2.5', className)}
    >
      <div
        className={cn('h-full rounded-full bg-gradient-to-r transition-[width] duration-700 ease-out', TONES[tone])}
        style={{ width: `${width}%` }}
      />
    </div>
  )
}
