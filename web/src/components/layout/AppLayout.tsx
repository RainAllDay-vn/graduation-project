import { useState } from 'react'
import { NavLink, Outlet, useNavigate, Navigate, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth, useTheme } from '@/context'
import { getIncidents } from '@/api/incidents'
import { LogOut } from 'lucide-react'

function getInitials(name?: string): string {
  if (!name) return 'NC'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const TABS = {
  vi: [
    { to: '/overview', label: 'Tổng quan' },
    { to: '/topology', label: 'Bản đồ mạng' },
    { to: '/dashboard', label: 'Điều tra', hasDot: true },
    { to: '/lookup', label: 'Tra cứu' },
    { to: '/documents', label: 'Tài liệu' },
    { to: '/sources', label: 'Nguồn dữ liệu' },
    { to: '/settings', label: 'Cài đặt' },
  ],
  en: [
    { to: '/overview', label: 'Overview' },
    { to: '/topology', label: 'Topology' },
    { to: '/dashboard', label: 'Investigation', hasDot: true },
    { to: '/lookup', label: 'Lookup' },
    { to: '/documents', label: 'Documents' },
    { to: '/sources', label: 'Sources' },
    { to: '/settings', label: 'Settings' },
  ],
}

export default function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const { locale, setLocale } = useTheme()
  const [showUserMenu, setShowUserMenu] = useState(false)

  // Topology and Investigation pages use a strict fixed-viewport canvas (no window scrolling)
  const isFixedViewport =
    location.pathname.startsWith('/topology') ||
    location.pathname.startsWith('/dashboard')

  // Query open incidents to dynamically light up the red notification dot
  const { data: incidents } = useQuery({
    queryKey: ['incidents', 'badge'],
    queryFn: () => getIncidents(),
    refetchInterval: 30000,
    enabled: isAuthenticated,
  })

  const hasActiveIncidents =
    incidents?.some((inc) => inc.status !== 'RESOLVED') ?? true

  const tabs = TABS[locale] || TABS.vi

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  // Show authenticating spinner while initial session check is in flight
  if (isLoading) {
    return (
      <div
        role="status"
        aria-label="Checking authentication"
        className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] dark:bg-[#0b0f19] text-[#64748b] dark:text-[#94a3b8]"
      >
        <div className="w-9 h-9 border-3 border-[#1d4ed8] border-t-transparent rounded-full animate-spin" />
        <span className="font-mono text-xs font-bold tracking-widest uppercase mt-3 text-[#94a3b8]">
          Authenticating...
        </span>
      </div>
    )
  }

  // Force unauthenticated users to the landing page
  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <div
      className={`flex flex-col bg-[#f8fafc] dark:bg-[#0b0f19] text-[#0f172a] dark:text-[#f8fafc] [background-image:radial-gradient(#e2e8f0_1px,transparent_1px)] dark:[background-image:radial-gradient(#1e293b_1px,transparent_1px)] [background-size:26px_26px] ${
        isFixedViewport ? 'h-screen h-[100dvh] overflow-hidden' : 'min-h-screen'
      }`}
    >
      {/* Top Navigation Bar matching vp-topnav */}
      <header className="h-[60px] shrink-0 flex items-center px-6 md:px-12 bg-white dark:bg-[#0f172a] border-b border-[#e2e8f0] dark:border-[#1e293b] relative z-20">
        {/* Brand */}
        <NavLink to="/" className="flex items-center gap-2.5 no-underline shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] inline-block shrink-0" />
          <span className="font-mono font-extrabold text-sm tracking-[0.18em] text-[#0f172a] dark:text-[#f8fafc]">
            NOC TOPOLOGY
          </span>
        </NavLink>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 ml-7 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `text-[12.5px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap transition-colors flex items-center gap-1.5 no-underline ${
                  isActive
                    ? 'bg-[#1d4ed8] text-white shadow-xs'
                    : 'text-[#64748b] dark:text-[#94a3b8] hover:text-[#0f172a] dark:hover:text-[#f8fafc] hover:bg-[#f1f5f9] dark:hover:bg-[#1e293b]'
                }`
              }
            >
              <span>{tab.label}</span>
              {tab.hasDot && hasActiveIncidents && (
                <span className="w-[7px] h-[7px] rounded-full bg-[#ef4444] inline-block" />
              )}
            </NavLink>
          ))}
        </nav>

        {/* Right Section: Language Switcher + User Profile */}
        <div className="ml-auto flex items-center gap-3 shrink-0">
          {/* Language Switcher Badge */}
          <div className="inline-flex items-center gap-0.5 p-[3px] border border-[#cbd5e1] dark:border-[#334155] rounded-full bg-[#f8fafc] dark:bg-[#0b0f19]">
            <button
              type="button"
              onClick={() => setLocale('vi')}
              className={`font-mono font-bold text-[10px] tracking-[0.08em] border-0 rounded-full py-0.5 px-2.5 transition-colors cursor-pointer ${
                locale === 'vi'
                  ? 'bg-[#0f172a] dark:bg-[#1e293b] text-white shadow-xs'
                  : 'text-[#64748b] dark:text-[#94a3b8] hover:text-[#0f172a] dark:hover:text-[#f8fafc] bg-transparent'
              }`}
            >
              VI
            </button>
            <button
              type="button"
              onClick={() => setLocale('en')}
              className={`font-mono font-bold text-[10px] tracking-[0.08em] border-0 rounded-full py-0.5 px-2.5 transition-colors cursor-pointer ${
                locale === 'en'
                  ? 'bg-[#0f172a] dark:bg-[#1e293b] text-white shadow-xs'
                  : 'text-[#64748b] dark:text-[#94a3b8] hover:text-[#0f172a] dark:hover:text-[#f8fafc] bg-transparent'
              }`}
            >
              EN
            </button>
          </div>

          <div className="w-[1px] h-4 bg-[#e2e8f0] dark:bg-[#1e293b]" />

          {/* User Profile Chip */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowUserMenu((prev) => !prev)}
              className="flex items-center gap-2 border-0 bg-transparent cursor-pointer p-0 select-none group"
            >
              <div className="w-[30px] h-[30px] rounded-full bg-[#f1f5f9] dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] font-mono font-extrabold text-[11px] text-[#334155] dark:text-[#cbd5e1] flex items-center justify-center transition-colors group-hover:border-[#1d4ed8]">
                {getInitials(user?.fullName)}
              </div>
              <span className="text-[12.5px] font-semibold text-[#334155] dark:text-[#cbd5e1] hidden sm:inline">
                {user?.fullName || (locale === 'en' ? 'NOC Engineer' : 'Kỹ sư NOC')}
              </span>
            </button>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#0f172a] border border-[#e2e8f0] dark:border-[#1e293b] rounded-xl shadow-lg p-1.5 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 border-b border-[#f1f5f9] dark:border-[#1e293b] text-xs">
                  <div className="font-bold text-[#0f172a] dark:text-[#f8fafc] truncate">
                    {user?.fullName || 'NOC Engineer'}
                  </div>
                  <div className="text-[#94a3b8] dark:text-[#64748b] font-mono text-[10px] truncate">
                    {user?.email || 'engineer@corp.internal'}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full mt-1 px-3 py-1.5 text-left text-xs font-semibold text-[#ef4444] hover:bg-[#fef2f2] dark:hover:bg-red-950/40 rounded-lg transition-colors flex items-center gap-2 cursor-pointer border-0 bg-transparent"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{locale === 'en' ? 'Log out' : 'Đăng xuất'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Page Content */}
      <main
        className={`flex-1 flex flex-col ${
          isFixedViewport ? 'min-h-0 h-[calc(100vh-60px)] h-[calc(100dvh-60px)] overflow-hidden' : ''
        }`}
      >
        <Outlet />
      </main>
    </div>
  )
}
