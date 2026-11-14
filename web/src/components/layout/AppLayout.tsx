import { NavLink, Outlet } from 'react-router-dom'

export default function AppLayout() {
  return (
    <div>
      <header className="p-4 border-b border-slate-800 flex gap-4 text-sm">
        <NavLink to="/overview">Overview</NavLink>
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/lookup">Lookup</NavLink>
        <NavLink to="/documents">Documents</NavLink>
        <NavLink to="/sources">Sources</NavLink>
        <NavLink to="/settings">Settings</NavLink>
      </header>
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  )
}
