import { NavLink, Outlet } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/context'

export default function PublicLayout() {
  const { locale, setLocale } = useTheme()

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
        </div>
      </header>

      {/* Main Page Content */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  )
}
