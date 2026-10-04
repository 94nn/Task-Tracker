import { createContext, useCallback, useRef, useState, type ReactNode } from 'react'
import { CircleCheck, Info, Trash2, X } from 'lucide-react'
import { cn } from '../utils/cn'

export type ToastVariant = 'success' | 'info' | 'danger'

interface Toast {
  id: number
  title: string
  description?: string
  variant: ToastVariant
}

export interface ToastContextValue {
  toast: (title: string, options?: { description?: string; variant?: ToastVariant }) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)

const ICONS = {
  success: <CircleCheck className="size-4.5 text-emerald-500" aria-hidden />,
  info: <Info className="size-4.5 text-brand-500" aria-hidden />,
  danger: <Trash2 className="size-4.5 text-rose-500" aria-hidden />,
}

const DURATION_MS = 3200

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(1)

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback<ToastContextValue['toast']>(
    (title, options = {}) => {
      const id = nextId.current++
      // Keep at most 3 toasts on screen.
      setToasts((list) => [...list.slice(-2), { id, title, description: options.description, variant: options.variant ?? 'success' }])
      window.setTimeout(() => dismiss(id), DURATION_MS)
    },
    [dismiss],
  )

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-4 lg:right-6 lg:bottom-6 lg:left-auto lg:items-end"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={cn(
              'pointer-events-auto flex w-full max-w-sm animate-toast-in items-start gap-3 rounded-2xl border border-line bg-surface/95 px-4 py-3 shadow-lift backdrop-blur',
            )}
          >
            <span className="mt-0.5">{ICONS[t.variant]}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{t.title}</p>
              {t.description && <p className="mt-0.5 truncate text-xs text-muted">{t.description}</p>}
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
              className="-mr-1 rounded-md p-1 text-subtle transition-colors hover:bg-surface-muted hover:text-ink"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
