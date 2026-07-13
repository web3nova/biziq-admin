import { useEffect, useState, useCallback } from 'react'
import { Plus, Trash2, Loader2, X, ShieldCheck, Mail } from 'lucide-react'
import { apiFetch } from '../lib/apiFetch'
import { useAuth } from '../context/AuthContext'
import { Card, PageHeader, LoadingBlock, EmptyBlock, Avatar, btnPrimary, inputClass } from '../components/ui'
import { useNotify } from '../context/NotificationContext'

export default function Admins() {
  const { user: me } = useAuth()
  const { confirmAction } = useNotify()
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ email: '', name: '' })
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [invited, setInvited] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiFetch('/admin/admins')
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body?.message || 'Failed to load admins')
      setAdmins(body?.data ?? [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleCreate = async (e) => {
    e.preventDefault()
    setFormError('')
    setSaving(true)
    try {
      const res = await apiFetch('/admin/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body?.message || 'Failed to invite admin')
      setInvited(form.email)
      setForm({ email: '', name: '' })
      load()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const closeForm = () => {
    setShowForm(false)
    setInvited(null)
    setFormError('')
  }

  const handleDelete = async (id) => {
    const confirmed = await confirmAction({ title: 'Remove this super admin?', message: 'This cannot be undone.', confirmLabel: 'Remove', danger: true })
    if (!confirmed) return
    setBusyId(id)
    try {
      const res = await apiFetch(`/admin/admins/${id}`, { method: 'DELETE' })
      if (!res.ok && res.status !== 204) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.message || 'Failed to delete admin')
      }
      setAdmins(prev => prev.filter(a => a.id !== id))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Super Admins"
        subtitle="People with full platform access."
        action={
          <button onClick={() => setShowForm(v => !v)} className={btnPrimary}>
            <Plus size={14} /> Invite Admin
          </button>
        }
      />

      {showForm && (
        <Card className="p-5 max-w-md">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-white">Invite Super Admin</span>
            <button type="button" onClick={closeForm} className="text-gray-500 hover:text-gray-300"><X size={16} /></button>
          </div>

          {invited ? (
            <div className="flex flex-col items-center text-center gap-3 py-4">
              <div className="w-11 h-11 rounded-full bg-blue-500/15 flex items-center justify-center">
                <Mail size={20} className="text-blue-400" />
              </div>
              <p className="text-sm text-gray-300">
                Invite sent to <span className="font-semibold text-white">{invited}</span>.
              </p>
              <p className="text-xs text-gray-500">They'll set their own password via the link in the email.</p>
              <button onClick={closeForm} className="text-xs text-blue-400 hover:text-blue-300 mt-1">Done</button>
            </div>
          ) : (
            <form onSubmit={handleCreate} className="space-y-3">
              <p className="text-xs text-gray-500 -mt-2 mb-1">
                They'll receive an email with a link to set their own password — you won't need to share credentials.
              </p>
              <input
                type="text" placeholder="Name (optional)" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className={inputClass}
              />
              <input
                type="email" required placeholder="Email" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className={inputClass}
              />
              {formError && <p className="text-xs text-red-400">{formError}</p>}
              <button type="submit" disabled={saving} className={`${btnPrimary} w-full`}>
                {saving ? <Loader2 size={14} className="animate-spin" /> : 'Send Invite'}
              </button>
            </form>
          )}
        </Card>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}

      <Card className="overflow-hidden">
        {loading ? (
          <LoadingBlock label="Loading admins…" />
        ) : admins.length === 0 ? (
          <EmptyBlock icon={ShieldCheck} label="No super admins yet." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-left text-xs text-gray-500">
                <th className="px-5 py-3 font-medium">Admin</th>
                <th className="px-5 py-3 font-medium">Added</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {admins.map(a => (
                <tr key={a.id} className="hover:bg-gray-850/60 transition">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={a.name} email={a.email} size={32} />
                      <div>
                        <div className="text-gray-200 font-medium">{a.name || '—'}</div>
                        <div className="text-xs text-gray-500">{a.email}</div>
                      </div>
                      {a.id === me?.id && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400">You</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-xs">{new Date(a.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3 text-right">
                    {a.id !== me?.id && (
                      <button
                        onClick={() => handleDelete(a.id)}
                        disabled={busyId === a.id}
                        className="text-red-400 hover:text-red-300 disabled:opacity-50"
                        title="Remove admin"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
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
