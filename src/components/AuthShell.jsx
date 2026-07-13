import logoIcon from '../assets/logo-icon.png'

export default function AuthShell({ children, title }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-gray-950">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[400px] h-[400px] rounded-full bg-indigo-600/10 blur-3xl" />
      </div>
      <div className="w-full max-w-sm relative">
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <img src={logoIcon} alt="" className="w-9 h-9 drop-shadow-[0_0_12px_rgba(65,102,245,0.35)]" />
          <span className="text-lg font-semibold text-white tracking-tight">BizIQ <span className="text-gray-500 font-medium">Admin</span></span>
        </div>
        <div className="bg-gray-900/90 backdrop-blur border border-gray-800 rounded-2xl p-6 shadow-2xl">
          {title && <h1 className="text-base font-semibold text-white mb-5">{title}</h1>}
          {children}
        </div>
      </div>
    </div>
  )
}
