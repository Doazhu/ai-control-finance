import { NavLink, useNavigate } from 'react-router-dom'
import {
  Zap, LayoutDashboard, ArrowUpDown, MessageSquare,
  LogOut, Settings, User, Bell, Search, PieChart, CreditCard,
} from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'

const navItems = [
  { to: '/',              icon: LayoutDashboard, label: 'Дашборд' },
  { to: '/transactions',  icon: ArrowUpDown,      label: 'Транзакции' },
  { to: '/budget',        icon: PieChart,         label: 'Бюджет' },
  { to: '/chat',          icon: MessageSquare,    label: 'AI Ассистент' },
  { to: '/search',        icon: Search,           label: 'Поиск' },
]

const secondaryItems = [
  { to: '/profile',       icon: User,             label: 'Профиль' },
  { to: '/notifications', icon: Bell,             label: 'Уведомления' },
  { to: '/subscription',  icon: CreditCard,       label: 'Подписка' },
  { to: '/settings',      icon: Settings,         label: 'Настройки' },
]

export default function Sidebar() {
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 spring-btn ${
      isActive
        ? 'sidebar-active'
        : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
    }`

  return (
    <aside className="w-64 border-r border-white/10 hidden lg:flex flex-col sticky top-0 h-screen z-50 bg-[#080b14] shrink-0">
      {/* Logo */}
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-tr from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Zap className="text-white" size={20} />
        </div>
        <span className="text-xl font-extrabold tracking-tight font-heading">FinAI</span>
      </div>

      {/* Primary nav */}
      <nav className="px-4 space-y-1">
        <p className="px-4 mb-2 text-[9px] font-black text-gray-600 uppercase tracking-widest">Основное</p>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'} className={linkClass}>
            {({ isActive }) => (
              <>
                <Icon size={20} className={isActive ? 'text-cyan-400' : ''} />
                <span className="font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Secondary nav */}
      <nav className="px-4 space-y-1 mt-4">
        <p className="px-4 mb-2 text-[9px] font-black text-gray-600 uppercase tracking-widest">Аккаунт</p>
        {secondaryItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={linkClass}>
            {({ isActive }) => (
              <>
                <Icon size={20} className={isActive ? 'text-cyan-400' : ''} />
                <span className="font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="flex-1" />

      {/* Budget limit mini-card */}
      <div className="px-6 pb-4">
        <div className="glass-card p-4 rounded-2xl group !transition-all">
          <p className="text-sm text-gray-400 mb-2 group-hover:text-gray-200 transition-colors">Лимит за месяц</p>
          <div className="flex justify-between items-end mb-1">
            <span className="text-lg font-bold text-cyan-400">72%</span>
            <span className="text-xs text-gray-500">45k / 60k ₽</span>
          </div>
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 w-[72%] transition-all duration-1000 ease-out" />
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="px-4 pb-6 border-t border-white/10 pt-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/5 transition-all duration-300 spring-btn"
        >
          <LogOut size={20} />
          <span className="font-medium">Выйти</span>
        </button>
      </div>
    </aside>
  )
}
