import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router'
import { CornerDownLeft, FileText, Search } from 'lucide-react'
import { useAssignments } from '../../hooks/useAssignments'
import { matchesSearch, subjectColor } from '../../utils/assignmentUtils'
import { formatShortDate } from '../../utils/dateUtils'
import { cn } from '../../utils/cn'
import { NAV_ITEMS } from './navItems'

interface SearchPaletteProps {
  open: boolean
  onClose: () => void
}

type Result =
  | { kind: 'assignment'; id: string; title: string; subtitle: string; subject: string; to: string }
  | { kind: 'page'; id: string; title: string; to: string }

/** Quick search across assignments and pages. Opens with Ctrl/⌘+K or "/". */
export function SearchPalette({ open, onClose }: SearchPaletteProps) {
  if (!open) return null
  return createPortal(<PaletteContent onClose={onClose} />, document.body)
}

function PaletteContent({ onClose }: { onClose: () => void }) {
  const { assignments } = useAssignments()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const results = useMemo<Result[]>(() => {
    const q = query.trim().toLowerCase()
    const assignmentResults: Result[] = assignments
      .filter((a) => matchesSearch(a, q))
      .slice(0, q ? 8 : 5)
      .map((a) => ({
        kind: 'assignment',
        id: a.id,
        title: a.title,
        subtitle: `Due ${formatShortDate(a.dueDate)}`,
        subject: a.subject,
        to: `/assignments/${a.id}`,
      }))
    const pageResults: Result[] = NAV_ITEMS.filter((p) => p.label.toLowerCase().includes(q)).map((p) => ({
      kind: 'page',
      id: p.to,
      title: p.label,
      to: p.to,
    }))
    return [...assignmentResults, ...pageResults]
  }, [assignments, query])

  function go(result: Result | undefined) {
    if (!result) return
    navigate(result.to)
    onClose()
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive((i) => Math.min(i + 1, results.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      go(results[active])
    }
  }

  // Keep the highlighted result visible while using the arrow keys.
  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [active])

  const assignmentsList = results.filter((r) => r.kind === 'assignment')
  const pagesList = results.filter((r) => r.kind === 'page')

  const renderItem = (result: Result) => {
    const index = results.indexOf(result)
    const PageIcon = result.kind === 'page' ? NAV_ITEMS.find((n) => n.to === result.to)?.icon : undefined
    return (
      <li key={`${result.kind}-${result.id}`} role="option" aria-selected={index === active} data-index={index}>
        <button
          type="button"
          onClick={() => go(result)}
          onMouseMove={() => setActive(index)}
          className={cn(
            'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
            index === active ? 'bg-surface-muted' : '',
          )}
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-line bg-surface text-muted">
            {PageIcon ? <PageIcon className="size-4" /> : <FileText className="size-4" />}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold">{result.title}</span>
            {result.kind === 'assignment' && (
              <span className="mt-0.5 flex items-center gap-2 text-xs text-muted">
                {result.subject && (
                  <span className={cn('truncate rounded px-1.5 py-px font-medium', subjectColor(result.subject))}>
                    {result.subject}
                  </span>
                )}
                <span className="shrink-0">{result.subtitle}</span>
              </span>
            )}
          </span>
          {index === active && <CornerDownLeft className="size-4 shrink-0 text-subtle" aria-hidden />}
        </button>
      </li>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[10vh]" onKeyDown={handleKeyDown}>
      <div className="absolute inset-0 animate-fade-in bg-slate-900/30 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        className="relative w-full max-w-xl animate-scale-in overflow-hidden rounded-2xl border border-line bg-surface shadow-lift"
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search className="size-5 text-subtle" aria-hidden />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActive(0)
            }}
            placeholder="Search assignments, subjects, tags…"
            aria-label="Search assignments"
            role="combobox"
            aria-expanded="true"
            aria-controls="search-results"
            className="h-14 flex-1 bg-transparent text-base placeholder:text-subtle focus:outline-none"
          />
          <kbd className="hidden rounded-md border border-line px-1.5 py-0.5 text-[11px] font-semibold text-subtle sm:block">
            Esc
          </kbd>
        </div>
        <ul id="search-results" ref={listRef} role="listbox" className="max-h-[60vh] overflow-y-auto p-2">
          {results.length === 0 && (
            <li className="px-3 py-10 text-center text-sm text-muted">No results for “{query}”</li>
          )}
          {assignmentsList.length > 0 && (
            <li role="presentation" className="px-3 pt-2 pb-1 text-xs font-semibold tracking-wide text-subtle uppercase">
              {query ? 'Assignments' : 'Recent assignments'}
            </li>
          )}
          {assignmentsList.map(renderItem)}
          {pagesList.length > 0 && (
            <li role="presentation" className="px-3 pt-3 pb-1 text-xs font-semibold tracking-wide text-subtle uppercase">
              Pages
            </li>
          )}
          {pagesList.map(renderItem)}
        </ul>
      </div>
    </div>
  )
}
