import { useState, FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Zap, Mail, Lock, Eye, EyeOff, User } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'

export default function RegisterPage() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('Пароли не совпадают')
      return
    }
    if (password.length < 8) {
      setError('Пароль должен быть не менее 8 символов')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Ошибка регистрации')
      // Auto-login after register
      const loginRes = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const loginData = await loginRes.json()
      if (loginRes.ok) login(loginData.token)
      navigate('/')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка сети')
    } finally {
      setLoading(false)
    }
  }

  const strength = (() => {
    if (password.length === 0) return 0
    let s = 0
    if (password.length >= 8) s++
    if (/[A-Z]/.test(password)) s++
    if (/[0-9]/.test(password)) s++
    if (/[^A-Za-z0-9]/.test(password)) s++
    return s
  })()

  const strengthLabel = ['', 'Слабый', 'Средний', 'Хороший', 'Отличный'][strength]
  const strengthColor = ['', 'bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-emerald-400'][strength]

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[#080b14]">
      <div className="particles-overlay" />
      <div
        className="gradient-glow top-[-100px] right-[-100px] bg-purple-600/20"
        style={{ animation: 'float-orb-1 25s ease-in-out infinite, pulse-glow 10s ease-in-out infinite' }}
      />
      <div
        className="gradient-glow bottom-[-100px] left-[-100px] bg-cyan-500/20"
        style={{ animation: 'float-orb-2 30s ease-in-out infinite' }}
      />

      <div className="max-w-md w-full anim-in relative z-10">
        {/* Logo */}
        <div className="text-center mb-10 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-400 to-purple-500 flex items-center justify-center shadow-lg shadow-cyan-500/30 mb-6 hover:rotate-12 transition-transform duration-500 cursor-pointer">
            <Zap className="text-white" size={28} />
          </div>
          <h1 className="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-gray-500">
            FinAI
          </h1>
          <p className="text-gray-400 mt-2 font-medium">Начни контролировать финансы</p>
        </div>

        <div className="glass-card rounded-[2.5rem] p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-cyan-400 to-purple-500" />
          <h2 className="text-2xl font-bold mb-8">Создать аккаунт</h2>

          <form onSubmit={submit} className="space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Ваше имя</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Александр"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none input-glow transition-all placeholder:text-gray-600"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Email Адрес</label>
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
              <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Пароль</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Минимум 8 символов"
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
              {/* Strength bar */}
              {password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1,2,3,4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i <= strength ? strengthColor : 'bg-white/10'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-500 ml-1">{strengthLabel}</p>
                </div>
              )}
            </div>

            {/* Confirm */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Подтвердите пароль</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Повторите пароль"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  className={`w-full bg-white/5 border rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none input-glow transition-all placeholder:text-gray-600 ${
                    confirm && confirm !== password ? 'border-red-500/50' : 'border-white/10'
                  }`}
                />
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-xs font-medium text-center bg-red-500/10 border border-red-500/20 rounded-xl py-3 px-4">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-cyan-400 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-[1.02] transition-all shadow-lg shadow-purple-500/20 spring-btn disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Создаём аккаунт...' : 'Зарегистрироваться'}
            </button>

            <p className="text-[10px] text-gray-600 text-center leading-relaxed">
              Нажимая «Зарегистрироваться», вы соглашаетесь с условиями использования и политикой конфиденциальности
            </p>
          </form>
        </div>

        <p className="text-center mt-10 text-sm text-gray-500 font-medium">
          Уже есть аккаунт?{' '}
          <Link
            to="/login"
            className="text-cyan-400 hover:text-purple-400 font-bold transition-all underline decoration-cyan-400/20 underline-offset-4"
          >
            Войти
          </Link>
        </p>
      </div>
    </div>
  )
}
