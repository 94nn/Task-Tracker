import { createContext, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { firebaseEnabled, loadCloud } from '../services/firebase'
import type { CloudUser } from '../services/cloud'
import { useToast } from '../hooks/useToast'
import { DEFAULT_SETTINGS, clearLocalAssignments, loadAssignments, loadSettings, markSignedIn } from '../services/storage'

export interface AuthUser {
  uid: string
  name: string
  email: string
  photoURL: string | null
}

/**
 * - disabled: Firebase isn't configured, so the app runs without accounts.
 * - loading: checking whether someone is already signed in.
 * - signed-out / signed-in: what you'd expect.
 * - error: signed in, but the account couldn't be prepared (usually a Firebase setup issue).
 */
export type AuthStatus = 'disabled' | 'loading' | 'signed-out' | 'signed-in' | 'error'

export interface AuthContextValue {
  status: AuthStatus
  user: AuthUser | null
  error: string | null
  /** Opens the Google sign-in popup. Resolves to null if the user closed it. */
  signInWithGoogle: () => Promise<{ isNewUser: boolean; name: string } | null>
  signOut: () => Promise<void>
  retry: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export class AuthError extends Error {}

function toAuthUser(user: CloudUser): AuthUser {
  return {
    uid: user.uid,
    name: user.displayName || user.email?.split('@')[0] || 'Student',
    email: user.email ?? '',
    photoURL: user.photoURL,
  }
}

/**
 * The first time an account signs in, create its profile and move this browser's
 * existing assignments and settings into it.
 */
async function prepareAccount(user: AuthUser): Promise<boolean> {
  const cloud = await loadCloud()
  if (await cloud.getProfile(user.uid)) return false
  const settings = loadSettings()
  if (settings.name === DEFAULT_SETTINGS.name) settings.name = user.name
  await cloud.createProfile(user.uid, { email: user.email, displayName: user.name, settings }, loadAssignments())
  clearLocalAssignments()
  return true
}

/** Firebase errors carry a `code` such as "auth/popup-blocked" or "permission-denied". */
const errorCode = (error: unknown) =>
  typeof error === 'object' && error !== null && 'code' in error ? String((error as { code: unknown }).code) : ''

function describeSetupError(error: unknown): string {
  const code = errorCode(error)
  if (code === 'permission-denied') {
    return 'Your account couldn’t be loaded because the Firestore security rules haven’t been set up yet. See “Accounts & sync” in the README.'
  }
  if (code === 'failed-precondition' || code === 'not-found') {
    return 'The Firestore database hasn’t been created yet. Create it in the Firebase console (Build → Firestore Database).'
  }
  if (code === 'unavailable') return 'Couldn’t reach the server. Check your internet connection and try again.'
  return 'Your account couldn’t be loaded. Please try again.'
}

function describeSignInError(error: unknown): string | null {
  const code = errorCode(error)
  switch (code) {
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
    case 'auth/user-cancelled':
      return null // The user just closed the window — not an error.
    case 'auth/popup-blocked':
      return 'Your browser blocked the sign-in window. Allow pop-ups for this site and try again.'
    case 'auth/unauthorized-domain':
      return 'This website isn’t on the list of allowed domains in Firebase (Authentication → Settings → Authorized domains).'
    case 'auth/operation-not-allowed':
      return 'Google sign-in isn’t turned on in Firebase yet (Authentication → Sign-in method → Google).'
    case 'auth/network-request-failed':
      return 'Couldn’t connect. Check your internet connection and try again.'
    default:
      return 'Sign-in didn’t work. Please try again.'
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>(firebaseEnabled ? 'loading' : 'disabled')
  const [user, setUser] = useState<AuthUser | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  const { toast } = useToast()
  // Set by a sign-in click; the welcome toast is shown once the account is ready,
  // so it isn't missed while a new account is being set up.
  const pendingWelcome = useRef(false)

  useEffect(() => {
    if (!firebaseEnabled) return
    let cancelled = false
    let unsubscribe = () => {}

    const handleUser = async (firebaseUser: CloudUser | null) => {
      if (!firebaseUser) {
        setUser(null)
        setStatus('signed-out')
        return
      }
      const next = toAuthUser(firebaseUser)
      setStatus('loading')
      try {
        const isNewAccount = await prepareAccount(next)
        markSignedIn()
        setUser(next)
        setError(null)
        setStatus('signed-in')
        if (pendingWelcome.current) {
          pendingWelcome.current = false
          const first = next.name.split(' ')[0]
          toast(isNewAccount ? `Welcome to Taskly, ${first}! 🎉` : `Welcome back, ${first}!`, {
            description: isNewAccount ? 'Your account is ready.' : undefined,
          })
        }
      } catch (e) {
        console.error('Account setup failed:', e)
        setUser(next)
        setError(describeSetupError(e))
        setStatus('error')
      }
    }

    // Firebase is downloaded on demand, then we listen for sign-in changes.
    loadCloud()
      .then((cloud) => {
        if (!cancelled) unsubscribe = cloud.onUserChange(handleUser)
      })
      .catch((e) => {
        if (cancelled) return
        console.error('Could not load sign-in:', e)
        setError('Sign-in couldn’t load. Check your internet connection and try again.')
        setStatus('error')
      })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [attempt, toast])

  const signInWithGoogle = useCallback(async () => {
    if (!firebaseEnabled) throw new AuthError('Sign-in isn’t available.')
    try {
      const cloud = await loadCloud()
      // Set before the popup resolves: the sign-in listener can fire first.
      pendingWelcome.current = true
      const result = await cloud.signInWithGoogle()
      return {
        isNewUser: result.isNewUser,
        name: result.displayName || result.email?.split('@')[0] || 'Student',
      }
    } catch (e) {
      pendingWelcome.current = false
      const message = describeSignInError(e)
      if (message === null) return null
      console.error('Google sign-in failed:', e)
      throw new AuthError(message)
    }
  }, [])

  const signOut = useCallback(async () => {
    if (!firebaseEnabled) return
    try {
      await (await loadCloud()).signOut()
    } catch (e) {
      console.error('Sign-out failed:', e)
    }
  }, [])

  // Re-run account setup (e.g. after fixing the Firebase rules).
  const retry = useCallback(() => setAttempt((n) => n + 1), [])

  const value = useMemo(
    () => ({ status, user, error, signInWithGoogle, signOut, retry }),
    [status, user, error, signInWithGoogle, signOut, retry],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
