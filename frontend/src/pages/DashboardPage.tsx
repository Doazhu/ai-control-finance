import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTransactionStore } from '../store/useTransactionStore'
import { TrendingUp, TrendingDown, ArrowUp, ArrowDown, Wallet, Zap, MessageSquare } from 'lucide-react'
import Modal from '../components/Modal'

// ─── Month labels ─────────────────────────────────────────────────────────────
const MONTH_SHORT = ['ЯНВ','ФЕВ','МАР','АПР','МАЙ','ИЮН','ИЮЛ','АВГ','СЕН','ОКТ','НОЯ','ДЕК']
const W = 1000, H = 180, PAD = 12

function yOf(v: number, maxV: number) {
  return H - (v / Math.max(maxV, 1)) * (H - PAD) - PAD / 2
}
function xOf(i: number, total: number) {
  return total < 2 ? W / 2 : (i / (total - 1)) * W
}

// Smooth cubic bezier through points
function smoothPath(pts: [number, number][]): string {
  if (!pts.length) return ''
  let d = `M ${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`
  for (let i = 1; i < pts.length; i++) {
    const [px, py] = pts[i - 1]
    const [cx, cy] = pts[i]
    const cpx = (px + cx) / 2
    d += ` C ${cpx.toFixed(1)},${py.toFixed(1)} ${cpx.toFixed(1)},${cy.toFixed(1)} ${cx.toFixed(1)},${cy.toFixed(1)}`
  }
  return d
}

// ─── Area Chart ───────────────────────────────────────────────────────────────
interface ChartPoint { m: string; inc: number; exp: number }

