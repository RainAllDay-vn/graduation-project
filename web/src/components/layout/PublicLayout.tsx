import { NavLink, Outlet } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-[#0f172a] [background-image:radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:26px_26px]">
      {/* Top Navigation Bar matching vp-topnav */}
      <header className="h-[60px] shrink-0 flex items-center px-6 md:px-12 bg-white border-b border-[#e2e8f0] relative z-10">
        <NavLink to="/" className="flex items-center gap-2.5 no-underline">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] inline-block shrink-0" />
          <span className="font-mono font-extrabold text-sm tracking-[0.18em] text-[#0f172a]">
            NOC TOPOLOGY
          </span>
        </NavLink>

        <div className="ml-auto flex items-center gap-2.5">
          <NavLink
            to="/login"
            className="text-[13px] font-bold text-[#334155] px-2.5 py-2 rounded-lg hover:bg-[#f1f5f9] transition-colors"
          >
            Đăng nhập
          </NavLink>
          <NavLink to="/signup">
            <Button
              size="sm"
              className="bg-[#1d4ed8] hover:bg-[#1e40af] text-white text-[13px] font-bold h-9 px-3.5 rounded-lg cursor-pointer transition-colors"
            >
              Tạo tài khoản
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
