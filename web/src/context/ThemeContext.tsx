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
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('noc_theme')
    return (saved as Theme) || 'dark'
  })
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = localStorage.getItem('noc_locale')
    return (saved as Locale) || 'vi'
  })

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem('noc_theme', newTheme)
  }

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('noc_locale', newLocale)
  }

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
