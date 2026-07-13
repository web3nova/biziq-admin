import { Outlet, NavLink } from 'react-router-dom'
import { Shield, LayoutDashboard, Building2, ShieldCheck, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { label: 'Overview', icon: LayoutDashboard, path: '/' },
  { label: 'Tenants', icon: Building2, path: '/tenants' },
  { label: 'Admins', icon: ShieldCheck, path: '/admins' },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex">
      <aside className="w-60 flex-shrink-0 border-r border-gray-800 flex flex-col">
        <div className="flex items-center gap-2 px-5 py-5">
          <Shield size={20} className="text-blue-500" />
          <span className="text-sm font-semibold">BizIQ Admin</span>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 text-sm rounded-xl transition ${
                  isActive ? 'bg-blue-600/15 text-blue-400' : 'text-gray-400 hover:bg-gray-900 hover:text-gray-200'
                }`
              }
            >
              <item.icon size={16} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-gray-800">
          <div className="px-3 py-2 mb-1">
            <div className="text-xs font-medium text-gray-200 truncate">{user?.name || user?.email}</div>
            <div className="text-[11px] text-gray-500 truncate">{user?.email}</div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-400 hover:bg-gray-900 hover:text-red-400 rounded-xl transition"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
