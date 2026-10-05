import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '../../utils/cn'

export interface MenuItem {
  label: string
  icon?: ReactNode
  onSelect: () => void
  danger?: boolean
}

interface DropdownMenuProps {
  /** Renders the trigger button. Spread the given props onto it. */
  trigger: (props: {
    onClick: (event: React.MouseEvent) => void
    'aria-expanded': boolean
    'aria-haspopup': 'menu'
  }) => ReactNode
  items: MenuItem[]
  align?: 'left' | 'right'
  /** Open below (default) or above the trigger — use 'top' near the bottom of the screen. */
  side?: 'top' | 'bottom'
}

export function DropdownMenu({ trigger, items, align = 'right', side = 'bottom' }: DropdownMenuProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus()

    function handleClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation()
        setOpen(false)
      }
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault()
        const itemsEls = Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])
        const index = itemsEls.indexOf(document.activeElement as HTMLElement)
        const nextIndex = event.key === 'ArrowDown' ? (index + 1) % itemsEls.length : (index - 1 + itemsEls.length) % itemsEls.length
        itemsEls[nextIndex]?.focus()
      }
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      {trigger({
        onClick: (event) => {
          event.stopPropagation()
          event.preventDefault()
          setOpen((o) => !o)
        },
        'aria-expanded': open,
        'aria-haspopup': 'menu',
      })}
      {open && (
        <div
          ref={menuRef}
          role="menu"
          className={cn(
            'absolute z-30 min-w-44 animate-scale-in rounded-xl border border-line bg-surface p-1.5 shadow-lift',
            side === 'top' ? 'bottom-full mb-1.5' : 'top-full mt-1.5',
            align === 'right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left',
          )}
          onClick={(event) => event.stopPropagation()}
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              onClick={(event) => {
                event.preventDefault()
                setOpen(false)
                item.onSelect()
              }}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-medium transition-colors focus:outline-none',
                item.danger
                  ? 'text-rose-600 hover:bg-rose-50 focus:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-400/10 dark:focus:bg-rose-400/10'
                  : 'text-ink hover:bg-surface-muted focus:bg-surface-muted',
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
