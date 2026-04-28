import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User, Bell, Shield, CreditCard, Zap, LayoutDashboard,
  Eye, EyeOff, GripVertical, ChevronRight, Check,
} from 'lucide-react'

interface Widget {
  id: string
  label: string
  desc: string
  enabled: boolean
}

const INITIAL_WIDGETS: Widget[] = [
  { id: 'balance',      label: 'Карточки баланса',      desc: 'Баланс, доходы, расходы, сбережения', enabled: true },
  { id: 'chart',        label: 'График динамики',        desc: 'Доходы vs расходы за 6 месяцев',       enabled: true },
  { id: 'transactions', label: 'Последние транзакции',   desc: 'Список 5 последних операций',           enabled: true },
  { id: 'ai_banner',    label: 'Рекомендация AI',        desc: 'Советы FinAI по сбережениям',           enabled: true },
  { id: 'budget_bar',   label: 'Лимит месяца',           desc: 'Прогресс бара расходов в боковой панели', enabled: true },
]

export default function SettingsPage() {
  const navigate = useNavigate()
  const [widgets, setWidgets] = useState<Widget[]>(INITIAL_WIDGETS)
  const [saved, setSaved] = useState(false)
  const [activeSection, setActiveSection] = useState<string | null>(null)

  const toggleWidget = (id: string) => {
    setWidgets((prev) => prev.map((w) => w.id === id ? { ...w, enabled: !w.enabled } : w))
  }

  const saveWidgets = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const menuItems = [
    { icon: User, label: 'Профиль', desc: 'Имя, email, аватар', color: 'text-cyan-400', bg: 'bg-cyan-400/10', href: '/profile' },
    { icon: Bell, label: 'Уведомления', desc: 'Push, email, SMS оповещения', color: 'text-purple-400', bg: 'bg-purple-400/10', href: '/notifications' },
    { icon: Shield, label: 'Безопасность', desc: 'Пароль, 2FA, сессии', color: 'text-emerald-400', bg: 'bg-emerald-400/10', href: null },
    { icon: CreditCard, label: 'Подписка', desc: 'Pro план, биллинг, история', color: 'text-yellow-400', bg: 'bg-yellow-400/10', href: '/subscription' },
  ]

  return (
    <div className="p-4 lg:p-8 relative overflow-x-hidden">
      <div className="particles-overlay pointer-events-none" />
      <div className="gradient-glow top-[-100px] right-[-100px] bg-cyan-500/10" style={{ animation: 'float-orb-1 25s ease-in-out infinite' }} />

      <div className="max-w-2xl mx-auto relative z-10 space-y-6">
        <header className="anim-in">
          <h1 className="text-3xl font-bold tracking-tight mb-1 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Настройки
          </h1>
          <p className="text-gray-400">Управление аккаунтом и предпочтениями</p>
        </header>

        {/* Menu items */}
        <div className="space-y-3">
          {menuItems.map(({ icon: Icon, label, desc, color, bg, href }, i) => (
            <div
              key={label}
              onClick={() => href ? navigate(href) : null}
              className={`glass-card p-5 rounded-3xl flex items-center gap-4 anim-in anim-in-${i + 1} ${href ? 'cursor-pointer hover:border-cyan-400/20 hover:bg-white/6' : 'opacity-60'} transition-all`}
            >
              <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center`}>
                <Icon size={22} className={color} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold">{label}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
              </div>
              {href ? (
                <ChevronRight size={18} className="text-gray-600" />
              ) : (
                <span className="text-[10px] text-gray-600 uppercase font-black">Скоро</span>
              )}
            </div>
          ))}
        </div>

        {/* Dashboard customization */}
        <div className="glass-card rounded-3xl p-6 anim-in anim-in-3">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setActiveSection(activeSection === 'dashboard' ? null : 'dashboard')}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-400/10 flex items-center justify-center">
                <LayoutDashboard size={22} className="text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold">Настройки дашборда</h3>
                <p className="text-xs text-gray-400 mt-0.5">Выбери какие виджеты отображать</p>
              </div>
            </div>
            <ChevronRight
              size={18}
              className={`text-gray-600 transition-transform duration-300 ${activeSection === 'dashboard' ? 'rotate-90' : ''}`}
            />
          </div>

          {activeSection === 'dashboard' && (
            <div className="mt-5 space-y-3 border-t border-white/5 pt-5">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black mb-3">Виджеты дашборда</p>
              {widgets.map((w) => (
                <div key={w.id} className="flex items-center gap-3 p-3 rounded-2xl bg-white/3 border border-white/5 group hover:bg-white/6 transition-all">
                  <GripVertical size={14} className="text-gray-600 cursor-grab" />
                  <div className="flex-1">
                    <p className={`text-sm font-bold ${w.enabled ? 'text-white' : 'text-gray-500'}`}>{w.label}</p>
                    <p className="text-[10px] text-gray-600">{w.desc}</p>
                  </div>
                  <button
                    onClick={() => toggleWidget(w.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all spring-btn ${
                      w.enabled
                        ? 'bg-cyan-400/15 text-cyan-400 border border-cyan-400/20'
                        : 'bg-white/5 text-gray-500 border border-white/10'
                    }`}
                  >
                    {w.enabled ? <><Eye size={10} /> Вкл</> : <><EyeOff size={10} /> Выкл</>}
                  </button>
                </div>
              ))}
              <button
                onClick={saveWidgets}
                className="mt-2 w-full py-3 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg shadow-cyan-500/20 hover:scale-[1.02] spring-btn flex items-center justify-center gap-2"
              >
                {saved ? <><Check size={14} /> Сохранено!</> : 'Применить изменения'}
              </button>
            </div>
          )}
        </div>

        {/* Pro upgrade banner */}
        <div className="glass-card p-6 rounded-3xl anim-in anim-in-5 bg-gradient-to-br from-cyan-400/5 to-purple-500/5 border border-cyan-400/20">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-400 to-purple-500 flex items-center justify-center">
              <Zap className="text-white" size={22} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold mb-1">Обновись до Pro</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Безлимитный AI-ассистент, аналитика за 12 месяцев, экспорт отчётов и приоритетная поддержка.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/subscription')}
            className="mt-4 w-full py-3 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-cyan-500/20 hover:scale-[1.02] spring-btn"
          >
            Попробовать Pro — 990 ₽/мес
          </button>
        </div>
      </div>
    </div>
  )
}
