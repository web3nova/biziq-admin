import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Users, ShoppingBag, Building2, ChevronRight, ChevronLeft } from 'lucide-react'
import { apiFetch } from '../lib/apiFetch'
import { Card, PageHeader, LoadingBlock, EmptyBlock, Avatar, Badge, btnDanger, btnSuccess } from '../components/ui'

const PAGE_SIZE = 50

export default function Tenants() {
  const navigate = useNavigate()
  const [tenants, setTenants] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const load = useCallback(async (q = '', p = 1) => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ page: p, limit: PAGE_SIZE, ...(q ? { search: q } : {}) })
      const res = await apiFetch(`/admin/tenants?${params}`)
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body?.message || 'Failed to load tenants')
      setTenants(body?.data ?? [])
      setTotal(body?.meta?.total ?? 0)
      setPage(p)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

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
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); load(e.target.value, 1) }}
          placeholder="Search by name, slug, or domain…"
          className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Card className="overflow-hidden">
        {loading ? (
          <LoadingBlock label="Loading tenants…" />
        ) : tenants.length === 0 ? (
          <EmptyBlock icon={Building2} label="No tenants found." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-5 py-3 font-semibold text-xs text-gray-400 uppercase tracking-wider">Business</th>
                <th className="px-5 py-3 font-semibold text-xs text-gray-400 uppercase tracking-wider">Plan</th>
                <th className="px-5 py-3 font-semibold text-xs text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 font-semibold text-xs text-gray-400 uppercase tracking-wider">Users</th>
                <th className="px-5 py-3 font-semibold text-xs text-gray-400 uppercase tracking-wider">Orders</th>
                <th className="px-5 py-3 font-semibold text-xs text-gray-400 uppercase tracking-wider">Joined</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tenants.map(t => (
                <tr
                  key={t.id}
                  onClick={() => navigate(`/tenants/${t.id}`)}
                  className="hover:bg-gray-50 cursor-pointer transition group"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar name={t.name} email={t.slug} src={t.logoUrl} size={32} />
                      <div>
                        <div className="font-medium text-gray-900">{t.name}</div>
                        <a
                          href={`https://${t.domain || `biziq.online/b/${t.slug}`}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="text-xs text-gray-400 hover:underline"
                        >
                          {t.domain || `biziq.online/b/${t.slug}`}
                        </a>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500">
                    {t.subscription?.plan?.name || t.subscription?.status || '—'}
                  </td>
                  <td className="px-5 py-3.5"><Badge tone={t.status === 'ACTIVE' ? 'green' : 'red'}>{t.status}</Badge></td>
                  <td className="px-5 py-3.5 text-gray-500">
                    <span className="inline-flex items-center gap-1"><Users size={12} /> {t._count?.users ?? 0}</span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500">
                    <span className="inline-flex items-center gap-1"><ShoppingBag size={12} /> {t._count?.orders ?? 0}</span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-400 text-xs">{new Date(t.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3.5 text-right" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => toggleStatus(t)}
                        disabled={busyId === t.id}
                        className={t.status === 'ACTIVE' ? btnDanger : btnSuccess}
                      >
                        {busyId === t.id ? '…' : t.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                      </button>
                      <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-400 transition" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {!loading && tenants.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">
            Page {page} of {totalPages} · {total} tenant{total === 1 ? '' : 's'}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => load(search, page - 1)}
              disabled={page <= 1}
              className="flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={13} /> Previous
            </button>
            <button
              onClick={() => load(search, page + 1)}
              disabled={page >= totalPages}
              className="flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
