import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

/** The signed-in Google account, plus sign-in / sign-out. */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}
