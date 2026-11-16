import type { ReactNode } from 'react'
import { AuthProvider } from './AuthContext'
import { ThemeProvider } from './ThemeContext'
import { IncidentProvider } from './IncidentContext'
import { SettingsProvider } from './SettingsContext'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SettingsProvider>
          <IncidentProvider>{children}</IncidentProvider>
        </SettingsProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export * from './AuthContext'
export * from './ThemeContext'
export * from './IncidentContext'
export * from './SettingsContext'
