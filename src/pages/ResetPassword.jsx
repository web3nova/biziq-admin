import { useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { Loader2, CheckCircle2, KeyRound } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import AuthShell from '../components/AuthShell'

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
        <p className="text-sm text-red-400 text-center">This link is missing a token. Please use the link from your email.</p>
        <Link to="/login" className="block text-center text-xs text-blue-400 hover:text-blue-300 mt-4">Back to sign in</Link>
      </AuthShell>
    )
  }

  if (done) {
    return (
      <AuthShell>
        <div className="flex flex-col items-center text-center gap-3 py-4">
          <div className="w-12 h-12 rounded-full bg-green-500/15 flex items-center justify-center">
            <CheckCircle2 size={24} className="text-green-400" />
          </div>
          <h2 className="text-base font-semibold text-white">Password set</h2>
          <p className="text-sm text-gray-400">Redirecting you to sign in…</p>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell icon={KeyRound} title="Set your password">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">New password</label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-3 py-2.5 text-sm bg-gray-800/80 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Confirm password</label>
          <input
            type="password"
            required
            minLength={8}
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            className="w-full px-3 py-2.5 text-sm bg-gray-800/80 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
          />
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-500 transition disabled:opacity-50 shadow-lg shadow-blue-600/20"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : 'Set Password & Continue'}
        </button>
      </form>
    </AuthShell>
  )
}
