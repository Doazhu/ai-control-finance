import { useState, useMemo } from 'react'
import { PieChart, Plus, Trash2, Check, X, AlertTriangle } from 'lucide-react'
import { useTransactionStore } from '../store/useTransactionStore'

interface BudgetCat {
  id: string
  emoji: string
  name: string
  limit: number
  color: string
}

const INITIAL_CATS: BudgetCat[] = [
  { id: '1', emoji: '🏠', name: 'Жильё',        limit: 25000, color: 'from-cyan-400 to-cyan-500' },
  { id: '2', emoji: '🛒', name: 'Продукты',      limit: 15000, color: 'from-emerald-400 to-emerald-500' },
  { id: '3', emoji: '🍽', name: 'Еда вне дома',  limit: 8000,  color: 'from-orange-400 to-orange-500' },
  { id: '4', emoji: '🚗', name: 'Транспорт',     limit: 6000,  color: 'from-purple-400 to-purple-500' },
  { id: '5', emoji: '📱', name: 'Подписки',      limit: 2000,  color: 'from-pink-400 to-pink-500' },
  { id: '6', emoji: '💊', name: 'Здоровье',      limit: 5000,  color: 'from-red-400 to-red-500' },
  { id: '7', emoji: '🎮', name: 'Развлечения',   limit: 4000,  color: 'from-yellow-400 to-yellow-500' },
  { id: '8', emoji: '💰', name: 'Прочее',        limit: 3000,  color: 'from-blue-400 to-blue-500' },
]

const goals = [
  { emoji: '✈️', name: 'Отпуск в Турции',  target: 80000, saved: 52000 },
  { emoji: '💻', name: 'MacBook Pro',        target: 200000, saved: 30000 },
  { emoji: '🚗', name: 'Первый взнос',       target: 300000, saved: 145000 },
]

const DAY_LABELS = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ']

