/**
 * Firebase project settings — paste yours here to turn on Google sign-in and sync.
 *
 * Where to find them: Firebase console → Project settings (gear icon) → General →
 * "Your apps" → Web app → SDK setup and configuration → Config.
 * Full steps are in the README ("Accounts & sync").
 *
 * These values are not secret: every Firebase web app ships them to the browser.
 * Your data is protected by the Firestore security rules in firestore.rules.
 *
 * While apiKey still starts with "PASTE", the app runs without accounts and keeps
 * data in the browser only (exactly like before sign-in existed).
 */
export const firebaseConfig = {
  apiKey: 'AIzaSyA6wv3UQOr4OZjuqbCMw5jOzgtLOrHSN-U',
  authDomain: 'taskly-1a7db.firebaseapp.com',
  projectId: 'taskly-1a7db',
  storageBucket: 'taskly-1a7db.firebasestorage.app',
  messagingSenderId: '462188188121',
  appId: '1:462188188121:web:870b69084d68c87cf5c9c8',
}

export const isFirebaseConfigured = !firebaseConfig.apiKey.startsWith('PASTE')
