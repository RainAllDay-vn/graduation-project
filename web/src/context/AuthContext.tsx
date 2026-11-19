import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { getMe, logout as apiLogout, type UserDetails } from '@/api/auth'

export type { UserDetails }

export type SignOffReason = 'inactivity' | 'session_expired' | 'user_action'

interface AuthContextType {
  user: UserDetails | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: UserDetails | null) => void
  logout: () => Promise<void>
  signOff: (reason?: SignOffReason) => void
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

  // Listen for multi-tab auth events (if user signs off or session expires in Tab A, Tab B syncs immediately)
  useEffect(() => {
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === 'noc_auth_broadcast' && e.newValue) {
        try {
          const payload = JSON.parse(e.newValue)
          if (payload?.type === 'SIGNOFF') {
            setUser(null)
            try {
              localStorage.removeItem('noc_user')
            } catch {}

            const isPublicOrTesting =
              typeof window !== 'undefined' &&
              (window.location.pathname.startsWith('/login') ||
                window.location.pathname.startsWith('/signup') ||
                window.location.pathname === '/' ||
                window.location.pathname.includes('iframe.html') ||
                window.location.pathname.includes('storybook'))

            if (!isPublicOrTesting) {
              const currentPath = window.location.pathname + window.location.search
              const returnUrlParam = encodeURIComponent(currentPath)
              const reason = payload.reason || 'session_expired'
              window.location.href = `/login?reason=${reason}&returnUrl=${returnUrlParam}`
            }
          }
        } catch {}
      }
    }

    window.addEventListener('storage', handleStorageEvent)
    return () => {
      window.removeEventListener('storage', handleStorageEvent)
    }
  }, [])

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
      .catch((err) => {
        if (isMounted) {
          // If server explicitly returns 401 Unauthorized, the session has expired or backend was restarted
          if (err?.response?.status === 401) {
            try {
              localStorage.removeItem('noc_user')
            } catch {}
            setUser(null)
          } else {
            // For temporary network glitches/offline mode, keep the cached user
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

  const signOff = (reason: SignOffReason = 'inactivity') => {
    try {
      localStorage.removeItem('noc_user')
      localStorage.setItem(
        'noc_auth_broadcast',
        JSON.stringify({ type: 'SIGNOFF', reason, timestamp: Date.now() })
      )
    } catch {}
    setUser(null)

    const isPublicOrTesting =
      typeof window !== 'undefined' &&
      (window.location.pathname.startsWith('/login') ||
        window.location.pathname.startsWith('/signup') ||
        window.location.pathname === '/' ||
        window.location.pathname.includes('iframe.html') ||
        window.location.pathname.includes('storybook'))

    if (!isPublicOrTesting) {
      const currentPath = window.location.pathname + window.location.search
      const returnUrlParam = encodeURIComponent(currentPath)
      window.location.href = `/login?reason=${reason}&returnUrl=${returnUrlParam}`
    }
  }

  const logout = async () => {
    try {
      await apiLogout()
    } catch {
      // Invalidate local session state even if network call fails
    } finally {
      signOff('user_action')
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
        signOff,
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