export default function BudgetPage() {
  const { transactions } = useTransactionStore()
  const [cats, setCats] = useState<BudgetCat[]>(INITIAL_CATS)
  const [adding, setAdding] = useState(false)
  const [newCat, setNewCat] = useState({ emoji: '💡', name: '', limit: '' })

  const fmt = (n: number) =>
    new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(n)

  const now = new Date()
  const curKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  // Real spending per category for the current month
  const spentByCategory = useMemo(() => {
    const map: Record<string, number> = {}
    transactions
      .filter(t => t.type === 'expense' && t.date.startsWith(curKey))
      .forEach(t => {
        const key = t.category || 'Прочее'
        map[key] = (map[key] ?? 0) + t.amount
      })
    return map
  }, [transactions, curKey])

  // Categories with real spent values injected
  const displayCats = useMemo(() =>
    cats.map(c => ({ ...c, spent: spentByCategory[c.name] ?? 0 })),
    [cats, spentByCategory]
  )

  // Weekly chart — last 7 days (Mon → Sun relative to today)
  const weeklyData = useMemo(() => {
    const result = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      const amount = transactions
        .filter(t => t.type === 'expense' && t.date === key)
        .reduce((s, t) => s + t.amount, 0)
      result.push({ day: DAY_LABELS[d.getDay()], amount })
    }
    return result
  }, [transactions])

  const maxDay = Math.max(...weeklyData.map(d => d.amount), 1)

  const totalLimit = displayCats.reduce((s, c) => s + c.limit, 0)
  const totalSpent = displayCats.reduce((s, c) => s + c.spent, 0)

  const deleteCat = (id: string) => setCats(prev => prev.filter(c => c.id !== id))

  const addCat = () => {
    if (!newCat.name || !newCat.limit) return
    const colors = [
      'from-cyan-400 to-cyan-500', 'from-purple-400 to-purple-500',
      'from-emerald-400 to-emerald-500', 'from-yellow-400 to-yellow-500',
    ]
    setCats(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        emoji: newCat.emoji,
        name: newCat.name,
        limit: Number(newCat.limit),
        color: colors[Math.floor(Math.random() * colors.length)],
      },
    ])
    setNewCat({ emoji: '💡', name: '', limit: '' })
    setAdding(false)
  }

  const monthLabel = now.toLocaleString('ru-RU', { month: 'long', year: 'numeric' })

  return (
    <div className="p-4 lg:p-8 relative overflow-x-hidden">
      <div className="particles-overlay pointer-events-none" />
      <div className="gradient-glow top-[-100px] right-[-100px] bg-cyan-500/10" style={{ animation: 'float-orb-1 25s ease-in-out infinite' }} />
      <div className="gradient-glow bottom-[10%] left-[5%] bg-purple-600/10" style={{ animation: 'float-orb-2 30s ease-in-out infinite' }} />

      <div className="max-w-5xl mx-auto relative z-10 space-y-6">
        {/* Header */}
        <header className="flex justify-between items-center anim-in">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Бюджетирование
            </h1>
            <p className="text-gray-400 mt-1">Управление лимитами · {monthLabel}</p>
          </div>
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-2xl font-bold text-sm hover:scale-105 transition-all spring-btn shadow-lg shadow-cyan-500/20"
          >
            <Plus size={16} /> Новый лимит
          </button>
        </header>

        {/* Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 anim-in anim-in-1">
          <div className="glass-card rounded-2xl p-5">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black mb-1">Общий лимит</p>
            <p className="text-2xl font-black">{fmt(totalLimit)}</p>
            <p className="text-xs text-gray-500 mt-1">{monthLabel}</p>
          </div>
          <div className="glass-card rounded-2xl p-5">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black mb-1">Потрачено</p>
            <p className="text-2xl font-black text-orange-400">{fmt(totalSpent)}</p>
            <p className="text-xs text-gray-500 mt-1">
              {totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0}% от лимита
            </p>
          </div>
          <div className="glass-card rounded-2xl p-5">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black mb-1">Остаток</p>
            <p className={`text-2xl font-black ${totalLimit - totalSpent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {fmt(totalLimit - totalSpent)}
            </p>
            <p className="text-xs text-gray-500 mt-1">до конца месяца</p>
          </div>
        </div>

        {/* Add new category form */}
        {adding && (
          <div className="glass-card rounded-2xl p-5 border border-cyan-400/30 anim-in">
            <h3 className="font-bold mb-4 text-sm">Новая категория</h3>
            <div className="flex gap-3 flex-wrap">
              <input
                type="text"
                value={newCat.emoji}
                onChange={e => setNewCat({ ...newCat, emoji: e.target.value })}
                placeholder="💡"
                className="w-14 bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-center focus:outline-none input-glow"
              />
              <input
                type="text"
                value={newCat.name}
                onChange={e => setNewCat({ ...newCat, name: e.target.value })}
                placeholder="Название категории"
                className="flex-1 min-w-[140px] bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:outline-none input-glow"
              />
              <input
                type="number"
                value={newCat.limit}
                onChange={e => setNewCat({ ...newCat, limit: e.target.value })}
                placeholder="Лимит ₽"
                className="w-32 bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:outline-none input-glow"
              />
              <button onClick={addCat} className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center spring-btn hover:bg-emerald-500/30">
                <Check size={16} />
              </button>
              <button onClick={() => setAdding(false)} className="w-10 h-10 rounded-xl glass-card text-gray-400 flex items-center justify-center spring-btn">
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Budget categories */}
        <div className="anim-in anim-in-2">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Категории</p>
          {displayCats.length === 0 ? (
            <div className="glass-card rounded-2xl p-10 text-center">
              <p className="text-2xl mb-2">📊</p>
              <p className="text-gray-400 font-bold">Нет категорий</p>
              <p className="text-xs text-gray-600 mt-1">Добавь лимиты для отслеживания расходов</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {displayCats.map(cat => {
                const pct = cat.limit > 0 ? Math.min((cat.spent / cat.limit) * 100, 100) : 0
                const over = cat.spent > cat.limit
                const warn = pct >= 80 && !over
                return (
                  <div key={cat.id} className="glass-card rounded-2xl p-5 group">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{cat.emoji}</span>
                        <div>
                          <p className="font-bold text-sm">{cat.name}</p>
                          <p className="text-[10px] text-gray-500">
                            {fmt(cat.spent)} из {fmt(cat.limit)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {over && <AlertTriangle size={14} className="text-red-400" />}
                        {warn && <AlertTriangle size={14} className="text-orange-400" />}
                        <span className={`text-sm font-black ${over ? 'text-red-400' : warn ? 'text-orange-400' : 'text-gray-300'}`}>
                          {cat.limit > 0 ? Math.round(pct) : 0}%
                        </span>
                        <button
                          onClick={() => deleteCat(cat.id)}
                          className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 hover:bg-red-500/20 spring-btn transition-opacity"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r transition-all duration-700 ${
                          over ? 'from-red-500 to-red-400' : warn ? 'from-orange-400 to-yellow-400' : cat.color
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    {over && (
                      <p className="text-[10px] text-red-400 font-bold mt-1.5">
                        Превышен на {fmt(cat.spent - cat.limit)}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Weekly chart — real data */}
          <div className="glass-card rounded-3xl p-6 anim-in anim-in-3">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold">Расходы по дням</h3>
                <p className="text-xs text-gray-500">Последние 7 дней</p>
              </div>
              <PieChart size={18} className="text-gray-500" />
            </div>
            <div className="flex items-end justify-between gap-2" style={{ height: '100px' }}>
              {weeklyData.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-sm bg-gradient-to-t from-cyan-400/60 to-cyan-400 transition-all duration-700 hover:from-purple-400/60 hover:to-purple-400"
                    style={{ height: `${(d.amount / maxDay) * 80}px`, minHeight: d.amount > 0 ? '3px' : '0' }}
                  />
                  <span className="text-[9px] text-gray-600 font-black">{d.day}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between text-[10px] text-gray-500">
              <span>Всего за 7 дней</span>
              <span className="font-bold text-white">
                {fmt(weeklyData.reduce((s, d) => s + d.amount, 0))}
              </span>
            </div>
          </div>

          {/* Goals */}
          <div className="glass-card rounded-3xl p-6 anim-in anim-in-3">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold">Финансовые цели</h3>
                <p className="text-xs text-gray-500">Копилки и накопления</p>
              </div>
              <button className="text-xs font-bold text-cyan-400 hover:text-cyan-300 spring-btn flex items-center gap-1">
                <Plus size={12} /> Добавить
              </button>
            </div>
            <div className="space-y-4">
              {goals.map(g => {
                const pct = Math.round((g.saved / g.target) * 100)
                return (
                  <div key={g.name}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{g.emoji}</span>
                        <p className="text-sm font-bold">{g.name}</p>
                      </div>
                      <span className="text-xs font-bold text-cyan-400">{pct}%</span>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[10px] text-gray-500">{fmt(g.saved)} накоплено</span>
                      <span className="text-[10px] text-gray-500">цель: {fmt(g.target)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
