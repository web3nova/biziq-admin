import { useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import AuthShell from '../components/AuthShell'
import { PRIMARY } from '../components/ui'

const inputClass =
  'w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition'

export default function ResetPassword() {
  const { resetPassword } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 8) return setError('Password must be at least 8 characters.')
    if (password !== confirm) return setError('Passwords do not match.')
    setLoading(true)
    try {
      await resetPassword(token, password)
      setDone(true)
      setTimeout(() => navigate('/login'), 2500)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <AuthShell>
        <p className="text-sm text-red-600 text-center">This link is missing a token. Please use the link from your email.</p>
        <Link to="/login" className="block text-center text-xs mt-4 hover:opacity-70" style={{ color: PRIMARY }}>Back to sign in</Link>
      </AuthShell>
    )
  }

  if (done) {
    return (
      <AuthShell>
        <div className="flex flex-col items-center text-center gap-3 py-4">
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
            <CheckCircle2 size={24} className="text-green-600" />
          </div>
          <h2 className="text-base font-semibold text-gray-900">Password set</h2>
          <p className="text-sm text-gray-500">Redirecting you to sign in…</p>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Set your password">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">New password</label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={e => setPassword(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Confirm password</label>
          <input
            type="password"
            required
            minLength={8}
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            className={inputClass}
          />
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white rounded-xl hover:opacity-90 transition disabled:opacity-50 shadow-sm"
          style={{ background: PRIMARY }}
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : 'Set Password & Continue'}
        </button>
      </form>
    </AuthShell>
  )
}
