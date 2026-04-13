import { Card, AreaChart, DonutChart, Title, Text } from '@tremor/react'
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTransactionStore } from '../store/useTransactionStore'
import { balanceHistory, expensesByCategory } from '../data/mockData'
import clsx from 'clsx'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
}
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
}: {
  label: string
  value: string
  sub: string
  icon: React.ElementType
  color: string
}) {
  return (
    <motion.div variants={item}>
      <Card className="dark:bg-slate-900 dark:ring-slate-800">
        <div className="flex items-start justify-between">
          <div>
            <Text className="dark:text-slate-400">{label}</Text>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">{sub}</p>
          </div>
          <div className={clsx('flex h-10 w-10 items-center justify-center rounded-xl', color)}>
            <Icon size={20} className="text-white" />
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

export default function DashboardPage() {
  const { transactions } = useTransactionStore()

  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0)

  const expenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0)

  const balance = income - expenses
  const savingsRate = income > 0 ? Math.round(((income - expenses) / income) * 100) : 0

  const fmt = (n: number) =>
    new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(n)

  const recent = transactions.slice(0, 5)

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Дашборд</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Апрель 2026</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Баланс" value={fmt(balance)} sub="Текущий месяц" icon={Wallet} color="bg-violet-600" />
        <StatCard label="Доходы" value={fmt(income)} sub="+12% к прошлому месяцу" icon={TrendingUp} color="bg-emerald-500" />
        <StatCard label="Расходы" value={fmt(expenses)} sub="-3% к прошлому месяцу" icon={TrendingDown} color="bg-rose-500" />
        <StatCard label="Норма сбережений" value={`${savingsRate}%`} sub="Цель: 30%" icon={PiggyBank} color="bg-blue-500" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <motion.div variants={item} className="xl:col-span-2">
          <Card className="dark:bg-slate-900 dark:ring-slate-800">
            <Title className="dark:text-white">Баланс за 6 месяцев</Title>
            <AreaChart
              className="mt-4 h-52"
              data={balanceHistory}
              index="date"
              categories={['balance']}
              colors={['violet']}
              valueFormatter={(v) => fmt(v)}
              showLegend={false}
              showGridLines={false}
            />
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="dark:bg-slate-900 dark:ring-slate-800">
            <Title className="dark:text-white">Расходы по категориям</Title>
            <DonutChart
              className="mt-4 h-52"
              data={expensesByCategory.filter((c) => c.amount > 0)}
              category="amount"
              index="name"
              colors={['violet', 'blue', 'cyan', 'emerald', 'amber', 'rose']}
              valueFormatter={(v) => fmt(v)}
              showLabel={false}
            />
          </Card>
        </motion.div>
      </div>

      {/* Recent transactions */}
      <motion.div variants={item}>
        <Card className="dark:bg-slate-900 dark:ring-slate-800">
          <Title className="dark:text-white">Последние транзакции</Title>
          <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
            {recent.map((t) => (
              <div key={t.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{t.description}</p>
                  <p className="text-xs text-slate-400">{t.category} · {t.date}</p>
                </div>
                <span
                  className={clsx(
                    'text-sm font-semibold',
                    t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'
                  )}
                >
                  {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}
