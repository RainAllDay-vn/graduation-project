import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { getMe, logout as apiLogout, type UserDetails } from '@/api/auth'

export type { UserDetails }

interface AuthContextType {
  user: UserDetails | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: UserDetails | null) => void
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDetails | null>(() => {
    try {
      const saved = localStorage.getItem('noc_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    getMe()
      .then((data) => {
        if (isMounted) {
          setUser(data)
          try {
            localStorage.setItem('noc_user', JSON.stringify(data))
          } catch {}
        }
      })
      .catch(() => {
        if (isMounted) {
          const saved = localStorage.getItem('noc_user')
          if (saved) {
            try {
              setUser(JSON.parse(saved))
            } catch {
              setUser(null)
            }
          } else {
            setUser(null)
          }
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  const logout = async () => {
    try {
      await apiLogout()
    } catch {
      // Invalidate local session state even if network call fails
    } finally {
      try {
        localStorage.removeItem('noc_user')
      } catch {}
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        setUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
