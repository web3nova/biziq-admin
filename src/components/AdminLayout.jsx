import { Outlet, NavLink } from 'react-router-dom'
import { LayoutDashboard, Building2, ShieldCheck, LogOut, Zap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Avatar } from './ui'

const navItems = [
  { label: 'Overview', icon: LayoutDashboard, path: '/' },
  { label: 'Tenants', icon: Building2, path: '/tenants' },
  { label: 'Admins', icon: ShieldCheck, path: '/admins' },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex">
      <aside className="w-64 flex-shrink-0 border-r border-gray-800/80 flex flex-col bg-gray-950/60">
        <div className="flex items-center gap-2.5 px-5 py-6">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
            <Zap size={16} className="text-white" fill="white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white leading-none tracking-tight">BizIQ</div>
            <div className="text-[10px] text-gray-500 mt-0.5">Admin Console</div>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1 mt-2">
          <div className="px-3 mb-2 text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Platform</div>
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `group relative flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl transition ${
                  isActive ? 'bg-blue-600/10 text-blue-400' : 'text-gray-400 hover:bg-gray-900 hover:text-gray-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-blue-500" />}
                  <item.icon size={16} strokeWidth={2} />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-gray-800/80">
          <div className="flex items-center gap-2.5 px-2 py-2 mb-1 rounded-xl">
            <Avatar name={user?.name} email={user?.email} size={32} />
            <div className="min-w-0">
              <div className="text-xs font-semibold text-gray-200 truncate">{user?.name || 'Admin'}</div>
              <div className="text-[11px] text-gray-500 truncate">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-400 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition"
          >
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-8 py-9">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
