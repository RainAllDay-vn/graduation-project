import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context'

export interface ProtectedRouteProps {
  redirectTo?: string
}

/**
 * Route guard that requires an active authenticated session.
 * If the user is unauthenticated, they are redirected to the landing page.
 */
export function ProtectedRoute({ redirectTo = '/' }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div
        role="status"
        aria-label="Checking authentication"
        className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] text-[#64748b]"
      >
        <div className="w-9 h-9 border-3 border-[#1d4ed8] border-t-transparent rounded-full animate-spin" />
        <span className="font-mono text-xs font-bold tracking-widest uppercase mt-3 text-[#94a3b8]">
          Authenticating...
        </span>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  return <Outlet />
}

export default ProtectedRoute
