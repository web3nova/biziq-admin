import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, Ban, CheckCircle2, Users, ShoppingBag, CreditCard } from 'lucide-react'
import { apiFetch } from '../lib/apiFetch'
import { Card, LoadingBlock, Avatar, Badge, btnDanger, btnSuccess, btnPrimary, inputClass } from '../components/ui'

function StatChip({ icon: Icon, label, value, color }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}18` }}>
          <Icon size={16} style={{ color }} />
        </div>
        <div>
          <div className="text-lg font-bold text-white leading-none">{value}</div>
          <div className="text-[11px] text-gray-500 mt-1">{label}</div>
        </div>
      </div>
    </Card>
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
  const [busy, setBusy] = useState(null)

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

  if (loading) return <LoadingBlock label="Loading tenant…" />
  if (!tenant) return <p className="text-sm text-red-400">{error || 'Tenant not found.'}</p>

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/tenants')} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition">
        <ArrowLeft size={14} /> Back to Tenants
      </button>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Avatar name={tenant.name} email={tenant.slug} size={44} />
          <div>
            <h1 className="text-xl font-semibold text-white tracking-tight">{tenant.name}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{tenant.domain || `${tenant.slug}.biziq.online`}</p>
          </div>
        </div>
        <button
          onClick={toggleTenantStatus}
          disabled={busy === 'tenant-status'}
          className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-xl border transition disabled:opacity-50 ${
            tenant.status === 'ACTIVE'
              ? 'border-red-900/60 text-red-400 hover:bg-red-500/10'
              : 'border-green-900/60 text-green-400 hover:bg-green-500/10'
          }`}
        >
          {tenant.status === 'ACTIVE' ? <Ban size={14} /> : <CheckCircle2 size={14} />}
          {tenant.status === 'ACTIVE' ? 'Suspend Tenant' : 'Activate Tenant'}
        </button>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="grid grid-cols-3 gap-4">
        <StatChip icon={tenant.status === 'ACTIVE' ? CheckCircle2 : Ban} label="Status" value={tenant.status} color={tenant.status === 'ACTIVE' ? '#16a34a' : '#dc2626'} />
        <StatChip icon={Users} label="Users" value={tenant._count?.users ?? 0} color="#9333ea" />
        <StatChip icon={ShoppingBag} label="Orders" value={tenant._count?.orders ?? 0} color="#d97706" />
      </div>

      {/* Plan override */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <CreditCard size={15} className="text-blue-400" />
          <div>
            <h2 className="text-sm font-semibold text-white">Subscription</h2>
            <p className="text-xs text-gray-500 mt-0.5">Manually override the plan, status, or renewal date.</p>
          </div>
        </div>
        <form onSubmit={savePlan} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div>
            <label className="block text-[11px] text-gray-500 mb-1.5">Plan</label>
            <select
              value={planForm.planId}
              onChange={e => setPlanForm(f => ({ ...f, planId: e.target.value }))}
              className={inputClass}
            >
              <option value="">— unchanged —</option>
              {plans.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] text-gray-500 mb-1.5">Status</label>
            <select
              value={planForm.status}
              onChange={e => setPlanForm(f => ({ ...f, status: e.target.value }))}
              className={inputClass}
            >
              <option value="">— unchanged —</option>
              {['TRIAL', 'ACTIVE', 'EXPIRED', 'CANCELLED'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] text-gray-500 mb-1.5">Renews At</label>
            <input
              type="date"
              value={planForm.renewsAt}
              onChange={e => setPlanForm(f => ({ ...f, renewsAt: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-3 flex items-center gap-3 pt-1">
            <button type="submit" disabled={planSaving} className={btnPrimary}>
              {planSaving ? <Loader2 size={14} className="animate-spin" /> : 'Save Changes'}
            </button>
            {tenant.subscription && (
              <span className="text-xs text-gray-500">
                Current: {tenant.subscription.plan?.label || '—'} · {tenant.subscription.status}
              </span>
            )}
          </div>
          {planError && <p className="sm:col-span-3 text-xs text-red-400">{planError}</p>}
        </form>
      </Card>

      {/* Users */}
      <Card className="overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-800 flex items-center gap-2">
          <Users size={15} className="text-purple-400" />
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
                <tr key={u.id} className="hover:bg-gray-850/60 transition">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={u.name} email={u.email} size={28} />
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
                    <Badge tone={u.isBanned ? 'red' : 'green'}>{u.isBanned ? 'Banned' : 'Active'}</Badge>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => toggleBan(u)}
                      disabled={busy === u.id}
                      className={u.isBanned ? btnSuccess : btnDanger}
                    >
                      {busy === u.id ? '…' : u.isBanned ? 'Unban' : 'Ban'}
                    </button>
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
