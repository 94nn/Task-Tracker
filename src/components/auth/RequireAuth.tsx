import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { CloudOff, Loader2 } from 'lucide-react'
import { Logo } from '../layout/Logo'
import { Button } from '../ui/Button'
import { useAuth } from '../../hooks/useAuth'
import { useAssignments } from '../../hooks/useAssignments'
import { hasSignedInBefore } from '../../services/storage'

/**
 * Protects the app: visitors who aren't signed in are sent to Sign up (first visit)
 * or Log in (returning). When accounts aren't configured, the app is always open.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { status, error, retry, signOut } = useAuth()
  const { ready } = useAssignments()
  const location = useLocation()

  if (status === 'disabled') return children

  if (status === 'signed-out') {
    return <Navigate to={hasSignedInBefore() ? '/login' : '/signup'} replace state={{ from: location.pathname }} />
  }

  if (status === 'error') {
    return (
      <FullScreen>
        <CloudOff className="mx-auto size-8 text-rose-400" aria-hidden />
        <h1 className="mt-4 text-lg font-bold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted">{error}</p>
        <div className="mt-6 flex justify-center gap-2">
          <Button variant="secondary" onClick={() => signOut()}>
            Sign out
          </Button>
          <Button onClick={retry}>Try again</Button>
        </div>
      </FullScreen>
    )
  }

  if (status === 'loading' || !ready) {
    return (
      <FullScreen>
        <Loader2 className="mx-auto size-7 animate-spin text-brand-400" aria-hidden />
        <p className="mt-3 text-sm text-muted" role="status">
          Loading your workspace…
        </p>
      </FullScreen>
    )
  }

  return children
}

function FullScreen({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6">
      <div className="absolute top-6 left-6">
        <Logo />
      </div>
      <div className="max-w-sm animate-fade-in text-center">{children}</div>
    </div>
  )
}
