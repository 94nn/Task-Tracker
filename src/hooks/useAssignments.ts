import { useContext } from 'react'
import { AssignmentsContext } from '../context/AssignmentsContext'

/** Access the assignment list and every create / update / delete action. */
export function useAssignments() {
  const context = useContext(AssignmentsContext)
  if (!context) throw new Error('useAssignments must be used inside <AssignmentsProvider>')
  return context
}
