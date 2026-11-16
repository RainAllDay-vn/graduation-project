import { useState, useRef, useEffect } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth, useTheme } from '@/context'
import { LogOut, ArrowRight, LayoutDashboard } from 'lucide-react'

function getInitials(name?: string): string {
  if (!name) return 'NC'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default function PublicLayout() {
  const { user, isAuthenticated, logout } = useAuth()
  const { locale, setLocale } = useTheme()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close dropdown menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }
    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserMenu])

  const handleLogout = async () => {
    setShowUserMenu(false)
    await logout()
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-[#0b0f19] text-[#0f172a] dark:text-[#f8fafc] [background-image:radial-gradient(#e2e8f0_1px,transparent_1px)] dark:[background-image:radial-gradient(#1e293b_1px,transparent_1px)] [background-size:26px_26px]">
      {/* Top Navigation Bar matching vp-topnav */}
      <header className="h-[60px] shrink-0 flex items-center px-6 md:px-12 bg-white dark:bg-[#0f172a] border-b border-[#e2e8f0] dark:border-[#1e293b] relative z-10">
        <NavLink to="/" className="flex items-center gap-2.5 no-underline">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] inline-block shrink-0" />
          <span className="font-mono font-extrabold text-sm tracking-[0.18em] text-[#0f172a] dark:text-[#f8fafc]">
            NOC TOPOLOGY
          </span>
        </NavLink>

        <div className="ml-auto flex items-center gap-3">
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

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {/* Go to App Primary CTA Button */}
              <NavLink to="/overview">
                <Button
                  size="sm"
                  className="bg-[#1d4ed8] hover:bg-[#1e40af] text-white text-[13px] font-bold h-9 px-3.5 rounded-lg cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  <span>{locale === 'en' ? 'Go to App' : 'Vào ứng dụng'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </NavLink>

              {/* User Profile Chip with Dropdown */}
              <div className="relative" ref={menuRef}>
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

                {/* Dropdown Menu */}
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

                    <NavLink
                      to="/overview"
                      onClick={() => setShowUserMenu(false)}
                      className="w-full mt-1 px-3 py-1.5 text-left text-xs font-semibold text-[#334155] dark:text-[#cbd5e1] hover:bg-[#f1f5f9] dark:hover:bg-[#1e293b] rounded-lg transition-colors flex items-center gap-2 no-underline"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-[#64748b] dark:text-[#94a3b8]" />
                      <span>{locale === 'en' ? 'Overview' : 'Tổng quan'}</span>
                    </NavLink>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full mt-0.5 px-3 py-1.5 text-left text-xs font-semibold text-[#ef4444] hover:bg-[#fef2f2] dark:hover:bg-red-950/40 rounded-lg transition-colors flex items-center gap-2 cursor-pointer border-0 bg-transparent"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{locale === 'en' ? 'Log out' : 'Đăng xuất'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <NavLink
                to="/login"
                className="text-[13px] font-bold text-[#334155] dark:text-[#cbd5e1] px-2.5 py-2 rounded-lg hover:bg-[#f1f5f9] dark:hover:bg-[#1e293b] transition-colors"
              >
                {locale === 'en' ? 'Log In' : 'Đăng nhập'}
              </NavLink>
              <NavLink to="/signup">
                <Button
                  size="sm"
                  className="bg-[#1d4ed8] hover:bg-[#1e40af] text-white text-[13px] font-bold h-9 px-3.5 rounded-lg cursor-pointer transition-colors"
                >
                  {locale === 'en' ? 'Create Account' : 'Tạo tài khoản'}
                </Button>
              </NavLink>
            </>
          )}
        </div>
      </header>

      {/* Main Page Content */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  )
}
