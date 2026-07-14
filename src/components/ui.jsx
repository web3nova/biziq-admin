import { Loader2 } from 'lucide-react'

export const PRIMARY = '#4166F5'
export const CREAM = '#F8F4E8'

export function initials(name, email) {
  const src = (name || email || '?').trim()
  if (!src) return '?'
  const parts = src.split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return src.slice(0, 2).toUpperCase()
}

const AVATAR_COLORS = ['#4166F5', '#9333ea', '#059669', '#d97706', '#dc2626', '#0891b2']
export function avatarColor(seed) {
  let hash = 0
  for (let i = 0; i < (seed || '').length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

// Shows a real photo (business logo / user avatar) when one is available,
// falling back to initials-on-color only when there's no image to show.
export function Avatar({ name, email, src, size = 36 }) {
  if (src) {
    return (
      <img
        src={src}
        alt=""
        className="rounded-full object-cover flex-shrink-0 border border-gray-100"
        style={{ width: size, height: size }}
        onError={(e) => { e.currentTarget.style.display = 'none' }}
      />
    )
  }
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.38, background: avatarColor(email || name || '?') }}
    >
      {initials(name, email)}
    </div>
  )
}

export function Card({ children, className = '' }) {
  return (
    <div className={`bg-white border border-gray-100 rounded-2xl shadow-sm ${className}`}>
      {children}
    </div>
  )
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function LoadingBlock({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center py-16 text-gray-400 text-sm gap-2">
      <Loader2 size={16} className="animate-spin" /> {label}
    </div>
  )
}

export function EmptyBlock({ icon: Icon, label }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
      {Icon && <Icon size={22} className="text-gray-300" />}
      <span className="text-sm">{label}</span>
    </div>
  )
}

export function Badge({ tone = 'gray', children }) {
  const tones = {
    green: 'bg-green-50 text-green-700',
    red: 'bg-red-50 text-red-600',
    amber: 'bg-amber-50 text-amber-700',
    blue: 'bg-blue-50 text-blue-600',
    gray: 'bg-gray-100 text-gray-500',
  }
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${tones[tone] || tones.gray}`}>
      {children}
    </span>
  )
}

export const btnPrimary =
  'flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold text-white rounded-xl transition disabled:opacity-50 shadow-sm hover:opacity-90'
export const btnPrimaryStyle = { background: PRIMARY }
export const btnGhost =
  'flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition disabled:opacity-50'
export const btnDanger =
  'text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-100 text-red-600 hover:bg-red-50 transition disabled:opacity-50'
export const btnSuccess =
  'text-xs font-semibold px-3 py-1.5 rounded-lg border border-green-100 text-green-700 hover:bg-green-50 transition disabled:opacity-50'
export const inputClass =
  'w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition'
