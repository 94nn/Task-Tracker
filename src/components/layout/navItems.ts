import { BookOpen, CalendarDays, CircleCheckBig, LayoutDashboard, ListChecks, Settings, type LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/assignments', label: 'Assignments', icon: BookOpen },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/tasks', label: 'Tasks', icon: ListChecks },
  { to: '/completed', label: 'Completed', icon: CircleCheckBig },
  { to: '/settings', label: 'Settings', icon: Settings },
]
