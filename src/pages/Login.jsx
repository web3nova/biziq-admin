import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import AuthShell from '../components/AuthShell'
import { PRIMARY } from '../components/ui'

const RESEND_COOLDOWN_S = 30

const inputClass =
  'w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition'
const primaryBtnClass =
  'w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white rounded-xl hover:opacity-90 transition disabled:opacity-50 shadow-sm'

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
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
            <CheckCircle2 size={22} style={{ color: PRIMARY }} />
          </div>
          <p className="text-sm text-gray-500">
            If an account exists for <span className="text-gray-900">{email}</span>, a reset link is on its way.
          </p>
          <button
            onClick={() => { setStep('credentials'); setError('') }}
            className="text-xs hover:opacity-70 mt-2"
            style={{ color: PRIMARY }}
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
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={inputClass}
              autoFocus
            />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className={primaryBtnClass} style={{ background: PRIMARY }}>
            {loading ? <Loader2 size={15} className="animate-spin" /> : 'Send Reset Link'}
          </button>
          <button
            type="button"
            onClick={() => { setStep('credentials'); setError('') }}
            className="w-full flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-gray-600"
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
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Email</label>
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
              <label className="block text-xs font-medium text-gray-500">Password</label>
              <button
                type="button"
                onClick={() => { setStep('forgot'); setError('') }}
                className="text-[11px] hover:opacity-70"
                style={{ color: PRIMARY }}
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
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className={primaryBtnClass} style={{ background: PRIMARY }}>
            {loading ? <Loader2 size={15} className="animate-spin" /> : 'Continue'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleOtp} className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-1">Enter your code</h2>
            <p className="text-xs text-gray-500">We sent a 6-digit code to <span className="text-gray-700">{email}</span>.</p>
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
            className="w-full px-3 py-3.5 text-center text-2xl font-semibold tracking-[0.4em] bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition"
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          {resendMessage && !error && <p className="text-xs text-green-600">{resendMessage}</p>}
          <button type="submit" disabled={loading || code.length !== 6} className={primaryBtnClass} style={{ background: PRIMARY }}>
            {loading ? <Loader2 size={15} className="animate-spin" /> : 'Verify & Sign In'}
          </button>
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => { setStep('credentials'); setCode(''); setError(''); setResendMessage('') }}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600"
            >
              <ArrowLeft size={12} /> Back
            </button>
            <button
              type="button"
              onClick={handleResend}
              disabled={resending || resendCooldown > 0}
              className="text-xs hover:opacity-70 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ color: PRIMARY }}
            >
              {resending ? 'Sending…' : resendCooldown > 0 ? `Resend code (${resendCooldown}s)` : 'Resend code'}
            </button>
          </div>
        </form>
      )}
    </AuthShell>
  )
}
