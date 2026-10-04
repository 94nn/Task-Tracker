import { useContext } from 'react'
import { UIContext } from '../context/UIContext'

/** Opens app-wide dialogs: add / edit assignment, delete confirmation and search. */
export function useUI() {
  const context = useContext(UIContext)
  if (!context) throw new Error('useUI must be used inside <UIProvider>')
  return context
}
