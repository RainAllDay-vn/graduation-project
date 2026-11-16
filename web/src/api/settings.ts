import { apiClient } from './client'
import type { Theme, Locale } from '@/context/ThemeContext'

export interface AppSettings {
  theme: Theme
  locale: Locale
  showDeviceLabels: boolean
  autoSelectOnAlarm: boolean
  blastRadiusBeacon: boolean
  showIpInPicker: boolean
  promptResumeInvestigation: boolean
}

export async function getSettings(): Promise<AppSettings> {
  const response = await apiClient.get<AppSettings>('/settings')
  return response.data
}

export async function saveSettings(settings: AppSettings): Promise<AppSettings> {
  const response = await apiClient.put<AppSettings>('/settings', settings)
  return response.data
}
