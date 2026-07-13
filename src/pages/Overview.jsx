import { useEffect, useState } from 'react'
import { Building2, Users, ShoppingBag, CheckCircle2, XCircle, TrendingUp } from 'lucide-react'
import { apiFetch } from '../lib/apiFetch'
import { PageHeader } from '../components/ui'

function StatCard({ icon: Icon, label, value, color, accent }) {
  return (
    <div className="relative bg-gray-900 border border-gray-800 rounded-2xl p-5 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: color }} />
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
          <Icon size={18} style={{ color }} />
        </div>
        {accent && (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-green-400">
            <TrendingUp size={11} /> {accent}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-white mt-4 tracking-tight">{value ?? '—'}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
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
      <PageHeader title="Overview" subtitle="Snapshot across every tenant on BizIQ." />

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
