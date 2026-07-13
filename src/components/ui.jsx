import { Loader2 } from 'lucide-react'

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

export function Avatar({ name, email, size = 36 }) {
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
    <div className={`bg-gray-900 border border-gray-800 rounded-2xl ${className}`}>
      {children}
    </div>
  )
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h1 className="text-xl font-semibold text-white tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function LoadingBlock({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center py-16 text-gray-500 text-sm gap-2">
      <Loader2 size={16} className="animate-spin" /> {label}
    </div>
  )
}

export function EmptyBlock({ icon: Icon, label }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-500 gap-2">
      {Icon && <Icon size={22} className="text-gray-700" />}
      <span className="text-sm">{label}</span>
    </div>
  )
}

export function Badge({ tone = 'gray', children }) {
  const tones = {
    green: 'bg-green-500/15 text-green-400',
    red: 'bg-red-500/15 text-red-400',
    amber: 'bg-amber-500/15 text-amber-400',
    blue: 'bg-blue-500/15 text-blue-400',
    gray: 'bg-gray-500/15 text-gray-400',
  }
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${tones[tone] || tones.gray}`}>
      {children}
    </span>
  )
}

export const btnPrimary =
  'flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-500 transition disabled:opacity-50 shadow-lg shadow-blue-600/10'
export const btnGhost =
  'flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-gray-800 bg-gray-900 text-gray-400 hover:bg-gray-850 hover:text-gray-200 transition disabled:opacity-50'
export const btnDanger =
  'text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-900/60 text-red-400 hover:bg-red-500/10 transition disabled:opacity-50'
export const btnSuccess =
  'text-xs font-semibold px-3 py-1.5 rounded-lg border border-green-900/60 text-green-400 hover:bg-green-500/10 transition disabled:opacity-50'
export const inputClass =
  'w-full px-3 py-2.5 text-sm bg-gray-800/80 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600 transition'
