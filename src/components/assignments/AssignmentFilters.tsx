import { Search, X } from 'lucide-react'
import type { Priority, Status } from '../../types/assignment'
import { PRIORITY_LABELS, SORT_LABELS, STATUS_LABELS, type SortOption } from '../../utils/assignmentUtils'
import { Select } from '../ui/FormField'

export interface FilterState {
  search: string
  status: Status | 'all'
  priority: Priority | 'all'
  subject: string // 'all' or a subject name
  sort: SortOption
}

export const DEFAULT_FILTERS: FilterState = {
  search: '',
  status: 'all',
  priority: 'all',
  subject: 'all',
  sort: 'dueDate',
}

interface AssignmentFiltersProps {
  filters: FilterState
  subjects: string[]
  onChange: (filters: FilterState) => void
}

export function AssignmentFilters({ filters, subjects, onChange }: AssignmentFiltersProps) {
  const set = <K extends keyof FilterState>(key: K, value: FilterState[K]) => onChange({ ...filters, [key]: value })

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-3 shadow-soft lg:flex-row lg:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-subtle" aria-hidden />
        <input
          type="search"
          value={filters.search}
          onChange={(e) => set('search', e.target.value)}
          placeholder="Search title, subject, description or tags…"
          aria-label="Search assignments"
          className="h-11 w-full rounded-xl border border-line bg-surface-muted/60 pr-10 pl-10 text-sm placeholder:text-subtle transition-colors focus:border-brand-400 focus:bg-surface focus:ring-4 focus:ring-brand-400/15 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        {filters.search && (
          <button
            type="button"
            onClick={() => set('search', '')}
            aria-label="Clear search"
            className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-md p-1 text-subtle hover:bg-surface-muted hover:text-ink"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:flex">
        <div className="lg:w-36">
          <Select aria-label="Filter by status" value={filters.status} onChange={(e) => set('status', e.target.value as FilterState['status'])}>
            <option value="all">All statuses</option>
            {(Object.keys(STATUS_LABELS) as Status[]).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
        </div>
        <div className="lg:w-36">
          <Select
            aria-label="Filter by priority"
            value={filters.priority}
            onChange={(e) => set('priority', e.target.value as FilterState['priority'])}
          >
            <option value="all">All priorities</option>
            {(Object.keys(PRIORITY_LABELS) as Priority[]).map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABELS[p]}
              </option>
            ))}
          </Select>
        </div>
        <div className="lg:w-44">
          <Select aria-label="Filter by subject" value={filters.subject} onChange={(e) => set('subject', e.target.value)}>
            <option value="all">All subjects</option>
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>
        <div className="lg:w-40">
          <Select aria-label="Sort assignments" value={filters.sort} onChange={(e) => set('sort', e.target.value as SortOption)}>
            {(Object.keys(SORT_LABELS) as SortOption[]).map((s) => (
              <option key={s} value={s}>
                Sort: {SORT_LABELS[s]}
              </option>
            ))}
          </Select>
        </div>
      </div>
    </div>
  )
}
