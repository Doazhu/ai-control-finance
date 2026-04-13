import { useState } from 'react'
import { Card, Badge } from '@tremor/react'
import { motion } from 'framer-motion'
import { Search, TrendingUp, TrendingDown } from 'lucide-react'
import { useTransactionStore } from '../store/useTransactionStore'
import clsx from 'clsx'

const categories = ['Все', 'Зарплата', 'Фриланс', 'Жильё', 'Продукты', 'Транспорт', 'Здоровье', 'Подписки', 'Еда вне дома', 'Прочее']

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
}
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
}

export default function TransactionsPage() {
  const { transactions } = useTransactionStore()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Все')
  const [type, setType] = useState<'all' | 'income' | 'expense'>('all')

  const fmt = (n: number) =>
    new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(n)

  const filtered = transactions.filter((t) => {
    const matchSearch = t.description.toLowerCase().includes(search.toLowerCase())
    const matchCat = category === 'Все' || t.category === category
    const matchType = type === 'all' || t.type === type
    return matchSearch && matchCat && matchType
  })

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Транзакции</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{filtered.length} записей</p>
      </motion.div>

      {/* Filters */}
      <motion.div variants={item}>
        <Card className="dark:bg-slate-900 dark:ring-slate-800">
          <div className="flex flex-wrap gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-48">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Поиск..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700
                  bg-slate-50 dark:bg-slate-800
                  pl-9 pr-3 py-2 text-sm text-slate-900 dark:text-slate-100
                  placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            {/* Type filter */}
            <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
              {(['all', 'income', 'expense'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={clsx(
                    'px-3 py-2 text-xs font-medium transition-colors',
                    type === t
                      ? 'bg-violet-600 text-white'
                      : 'bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  )}
                >
                  {t === 'all' ? 'Все' : t === 'income' ? 'Доходы' : 'Расходы'}
                </button>
              ))}
            </div>
          </div>

          {/* Category chips */}
          <div className="mt-3 flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={clsx(
                  'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                  category === c
                    ? 'bg-violet-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Table */}
      <motion.div variants={item}>
        <Card className="dark:bg-slate-900 dark:ring-slate-800 p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Описание
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Категория
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Дата
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Сумма
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((t, i) => (
                  <motion.tr
                    key={t.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.25 }}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className={clsx(
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                          t.type === 'income' ? 'bg-emerald-100 dark:bg-emerald-500/15' : 'bg-rose-100 dark:bg-rose-500/15'
                        )}>
                          {t.type === 'income'
                            ? <TrendingUp size={13} className="text-emerald-600 dark:text-emerald-400" />
                            : <TrendingDown size={13} className="text-rose-600 dark:text-rose-400" />
                          }
                        </div>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{t.description}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge color="violet" size="xs">{t.category}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">{t.date}</td>
                    <td className={clsx(
                      'px-5 py-3.5 text-right font-semibold',
                      t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    )}>
                      {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="py-16 text-center text-slate-400 dark:text-slate-600">
                Транзакции не найдены
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}
