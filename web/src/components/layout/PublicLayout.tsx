import { NavLink, Outlet } from 'react-router-dom'

export default function PublicLayout() {
  return (
    <div>
      <header className="p-4 border-b border-slate-800 flex gap-4 text-sm">
        <NavLink to="/">Landing</NavLink>
        <NavLink to="/login">Login</NavLink>
        <NavLink to="/signup">Signup</NavLink>
      </header>
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  )
}
