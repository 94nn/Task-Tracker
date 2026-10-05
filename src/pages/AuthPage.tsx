import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router'
import { CalendarDays, Cloud, ListChecks, Loader2, Target, TriangleAlert } from 'lucide-react'
import { Logo } from '../components/layout/Logo'
import { GoogleIcon } from '../components/auth/GoogleIcon'
import { AuthError } from '../context/AuthContext'
import { useAuth } from '../hooks/useAuth'

type Mode = 'signup' | 'login'

const COPY: Record<Mode, { title: string; subtitle: string; button: string; switchText: string; switchLink: string; switchTo: string }> = {
  signup: {
    title: 'Create your account',
    subtitle: 'Start organising your assignments in seconds. It’s free.',
    button: 'Sign up with Google',
    switchText: 'Already have an account?',
    switchLink: 'Log in',
    switchTo: '/login',
  },
  login: {
    title: 'Welcome back 👋',
    subtitle: 'Log in to pick up right where you left off.',
    button: 'Log in with Google',
    switchText: 'New to Taskly?',
    switchLink: 'Create an account',
    switchTo: '/signup',
  },
}

const FEATURES = [
  { icon: ListChecks, text: 'Break assignments into small, doable steps' },
  { icon: CalendarDays, text: 'See every deadline on one calm calendar' },
  { icon: Target, text: 'Track progress and spot what needs attention' },
  { icon: Cloud, text: 'Your work syncs across laptop, tablet and phone' },
]

export default function AuthPage({ mode }: { mode: Mode }) {
  const { status, signInWithGoogle } = useAuth()
  const location = useLocation()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const copy = COPY[mode]

  // Where to go after signing in (the page they originally tried to open).
  const from = (location.state as { from?: string } | null)?.from ?? '/'
  if (status === 'disabled' || status === 'signed-in') return <Navigate to={from} replace />

  const busy = pending || status === 'loading'

  async function handleGoogle() {
    setError(null)
    setPending(true)
    try {
      // The welcome message appears once the account is ready (see AuthContext).
      await signInWithGoogle()
    } catch (e) {
      setError(e instanceof AuthError ? e.message : 'Sign-in didn’t work. Please try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Brand panel (large screens) */}
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-brand-100 via-pink-50 to-sky-100 p-12 lg:flex lg:flex-col dark:from-brand-500/15 dark:via-canvas dark:to-sky-500/10">
        <div className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-brand-200/60 blur-3xl dark:bg-brand-500/10" aria-hidden />
        <div className="pointer-events-none absolute -bottom-32 -left-20 size-96 rounded-full bg-sky-200/60 blur-3xl dark:bg-sky-500/10" aria-hidden />
        <Logo />
        <div className="relative my-auto max-w-md">
          <h2 className="text-4xl leading-tight font-bold tracking-tight">
            Your assignments,
            <br />
            finally under control.
          </h2>
          <p className="mt-4 text-base text-muted">A calm, student-friendly planner for deadlines, coursework and everything in between.</p>
          <ul className="mt-10 space-y-4">
            {FEATURES.map(({ icon: Icon, text }, i) => (
              <li key={text} className="flex animate-fade-up items-center gap-3" style={{ animationDelay: `${i * 70}ms` }}>
                <span className="flex size-10 items-center justify-center rounded-xl bg-surface/80 shadow-soft backdrop-blur">
                  <Icon className="size-5 text-brand-500" aria-hidden />
                </span>
                <span className="text-sm font-medium">{text}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-muted">Made for university students ✨</p>
      </aside>

      {/* Form */}
      <main className="flex items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-sm animate-fade-up">
          <div className="mb-10 lg:hidden">
            <Logo />
          </div>

          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{copy.title}</h1>
          <p className="mt-2 text-sm text-muted">{copy.subtitle}</p>

          {error && (
            <div role="alert" className="mt-6 flex gap-2.5 rounded-xl bg-rose-50 p-3.5 text-sm text-rose-700 dark:bg-rose-400/10 dark:text-rose-300">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
              <p>{error}</p>
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogle}
            disabled={busy}
            className="mt-8 flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-line bg-surface text-sm font-semibold shadow-soft transition-all hover:-translate-y-px hover:shadow-lift active:translate-y-0 disabled:pointer-events-none disabled:opacity-60"
          >
            {busy ? <Loader2 className="size-5 animate-spin text-muted" aria-hidden /> : <GoogleIcon className="size-5" />}
            {busy ? 'Signing you in…' : copy.button}
          </button>

          <p className="mt-4 text-center text-xs leading-relaxed text-subtle">
            We only use your Google name, email address and profile photo.
            {mode === 'signup' && ' Anything already in this browser moves into your new account.'}
          </p>

          <div className="my-8 h-px bg-line" />

          <p className="text-center text-sm text-muted">
            {copy.switchText}{' '}
            <Link to={copy.switchTo} state={location.state} className="font-semibold text-brand-600 hover:underline dark:text-brand-300">
              {copy.switchLink}
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
