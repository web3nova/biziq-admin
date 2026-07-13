import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import AuthShell from '../components/AuthShell'

const RESEND_COOLDOWN_S = 30

const inputClass =
  'w-full px-3 py-2.5 text-sm bg-gray-800/80 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600 transition'
const primaryBtnClass =
  'w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-500 transition disabled:opacity-50 shadow-lg shadow-blue-600/20'

export default function Login() {
  const { requestOtp, verifyOtp, resendOtp, forgotPassword } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState('credentials') // 'credentials' | 'otp' | 'forgot' | 'forgot-sent'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [userId, setUserId] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [resendMessage, setResendMessage] = useState('')

  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCooldown])

  const handleCredentials = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { userId } = await requestOtp(email, password)
      setUserId(userId)
      setStep('otp')
      setResendCooldown(RESEND_COOLDOWN_S)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (resending || resendCooldown > 0) return
    setError('')
    setResendMessage('')
    setResending(true)
    try {
      await resendOtp(userId)
      setResendMessage('New code sent.')
      setResendCooldown(RESEND_COOLDOWN_S)
    } catch (err) {
      setError(err.message)
    } finally {
      setResending(false)
    }
  }

  const handleOtp = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await verifyOtp(userId, code)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleForgot = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await forgotPassword(email)
      setStep('forgot-sent')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (step === 'forgot-sent') {
    return (
      <AuthShell title="Check your email">
        <div className="flex flex-col items-center text-center gap-3 py-2">
          <div className="w-12 h-12 rounded-full bg-blue-500/15 flex items-center justify-center">
            <CheckCircle2 size={22} className="text-blue-400" />
          </div>
          <p className="text-sm text-gray-400">
            If an account exists for <span className="text-gray-200">{email}</span>, a reset link is on its way.
          </p>
          <button
            onClick={() => { setStep('credentials'); setError('') }}
            className="text-xs text-blue-400 hover:text-blue-300 mt-2"
          >
            Back to sign in
          </button>
        </div>
      </AuthShell>
    )
  }

  if (step === 'forgot') {
    return (
      <AuthShell title="Reset your password">
        <form onSubmit={handleForgot} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={inputClass}
              autoFocus
            />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button type="submit" disabled={loading} className={primaryBtnClass}>
            {loading ? <Loader2 size={15} className="animate-spin" /> : 'Send Reset Link'}
          </button>
          <button
            type="button"
            onClick={() => { setStep('credentials'); setError('') }}
            className="w-full flex items-center justify-center gap-1.5 text-xs text-gray-500 hover:text-gray-300"
          >
            <ArrowLeft size={12} /> Back to sign in
          </button>
        </form>
      </AuthShell>
    )
  }

  return (
    <AuthShell title={step === 'credentials' ? 'Sign in' : undefined}>
      {step === 'credentials' ? (
        <form onSubmit={handleCredentials} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-gray-400">Password</label>
              <button
                type="button"
                onClick={() => { setStep('forgot'); setError('') }}
                className="text-[11px] text-blue-400 hover:text-blue-300"
              >
                Forgot password?
              </button>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={inputClass}
            />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button type="submit" disabled={loading} className={primaryBtnClass}>
            {loading ? <Loader2 size={15} className="animate-spin" /> : 'Continue'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleOtp} className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-white mb-1">Enter your code</h2>
            <p className="text-xs text-gray-400">We sent a 6-digit code to <span className="text-gray-300">{email}</span>.</p>
          </div>
          <input
            type="text"
            required
            maxLength={6}
            inputMode="numeric"
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
            placeholder="000000"
            autoFocus
            className="w-full px-3 py-3.5 text-center text-2xl font-semibold tracking-[0.4em] bg-gray-800/80 border border-gray-700 rounded-xl text-white placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
          {resendMessage && !error && <p className="text-xs text-green-400">{resendMessage}</p>}
          <button type="submit" disabled={loading || code.length !== 6} className={primaryBtnClass}>
            {loading ? <Loader2 size={15} className="animate-spin" /> : 'Verify & Sign In'}
          </button>
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => { setStep('credentials'); setCode(''); setError(''); setResendMessage('') }}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300"
            >
              <ArrowLeft size={12} /> Back
            </button>
            <button
              type="button"
              onClick={handleResend}
              disabled={resending || resendCooldown > 0}
              className="text-xs text-blue-400 hover:text-blue-300 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {resending ? 'Sending…' : resendCooldown > 0 ? `Resend code (${resendCooldown}s)` : 'Resend code'}
            </button>
          </div>
        </form>
      )}
    </AuthShell>
  )
}
