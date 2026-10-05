/**
 * Everything that talks to Firebase: Google sign-in and the Firestore database.
 *
 * This module is only ever loaded with `loadCloud()` (see firebase.ts), so the
 * Firebase SDK is downloaded only when accounts are set up. The rest of the app
 * never imports Firebase directly.
 *
 * Data layout (one private area per Google account):
 *   users/{uid}                         → { email, displayName, settings, createdAt }
 *   users/{uid}/assignments/{id}        → one Assignment (subtasks included)
 */
import { initializeApp } from 'firebase/app'
import {
  GoogleAuthProvider,
  connectAuthEmulator,
  getAdditionalUserInfo,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import {
  collection,
  connectFirestoreEmulator,
  doc,
  getDoc,
  initializeFirestore,
  onSnapshot,
  orderBy,
  persistentLocalCache,
  persistentMultipleTabManager,
  query,
  serverTimestamp,
  setDoc,
  writeBatch,
  type Unsubscribe,
  type WriteBatch,
} from 'firebase/firestore'
import { firebaseConfig } from '../config/firebase'
import { useFirebaseEmulator } from './firebase'
import type { Assignment, Settings } from '../types/assignment'

/* ---------- Setup ---------- */

const app = initializeApp(
  useFirebaseEmulator
    ? { apiKey: 'demo-key', authDomain: 'demo-taskly.firebaseapp.com', projectId: 'demo-taskly' }
    : firebaseConfig,
)
const auth = getAuth(app)

// The local cache keeps the app fast on reload and lets it work offline;
// changes sync automatically when the connection comes back.
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  ignoreUndefinedProperties: true,
})

if (useFirebaseEmulator) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
  connectFirestoreEmulator(db, '127.0.0.1', 8080)
}

/* ---------- Google sign-in ---------- */

export interface CloudUser {
  uid: string
  displayName: string | null
  email: string | null
  photoURL: string | null
}

/** Calls back with the signed-in user (or null) now and whenever it changes. */
export function onUserChange(callback: (user: CloudUser | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, (user) =>
    callback(user && { uid: user.uid, displayName: user.displayName, email: user.email, photoURL: user.photoURL }),
  )
}

/** Opens the Google sign-in popup. Throws Firebase errors (with a `code`) on failure. */
export async function signInWithGoogle(): Promise<{ isNewUser: boolean; displayName: string | null; email: string | null }> {
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })
  const credential = await signInWithPopup(auth, provider)
  return {
    isNewUser: getAdditionalUserInfo(credential)?.isNewUser ?? false,
    displayName: credential.user.displayName,
    email: credential.user.email,
  }
}

export function signOut(): Promise<void> {
  return firebaseSignOut(auth)
}

/* ---------- Assignments ---------- */

const assignmentDoc = (uid: string, id: string) => doc(db, 'users', uid, 'assignments', id)
const profileDoc = (uid: string) => doc(db, 'users', uid)

/** Live list of the user's assignments, newest first. Fires again on every change. */
export function subscribeAssignments(
  uid: string,
  onData: (assignments: Assignment[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const q = query(collection(db, 'users', uid, 'assignments'), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snap) => onData(snap.docs.map((d) => d.data() as Assignment)), onError)
}

/**
 * Saves only what changed between two versions of the list: new or edited
 * assignments are written, removed ones are deleted.
 */
export async function saveAssignmentChanges(uid: string, before: Assignment[], after: Assignment[]): Promise<void> {
  const previous = new Map(before.map((a) => [a.id, a]))
  const writes: ((batch: WriteBatch) => void)[] = []

  for (const assignment of after) {
    if (previous.get(assignment.id) !== assignment) writes.push((b) => b.set(assignmentDoc(uid, assignment.id), assignment))
    previous.delete(assignment.id)
  }
  for (const id of previous.keys()) writes.push((b) => b.delete(assignmentDoc(uid, id)))

  await commitInChunks(writes)
}

/** Firestore batches hold at most 500 writes. */
async function commitInChunks(writes: ((batch: WriteBatch) => void)[]) {
  for (let i = 0; i < writes.length; i += 450) {
    const batch = writeBatch(db)
    writes.slice(i, i + 450).forEach((write) => write(batch))
    await batch.commit()
  }
}

/* ---------- Profile & settings ---------- */

export interface CloudProfile {
  email: string | null
  displayName: string | null
  settings?: Partial<Settings>
}

export async function getProfile(uid: string): Promise<CloudProfile | null> {
  const snap = await getDoc(profileDoc(uid))
  return snap.exists() ? (snap.data() as CloudProfile) : null
}

/** Creates the account's profile and moves the browser's existing assignments into it. */
export async function createProfile(uid: string, profile: CloudProfile, assignments: Assignment[]): Promise<void> {
  await commitInChunks([
    ...assignments.map((a) => (b: WriteBatch) => b.set(assignmentDoc(uid, a.id), a)),
    (b) => b.set(profileDoc(uid), { ...profile, createdAt: serverTimestamp() }),
  ])
}

/** Live settings (so a change on one device shows up on the others). */
export function subscribeSettings(uid: string, onData: (settings: Partial<Settings> | undefined) => void): Unsubscribe {
  return onSnapshot(profileDoc(uid), (snap) => onData((snap.data() as CloudProfile | undefined)?.settings))
}

export function saveCloudSettings(uid: string, settings: Settings): Promise<void> {
  return setDoc(profileDoc(uid), { settings }, { merge: true })
}
