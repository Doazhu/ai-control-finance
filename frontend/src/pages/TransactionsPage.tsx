import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, TrendingUp, TrendingDown, Plus, Trash2, X, Check, RefreshCw, Loader2, Upload } from 'lucide-react'
import { useTransactionStore } from '../store/useTransactionStore'
import { Transaction } from '../types'
import Modal from '../components/Modal'
import ImportModal from '../components/ImportModal'

const categories = ['Все', 'Зарплата', 'Фриланс', 'Жильё', 'Продукты', 'Транспорт', 'Здоровье', 'Подписки', 'Еда вне дома', 'Прочее']
const addCategories = categories.filter(c => c !== 'Все')

const catEmoji: Record<string, string> = {
  'Зарплата': '💼', 'Фриланс': '🎨', 'Жильё': '🏠',
  'Продукты': '🛒', 'Транспорт': '🚗', 'Здоровье': '💊',
  'Подписки': '📱', 'Еда вне дома': '🍽', 'Прочее': '💰',
}

export default function TransactionsPage() {
  const { transactions, loading, addTransaction, removeTransaction, fetchTransactions } = useTransactionStore()

  const [search, setSearch]     = useState('')
  const [category, setCategory] = useState('Все')
  const [type, setType]         = useState<'all' | 'income' | 'expense'>('all')
  const [selected, setSelected] = useState<Transaction | null>(null)
  const [showAdd, setShowAdd]   = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Add form state
  const [form, setForm] = useState({
    description: '',
    amount: '',
    category: 'Прочее',
    type: 'expense' as 'income' | 'expense',
    date: new Date().toISOString().slice(0, 10),
  })

  const fmt = (n: number) =>
    new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(n)

  const filtered = transactions.filter(t => {
    const matchSearch = t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase())
    const matchCat  = category === 'Все' || t.category === category
    const matchType = type === 'all' || t.type === type
    return matchSearch && matchCat && matchType
  })

  const income  = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  const [adding, setAdding]   = useState(false)
  const [showImport, setShowImport] = useState(false)

  const handleAdd = async () => {
    if (!form.description || !form.amount) return
    setAdding(true)
    try {
      await addTransaction({
        description: form.description,
        amount: Number(form.amount),
        category: form.category,
        type: form.type,
        date: form.date,
      })
      setForm({ description: '', amount: '', category: 'Прочее', type: 'expense', date: new Date().toISOString().slice(0, 10) })
      setShowAdd(false)
    } catch {
      // ошибка показывается через ErrorToast
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = (id: string) => {
    removeTransaction(id)
    setDeleteId(null)
    if (selected?.id === id) setSelected(null)
  }

  return (
    <div className="p-4 lg:p-8 relative overflow-x-hidden">
      <div className="particles-overlay pointer-events-none" />
      <div className="gradient-glow top-[-100px] right-[-100px] bg-purple-600/10" style={{ animation: 'float-orb-1 25s ease-in-out infinite' }} />
      <div className="gradient-glow bottom-[10%] left-[5%] bg-cyan-500/10"   style={{ animation: 'float-orb-2 30s ease-in-out infinite' }} />

      {/* Header */}
      <header className="flex justify-between items-center mb-6 anim-in relative z-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Транзакции
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Найдено: <span className="text-white font-bold">{filtered.length}</span> записей
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fetchTransactions()}
            disabled={loading}
            className="w-10 h-10 glass-card rounded-xl flex items-center justify-center text-gray-400 hover:text-cyan-400 spring-btn disabled:opacity-50"
            title="Обновить"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-2 px-4 py-3 glass-card rounded-2xl font-bold text-sm text-gray-300 hover:text-cyan-400 hover:border-cyan-400/25 spring-btn transition-all"
          >
            <Upload size={15} /> Импорт
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-2xl font-bold text-sm shadow-lg shadow-cyan-500/20 hover:scale-105 spring-btn"
          >
            <Plus size={16} /> Добавить
          </button>
        </div>
      </header>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 mb-5 relative z-10 anim-in anim-in-1">
        <div className="glass-card p-4 rounded-2xl flex items-center gap-3 hover:border-emerald-400/20 transition-all">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center">
            <TrendingUp size={16} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-black">Доходы</p>
            <p className="text-base font-black text-emerald-400">+{fmt(income)}</p>
          </div>
        </div>
        <div className="glass-card p-4 rounded-2xl flex items-center gap-3 hover:border-red-400/20 transition-all">
          <div className="w-9 h-9 rounded-xl bg-red-500/15 flex items-center justify-center">
            <TrendingDown size={16} className="text-red-400" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-black">Расходы</p>
            <p className="text-base font-black text-red-400">-{fmt(expense)}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-5 rounded-2xl mb-5 anim-in anim-in-2 relative z-10">
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="relative flex-1 min-w-48">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Поиск по описанию, категории..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none input-glow transition-all placeholder:text-gray-600"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white spring-btn">
                <X size={14} />
              </button>
            )}
          </div>
          <div className="flex rounded-xl border border-white/10 overflow-hidden bg-white/5">
            {(['all', 'income', 'expense'] as const).map(t => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`px-4 py-3 text-xs font-black transition-all ${
                  type === t ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-white' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {t === 'all' ? 'Все' : t === 'income' ? '↑ Доходы' : '↓ Расходы'}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all spring-btn ${
                category === c
                  ? 'bg-cyan-400/15 text-cyan-400 border border-cyan-400/30'
                  : 'bg-white/5 text-gray-500 border border-white/5 hover:border-white/20 hover:text-gray-300'
              }`}
            >
              {catEmoji[c] ? `${catEmoji[c]} ` : ''}{c}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="space-y-2 relative z-10">
        {loading && transactions.length === 0 ? (
          // skeleton
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card p-4 rounded-xl flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/8" />
                  <div className="space-y-2">
                    <div className="h-3 w-32 bg-white/8 rounded-full" />
                    <div className="h-2 w-20 bg-white/5 rounded-full" />
                  </div>
                </div>
                <div className="h-3 w-20 bg-white/8 rounded-full" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card p-16 rounded-2xl text-center text-gray-500 anim-in">
            <p className="text-4xl mb-4">🔍</p>
            <p className="font-bold text-lg">Транзакции не найдены</p>
            <p className="text-sm mt-1 text-gray-600">Попробуй изменить фильтры</p>
          </div>
        ) : (
          <AnimatePresence>
            {filtered.map((t, i) => (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.03, duration: 0.25 }}
                onClick={() => setSelected(t)}
                className="glass-card p-4 rounded-xl flex items-center justify-between group cursor-pointer
                  hover:border-white/15 hover:bg-white/5 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg
                    group-hover:scale-110 transition-transform duration-200
                    ${t.type === 'income' ? 'bg-emerald-500/15' : 'bg-orange-500/15'}`}>
                    {catEmoji[t.category] ?? '💳'}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{t.description}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      {t.category} · {new Date(t.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-black ${t.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                  </span>
                  <button
                    onClick={e => { e.stopPropagation(); setDeleteId(t.id) }}
                    className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center
                      text-red-400 hover:bg-red-500/20 transition-all spring-btn"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* ─── Detail modal ─── */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Детали транзакции" size="sm">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0
                ${selected.type === 'income' ? 'bg-emerald-500/15' : 'bg-orange-500/15'}`}>
                {catEmoji[selected.category] ?? '💳'}
              </div>
              <div>
                <p className="font-black text-lg leading-tight">{selected.description}</p>
                <p className="text-sm text-gray-400 mt-0.5">{selected.category}</p>
              </div>
            </div>

            <div className={`text-center py-5 rounded-2xl border ${
              selected.type === 'income'
                ? 'bg-emerald-500/5 border-emerald-500/15'
                : 'bg-red-500/5 border-red-500/15'
            }`}>
              <p className={`text-4xl font-black ${selected.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                {selected.type === 'income' ? '+' : '-'}{fmt(selected.amount)}
              </p>
              <p className="text-xs text-gray-500 mt-1">{selected.type === 'income' ? 'Доход' : 'Расход'}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-[9px] text-gray-500 uppercase font-black mb-1">Дата</p>
                <p className="text-sm font-bold">
                  {new Date(selected.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-[9px] text-gray-500 uppercase font-black mb-1">Категория</p>
                <p className="text-sm font-bold">{selected.category}</p>
              </div>
            </div>

            <button
              onClick={() => { handleDelete(selected.id) }}
              className="w-full py-3 rounded-xl border border-red-500/20 text-red-400 text-sm font-bold
                hover:bg-red-500/10 spring-btn transition-all flex items-center justify-center gap-2"
            >
              <Trash2 size={14} /> Удалить транзакцию
            </button>
          </div>
        )}
      </Modal>

      {/* ─── Add modal ─── */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Новая транзакция" size="md">
        <div className="space-y-4">
          {/* Type toggle */}
          <div className="flex rounded-xl border border-white/10 overflow-hidden bg-white/5">
            {(['expense', 'income'] as const).map(t => (
              <button
                key={t}
                onClick={() => setForm(f => ({ ...f, type: t }))}
                className={`flex-1 py-3 text-sm font-black transition-all ${
                  form.type === t
                    ? t === 'income'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-red-500/20 text-red-400'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {t === 'income' ? '↑ Доход' : '↓ Расход'}
              </button>
            ))}
          </div>

          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-widest font-black block mb-1.5">Описание</label>
            <input
              type="text"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Например: Зарплата, ВкусВилл..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none input-glow"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-widest font-black block mb-1.5">Сумма ₽</label>
              <input
                type="number"
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                placeholder="0"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none input-glow"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-widest font-black block mb-1.5">Дата</label>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none input-glow"
                style={{ colorScheme: 'dark' }}
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-widest font-black block mb-2">Категория</label>
            <div className="flex flex-wrap gap-2">
              {addCategories.map(c => (
                <button
                  key={c}
                  onClick={() => setForm(f => ({ ...f, category: c }))}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all spring-btn ${
                    form.category === c
                      ? 'bg-cyan-400/15 text-cyan-400 border border-cyan-400/30'
                      : 'bg-white/5 text-gray-500 border border-white/5 hover:border-white/20 hover:text-gray-300'
                  }`}
                >
                  {catEmoji[c]} {c}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleAdd}
            disabled={!form.description || !form.amount || adding}
            className="w-full py-3.5 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-2xl font-black text-sm
              shadow-lg shadow-cyan-500/20 hover:scale-[1.02] spring-btn transition-all
              disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100
              flex items-center justify-center gap-2"
          >
            {adding
              ? <><Loader2 size={16} className="animate-spin" /> Сохранение...</>
              : <><Check size={16} /> Добавить транзакцию</>}
          </button>
        </div>
      </Modal>

      {/* ─── Import modal ─── */}
      <ImportModal open={showImport} onClose={() => setShowImport(false)} />

      {/* ─── Delete confirm ─── */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Удалить транзакцию?" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-400">
            Это действие необратимо. Транзакция будет удалена навсегда.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => deleteId && handleDelete(deleteId)}
              className="flex-1 py-3 rounded-xl bg-red-500/15 border border-red-500/25 text-red-400 font-bold text-sm hover:bg-red-500/25 spring-btn"
            >
              Удалить
            </button>
            <button
              onClick={() => setDeleteId(null)}
              className="flex-1 py-3 rounded-xl glass-card text-gray-400 font-bold text-sm spring-btn"
            >
              Отмена
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
