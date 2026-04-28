import { useState, useMemo } from 'react'
import { Search, Calendar, ChevronDown } from 'lucide-react'
import { useTransactionStore } from '../store/useTransactionStore'

const MONTHS_RU = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
]

function formatMonthRu(key: string): string {
  const [year, month] = key.split('-').map(Number)
  return `${MONTHS_RU[month - 1]} ${year}`
}

const catEmoji: Record<string, string> = {
  'Зарплата': '💼', 'Фриланс': '🎨', 'Жильё': '🏠',
  'Продукты': '🛒', 'Транспорт': '🚗', 'Здоровье': '💊',
  'Подписки': '📱', 'Еда вне дома': '🍽', 'Прочее': '💰',
}

export default function SearchPage() {
  const { transactions } = useTransactionStore()
  const [query, setQuery] = useState('')
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null)
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set())

  const fmt = (n: number) =>
    new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(n)

  const now = new Date()
  const curKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  // Group transactions by month, exclude current month (shown separately)
  const monthlyGroups = useMemo(() => {
    const map: Record<string, { income: number; expense: number; count: number }> = {}
    transactions.forEach(t => {
      const key = t.date.slice(0, 7)
      if (!map[key]) map[key] = { income: 0, expense: 0, count: 0 }
      if (t.type === 'income') map[key].income += t.amount
      else map[key].expense += t.amount
      map[key].count++
    })
    return Object.entries(map)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([key, data]) => ({ key, month: formatMonthRu(key), ...data }))
  }, [transactions])

  // Current month stats
  const curMonthData = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income' && t.date.startsWith(curKey)).reduce((s, t) => s + t.amount, 0)
    const expense = transactions.filter(t => t.type === 'expense' && t.date.startsWith(curKey)).reduce((s, t) => s + t.amount, 0)
    const count = transactions.filter(t => t.date.startsWith(curKey)).length
    return { income, expense, count }
  }, [transactions, curKey])

  // Archive months — everything except current month
  const archiveGroups = useMemo(
    () => monthlyGroups.filter(g => g.key !== curKey),
    [monthlyGroups, curKey]
  )

  // Chart months — last 6 + current (oldest → newest)
  const chartMonths = useMemo(() => {
    const all = [...archiveGroups].reverse().slice(-5)
    all.push({ key: curKey, month: formatMonthRu(curKey), ...curMonthData })
    return all
  }, [archiveGroups, curKey, curMonthData])

  const maxChartVal = Math.max(...chartMonths.flatMap(m => [m.income, m.expense]), 1)

  // Search results
  const results = useMemo(() => {
    if (!query.trim() && !selectedMonth) return []
    return transactions.filter(t => {
      const matchQ = !query.trim() ||
        t.description.toLowerCase().includes(query.toLowerCase()) ||
        t.category.toLowerCase().includes(query.toLowerCase())
      const matchM = !selectedMonth || t.date.slice(0, 7) === selectedMonth
      return matchQ && matchM
    })
  }, [query, selectedMonth, transactions])

  const toggleExpand = (key: string) => {
    setExpandedMonths(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const currentMonthLabel = formatMonthRu(curKey)

  return (
    <div className="p-4 lg:p-8 relative overflow-x-hidden">
      <div className="particles-overlay pointer-events-none" />
      <div className="gradient-glow top-[-100px] right-[-100px] bg-cyan-500/10" style={{ animation: 'float-orb-1 25s ease-in-out infinite' }} />
      <div className="gradient-glow bottom-[10%] left-[5%] bg-purple-600/10" style={{ animation: 'float-orb-2 30s ease-in-out infinite' }} />

      <div className="max-w-4xl mx-auto relative z-10 space-y-6">
        {/* Header */}
        <header className="anim-in">
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Поиск и история
          </h1>
          <p className="text-gray-400 mt-1">Ищи по транзакциям и просматривай архивы прошлых месяцев</p>
        </header>

        {/* Search input */}
        <div className="rotating-border anim-in anim-in-1">
          <div className="relative bg-[#0a0f1d] rounded-[1.4rem] p-2 flex items-center gap-3">
            <Search size={18} className="text-gray-500 ml-2 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Поиск по описанию, категории, сумме..."
              autoFocus
              className="flex-1 bg-transparent border-none py-3 text-sm focus:outline-none placeholder:text-gray-600"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-gray-500 hover:text-white mr-2 spring-btn">✕</button>
            )}
          </div>
        </div>

        {/* Current month overview */}
        <div className="anim-in anim-in-2">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Текущий период</p>
          <div
            onClick={() => setSelectedMonth(selectedMonth === curKey ? null : curKey)}
            className={`glass-card rounded-2xl p-5 cursor-pointer border-l-2 transition-all ${
              selectedMonth === curKey ? 'border-l-cyan-400 bg-white/5' : 'border-l-transparent'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-400/10 flex items-center justify-center">
                  <Calendar size={18} className="text-cyan-400" />
                </div>
                <div>
                  <p className="font-bold">{currentMonthLabel}</p>
                  <p className="text-[10px] text-gray-500">{curMonthData.count} транзакций</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-emerald-400 font-bold">+{fmt(curMonthData.income)}</p>
                <p className="text-xs text-red-400 font-bold">-{fmt(curMonthData.expense)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search results */}
        {(query.trim() || selectedMonth) && (
          <div className="space-y-3 anim-in">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
              Результаты {results.length > 0 ? `— ${results.length}` : ''}
            </p>
            {results.length === 0 ? (
              <div className="glass-card rounded-2xl p-10 text-center">
                <p className="text-2xl mb-2">🔍</p>
                <p className="text-gray-400 font-bold">Ничего не найдено</p>
                <p className="text-xs text-gray-600 mt-1">Попробуй другой запрос</p>
              </div>
            ) : (
              results.map((t, i) => (
                <div
                  key={t.id}
                  className="glass-card p-4 rounded-2xl flex items-center justify-between"
                  style={{ animationDelay: `${i * 0.04}s` }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                      t.type === 'income' ? 'bg-emerald-500/20' : 'bg-orange-500/20'
                    }`}>
                      {catEmoji[t.category] ?? '💳'}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{t.description}</p>
                      <p className="text-[10px] text-gray-500">{t.category} · {t.date}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${t.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Archive months — real data from store */}
        <div className="anim-in anim-in-3">
          <div className="flex justify-between items-center mb-3">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Архив месяцев</p>
            <p className="text-[10px] text-gray-600">Нажми для детализации</p>
          </div>

          {archiveGroups.length === 0 ? (
            <div className="glass-card rounded-2xl p-8 text-center">
              <p className="text-2xl mb-2">🗓</p>
              <p className="text-gray-400 font-bold text-sm">Нет архивных данных</p>
              <p className="text-xs text-gray-600 mt-1">Архив появится когда накопится история за несколько месяцев</p>
            </div>
          ) : (
            <div className="space-y-3">
              {archiveGroups.map(arc => {
                const expanded = expandedMonths.has(arc.key)
                return (
                  <div key={arc.key} className="glass-card rounded-2xl overflow-hidden">
                    <div
                      className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-all"
                      onClick={() => toggleExpand(arc.key)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                          <Calendar size={18} className="text-gray-400" />
                        </div>
                        <div>
                          <p className="font-bold text-sm">{arc.month}</p>
                          <p className="text-[10px] text-gray-500">{arc.count} транзакций</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                          <p className="text-xs text-emerald-400 font-bold">+{fmt(arc.income)}</p>
                          <p className="text-xs text-red-400 font-bold">-{fmt(arc.expense)}</p>
                        </div>
                        <ChevronDown
                          size={18}
                          className={`text-gray-400 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
                        />
                      </div>
                    </div>

                    {expanded && (
                      <div className="border-t border-white/5 px-5 pb-4 pt-3">
                        <div className="grid grid-cols-3 gap-3 mb-3">
                          <div className="bg-white/5 rounded-xl p-3">
                            <p className="text-[9px] text-gray-500 uppercase">Баланс</p>
                            <p className={`text-sm font-bold ${arc.income - arc.expense >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {arc.income - arc.expense >= 0 ? '+' : ''}{fmt(arc.income - arc.expense)}
                            </p>
                          </div>
                          <div className="bg-white/5 rounded-xl p-3">
                            <p className="text-[9px] text-gray-500 uppercase">Доходы</p>
                            <p className="text-sm font-bold">{fmt(arc.income)}</p>
                          </div>
                          <div className="bg-white/5 rounded-xl p-3">
                            <p className="text-[9px] text-gray-500 uppercase">Расходы</p>
                            <p className="text-sm font-bold">{fmt(arc.expense)}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedMonth(arc.key)}
                          className="w-full text-center text-[10px] text-cyan-400 font-bold hover:text-cyan-300 spring-btn py-1"
                        >
                          Показать транзакции ↑
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Monthly chart — real data */}
        {chartMonths.length > 1 && (
          <div className="glass-card rounded-3xl p-6 anim-in anim-in-4">
            <h3 className="font-bold mb-4">Динамика по месяцам</h3>
            <div className="flex items-end justify-between gap-2 h-24">
              {chartMonths.map(m => (
                <div key={m.key} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col items-center gap-0.5" style={{ height: '80px' }}>
                    <div
                      className={`w-full rounded-t-sm bg-gradient-to-t from-cyan-400/80 to-cyan-400 ${m.key === curKey ? 'ring-2 ring-cyan-400/40' : ''}`}
                      style={{ height: `${(m.income / maxChartVal) * 100}%`, minHeight: m.income > 0 ? '2px' : '0' }}
                    />
                    <div
                      className="w-full rounded-b-sm bg-purple-500/60"
                      style={{ height: `${(m.expense / maxChartVal) * 60}%`, minHeight: m.expense > 0 ? '2px' : '0' }}
                    />
                  </div>
                  <span className={`text-[8px] font-black ${m.key === curKey ? 'text-cyan-400' : 'text-gray-600'}`}>
                    {m.month.slice(0, 3).toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-cyan-400" />
                <span className="text-[9px] text-gray-500 font-bold">Доходы</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                <span className="text-[9px] text-gray-500 font-bold">Расходы</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
