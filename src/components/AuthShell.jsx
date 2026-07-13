import { ShieldCheck } from 'lucide-react'

export default function AuthShell({ children, icon: Icon = ShieldCheck, title }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-gray-950">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[400px] h-[400px] rounded-full bg-indigo-600/10 blur-3xl" />
      </div>
      <div className="w-full max-w-sm relative">
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
            <Icon size={16} className="text-white" />
          </div>
          <span className="text-lg font-semibold text-white tracking-tight">BizIQ Admin</span>
        </div>
        <div className="bg-gray-900/90 backdrop-blur border border-gray-800 rounded-2xl p-6 shadow-2xl">
          {title && <h1 className="text-base font-semibold text-white mb-5">{title}</h1>}
          {children}
        </div>
      </div>
    </div>
  )
}
