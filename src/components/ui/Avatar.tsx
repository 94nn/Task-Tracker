import { cn } from '../../utils/cn'

export function Avatar({ name, photoURL, className }: { name: string; photoURL?: string | null; className?: string }) {
  const initials =
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || '?'

  if (photoURL) {
    return (
      <img
        src={photoURL}
        alt=""
        // Google profile photos refuse requests that send a referrer.
        referrerPolicy="no-referrer"
        className={cn('size-10 shrink-0 rounded-full object-cover shadow-sm ring-2 ring-surface', className)}
      />
    )
  }

  return (
    <div
      className={cn(
        'flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-300 via-brand-300 to-sky-300 text-sm font-bold text-white shadow-sm ring-2 ring-surface',
        className,
      )}
      aria-hidden
    >
      {initials}
    </div>
  )
}
