import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from 'react'
import { useTheme, type Theme, type Locale } from './ThemeContext'
import { useAuth } from './AuthContext'
import { getSettings, saveSettings as saveSettingsApi } from '@/api/settings'

export interface UserSettings {
  theme: Theme
  locale: Locale
  showDeviceLabels: boolean
  autoSelectOnAlarm: boolean
  blastRadiusBeacon: boolean
  showIpInPicker: boolean
  promptResumeInvestigation: boolean
}

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'light',
  locale: 'vi',
  showDeviceLabels: true,
  autoSelectOnAlarm: true,
  blastRadiusBeacon: true,
  showIpInPicker: false,
  promptResumeInvestigation: true,
}

const SETTINGS_STORAGE_KEY = 'noc_settings'

export type SaveStatus = 'idle' | 'unsaved' | 'saved'

export interface SettingsContextType {
  settings: UserSettings
  draftSettings: UserSettings
  isDirty: boolean
  saveStatus: SaveStatus
  updateDraftSetting: <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => void
  saveSettings: () => void
  discardDraft: () => void
  resetToDefaults: () => void
  setSaveStatus: (status: SaveStatus) => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

function loadInitialSettings(currentTheme: Theme, currentLocale: Locale): UserSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        // Ensure theme & locale match current active values if already stored
        theme: parsed.theme || currentTheme || DEFAULT_SETTINGS.theme,
        locale: parsed.locale || currentLocale || DEFAULT_SETTINGS.locale,
      }
    }
  } catch (e) {
    console.warn('Failed to parse noc_settings from localStorage', e)
  }

  return {
    ...DEFAULT_SETTINGS,
    theme: currentTheme || DEFAULT_SETTINGS.theme,
    locale: currentLocale || DEFAULT_SETTINGS.locale,
  }
}

function areSettingsEqual(a: UserSettings, b: UserSettings): boolean {
  return (
    a.theme === b.theme &&
    a.locale === b.locale &&
    a.showDeviceLabels === b.showDeviceLabels &&
    a.autoSelectOnAlarm === b.autoSelectOnAlarm &&
    a.blastRadiusBeacon === b.blastRadiusBeacon &&
    a.showIpInPicker === b.showIpInPicker &&
    a.promptResumeInvestigation === b.promptResumeInvestigation
  )
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { theme, setTheme, locale, setLocale } = useTheme()
  const { user, isAuthenticated } = useAuth()

  const [settings, setSettings] = useState<UserSettings>(() =>
    loadInitialSettings(theme, locale)
  )
  const [draftSettings, setDraftSettings] = useState<UserSettings>(settings)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const hydratedUserRef = useRef<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated || !user) {
      hydratedUserRef.current = null
      return
    }
    if (hydratedUserRef.current === user.email) return
    hydratedUserRef.current = user.email

    getSettings()
      .then((remote) => {
        const merged: UserSettings = { ...DEFAULT_SETTINGS, ...remote }
        setSettings(merged)
        setDraftSettings(merged)
        setSaveStatus('idle')
        setTheme(merged.theme)
        setLocale(merged.locale)
        try {
          localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(merged))
        } catch (e) {
          console.warn('Failed to mirror server settings to localStorage', e)
        }
      })
      .catch((e) => {
        console.warn('Failed to load settings from server', e)
      })
  }, [isAuthenticated, user, setTheme, setLocale])

  const isDirty = useMemo(() => !areSettingsEqual(settings, draftSettings), [
    settings,
    draftSettings,
  ])

  const updateDraftSetting = useCallback(
    <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
      setDraftSettings((prev) => {
        const next = { ...prev, [key]: value }
        const dirty = !areSettingsEqual(settings, next)
        setSaveStatus(dirty ? 'unsaved' : 'idle')
        return next
      })

      // If user toggles theme or locale, provide immediate live feedback
      if (key === 'theme') {
        setTheme(value as Theme)
      } else if (key === 'locale') {
        setLocale(value as Locale)
      }
    },
    [settings, setTheme, setLocale]
  )

  const saveSettings = useCallback(async () => {
    const target = draftSettings
    try {
      await saveSettingsApi(target)
    } catch (e) {
      console.warn('Failed to save settings to server', e)
      setSaveStatus('unsaved')
      return
    }

    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(target))
    } catch (e) {
      console.warn('Failed to save settings to localStorage', e)
    }

    setSettings(target)
    setSaveStatus('saved')

    setTheme(target.theme)
    setLocale(target.locale)
  }, [draftSettings, setTheme, setLocale])

  const discardDraft = useCallback(() => {
    setDraftSettings(settings)
    setSaveStatus('idle')

    // Revert live preview if theme/locale had been changed in draft
    setTheme(settings.theme)
    setLocale(settings.locale)
  }, [settings, setTheme, setLocale])

  const resetToDefaults = useCallback(async () => {
    try {
      await saveSettingsApi(DEFAULT_SETTINGS)
    } catch (e) {
      console.warn('Failed to reset settings on server', e)
    }

    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS))
    } catch (e) {
      console.warn('Failed to reset settings in localStorage', e)
    }

    setSettings(DEFAULT_SETTINGS)
    setDraftSettings(DEFAULT_SETTINGS)
    setSaveStatus('saved')

    setTheme(DEFAULT_SETTINGS.theme)
    setLocale(DEFAULT_SETTINGS.locale)
  }, [setTheme, setLocale])

  const value = useMemo(
    () => ({
      settings,
      draftSettings,
      isDirty,
      saveStatus,
      updateDraftSetting,
      saveSettings,
      discardDraft,
      resetToDefaults,
      setSaveStatus,
    }),
    [
      settings,
      draftSettings,
      isDirty,
      saveStatus,
      updateDraftSetting,
      saveSettings,
      discardDraft,
      resetToDefaults,
    ]
  )

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings(): SettingsContextType {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
