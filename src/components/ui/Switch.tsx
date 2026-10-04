import { cn } from '../../utils/cn'

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  id?: string
  label: string
}

export function Switch({ checked, onChange, id, label }: SwitchProps) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-200',
        checked ? 'bg-brand-500' : 'bg-line',
      )}
    >
      <span
        className={cn(
          'inline-block size-5 rounded-full bg-white shadow-sm transition-transform duration-200',
          checked ? 'translate-x-6' : 'translate-x-1',
        )}
      />
    </button>
  )
}
