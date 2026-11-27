import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppProviders } from '@/context'

import AppLayout from '@/components/layout/AppLayout'
import PublicLayout from '@/components/layout/PublicLayout'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

import LandingPage from '@/pages'
import LoginPage from '@/pages/login'
import SignupPage from '@/pages/signup'
import OverviewPage from '@/pages/overview'
import TopologyPage from '@/pages/topology'
import LookupPage from '@/pages/lookup'
import DocumentsPage from '@/pages/documents'
import SourcesPage from '@/pages/sources'
import SettingsPage from '@/pages/settings'
import NotFoundPage from '@/pages/NotFoundPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProviders>
        <BrowserRouter>
          <Routes>
            {/* Public Landing with Topbar */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
            </Route>

            {/* Standalone Split-Screen Auth Pages */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Authenticated Application Routes (Secured Monitor Pages) */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/overview" element={<OverviewPage />} />
                <Route path="/topology" element={<TopologyPage />} />
                <Route path="/incident" element={<TopologyPage />} />
                <Route path="/lookup" element={<LookupPage />} />
                <Route path="/documents" element={<DocumentsPage />} />
                <Route path="/sources" element={<SourcesPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Route>

            {/* Fallback 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AppProviders>
    </QueryClientProvider>
  )
}
