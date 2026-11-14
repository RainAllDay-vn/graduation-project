import { createContext, useContext, useState, type ReactNode } from 'react'

export type Theme = 'dark' | 'light' | 'system'
export type Locale = 'vi' | 'en'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  locale: Locale
  setLocale: (locale: Locale) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')
  const [locale, setLocale] = useState<Locale>('vi')

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        locale,
        setLocale,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
