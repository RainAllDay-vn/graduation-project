import axios from 'axios'

export const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  // Ensure session cookies (JSESSIONID) are sent and received
  withCredentials: true,
})

// Global 401 Unauthorized Interceptor:
// If a protected session expires on backend, invalidate local storage, broadcast to other tabs, and redirect to login
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      try {
        localStorage.removeItem('noc_user')
        localStorage.setItem(
          'noc_auth_broadcast',
          JSON.stringify({ type: 'SIGNOFF', reason: 'session_expired', timestamp: Date.now() })
        )
      } catch {}

      const isAuthEndpoint =
        error.config?.url?.includes('/auth/login') ||
        error.config?.url?.includes('/auth/signup')

      const isPublicOrTesting =
        typeof window !== 'undefined' &&
        (window.location.pathname.startsWith('/login') ||
          window.location.pathname.startsWith('/signup') ||
          window.location.pathname === '/' ||
          window.location.pathname.includes('iframe.html') ||
          window.location.pathname.includes('storybook'))

      if (!isAuthEndpoint && !isPublicOrTesting) {
        const currentPath = window.location.pathname + window.location.search
        const returnUrlParam = encodeURIComponent(currentPath)
        window.location.href = `/login?reason=session_expired&returnUrl=${returnUrlParam}`
      }
    }
    return Promise.reject(error)
  }
)
