import { Check } from 'lucide-react'
import { cn } from '../../utils/cn'

interface CheckboxProps {
  checked: boolean
  onChange: () => void
  label: string
  className?: string
}

/** A round, animated checkbox. `label` is announced to screen readers. */
export function Checkbox({ checked, onChange, label, className }: CheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={cn(
        'relative flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 active:scale-90',
        checked
          ? 'border-emerald-400 bg-emerald-400 text-white'
          : 'border-line bg-surface hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-400/10',
        className,
      )}
    >
      {checked && <Check className="size-3.5 animate-pop" strokeWidth={3.5} aria-hidden />}
    </button>
  )
}
