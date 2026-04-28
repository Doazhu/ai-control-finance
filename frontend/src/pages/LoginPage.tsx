import { useState, FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Zap, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'

export default function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Ошибка входа')
      login(data.token)
      navigate('/')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка сети')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[#080b14]">
      {/* Background */}
      <div className="particles-overlay" />
      <div
        className="gradient-glow top-[-100px] right-[-100px] bg-cyan-500/20"
        style={{ animation: 'float-orb-1 25s ease-in-out infinite, pulse-glow 10s ease-in-out infinite' }}
      />
      <div
        className="gradient-glow bottom-[-100px] left-[-100px] bg-purple-600/20"
        style={{ animation: 'float-orb-2 30s ease-in-out infinite' }}
      />

      {/* Card */}
      <div className="max-w-md w-full anim-in relative z-10">
        {/* Logo */}
        <div className="text-center mb-10 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-400 to-purple-500 flex items-center justify-center shadow-lg shadow-cyan-500/30 mb-6 hover:rotate-12 transition-transform duration-500 cursor-pointer">
            <Zap className="text-white" size={28} />
          </div>
          <h1 className="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-gray-500">
            FinAI
          </h1>
          <p className="text-gray-400 mt-2 font-medium">Твой интеллект в мире финансов</p>
        </div>

        {/* Form card */}
        <div className="glass-card !hover:transform-none rounded-[2.5rem] p-10 relative overflow-hidden">
          {/* Top gradient line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-400" />

          <h2 className="text-2xl font-bold mb-8">Вход в аккаунт</h2>

          <form onSubmit={submit} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">
                Email Адрес
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  placeholder="alex@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none input-glow transition-all placeholder:text-gray-600"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">
                  Пароль
                </label>
                <button type="button" className="text-xs text-cyan-400 hover:text-cyan-300 font-bold transition-colors">
                  Забыли пароль?
                </button>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-sm focus:outline-none input-glow transition-all placeholder:text-gray-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-white/10 bg-white/5 accent-cyan-400 cursor-pointer"
              />
              <label htmlFor="remember" className="text-xs text-gray-400 cursor-pointer select-none font-medium">
                Запомнить меня на этом устройстве
              </label>
            </div>

            {error && (
              <p className="text-red-400 text-xs font-medium text-center bg-red-500/10 border border-red-500/20 rounded-xl py-3 px-4">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-[1.02] transition-all shadow-lg shadow-cyan-500/20 spring-btn disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Входим...' : 'Войти'}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8">
            <div className="relative flex items-center justify-center mb-8">
              <div className="absolute inset-x-0 h-px bg-white/5" />
              <span className="relative bg-[#0d121f] px-4 text-[10px] font-black uppercase tracking-widest text-gray-600">
                Или через соцсети
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-3 py-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all spring-btn">
                <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                <span className="text-xs font-bold">Google</span>
              </button>
              <button className="flex items-center justify-center gap-3 py-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all spring-btn">
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                <span className="text-xs font-bold">Apple ID</span>
              </button>
            </div>
          </div>
        </div>

        <p className="text-center mt-10 text-sm text-gray-500 font-medium">
          Нет аккаунта?{' '}
          <Link
            to="/register"
            className="text-cyan-400 hover:text-purple-400 font-bold transition-all underline decoration-cyan-400/20 underline-offset-4"
          >
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  )
}
