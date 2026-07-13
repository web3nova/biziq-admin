import { createContext, useContext, useState, useCallback } from 'react'
import { API_BASE } from '../lib/apiConfig'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('adminUser') || 'null') } catch { return null }
  })

  // Step 1: email + password — triggers an OTP email, does not issue tokens
  const requestOtp = useCallback(async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(body?.message || 'Login failed')
    const data = body?.data ?? body
    if (!data.requiresOtp || !data.userId) throw new Error('Unexpected login response')
    return { userId: data.userId, email: data.email }
  }, [])

  // Step 2: OTP code — issues tokens; rejects non-superadmins client-side too
  const verifyOtp = useCallback(async (userId, code) => {
    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ userId, code }),
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(body?.message || 'Invalid or expired code')
    const data = body?.data ?? body

    if (!data.user?.isSuperAdmin) {
      throw new Error('This account does not have admin access.')
    }

    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    localStorage.setItem('adminUser', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }, [])

  const resendOtp = useCallback(async (userId) => {
    const res = await fetch(`${API_BASE}/auth/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ userId }),
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(body?.message || 'Failed to resend code')
    return true
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('adminUser')
    setUser(null)
    window.location.replace('/login')
  }, [])

  return (
    <AuthContext.Provider value={{ user, requestOtp, verifyOtp, resendOtp, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
