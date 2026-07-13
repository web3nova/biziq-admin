import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, Ban, CheckCircle2, Users, ShoppingBag, UserRound } from 'lucide-react'
import { apiFetch } from '../lib/apiFetch'

function Field({ label, children }) {
  return (
    <div>
      <div className="text-[11px] text-gray-500 mb-1">{label}</div>
      <div className="text-sm text-gray-200">{children}</div>
    </div>
  )
}

export default function TenantDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [tenant, setTenant] = useState(null)
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(null) // id currently being mutated

  const [planForm, setPlanForm] = useState({ planId: '', status: '', renewsAt: '' })
  const [planSaving, setPlanSaving] = useState(false)
  const [planError, setPlanError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [tenantRes, usersRes, rolesRes, plansRes] = await Promise.all([
        apiFetch(`/admin/tenants/${id}`),
        apiFetch(`/admin/tenants/${id}/users`),
        apiFetch(`/admin/tenants/${id}/roles`),
        apiFetch('/billing/plans'),
      ])
      const [tenantBody, usersBody, rolesBody, plansBody] = await Promise.all([
        tenantRes.json(), usersRes.json(), rolesRes.json(), plansRes.json(),
      ])
      if (!tenantRes.ok) throw new Error(tenantBody?.message || 'Failed to load tenant')

      const t = tenantBody?.data ?? tenantBody
      setTenant(t)
      setUsers(usersBody?.data ?? [])
      setRoles(rolesBody?.data ?? [])
      setPlans(plansBody?.data ?? [])
      setPlanForm({
        planId: t.subscription?.planId || '',
        status: t.subscription?.status || '',
        renewsAt: t.subscription?.renewsAt ? t.subscription.renewsAt.slice(0, 10) : '',
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { load() }, [load])

  const toggleTenantStatus = async () => {
    if (!tenant) return
    setBusy('tenant-status')
    try {
      const action = tenant.status === 'ACTIVE' ? 'suspend' : 'activate'
      const res = await apiFetch(`/admin/tenants/${id}/${action}`, { method: 'PATCH' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.message || `Failed to ${action} tenant`)
      }
      setTenant(t => ({ ...t, status: action === 'suspend' ? 'SUSPENDED' : 'ACTIVE' }))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(null)
    }
  }

  const savePlan = async (e) => {
    e.preventDefault()
    setPlanError('')
    setPlanSaving(true)
    try {
      const payload = {}
      if (planForm.planId) payload.planId = planForm.planId
      if (planForm.status) payload.status = planForm.status
      if (planForm.renewsAt) payload.renewsAt = new Date(planForm.renewsAt).toISOString()

      const res = await apiFetch(`/admin/tenants/${id}/plan`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body?.message || 'Failed to update plan')
      await load()
    } catch (err) {
      setPlanError(err.message)
    } finally {
      setPlanSaving(false)
    }
  }

  const toggleBan = async (user) => {
    setBusy(user.id)
    try {
      const action = user.isBanned ? 'unban' : 'ban'
      const res = await apiFetch(`/admin/users/${user.id}/${action}`, { method: 'PATCH' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.message || `Failed to ${action} user`)
      }
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isBanned: !u.isBanned } : u))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(null)
    }
  }

  const changeRole = async (user, roleId) => {
    setBusy(user.id)
    try {
      const res = await apiFetch(`/admin/users/${user.id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleId }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body?.message || 'Failed to assign role')
      const updated = body?.data ?? body
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, roleId: updated.roleId, role: updated.role } : u))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500 text-sm gap-2">
        <Loader2 size={16} className="animate-spin" /> Loading tenant…
      </div>
    )
  }

  if (!tenant) {
    return <p className="text-sm text-red-400">{error || 'Tenant not found.'}</p>
  }

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/tenants')} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300">
        <ArrowLeft size={14} /> Back to Tenants
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">{tenant.name}</h1>
          <p className="text-sm text-gray-500 mt-1">{tenant.domain || `${tenant.slug}.biziq.online`}</p>
        </div>
        <button
          onClick={toggleTenantStatus}
          disabled={busy === 'tenant-status'}
          className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl border transition disabled:opacity-50 ${
            tenant.status === 'ACTIVE'
              ? 'border-red-900 text-red-400 hover:bg-red-500/10'
              : 'border-green-900 text-green-400 hover:bg-green-500/10'
          }`}
        >
          {tenant.status === 'ACTIVE' ? <Ban size={14} /> : <CheckCircle2 size={14} />}
          {tenant.status === 'ACTIVE' ? 'Suspend Tenant' : 'Activate Tenant'}
        </button>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <Field label="Status">
            <span className={tenant.status === 'ACTIVE' ? 'text-green-400' : 'text-red-400'}>{tenant.status}</span>
          </Field>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <Field label="Users">
            <span className="inline-flex items-center gap-1.5"><Users size={13} /> {tenant._count?.users ?? 0}</span>
          </Field>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <Field label="Orders">
            <span className="inline-flex items-center gap-1.5"><ShoppingBag size={13} /> {tenant._count?.orders ?? 0}</span>
          </Field>
        </div>
      </div>

      {/* Plan override */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-white">Subscription</h2>
          <p className="text-xs text-gray-500 mt-0.5">Manually override the plan, status, or renewal date.</p>
        </div>
        <form onSubmit={savePlan} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div>
            <label className="block text-[11px] text-gray-500 mb-1">Plan</label>
            <select
              value={planForm.planId}
              onChange={e => setPlanForm(f => ({ ...f, planId: e.target.value }))}
              className="w-full px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">— unchanged —</option>
              {plans.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] text-gray-500 mb-1">Status</label>
            <select
              value={planForm.status}
              onChange={e => setPlanForm(f => ({ ...f, status: e.target.value }))}
              className="w-full px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">— unchanged —</option>
              {['TRIAL', 'ACTIVE', 'EXPIRED', 'CANCELLED'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] text-gray-500 mb-1">Renews At</label>
            <input
              type="date"
              value={planForm.renewsAt}
              onChange={e => setPlanForm(f => ({ ...f, renewsAt: e.target.value }))}
              className="w-full px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <div className="sm:col-span-3 flex items-center gap-3">
            <button
              type="submit"
              disabled={planSaving}
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-500 transition disabled:opacity-50"
            >
              {planSaving ? 'Saving…' : 'Save Changes'}
            </button>
            {tenant.subscription && (
              <span className="text-xs text-gray-500">
                Current: {tenant.subscription.plan?.label || '—'} · {tenant.subscription.status}
              </span>
            )}
          </div>
          {planError && <p className="sm:col-span-3 text-xs text-red-400">{planError}</p>}
        </form>
      </div>

      {/* Users */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-800">
          <h2 className="text-sm font-semibold text-white">Team Members</h2>
        </div>
        {users.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-500">No users in this tenant.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-left text-xs text-gray-500">
                <th className="px-5 py-3 font-medium">User</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {users.map(u => (
                <tr key={u.id}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <UserRound size={14} className="text-gray-500" />
                      <div>
                        <div className="text-gray-200">{u.name || '—'}</div>
                        <div className="text-xs text-gray-500">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <select
                      value={u.roleId || ''}
                      onChange={e => changeRole(u, e.target.value)}
                      disabled={busy === u.id}
                      className="px-2 py-1.5 text-xs bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
                    >
                      <option value="">No role</option>
                      {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${u.isBanned ? 'bg-red-500/15 text-red-400' : 'bg-green-500/15 text-green-400'}`}>
                      {u.isBanned ? 'Banned' : 'Active'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => toggleBan(u)}
                      disabled={busy === u.id}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition disabled:opacity-50 ${
                        u.isBanned
                          ? 'border-green-900 text-green-400 hover:bg-green-500/10'
                          : 'border-red-900 text-red-400 hover:bg-red-500/10'
                      }`}
                    >
                      {busy === u.id ? '…' : u.isBanned ? 'Unban' : 'Ban'}
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
