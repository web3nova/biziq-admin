import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { CheckCircle2, AlertCircle, X, AlertTriangle } from 'lucide-react'

const NotificationContext = createContext(null)
let idCounter = 0

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const [confirmState, setConfirmState] = useState(null)
  const resolveRef = useRef(null)

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = useCallback((message, type = 'success', duration = 4000) => {
    const id = ++idCounter
    setToasts(prev => [...prev, { id, message, type }])
    if (duration) setTimeout(() => dismissToast(id), duration)
    return id
  }, [dismissToast])

  toast.success = (msg, duration) => toast(msg, 'success', duration)
  toast.error = (msg, duration) => toast(msg, 'error', duration)
  toast.info = (msg, duration) => toast(msg, 'info', duration)

  const confirmAction = useCallback(({ title = 'Are you sure?', message = '', confirmLabel = 'Confirm', cancelLabel = 'Cancel', danger = false } = {}) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve
      setConfirmState({ title, message, confirmLabel, cancelLabel, danger })
    })
  }, [])

  const closeConfirm = (result) => {
    resolveRef.current?.(result)
    resolveRef.current = null
    setConfirmState(null)
  }

  return (
    <NotificationContext.Provider value={{ toast, confirmAction }}>
      {children}

      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 items-end pointer-events-none">
        {toasts.map(t => {
          const Icon = t.type === 'error' ? AlertCircle : t.type === 'info' ? AlertTriangle : CheckCircle2
          const styles = t.type === 'error'
            ? 'bg-red-500/10 border-red-900/60 text-red-400'
            : t.type === 'info'
              ? 'bg-amber-500/10 border-amber-900/60 text-amber-400'
              : 'bg-green-500/10 border-green-900/60 text-green-400'
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-center gap-2 px-4 py-3 rounded-xl border text-sm shadow-lg max-w-sm backdrop-blur transition-all duration-150 ${styles}`}
            >
              <Icon size={16} className="flex-shrink-0" />
              <span className="flex-1">{t.message}</span>
              <button onClick={() => dismissToast(t.id)} className="opacity-60 hover:opacity-100 flex-shrink-0">
                <X size={14} />
              </button>
            </div>
          )
        })}
      </div>

      {confirmState && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60" onClick={() => closeConfirm(false)}>
          <div
            className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl max-w-sm w-full p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${confirmState.danger ? 'bg-red-500/15' : 'bg-blue-500/15'}`}>
                <AlertTriangle size={18} className={confirmState.danger ? 'text-red-400' : 'text-blue-400'} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">{confirmState.title}</h3>
                {confirmState.message && <p className="text-sm text-gray-400 mt-1">{confirmState.message}</p>}
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => closeConfirm(false)}
                className="px-4 py-2 text-sm font-semibold text-gray-400 border border-gray-800 rounded-xl hover:bg-gray-850 transition"
              >
                {confirmState.cancelLabel}
              </button>
              <button
                onClick={() => closeConfirm(true)}
                className="px-4 py-2 text-sm font-semibold text-white rounded-xl transition"
                style={{ background: confirmState.danger ? '#dc2626' : '#4166F5' }}
              >
                {confirmState.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  )
}

export function useNotify() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotify must be used within NotificationProvider')
  return ctx
}
