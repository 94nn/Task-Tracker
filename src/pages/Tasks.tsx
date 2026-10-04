import { useMemo, useState } from 'react'
import { CircleCheckBig, ClipboardList, PartyPopper } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { SegmentedControl } from '../components/ui/SegmentedControl'
import { TaskRow } from '../components/tasks/TaskRow'
import { useAssignments } from '../hooks/useAssignments'
import { getAllTasks, isTaskDueToday, type TaskItem } from '../utils/assignmentUtils'
import { todayISO } from '../utils/dateUtils'

type Tab = 'all' | 'today' | 'upcoming' | 'completed'

const EMPTY: Record<Tab, { title: string; description: string }> = {
  all: {
    title: 'No tasks yet',
    description: 'Open an assignment and break it into subtasks — they’ll all show up here.',
  },
  today: { title: "You're all caught up!", description: 'Nothing is due today. A good moment to get ahead.' },
  upcoming: { title: "You're all caught up!", description: 'No upcoming tasks. Enjoy the breathing room.' },
  completed: { title: 'Nothing finished yet', description: 'Tick off a task and it will appear here.' },
}

export default function Tasks() {
  const { assignments } = useAssignments()
  const [tab, setTab] = useState<Tab>('today')

  const groups = useMemo(() => {
    const all = getAllTasks(assignments)
    const today = todayISO()
    return {
      // Open tasks first, finished ones at the bottom.
      all: [...all.filter((t) => !t.subtask.completed), ...all.filter((t) => t.subtask.completed)],
      today: all.filter(isTaskDueToday),
      upcoming: all.filter((t) => !t.subtask.completed && t.dueDate > today),
      completed: all.filter((t) => t.subtask.completed),
    } satisfies Record<Tab, TaskItem[]>
  }, [assignments])

  const tasks = groups[tab]
  const overdue = tab === 'today' ? tasks.filter((t) => t.dueDate < todayISO()) : []
  const dueToday = tab === 'today' ? tasks.filter((t) => t.dueDate === todayISO()) : tasks

  return (
    <div className="space-y-5">
      <SegmentedControl
        label="Task filter"
        value={tab}
        onChange={setTab}
        className="w-full sm:w-auto"
        options={[
          { value: 'today', label: 'Today', count: groups.today.length },
          { value: 'upcoming', label: 'Upcoming', count: groups.upcoming.length },
          { value: 'all', label: 'All', count: groups.all.length },
          { value: 'completed', label: 'Completed', count: groups.completed.length },
        ]}
      />

      <Card className="p-2 sm:p-3">
        {tasks.length === 0 ? (
          <EmptyState
            icon={tab === 'completed' ? CircleCheckBig : tab === 'all' ? ClipboardList : PartyPopper}
            title={EMPTY[tab].title}
            description={EMPTY[tab].description}
          />
        ) : (
          <div key={tab} className="animate-fade-up">
            {overdue.length > 0 && <TaskGroup title="Overdue" tone="text-rose-600 dark:text-rose-300" tasks={overdue} />}
            {dueToday.length > 0 && <TaskGroup title={tab === 'today' ? 'Due today' : undefined} tasks={dueToday} />}
          </div>
        )}
      </Card>
    </div>
  )
}

function TaskGroup({ title, tone = 'text-subtle', tasks }: { title?: string; tone?: string; tasks: TaskItem[] }) {
  return (
    <section className="py-1">
      {title && <h2 className={`px-3 pt-2 pb-1 text-xs font-bold tracking-wide uppercase ${tone}`}>{title}</h2>}
      <ul className="divide-y divide-line">
        {tasks.map((task) => (
          <TaskRow key={task.subtask.id} task={task} />
        ))}
      </ul>
    </section>
  )
}
