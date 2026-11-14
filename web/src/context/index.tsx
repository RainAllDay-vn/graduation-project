import type { ReactNode } from 'react'
import { AuthProvider } from './AuthContext'
import { ThemeProvider } from './ThemeContext'
import { IncidentProvider } from './IncidentContext'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <IncidentProvider>{children}</IncidentProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export * from './AuthContext'
export * from './ThemeContext'
export * from './IncidentContext'
