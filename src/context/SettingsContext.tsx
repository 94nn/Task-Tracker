import { createContext, useCallback, useEffect, useState, type ReactNode } from 'react'
import type { Settings } from '../types/assignment'
import { loadSettings, saveSettings } from '../services/storage'

export interface SettingsContextValue {
  settings: Settings
  updateSettings: (changes: Partial<Settings>) => void
}

export const SettingsContext = createContext<SettingsContextValue | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(loadSettings)

  const updateSettings = useCallback((changes: Partial<Settings>) => {
    setSettings((current) => {
      const next = { ...current, ...changes }
      saveSettings(next)
      return next
    })
  }, [])

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