function AreaChart({ data }: { data: ChartPoint[] }) {
  const maxV = Math.max(...data.flatMap(d => [d.inc, d.exp]), 10)
  const gridLines = [maxV, Math.round(maxV * 0.67), Math.round(maxV * 0.33)]

  const incPts: [number, number][] = data.map((d, i) => [xOf(i, data.length), yOf(d.inc, maxV)])
  const expPts: [number, number][] = data.map((d, i) => [xOf(i, data.length), yOf(d.exp, maxV)])

  const incLine = smoothPath(incPts)
  const expLine = smoothPath(expPts)
  const incArea = `${incLine} L ${W},${H} L 0,${H} Z`
  const expArea = `${expLine} L ${W},${H} L 0,${H} Z`

  return (
    <div className="relative">
      <div className="flex gap-3">
        {/* Y axis */}
        <div className="flex flex-col justify-between py-1 shrink-0" style={{ height: H }}>
          {gridLines.map(v => (
            <span key={v} className="text-[9px] text-gray-600 font-black leading-none">
              {v >= 1000 ? `${Math.round(v / 1000)}m` : `${Math.round(v)}k`}
            </span>
          ))}
        </div>

        {/* SVG chart */}
        <div className="relative flex-1">
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none" style={{ height: H }}>
            {gridLines.map(v => (
              <div key={v} className="w-full border-t border-white/[0.06]" />
            ))}
          </div>

          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full" style={{ height: H, display: 'block' }}>
            <defs>
              <linearGradient id="gInc" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#22d3ee" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#a855f7" stopOpacity="0.20" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
              </linearGradient>
            </defs>

            <path d={expArea} fill="url(#gExp)" />
            <path d={incArea} fill="url(#gInc)" />

            <path d={expLine} fill="none" stroke="#a855f7" strokeWidth="2"
              strokeDasharray="7 4" strokeLinecap="round" className="animate-draw" />
            <path d={incLine} fill="none" stroke="#22d3ee" strokeWidth="3"
              strokeLinecap="round" className="animate-draw" />

            {incPts.map(([x, y], i) => (
              <line key={i} x1={x} y1={y - 5} x2={x} y2={y + 5}
                stroke="#22d3ee" strokeWidth="1.5"
                strokeOpacity={i === incPts.length - 1 ? '1' : '0.4'} />
            ))}
          </svg>

          {/* Pulsing dot at last income point */}
          {incPts.length > 0 && (() => {
            const [lx, ly] = incPts[incPts.length - 1]
            return (
              <div className="absolute pointer-events-none"
                style={{ left: `${(lx / W) * 100}%`, top: `${(ly / H) * 100}%`, transform: 'translate(-50%,-50%)' }}>
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-400 border-2 border-[#0a1120]" />
                </span>
              </div>
            )
          })()}
        </div>
      </div>

      {/* X labels */}
      <div className="flex ml-8 mt-2">
        {data.map(d => (
          <div key={d.m} className="flex-1 text-center">
            <span className="text-[9px] text-gray-600 font-black tracking-wider">{d.m}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Donut Chart ──────────────────────────────────────────────────────────────
const DONUT_COLORS = ['#22d3ee', '#a855f7', '#f59e0b', '#10b981', '#f97316', '#ec4899']

interface DonutSlice { label: string; pct: number; color: string }

function DonutChart({ slices, usedPct, onClick }: { slices: DonutSlice[]; usedPct: number; onClick: () => void }) {
  const R = 44, CX = 56, CY = 56, STROKE = 14
  const circ = 2 * Math.PI * R
  let cum = 0

  if (slices.length === 0) {
    return (
      <div className="flex items-center justify-center h-28 text-gray-500 text-xs cursor-pointer" onClick={onClick}>
        Нет данных о расходах
      </div>
    )
  }

  return (
    <div className="flex items-center gap-5 cursor-pointer group" onClick={onClick}>
      <div className="relative shrink-0" style={{ width: 112, height: 112 }}>
        <svg width="112" height="112" viewBox="0 0 112 112" className="-rotate-90">
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={STROKE} />
          {slices.map(s => {
            const dash = (s.pct / 100) * circ
            const el = (
              <circle key={s.label} cx={CX} cy={CY} r={R} fill="none"
                stroke={s.color} strokeWidth={STROKE}
                strokeDasharray={`${dash} ${circ - dash}`}
                strokeDashoffset={-cum}
                className="transition-all duration-500 group-hover:opacity-80" />
            )
            cum += dash
            return el
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-black">{usedPct}%</span>
          <span className="text-[8px] text-gray-500 uppercase font-black">бюджета</span>
        </div>
      </div>
      <div className="flex-1 space-y-2">
        {slices.map(s => (
          <div key={s.label} className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-[11px] text-gray-400 group-hover:text-gray-200 transition-colors">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
              {s.label}
            </span>
            <span className="text-[11px] font-black">{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Heatmap ──────────────────────────────────────────────────────────────────
const DAYS = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС']

interface HeatCell { date: string; amount: number; intensity: number }

function Heatmap({ rows }: { rows: HeatCell[][] }) {
  const [tip, setTip] = useState<{ d: string; amount: number } | null>(null)

  const fmt = (n: number) =>
    new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(n)

  return (
    <div className="relative">
      <div className="flex justify-between mb-2">
        {DAYS.map(d => (
          <span key={d} className="flex-1 text-center text-[9px] text-gray-600 font-black uppercase">{d}</span>
        ))}
      </div>
      <div className="space-y-1.5">
        {rows.map((row, ri) => (
          <div key={ri} className="flex gap-1.5">
            {row.map((cell, ci) => (
              <div
                key={ci}
                title={cell.date ? `${cell.date}: ${fmt(cell.amount)}` : ''}
                onMouseEnter={() => cell.amount > 0 && setTip({ d: cell.date, amount: cell.amount })}
                onMouseLeave={() => setTip(null)}
                className="flex-1 rounded-sm cursor-pointer transition-all duration-150 hover:scale-110 hover:brightness-125"
                style={{
                  height: 14,
                  background: cell.intensity === 0
                    ? 'rgba(255,255,255,0.04)'
                    : cell.intensity > 70
                    ? `rgba(168,85,247,${Math.min(cell.intensity / 100, 1)})`
                    : `rgba(34,211,238,${(cell.intensity / 100) * 0.7 + 0.1})`,
                }}
              />
            ))}
          </div>
        ))}
      </div>
      {tip ? (
        <div className="mt-3 text-[10px] text-gray-400">
          <span className="font-black text-white">{tip.d}</span>: {fmt(tip.amount)}
          {tip.amount > 5000 && <span className="ml-1 text-purple-400 font-bold">(пик трат)</span>}
        </div>
      ) : (
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[10px] text-gray-500">Последние 5 недель</span>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-sm bg-cyan-400/50" />
            <div className="w-2 h-2 rounded-sm bg-purple-500" />
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
type CardKey = 'balance' | 'income' | 'expense' | 'savings' | null

const catIcons: Record<string, string> = {
  'Зарплата': '💼', 'Фриланс': '🎨', 'Жильё': '🏠',
  'Продукты': '🛒', 'Транспорт': '🚗', 'Здоровье': '💊',
  'Подписки': '📱', 'Еда вне дома': '🍽', 'Прочее': '💰',
}

export default function DashboardPage() {
  const { transactions } = useTransactionStore()
  const navigate = useNavigate()
  const [openCard, setOpenCard] = useState<CardKey>(null)

  const now = new Date()
  const curKey  = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const prevKey  = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`

  const byMonth = (key: string, type: 'income' | 'expense') =>
    transactions.filter(t => t.type === type && t.date.startsWith(key)).reduce((s, t) => s + t.amount, 0)

  const income  = byMonth(curKey, 'income')
  const expense = byMonth(curKey, 'expense')
  const balance = income - expense
  const savings = income > 0 ? Math.round(((income - expense) / income) * 100) : 0

  const pct = (cur: number, prev: number): string | null => {
    if (prev === 0) return null
    const v = Math.round(((cur - prev) / prev) * 100)
    return (v >= 0 ? '+' : '') + v + '%'
  }
  const prevIncome  = byMonth(prevKey, 'income')
  const prevExpense = byMonth(prevKey, 'expense')
  const prevBalance = prevIncome - prevExpense

  const incomePct  = pct(income,  prevIncome)
  const expensePct = pct(expense, prevExpense)
  const balancePct = pct(balance, prevBalance)
  const savingsSub = savings >= 30 ? '✓ Цель 30%' : `До 30% ещё ${30 - savings}%`

  const fmt = (n: number) =>
    new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(n)

  const recent = transactions.slice(0, 5)

  const incByCat = transactions.filter(t => t.type === 'income')
    .reduce<Record<string, number>>((a, t) => { a[t.category] = (a[t.category] || 0) + t.amount; return a }, {})
  const expByCat = transactions.filter(t => t.type === 'expense')
    .reduce<Record<string, number>>((a, t) => { a[t.category] = (a[t.category] || 0) + t.amount; return a }, {})

  // ── Area chart: last 12 calendar months in thousands (rubles) ──────────────
  const chartData = useMemo((): ChartPoint[] => {
    const result: ChartPoint[] = []
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      result.push({
        m: MONTH_SHORT[d.getMonth()],
        inc: byMonth(key, 'income') / 1000,
        exp: byMonth(key, 'expense') / 1000,
      })
    }
    return result
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions])

  // ── Donut chart: current month expense breakdown ───────────────────────────
  const donutData = useMemo((): { slices: DonutSlice[]; usedPct: number } => {
    const curMonthExp = transactions.filter(t => t.type === 'expense' && t.date.startsWith(curKey))
    const total = curMonthExp.reduce((s, t) => s + t.amount, 0)
    if (total === 0) return { slices: [], usedPct: 0 }

    // Group by category, sort desc, take top 3, rest = Прочее
    const bycat: Record<string, number> = {}
    curMonthExp.forEach(t => { bycat[t.category || 'Прочее'] = (bycat[t.category || 'Прочее'] ?? 0) + t.amount })
    const sorted = Object.entries(bycat).sort(([,a],[,b]) => b - a)
    const top3 = sorted.slice(0, 3)
    const rest = sorted.slice(3).reduce((s, [, v]) => s + v, 0)

    const entries: [string, number][] = rest > 0 ? [...top3, ['Прочее', rest]] : top3
    const slices: DonutSlice[] = entries.map(([label, amount], i) => ({
      label,
      pct: Math.round((amount / total) * 100),
      color: DONUT_COLORS[i % DONUT_COLORS.length],
    }))

    // usedPct: how much of total month budget was spent (vs estimated income)
    const usedPct = income > 0 ? Math.min(Math.round((total / income) * 100), 100) : 100
    return { slices, usedPct }
  }, [transactions, curKey, income])

  // ── Heatmap: last 35 days (5 weeks × 7 days), Mon-Sun ─────────────────────
  const heatmapRows = useMemo((): HeatCell[][] => {
    // Build a map of date → expense amount for the last 35 days
    const amounts: Record<string, number> = {}
    transactions.filter(t => t.type === 'expense').forEach(t => {
      amounts[t.date] = (amounts[t.date] ?? 0) + t.amount
    })

    // Get last 35 days as YYYY-MM-DD strings
    const last35: string[] = []
    for (let i = 34; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      last35.push(d.toISOString().slice(0, 10))
    }

    const maxAmt = Math.max(...last35.map(d => amounts[d] ?? 0), 1)

    // Reshape into 5 rows × 7 cols (Mon=0 ... Sun=6 in our labels)
    // We want each row to be a week (Mon to Sun)
    // Find the Monday of the week containing today minus 34 days
    const firstDate = new Date(last35[0])
    // Shift first date back to Monday
    const dayOfWeek = firstDate.getDay() // 0=Sun, 1=Mon, ...6=Sat
    const daysFromMon = (dayOfWeek + 6) % 7 // Mon=0
    const startMon = new Date(firstDate)
    startMon.setDate(startMon.getDate() - daysFromMon)

    const rows: HeatCell[][] = []
    for (let week = 0; week < 5; week++) {
      const row: HeatCell[] = []
      for (let day = 0; day < 7; day++) {
        const d = new Date(startMon)
        d.setDate(d.getDate() + week * 7 + day)
        const key = d.toISOString().slice(0, 10)
        const amount = amounts[key] ?? 0
        row.push({
          date: key,
          amount,
          intensity: Math.round((amount / maxAmt) * 100),
        })
      }
      rows.push(row)
    }
    return rows
  }, [transactions])

  const cards = [
    {
      key: 'balance' as CardKey,
      label: 'Баланс',     value: fmt(balance),  sub: balancePct,
      up: balance >= prevBalance,
      icon: <Wallet size={18} className="text-cyan-400" />,
      badge: balance >= 0 ? 'text-emerald-400' : 'text-red-400', glow: 'shadow-cyan-500/10',
    },
    {
      key: 'income' as CardKey,
      label: 'Доходы',     value: fmt(income),   sub: incomePct,
      up: income >= prevIncome,
      icon: <TrendingUp size={18} className="text-emerald-400" />,
      badge: 'text-emerald-400', glow: 'shadow-emerald-500/10',
    },
    {
      key: 'expense' as CardKey,
      label: 'Расходы',    value: fmt(expense),  sub: expensePct,
      up: false,
      icon: <TrendingDown size={18} className="text-red-400" />,
      badge: 'text-red-400', glow: 'shadow-red-500/10',
    },
    {
      key: 'savings' as CardKey,
      label: 'Сбережения', value: `${savings}%`, sub: savingsSub,
      up: savings >= 30,
      icon: <Zap size={18} className="text-purple-400" />,
      badge: savings >= 30 ? 'text-emerald-400' : 'text-cyan-400', glow: 'shadow-purple-500/10',
    },
  ]

  const currentMonthLabel = now.toLocaleString('ru-RU', { month: 'long', year: 'numeric' })

  return (
    <div className="p-4 lg:p-8 relative overflow-x-hidden">
      <div className="particles-overlay pointer-events-none" />
      <div className="gradient-glow top-[-100px] right-[-100px] bg-cyan-500/10" style={{ animation: 'float-orb-1 25s ease-in-out infinite' }} />
      <div className="gradient-glow bottom-[30%] left-[-5%] bg-purple-600/10" style={{ animation: 'float-orb-2 30s ease-in-out infinite' }} />

      {/* Header */}
      <header className="flex justify-between items-center mb-8 anim-in relative z-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Аналитика
          </h1>
          <p className="text-gray-500 mt-1 text-sm">Глубокий разбор твоих финансов · {currentMonthLabel}</p>
        </div>
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/profile')}>
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold">Пользователь</p>
            <p className="text-xs text-cyan-400">Pro Аккаунт</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-cyan-600 p-0.5 hover:scale-110 transition-transform shadow-lg shadow-purple-500/20">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Avatar" className="w-full h-full rounded-full bg-[#080b14]" />
          </div>
        </div>
      </header>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 relative z-10">
        {cards.map((card, i) => (
          <div
            key={card.label}
            onClick={() => setOpenCard(card.key)}
            className={`glass-card p-5 rounded-2xl anim-in anim-in-${i + 1} cursor-pointer group
              hover:border-white/20 hover:shadow-lg ${card.glow} transition-all duration-300`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                {card.icon}
              </div>
              {card.sub ? (
                <span className={`text-xs font-black flex items-center gap-0.5 ${card.badge}`}>
                  {card.up ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                  {card.sub}
                </span>
              ) : (
                <span className="text-[10px] text-gray-600 font-bold">vs мес.</span>
              )}
            </div>
            <p className="text-gray-500 text-[10px] uppercase tracking-widest font-black mb-1">{card.label}</p>
            <h3 className="text-xl font-black">{card.value}</h3>
            <p className="text-[10px] text-gray-700 mt-2 group-hover:text-cyan-400/50 transition-colors">
              Подробнее →
            </p>
          </div>
        ))}
      </div>

      {/* Area chart — real 12-month data */}
      <div className="glass-card p-6 rounded-2xl mb-6 anim-in anim-in-2 relative z-10 group">
        <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
          <div>
            <h3 className="font-bold text-lg">Динамика доходов и расходов</h3>
            <p className="text-xs text-gray-500 mt-0.5">Последние 12 месяцев · тыс. ₽</p>
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-400/10 border border-cyan-400/15 group-hover:border-cyan-400/30 transition-colors">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="text-[10px] font-black text-cyan-400">Доходы</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/15 group-hover:border-purple-500/30 transition-colors">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              <span className="text-[10px] font-black text-purple-400">Расходы</span>
            </div>
          </div>
        </div>
        <AreaChart data={chartData} />
      </div>

      {/* Bottom 3 cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10 anim-in anim-in-3">

        {/* Donut — real expense breakdown */}
        <div
          className="glass-card p-6 rounded-2xl cursor-pointer hover:border-cyan-400/25 transition-all group"
          onClick={() => navigate('/budget')}
        >
          <h3 className="font-bold mb-4 flex items-center gap-2 group-hover:text-cyan-400 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2">
              <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>
            </svg>
            Расходы месяца
          </h3>
          <DonutChart
            slices={donutData.slices}
            usedPct={donutData.usedPct}
            onClick={() => navigate('/budget')}
          />
          <p className="text-[10px] text-gray-600 mt-3 group-hover:text-cyan-400/50 transition-colors">
            Открыть бюджет →
          </p>
        </div>

        {/* Recent transactions */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">Последние операции</h3>
            <button
              onClick={() => navigate('/transactions')}
              className="text-[10px] font-black text-cyan-400 hover:text-cyan-300 transition-colors uppercase tracking-wider spring-btn"
            >
              Все →
            </button>
          </div>
          {recent.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              <p className="text-2xl mb-2">💸</p>
              Нет транзакций
            </div>
          ) : (
            <div className="space-y-2">
              {recent.map(t => (
                <div
                  key={t.id}
                  onClick={() => navigate('/transactions')}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/4 border border-white/5
                    hover:bg-white/8 hover:border-white/10 transition-all cursor-pointer group/tx"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm
                      group-hover/tx:scale-110 transition-transform
                      ${t.type === 'income' ? 'bg-emerald-500/15' : 'bg-orange-500/15'}`}>
                      {catIcons[t.category] ?? '💳'}
                    </div>
                    <div>
                      <p className="text-sm font-bold leading-tight">{t.description}</p>
                      <p className="text-[10px] text-gray-500">{t.date.slice(5)}</p>
                    </div>
                  </div>
                  <p className={`text-sm font-black ${t.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Heatmap — real daily expense data */}
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="font-bold mb-4">Активность трат</h3>
          <Heatmap rows={heatmapRows} />
        </div>
      </div>

      {/* AI banner */}
      <div
        className="mt-5 glass-card p-5 rounded-2xl anim-in anim-in-4 relative z-10 border-l-2 border-l-cyan-400
          cursor-pointer hover:bg-white/5 transition-all group"
        onClick={() => navigate('/chat')}
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 to-purple-500 flex items-center justify-center shrink-0 shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-transform">
            <Zap className="text-white" size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm mb-0.5">Рекомендация FinAI</h4>
            <p className="text-xs text-gray-400 leading-relaxed truncate sm:whitespace-normal">
              Норма сбережений <span className="text-cyan-400 font-bold">{savings}%</span>.
              {savings < 30 && income > 0 && (
                <> До цели 30% не хватает <span className="text-purple-400 font-bold">{fmt(Math.max(0, income * 0.3 - balance))}</span>.</>
              )}
              {' '}Сократи расходы на еду вне дома — даст ещё 2–3%.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <MessageSquare size={14} className="text-cyan-400" />
            <span className="text-xs font-bold text-cyan-400 group-hover:text-cyan-300 transition-colors whitespace-nowrap">
              Открыть чат →
            </span>
          </div>
        </div>
      </div>

      {/* ═══ MODALS ═══ */}
      <Modal open={openCard === 'balance'} onClose={() => setOpenCard(null)} title="Баланс счёта">
        <div className="space-y-4">
          <div className="text-center py-4">
            <p className={`text-4xl font-black ${balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmt(balance)}</p>
            <p className="text-sm text-gray-500 mt-1">Текущий баланс · {currentMonthLabel}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-2xl p-4 text-center">
              <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Пришло</p>
              <p className="text-lg font-black text-emerald-400">+{fmt(income)}</p>
            </div>
            <div className="bg-red-500/5 border border-red-500/15 rounded-2xl p-4 text-center">
              <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Ушло</p>
              <p className="text-lg font-black text-red-400">-{fmt(expense)}</p>
            </div>
          </div>
        </div>
      </Modal>

      <Modal open={openCard === 'income'} onClose={() => setOpenCard(null)} title="Источники дохода">
        <div className="space-y-3">
          <div className="text-center py-3">
            <p className="text-3xl font-black text-emerald-400">+{fmt(income)}</p>
            <p className="text-sm text-gray-500 mt-1">{currentMonthLabel}</p>
          </div>
          {Object.entries(incByCat).length === 0
            ? <p className="text-center text-gray-500 py-6 text-sm">Нет доходов в этом месяце</p>
            : Object.entries(incByCat).sort(([,a],[,b]) => b - a).map(([cat, amount]) => (
              <div key={cat} className="flex items-center gap-3">
                <span className="text-xl w-8 text-center">{catIcons[cat] ?? '💰'}</span>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-bold">{cat}</span>
                    <span className="text-sm font-black text-emerald-400">+{fmt(amount)}</span>
                  </div>
                  <div className="h-1 bg-white/8 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full transition-all duration-700"
                      style={{ width: `${income > 0 ? (amount / income) * 100 : 0}%` }} />
                  </div>
                </div>
              </div>
            ))}
        </div>
      </Modal>

      <Modal open={openCard === 'expense'} onClose={() => setOpenCard(null)} title="Структура расходов">
        <div className="space-y-3">
          <div className="text-center py-3">
            <p className="text-3xl font-black text-red-400">-{fmt(expense)}</p>
            <p className="text-sm text-gray-500 mt-1">{currentMonthLabel}</p>
          </div>
          {Object.entries(expByCat).length === 0
            ? <p className="text-center text-gray-500 py-6 text-sm">Нет расходов в этом месяце</p>
            : Object.entries(expByCat).sort(([,a],[,b]) => b - a).map(([cat, amount]) => (
              <div key={cat} className="flex items-center gap-3">
                <span className="text-xl w-8 text-center">{catIcons[cat] ?? '💳'}</span>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-bold">{cat}</span>
                    <span className="text-sm font-black text-red-400">-{fmt(amount)}</span>
                  </div>
                  <div className="h-1 bg-white/8 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-red-400 to-orange-400 rounded-full transition-all duration-700"
                      style={{ width: `${expense > 0 ? (amount / expense) * 100 : 0}%` }} />
                  </div>
                </div>
              </div>
            ))}
        </div>
      </Modal>

      <Modal open={openCard === 'savings'} onClose={() => setOpenCard(null)} title="Норма сбережений">
        <div className="space-y-4">
          <div className="flex justify-center py-4">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="url(#sg)" strokeWidth="10"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - Math.min(savings, 100) / 100)}`}
                  strokeLinecap="round" />
                <defs>
                  <linearGradient id="sg" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#22d3ee" /><stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black">{savings}%</span>
                <span className="text-[9px] text-gray-500 uppercase font-black">норма</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: 'Сохранено', value: fmt(Math.max(0, balance)), color: 'text-cyan-400' },
              { label: 'Цель',      value: '30%',                      color: 'text-white' },
              { label: 'До цели',   value: savings >= 30 ? '🎉' : fmt(Math.max(0, income * 0.3 - balance)), color: 'text-purple-400' },
            ].map(item => (
              <div key={item.label} className="bg-white/5 rounded-2xl p-3">
                <p className="text-[9px] text-gray-500 uppercase font-black mb-1">{item.label}</p>
                <p className={`font-black text-sm ${item.color}`}>{item.value}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 text-center leading-relaxed">
            {savings >= 30
              ? '🎉 Отлично! Норма сбережений превышает рекомендуемые 30%.'
              : 'Увеличь сбережения, сократив расходы на развлечения и еду вне дома.'}
          </p>
          <button
            onClick={() => { setOpenCard(null); navigate('/budget') }}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-400/20 to-purple-500/20
              border border-cyan-400/20 text-sm font-bold text-cyan-400 hover:from-cyan-400/30 hover:to-purple-500/30
              transition-all spring-btn"
          >
            Настроить бюджет →
          </button>
        </div>
      </Modal>
    </div>
  )
}
