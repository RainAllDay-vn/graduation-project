import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { AuthProvider } from '@/context'

const meta: Meta<typeof ProtectedRoute> = {
  title: 'Auth/ProtectedRoute',
  component: ProtectedRoute,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const AuthenticatedAccess: Story = {
  render: () => (
    <MemoryRouter initialEntries={['/secured-monitor']}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<div className="p-8 font-bold">Landing Page</div>} />
          <Route element={<ProtectedRoute />}>
            <Route
              path="/secured-monitor"
              element={
                <div className="p-8 bg-green-50 border border-green-200 text-green-800 rounded-xl m-6">
                  <h2 className="text-lg font-bold">Secured Monitor Page</h2>
                  <p className="text-sm mt-1">Authenticated user can view this monitor route.</p>
                </div>
              }
            />
          </Route>
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  ),
}

export const UnauthenticatedRedirectsToLanding: Story = {
  render: () => (
    <MemoryRouter initialEntries={['/secured-monitor']}>
      <AuthProvider>
        <Routes>
          <Route
            path="/"
            element={
              <div className="p-8 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl m-6">
                <h2 className="text-lg font-bold">Landing Page (Redirect Destination)</h2>
                <p className="text-sm mt-1">
                  Unauthenticated visitors attempting to view monitor pages are redirected here.
                </p>
              </div>
            }
          />
          <Route element={<ProtectedRoute />}>
            <Route
              path="/secured-monitor"
              element={<div>Should not be visible without auth</div>}
            />
          </Route>
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  ),
}
