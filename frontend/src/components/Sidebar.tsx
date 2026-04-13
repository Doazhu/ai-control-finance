import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ArrowLeftRight, Bot, Settings, Wallet, Sun, Moon } from 'lucide-react'
import { motion } from 'framer-motion'
import { useThemeStore } from '../store/useThemeStore'
import clsx from 'clsx'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Дашборд' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Транзакции' },
  { to: '/chat', icon: Bot, label: 'AI Чат' },
  { to: '/settings', icon: Settings, label: 'Настройки' },
]

export default function Sidebar() {
  const { theme, toggle } = useThemeStore()

  return (
    <aside className="fixed left-0 top-0 h-full w-60 flex flex-col
      bg-white dark:bg-slate-900
      border-r border-slate-200 dark:border-slate-800
      z-40">

      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600">
          <Wallet size={18} className="text-white" />
        </div>
        <span className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">
          Finance AI
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-violet-50 text-violet-700 dark:bg-violet-600/15 dark:text-violet-400'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} className={isActive ? 'text-violet-600 dark:text-violet-400' : ''} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Theme toggle */}
      <div className="px-3 py-4 border-t border-slate-200 dark:border-slate-800">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={toggle}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium
            text-slate-600 dark:text-slate-400
            hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {theme === 'dark' ? (
            <>
              <Sun size={18} />
              Светлая тема
            </>
          ) : (
            <>
              <Moon size={18} />
              Тёмная тема
            </>
          )}
        </motion.button>
      </div>
    </aside>
  )
}
