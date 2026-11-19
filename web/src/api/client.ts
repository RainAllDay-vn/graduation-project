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
// If a protected session expires on backend, invalidate local storage and redirect to login
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      try {
        localStorage.removeItem('noc_user')
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
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)
