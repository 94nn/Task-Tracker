import { createContext, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import type { Settings } from '../types/assignment'
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from '../services/storage'
import { loadCloud } from '../services/firebase'
import { useAuth } from '../hooks/useAuth'

export interface SettingsContextValue {
  settings: Settings
  updateSettings: (changes: Partial<Settings>) => void
}

export const SettingsContext = createContext<SettingsContextValue | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { status, user } = useAuth()
  const uid = status === 'signed-in' ? user?.uid : undefined
  const [settings, setSettings] = useState<Settings>(loadSettings)
  const latest = useRef(settings)

  // Signed in: settings come from the account (and update live from other devices).
  // A copy is still kept locally so the theme applies instantly on the next page load.
  useEffect(() => {
    if (!uid) return
    let cancelled = false
    let unsubscribe = () => {}
    loadCloud().then((cloud) => {
      if (cancelled) return
      unsubscribe = cloud.subscribeSettings(uid, (saved) => {
        if (!saved) return
        const next = { ...DEFAULT_SETTINGS, ...saved }
        latest.current = next
        setSettings(next)
        saveSettings(next)
      })
    })
    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [uid])

  const updateSettings = useCallback(
    (changes: Partial<Settings>) => {
      const next = { ...latest.current, ...changes }
      latest.current = next
      setSettings(next)
      saveSettings(next)
      if (uid) {
        loadCloud()
          .then((cloud) => cloud.saveCloudSettings(uid, next))
          .catch((error) => console.error('Could not save settings:', error))
      }
    },
    [uid],
  )

  // Apply the theme by toggling the "dark" class on <html>.
  // For "system", follow the operating system and react when it changes.
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const dark = settings.theme === 'dark' || (settings.theme === 'system' && media.matches)
      document.documentElement.classList.toggle('dark', dark)
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0e1016' : '#faf8f5')
    }
    apply()
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [settings.theme])

  return <SettingsContext.Provider value={{ settings, updateSettings }}>{children}</SettingsContext.Provider>
}
