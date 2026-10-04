import { useMemo, useState } from 'react'
import { Plus, SearchX, Sparkles } from 'lucide-react'
import { AssignmentCard } from '../components/assignments/AssignmentCard'
import { AssignmentFilters, DEFAULT_FILTERS, type FilterState } from '../components/assignments/AssignmentFilters'
import { EmptyState } from '../components/ui/EmptyState'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { useAssignments } from '../hooks/useAssignments'
import { useUI } from '../hooks/useUI'
import { getSubjects, matchesSearch, sortAssignments } from '../utils/assignmentUtils'

export default function Assignments() {
  const { assignments } = useAssignments()
  const { openCreate } = useUI()
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)

  const subjects = useMemo(() => getSubjects(assignments), [assignments])

  const visible = useMemo(() => {
    const filtered = assignments.filter(
      (a) =>
        (filters.status === 'all' || a.status === filters.status) &&
        (filters.priority === 'all' || a.priority === filters.priority) &&
        (filters.subject === 'all' || a.subject === filters.subject) &&
        matchesSearch(a, filters.search),
    )
    return sortAssignments(filtered, filters.sort)
  }, [assignments, filters])

  const isFiltered =
    filters.search !== '' || filters.status !== 'all' || filters.priority !== 'all' || filters.subject !== 'all'

  if (assignments.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={Sparkles}
          title="Your workspace is clear ✨"
          description="No assignments yet. Add your first assignment to get started."
          action={
            <Button variant="brand" icon={<Plus className="size-4.5" />} onClick={() => openCreate()}>
              Add assignment
            </Button>
          }
          className="py-20"
        />
      </Card>
    )
  }

  return (
    <div className="space-y-5">
      <AssignmentFilters filters={filters} subjects={subjects} onChange={setFilters} />

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted" aria-live="polite">
          Showing <span className="font-bold text-ink">{visible.length}</span> of {assignments.length} assignments
        </p>
        <div className="flex items-center gap-2">
          {isFiltered && (
            <Button variant="ghost" size="sm" onClick={() => setFilters({ ...DEFAULT_FILTERS, sort: filters.sort })}>
              Clear filters
            </Button>
          )}
          <Button variant="primary" size="sm" icon={<Plus className="size-4" />} onClick={() => openCreate()} className="lg:hidden">
            New
          </Button>
        </div>
      </div>

      {visible.length === 0 ? (
        <Card>
          <EmptyState
            icon={SearchX}
            title="No matching assignments"
            description="Try a different search term or loosen your filters."
            action={
              <Button variant="secondary" onClick={() => setFilters(DEFAULT_FILTERS)}>
                Reset filters
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((a, i) => (
            <AssignmentCard key={a.id} assignment={a} delay={Math.min(i, 8) * 40} />
          ))}
        </div>
      )}
    </div>
  )
}
