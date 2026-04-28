import { useState, useMemo } from 'react'
import { Camera, Star, TrendingUp, Shield, Award, Edit2, Check, X } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { useTransactionStore } from '../store/useTransactionStore'

interface EditField {
  name: string
  email: string
  phone: string
  city: string
}

export default function ProfilePage() {
  const logout = useAuthStore(s => s.logout)
  const { transactions } = useTransactionStore()

  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState(false)
  const [fields, setFields] = useState<EditField>({
    name: 'Александр К.',
    email: 'alex@example.com',
    phone: '+7 (999) 123-45-67',
    city: 'Москва',
  })
  const [draft, setDraft] = useState<EditField>({ ...fields })

  const startEdit = () => { setDraft({ ...fields }); setEditing(true) }
  const cancelEdit = () => setEditing(false)
  const saveEdit = () => {
    setFields({ ...draft })
    setEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  // ── Real stats from transaction store ──────────────────────────────────────
  const { totalTransactions, daysActive, savedRub, totalTurnover, monthsPositive } = useMemo(() => {
    const total = transactions.length

    // Days active: spread between earliest and today
    const dates = transactions.map(t => t.date).sort()
    const firstDate = dates[0]
    const days = firstDate
      ? Math.max(1, Math.ceil((Date.now() - new Date(firstDate).getTime()) / 86_400_000))
      : 0

    const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    const saved = Math.max(0, income - expense)
    const turnover = income + expense

    // Months with positive balance
    const byMonth: Record<string, { i: number; e: number }> = {}
    transactions.forEach(t => {
      const key = t.date.slice(0, 7)
      if (!byMonth[key]) byMonth[key] = { i: 0, e: 0 }
      if (t.type === 'income') byMonth[key].i += t.amount
      else byMonth[key].e += t.amount
    })
    const positive = Object.values(byMonth).filter(m => m.i > m.e).length

    return {
      totalTransactions: total,
      daysActive: days,
      savedRub: saved,
      totalTurnover: turnover,
      monthsPositive: positive,
    }
  }, [transactions])

  const fmt = (n: number) =>
    new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(n)
  const fmtShort = (n: number) =>
    n >= 1_000_000
      ? `${(n / 1_000_000).toFixed(1)} млн ₽`
      : n >= 1_000
      ? `${Math.round(n / 1_000)} тыс ₽`
      : fmt(n)

  const stats = [
    { label: 'Транзакций',    value: String(totalTransactions),     icon: TrendingUp, color: 'text-cyan-400',    bg: 'bg-cyan-400/10' },
    { label: 'Дней в системе', value: String(daysActive),           icon: Star,       color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { label: 'Сэкономлено',   value: fmtShort(savedRub),           icon: Shield,     color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: 'Уровень',       value: 'Pro',                         icon: Award,      color: 'text-purple-400',  bg: 'bg-purple-400/10' },
  ]

  // ── Achievements — computed from real data ──────────────────────────────────
  const achievements = useMemo(() => [
    {
      emoji: '💰',
      title: 'Первый миллион',
      desc: 'Суммарный оборот >1M ₽',
      done: totalTurnover >= 1_000_000,
    },
    {
      emoji: '📈',
      title: 'Инвестор',
      desc: '3 месяца с положительным балансом',
      done: monthsPositive >= 3,
    },
    {
      emoji: '🎯',
      title: 'Активный пользователь',
      desc: 'Добавлено >50 транзакций',
      done: totalTransactions >= 50,
    },
    {
      emoji: '🤖',
      title: 'AI-Друг',
      desc: '10 вопросов ассистенту',
      done: false,
    },
    {
      emoji: '🏆',
      title: 'Топ-10%',
      desc: 'Норма сбережений >30%',
      done: (() => {
        const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
        const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
        return income > 0 && (income - expense) / income >= 0.3
      })(),
    },
    {
      emoji: '🔥',
      title: 'Streak 7',
      desc: '7 дней подряд с транзакциями',
      done: (() => {
        const dateSet = new Set(transactions.map(t => t.date))
        let streak = 0
        const today = new Date()
        for (let i = 0; i < 30; i++) {
          const d = new Date(today)
          d.setDate(d.getDate() - i)
          if (dateSet.has(d.toISOString().slice(0, 10))) streak++
          else break
        }
        return streak >= 7
      })(),
    },
  ], [totalTransactions, totalTurnover, monthsPositive, transactions])

  // Financial rating — composite score
  const rating = useMemo(() => {
    let score = 40 // base
    if (totalTransactions > 10) score += 10
    if (totalTransactions > 50) score += 10
    if (daysActive > 30)        score += 10
    if (monthsPositive >= 1)    score += 10
    if (monthsPositive >= 3)    score += 10
    const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    if (income > 0 && (income - expense) / income >= 0.2) score += 10
    return Math.min(score, 100)
  }, [totalTransactions, daysActive, monthsPositive, transactions])

  return (
    <div className="p-4 lg:p-8 relative overflow-x-hidden">
      <div className="particles-overlay pointer-events-none" />
      <div className="gradient-glow top-[-100px] right-[-100px] bg-purple-600/10" style={{ animation: 'float-orb-1 25s ease-in-out infinite' }} />
      <div className="gradient-glow bottom-[10%] left-[5%] bg-cyan-500/10" style={{ animation: 'float-orb-2 30s ease-in-out infinite' }} />

      <div className="max-w-4xl mx-auto relative z-10 space-y-6">

        {/* Profile hero */}
        <div className="glass-card rounded-3xl p-8 anim-in">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-600 to-cyan-600 p-0.5 shadow-lg shadow-cyan-500/30">
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                  alt="Avatar"
                  className="w-full h-full rounded-2xl bg-[#080b14]"
                />
              </div>
              <button className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-400 to-purple-500 flex items-center justify-center shadow-lg spring-btn hover:scale-110">
                <Camera size={14} className="text-white" />
              </button>
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              {!editing ? (
                <>
                  <h1 className="text-2xl font-black tracking-tight">{fields.name}</h1>
                  <p className="text-gray-400 text-sm mt-0.5">{fields.email}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{fields.phone} · {fields.city}</p>
                  <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                    <span className="px-3 py-1 rounded-full bg-cyan-400/15 text-cyan-400 text-[10px] font-black uppercase tracking-wider border border-cyan-400/20">
                      Pro Аккаунт
                    </span>
                    <span className="px-3 py-1 rounded-full bg-emerald-400/10 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                      С нами с 2024
                    </span>
                  </div>
                </>
              ) : (
                <div className="space-y-3 text-left">
                  {(['name', 'email', 'phone', 'city'] as const).map(key => (
                    <div key={key}>
                      <label className="text-[10px] text-gray-500 uppercase tracking-widest font-black">
                        {key === 'name' ? 'Имя' : key === 'email' ? 'Email' : key === 'phone' ? 'Телефон' : 'Город'}
                      </label>
                      <input
                        type="text"
                        value={draft[key]}
                        onChange={e => setDraft({ ...draft, [key]: e.target.value })}
                        className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:outline-none input-glow"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 shrink-0">
              {!editing ? (
                <button
                  onClick={startEdit}
                  className="flex items-center gap-2 px-4 py-2.5 glass-card rounded-xl text-sm font-bold hover:text-cyan-400 spring-btn"
                >
                  <Edit2 size={14} /> Редактировать
                </button>
              ) : (
                <>
                  <button onClick={saveEdit} className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-sm font-bold spring-btn hover:bg-emerald-500/30">
                    <Check size={14} /> Сохранить
                  </button>
                  <button onClick={cancelEdit} className="flex items-center gap-1.5 px-4 py-2.5 glass-card rounded-xl text-sm font-bold text-gray-400 spring-btn">
                    <X size={14} /> Отмена
                  </button>
                </>
              )}
            </div>
          </div>

          {saved && (
            <div className="mt-4 text-center text-xs text-emerald-400 font-bold">
              ✓ Профиль обновлён
            </div>
          )}
        </div>

        {/* Financial rating */}
        <div className="glass-card rounded-3xl p-6 anim-in anim-in-1">
          <h2 className="text-lg font-bold mb-4">Финансовый рейтинг</h2>
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                <circle
                  cx="50" cy="50" r="40" fill="none"
                  stroke="url(#ratingGrad)" strokeWidth="10"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - rating / 100)}`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1s ease' }}
                />
                <defs>
                  <linearGradient id="ratingGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black">{rating}</span>
                <span className="text-[8px] text-gray-500 uppercase font-black">/ 100</span>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Star size={14} className="text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-bold">
                  {rating >= 80 ? 'Отличный уровень' : rating >= 60 ? 'Хороший уровень' : 'Развивайся дальше'}
                </span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                {totalTransactions === 0
                  ? 'Добавь первые транзакции, чтобы рейтинг рос.'
                  : `Добавлено ${totalTransactions} транзакций. ${monthsPositive >= 3 ? 'Отлично держишь баланс!' : 'Поддерживай позитивный баланс для роста рейтинга.'}`}
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {['Активность', 'Сбережения', 'Дисциплина'].map((label, i) => {
                  const widths = [
                    Math.min(100, totalTransactions * 2),
                    Math.min(100, monthsPositive * 25),
                    Math.min(100, daysActive),
                  ]
                  return (
                    <div key={label}>
                      <p className="text-[9px] text-gray-500 uppercase font-bold mb-1">{label}</p>
                      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-1000"
                          style={{ width: `${widths[i]}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 anim-in anim-in-2">
          {stats.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="glass-card p-5 rounded-2xl flex flex-col gap-3">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon size={18} className={color} />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
                <h3 className="text-xl font-black mt-0.5">{value}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Achievements */}
        <div className="glass-card rounded-3xl p-6 anim-in anim-in-3">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold">Достижения</h2>
            <span className="text-xs text-gray-500 font-bold">
              {achievements.filter(a => a.done).length}/{achievements.length} получено
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {achievements.map(a => (
              <div
                key={a.title}
                className={`p-4 rounded-2xl border transition-all duration-300 ${
                  a.done
                    ? 'bg-gradient-to-br from-cyan-400/5 to-purple-500/5 border-cyan-400/20'
                    : 'bg-white/2 border-white/5 opacity-50 grayscale'
                }`}
              >
                <div className="text-2xl mb-2">{a.emoji}</div>
                <p className={`text-xs font-bold ${a.done ? 'text-white' : 'text-gray-500'}`}>{a.title}</p>
                <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">{a.desc}</p>
                {a.done && (
                  <div className="mt-2 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-[9px] text-emerald-400 font-bold">Получено</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Danger zone */}
        <div className="glass-card rounded-3xl p-6 anim-in anim-in-4 border border-red-500/10">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Опасная зона</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <button className="flex-1 py-3 rounded-2xl border border-red-500/20 text-red-400 text-sm font-bold hover:bg-red-500/10 spring-btn transition-all">
              Удалить все данные
            </button>
            <button
              onClick={logout}
              className="flex-1 py-3 rounded-2xl border border-white/10 text-gray-400 text-sm font-bold hover:bg-white/5 spring-btn transition-all"
            >
              Выйти из аккаунта
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
