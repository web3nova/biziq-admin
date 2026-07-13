import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Loader2, Users, ShoppingBag } from 'lucide-react'
import { apiFetch } from '../lib/apiFetch'

function StatusBadge({ status }) {
  const styles = {
    ACTIVE: 'bg-green-500/15 text-green-400',
    SUSPENDED: 'bg-red-500/15 text-red-400',
  }
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${styles[status] || 'bg-gray-500/15 text-gray-400'}`}>
      {status}
    </span>
  )
}

export default function Tenants() {
  const navigate = useNavigate()
  const [tenants, setTenants] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState('')

  const load = useCallback(async (q = '') => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ page: 1, limit: 50, ...(q ? { search: q } : {}) })
      const res = await apiFetch(`/admin/tenants?${params}`)
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body?.message || 'Failed to load tenants')
      setTenants(body?.data ?? [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const toggleStatus = async (tenant) => {
    setBusyId(tenant.id)
    try {
      const action = tenant.status === 'ACTIVE' ? 'suspend' : 'activate'
      const res = await apiFetch(`/admin/tenants/${tenant.id}/${action}`, { method: 'PATCH' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.message || `Failed to ${action} tenant`)
      }
      setTenants(prev => prev.map(t => t.id === tenant.id ? { ...t, status: action === 'suspend' ? 'SUSPENDED' : 'ACTIVE' } : t))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Tenants</h1>
          <p className="text-sm text-gray-500 mt-1">Every business registered on BizIQ.</p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); load(e.target.value) }}
          placeholder="Search by name, slug, or domain…"
          className="w-full pl-9 pr-3 py-2 text-sm bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-500 text-sm gap-2">
            <Loader2 size={16} className="animate-spin" /> Loading tenants…
          </div>
        ) : tenants.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-500">No tenants found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-left text-xs text-gray-500">
                <th className="px-5 py-3 font-medium">Business</th>
                <th className="px-5 py-3 font-medium">Plan</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Users</th>
                <th className="px-5 py-3 font-medium">Orders</th>
                <th className="px-5 py-3 font-medium">Joined</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {tenants.map(t => (
                <tr
                  key={t.id}
                  onClick={() => navigate(`/tenants/${t.id}`)}
                  className="hover:bg-gray-850 cursor-pointer"
                >
                  <td className="px-5 py-3">
                    <div className="font-medium text-gray-200">{t.name}</div>
                    <div className="text-xs text-gray-500">{t.domain || `${t.slug}.biziq.online`}</div>
                  </td>
                  <td className="px-5 py-3 text-gray-400">
                    {t.subscription?.plan?.name || t.subscription?.status || '—'}
                  </td>
                  <td className="px-5 py-3"><StatusBadge status={t.status} /></td>
                  <td className="px-5 py-3 text-gray-400">
                    <span className="inline-flex items-center gap-1"><Users size={12} /> {t._count?.users ?? 0}</span>
                  </td>
                  <td className="px-5 py-3 text-gray-400">
                    <span className="inline-flex items-center gap-1"><ShoppingBag size={12} /> {t._count?.orders ?? 0}</span>
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-xs">{new Date(t.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3 text-right" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => toggleStatus(t)}
                      disabled={busyId === t.id}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition disabled:opacity-50 ${
                        t.status === 'ACTIVE'
                          ? 'border-red-900 text-red-400 hover:bg-red-500/10'
                          : 'border-green-900 text-green-400 hover:bg-green-500/10'
                      }`}
                    >
                      {busyId === t.id ? '…' : t.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
