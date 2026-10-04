import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'brand'
type Size = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  icon?: ReactNode
}

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-ink text-canvas shadow-sm hover:bg-ink/90',
  brand:
    'bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-sm shadow-brand-600/25 hover:from-brand-600 hover:to-brand-700',
  secondary: 'border border-line bg-surface text-ink shadow-xs hover:bg-surface-muted',
  ghost: 'text-muted hover:bg-surface-muted hover:text-ink',
  danger: 'bg-rose-500 text-white shadow-sm hover:bg-rose-600',
}

const SIZES: Record<Size, string> = {
  sm: 'h-9 gap-1.5 rounded-lg px-3 text-sm',
  md: 'h-11 gap-2 rounded-xl px-4 text-sm',
}

export function Button({ variant = 'primary', size = 'md', icon, className, children, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex shrink-0 items-center justify-center font-semibold whitespace-nowrap transition-all duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  )
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Required so screen readers can announce icon-only buttons. */
  label: string
  size?: Size
}

export function IconButton({ label, size = 'md', className, children, ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center text-muted transition-colors duration-150 hover:bg-surface-muted hover:text-ink active:scale-95',
        size === 'sm' ? 'size-8 rounded-lg' : 'size-11 rounded-xl',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
