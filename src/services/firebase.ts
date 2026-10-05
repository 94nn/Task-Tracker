/**
 * Decides whether accounts are on, and loads Firebase only when they are.
 *
 * Firebase is large, so it lives in its own file (cloud.ts) that is downloaded
 * on demand. If src/config/firebase.ts still has the placeholder values, it is
 * never downloaded at all and the app keeps data in the browser instead.
 */
import { isFirebaseConfigured } from '../config/firebase'

/**
 * For local testing without a real project: `VITE_FIREBASE_EMULATOR=true npm run dev`
 * talks to the Firebase emulators (auth on :9099, Firestore on :8080).
 */
export const useFirebaseEmulator = import.meta.env.VITE_FIREBASE_EMULATOR === 'true'

export const firebaseEnabled = useFirebaseEmulator || isFirebaseConfigured

type Cloud = typeof import('./cloud')
let cloud: Promise<Cloud> | null = null

/** Downloads and starts Firebase the first time it's needed; later calls reuse it. */
export function loadCloud(): Promise<Cloud> {
  if (!firebaseEnabled) return Promise.reject(new Error('Firebase is not configured.'))
  cloud ??= import('./cloud').catch((error: unknown) => {
    cloud = null // allow "Try again" after a failed download
    throw error
  })
  return cloud
}

// Start downloading straight away when accounts are on, so sign-in is ready sooner.
if (firebaseEnabled) void loadCloud()
