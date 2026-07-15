import { useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { LayoutDashboard, Building2, ShieldCheck, LogOut, Menu, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Avatar, PRIMARY, CREAM } from './ui'
import logoIcon from '../assets/logo-icon.png'

const navItems = [
  { label: 'Overview', icon: LayoutDashboard, path: '/' },
  { label: 'Tenants', icon: Building2, path: '/tenants' },
  { label: 'Admins', icon: ShieldCheck, path: '/admins' },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className="min-h-screen flex" style={{ background: CREAM }}>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(v => !v)}
        className="fixed top-4 left-4 z-30 lg:hidden w-9 h-9 flex items-center justify-center bg-white border border-gray-200 rounded-xl shadow-sm text-gray-500 hover:text-gray-700"
      >
        {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-20 w-64 flex-shrink-0 border-r border-gray-200 flex flex-col
          lg:static lg:z-auto
          transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{ background: CREAM }}
      >
        <div className="flex items-center gap-2.5 px-5 py-6 border-b border-gray-100">
          <img src={logoIcon} alt="" className="w-8 h-8" />
          <div>
            <div className="text-sm font-bold text-gray-900 leading-none tracking-tight">BizIQ</div>
            <div className="text-[10px] text-gray-400 mt-0.5">Admin Console</div>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1 mt-4">
          <div className="px-3 mb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Platform</div>
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `group relative flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl transition ${
                  isActive ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:bg-white/60 hover:text-gray-700'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full" style={{ background: PRIMARY }} />}
                  <item.icon size={16} strokeWidth={2} style={isActive ? { color: PRIMARY } : undefined} />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-gray-100">
          <div className="flex items-center gap-2.5 px-2 py-2 mb-1 rounded-xl">
            <Avatar name={user?.name} email={user?.email} size={32} />
            <div className="min-w-0">
              <div className="text-xs font-semibold text-gray-900 truncate">{user?.name || 'Admin'}</div>
              <div className="text-[11px] text-gray-400 truncate">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition"
          >
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-9 pt-20 lg:pt-9">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
