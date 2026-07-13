import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Users, ShoppingBag, Building2, ChevronRight } from 'lucide-react'
import { apiFetch } from '../lib/apiFetch'
import { Card, PageHeader, LoadingBlock, EmptyBlock, Avatar, Badge, btnDanger, btnSuccess } from '../components/ui'

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
      <PageHeader title="Tenants" subtitle="Every business registered on BizIQ." />

      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); load(e.target.value) }}
          placeholder="Search by name, slug, or domain…"
          className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <Card className="overflow-hidden">
        {loading ? (
          <LoadingBlock label="Loading tenants…" />
        ) : tenants.length === 0 ? (
          <EmptyBlock icon={Building2} label="No tenants found." />
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
                  className="hover:bg-gray-850/60 cursor-pointer transition group"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={t.name} email={t.slug} size={32} />
                      <div>
                        <div className="font-medium text-gray-200">{t.name}</div>
                        <div className="text-xs text-gray-500">{t.domain || `${t.slug}.biziq.online`}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-400">
                    {t.subscription?.plan?.name || t.subscription?.status || '—'}
                  </td>
                  <td className="px-5 py-3"><Badge tone={t.status === 'ACTIVE' ? 'green' : 'red'}>{t.status}</Badge></td>
                  <td className="px-5 py-3 text-gray-400">
                    <span className="inline-flex items-center gap-1"><Users size={12} /> {t._count?.users ?? 0}</span>
                  </td>
                  <td className="px-5 py-3 text-gray-400">
                    <span className="inline-flex items-center gap-1"><ShoppingBag size={12} /> {t._count?.orders ?? 0}</span>
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-xs">{new Date(t.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3 text-right" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => toggleStatus(t)}
                        disabled={busyId === t.id}
                        className={t.status === 'ACTIVE' ? btnDanger : btnSuccess}
                      >
                        {busyId === t.id ? '…' : t.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                      </button>
                      <ChevronRight size={14} className="text-gray-700 group-hover:text-gray-500 transition" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  )
}
