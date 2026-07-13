import { useEffect, useState, useCallback } from 'react'
import { Plus, Trash2, Loader2, X } from 'lucide-react'
import { apiFetch } from '../lib/apiFetch'
import { useAuth } from '../context/AuthContext'

export default function Admins() {
  const { user: me } = useAuth()
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', name: '' })
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

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
      if (!res.ok) throw new Error(body?.message || 'Failed to create admin')
      setForm({ email: '', password: '', name: '' })
      setShowForm(false)
      load()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Remove this super admin? This cannot be undone.')) return
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Super Admins</h1>
          <p className="text-sm text-gray-500 mt-1">People with full platform access.</p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-500 transition"
        >
          <Plus size={14} /> Add Admin
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3 max-w-md">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-white">New Super Admin</span>
            <button type="button" onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-300"><X size={16} /></button>
          </div>
          <input
            type="text" placeholder="Name (optional)" value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <input
            type="email" required placeholder="Email" value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            className="w-full px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <input
            type="password" required minLength={8} placeholder="Password (min 8 chars)" value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            className="w-full px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          {formError && <p className="text-xs text-red-400">{formError}</p>}
          <button
            type="submit" disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-500 transition disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : 'Create Admin'}
          </button>
        </form>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-500 text-sm gap-2">
            <Loader2 size={16} className="animate-spin" /> Loading admins…
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-left text-xs text-gray-500">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Added</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {admins.map(a => (
                <tr key={a.id}>
                  <td className="px-5 py-3 text-gray-200">{a.name || '—'}</td>
                  <td className="px-5 py-3 text-gray-400">{a.email}</td>
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
      </div>
    </div>
  )
}
