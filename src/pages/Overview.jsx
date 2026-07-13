import { useEffect, useState } from 'react'
import { Building2, Users, ShoppingBag, CheckCircle2, XCircle } from 'lucide-react'
import { apiFetch } from '../lib/apiFetch'

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
          <Icon size={16} style={{ color }} />
        </div>
        <span className="text-xs text-gray-400">{label}</span>
      </div>
      <div className="text-2xl font-semibold text-white mt-3">{value ?? '—'}</div>
    </div>
  )
}

export default function Overview() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false
    apiFetch('/admin/stats')
      .then(res => res.json())
      .then(body => { if (!ignore) setStats(body?.data ?? body) })
      .catch(err => { if (!ignore) setError(err.message) })
    return () => { ignore = true }
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Platform Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Snapshot across every tenant on BizIQ.</p>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard icon={Building2} label="Total Tenants" value={stats?.totalTenants} color="#4166F5" />
        <StatCard icon={CheckCircle2} label="Active Tenants" value={stats?.activeTenants} color="#16a34a" />
        <StatCard icon={XCircle} label="Suspended Tenants" value={stats?.suspendedTenants} color="#dc2626" />
        <StatCard icon={Users} label="Total Users" value={stats?.totalUsers} color="#9333ea" />
        <StatCard icon={ShoppingBag} label="Total Orders" value={stats?.totalOrders} color="#d97706" />
      </div>
    </div>
  )
}
