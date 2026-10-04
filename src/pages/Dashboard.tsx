import { BookOpen, CircleCheckBig, Hourglass, Plus, TriangleAlert, Sparkles } from 'lucide-react'
import { StatCard } from '../components/dashboard/StatCard'
import { ProgressOverview } from '../components/dashboard/ProgressOverview'
import { UpcomingDeadlines } from '../components/dashboard/UpcomingDeadlines'
import { TodayFocus } from '../components/dashboard/TodayFocus'
import { EmptyState } from '../components/ui/EmptyState'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useAssignments } from '../hooks/useAssignments'
import { useUI } from '../hooks/useUI'
import { getAllTasks, getStats, getUpcoming, isTaskDueToday } from '../utils/assignmentUtils'

export default function Dashboard() {
  const { assignments } = useAssignments()
  const { openCreate } = useUI()

  const stats = getStats(assignments)
  const upcoming = getUpcoming(assignments).slice(0, 6)
  const todayTasks = getAllTasks(assignments).filter(isTaskDueToday)

  if (assignments.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={Sparkles}
          title="Your workspace is clear ✨"
          description="No assignments yet. Add your first assignment to get started."
          action={
            <Button variant="brand" icon={<Plus className="size-4.5" />} onClick={() => openCreate()}>
              Add your first assignment
            </Button>
          }
          className="py-20"
        />
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <section aria-label="Statistics" className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          label="Total Assignments"
          value={stats.total}
          hint={`${stats.dueThisWeek} due this week`}
          icon={BookOpen}
          tone="lavender"
        />
        <StatCard
          label="In Progress"
          value={stats.inProgress}
          hint={stats.inProgress > 0 ? 'Keep going!' : 'Nothing in progress'}
          icon={Hourglass}
          tone="orange"
          delay={40}
        />
        <StatCard
          label="Completed"
          value={stats.completed}
          hint={`${stats.completionRate}% of all assignments`}
          icon={CircleCheckBig}
          tone="green"
          delay={80}
        />
        <StatCard
          label="Overdue"
          value={stats.overdue}
          hint={stats.overdue > 0 ? 'Needs attention' : 'Nothing overdue 🎉'}
          icon={TriangleAlert}
          tone="red"
          delay={120}
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <UpcomingDeadlines assignments={upcoming} />
        </div>
        <div className="space-y-6">
          <ProgressOverview stats={stats} />
          <TodayFocus tasks={todayTasks} />
        </div>
      </div>
    </div>
  )
}
