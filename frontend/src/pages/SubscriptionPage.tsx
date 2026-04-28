import { useState } from 'react'
import { Check, Zap, Star, Crown, CreditCard, Calendar, ChevronRight } from 'lucide-react'

const plans = [
  {
    id: 'free',
    name: 'Базовый',
    price: 0,
    period: 'навсегда',
    icon: Star,
    color: 'text-gray-400',
    bg: 'bg-gray-400/10',
    border: 'border-white/10',
    current: false,
    features: [
      'До 50 транзакций в месяц',
      'Базовая аналитика',
      '1 счёт',
      '3 категории бюджета',
      'История за 1 месяц',
    ],
    missing: [
      'AI-ассистент',
      'Экспорт отчётов',
      'Уведомления',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 990,
    period: 'месяц',
    icon: Zap,
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10',
    border: 'border-cyan-400/30',
    current: true,
    highlight: true,
    features: [
      'Неограниченные транзакции',
      'Полная аналитика + прогнозы',
      'До 10 счётов',
      'Неограниченные категории',
      'История за 12 месяцев',
      'AI-ассистент (100 запросов/мес)',
      'Экспорт в PDF/Excel',
      'Push и email уведомления',
    ],
    missing: [],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 1990,
    period: 'месяц',
    icon: Crown,
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    border: 'border-yellow-400/20',
    current: false,
    features: [
      'Всё из Pro',
      'Безлимитный AI-ассистент',
      'Инвестиционный портфель',
      'Налоговые отчёты',
      'Приоритетная поддержка 24/7',
      'Персональный финансовый план',
      'API доступ',
      'Семейный аккаунт (до 5 человек)',
    ],
    missing: [],
  },
]

const billing = [
  { id: 'b1', date: '01 апр 2026', amount: 990,  status: 'paid',   plan: 'Pro' },
  { id: 'b2', date: '01 мар 2026', amount: 990,  status: 'paid',   plan: 'Pro' },
  { id: 'b3', date: '01 фев 2026', amount: 990,  status: 'paid',   plan: 'Pro' },
  { id: 'b4', date: '01 янв 2026', amount: 990,  status: 'paid',   plan: 'Pro' },
]

export default function SubscriptionPage() {
  const [annual, setAnnual] = useState(false)
  const fmt = (n: number) =>
    new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(n)

  return (
    <div className="p-4 lg:p-8 relative overflow-x-hidden">
      <div className="particles-overlay pointer-events-none" />
      <div className="gradient-glow top-[-100px] right-[-100px] bg-cyan-500/10" style={{ animation: 'float-orb-1 25s ease-in-out infinite' }} />
      <div className="gradient-glow bottom-[10%] left-[5%] bg-purple-600/10" style={{ animation: 'float-orb-2 30s ease-in-out infinite' }} />

      <div className="max-w-5xl mx-auto relative z-10 space-y-8">
        {/* Header */}
        <header className="anim-in">
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Управление подпиской
          </h1>
          <p className="text-gray-400 mt-1">Выбирай тариф, который подходит твоему стилю жизни</p>
        </header>

        {/* Current plan banner */}
        <div className="rotating-border anim-in anim-in-1">
          <div className="bg-[#0a0f1d] rounded-[1.4rem] p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-400 to-purple-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Zap className="text-white" size={22} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Текущий план</p>
                <h2 className="text-xl font-black">Pro Аккаунт</h2>
                <p className="text-xs text-gray-400 mt-0.5">Следующее списание <span className="text-cyan-400 font-bold">01 мая 2026</span> — 990 ₽</p>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-2xl font-black text-cyan-400">990 ₽</p>
              <p className="text-xs text-gray-500">в месяц</p>
            </div>
          </div>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-4 anim-in anim-in-2">
          <span className={`text-sm font-bold ${!annual ? 'text-white' : 'text-gray-500'}`}>Ежемесячно</span>
          <button
            onClick={() => setAnnual(!annual)}
            className={`relative w-14 h-7 rounded-full transition-all duration-300 ${annual ? 'bg-cyan-400/30' : 'bg-white/10'}`}
          >
            <div className={`absolute top-1 w-5 h-5 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-500 transition-all duration-300 shadow-lg ${annual ? 'left-8' : 'left-1'}`} />
          </button>
          <span className={`text-sm font-bold ${annual ? 'text-white' : 'text-gray-500'}`}>
            Ежегодно
            <span className="ml-2 px-2 py-0.5 bg-emerald-400/15 text-emerald-400 text-[9px] font-black uppercase rounded-full">−20%</span>
          </span>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 anim-in anim-in-2">
          {plans.map((plan) => {
            const Icon = plan.icon
            const price = annual && plan.price > 0 ? Math.round(plan.price * 0.8) : plan.price
            return (
              <div
                key={plan.id}
                className={`glass-card rounded-3xl overflow-hidden border relative ${plan.border} ${plan.highlight ? 'ring-2 ring-cyan-400/30 shadow-2xl shadow-cyan-500/10' : ''}`}
              >
                {plan.highlight && (
                  <div className="h-0.5 w-full bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-400" />
                )}
                {plan.current && (
                  <div className="absolute top-4 right-4 px-2.5 py-1 bg-cyan-400/15 border border-cyan-400/30 rounded-full text-[9px] font-black text-cyan-400 uppercase tracking-wider">
                    Активен
                  </div>
                )}
                <div className="p-6">
                  <div className={`w-12 h-12 rounded-2xl ${plan.bg} flex items-center justify-center mb-4`}>
                    <Icon size={22} className={plan.color} />
                  </div>
                  <h3 className="text-xl font-black mb-1">{plan.name}</h3>
                  <div className="flex items-end gap-1 mb-5">
                    <span className="text-3xl font-black">
                      {plan.price === 0 ? '0' : fmt(price).replace(' ₽', '')}
                    </span>
                    <span className="text-gray-500 text-sm mb-1">₽ / {plan.period}</span>
                  </div>
                  <div className="space-y-2.5 mb-6">
                    {plan.features.map((f) => (
                      <div key={f} className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded-full bg-emerald-400/20 flex items-center justify-center shrink-0 mt-0.5">
                          <Check size={10} className="text-emerald-400" />
                        </div>
                        <span className="text-xs text-gray-300">{f}</span>
                      </div>
                    ))}
                    {plan.missing.map((f) => (
                      <div key={f} className="flex items-start gap-2 opacity-40">
                        <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-[8px] text-gray-500">—</span>
                        </div>
                        <span className="text-xs text-gray-500 line-through">{f}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    className={`w-full py-3 rounded-2xl font-black text-sm uppercase tracking-wider transition-all spring-btn ${
                      plan.current
                        ? 'bg-white/5 border border-white/10 text-gray-400 cursor-default'
                        : plan.highlight
                        ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-white shadow-lg shadow-cyan-500/20 hover:scale-[1.02]'
                        : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-400/30'
                    }`}
                  >
                    {plan.current ? 'Текущий план' : `Перейти на ${plan.name}`}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Payment method */}
        <div className="glass-card rounded-3xl p-6 anim-in anim-in-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Способ оплаты</h3>
            <button className="text-xs font-bold text-cyan-400 hover:text-cyan-300 spring-btn">+ Добавить карту</button>
          </div>
          <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/8">
            <div className="w-12 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center">
              <CreditCard size={14} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold">•••• •••• •••• 4242</p>
              <p className="text-xs text-gray-500">Visa · Истекает 12/27</p>
            </div>
            <div className="px-2.5 py-1 bg-emerald-400/10 rounded-full text-[9px] text-emerald-400 font-black uppercase">
              Основная
            </div>
          </div>
        </div>

        {/* Billing history */}
        <div className="glass-card rounded-3xl p-6 anim-in anim-in-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">История платежей</h3>
            <button className="text-xs font-bold text-gray-500 hover:text-cyan-400 spring-btn flex items-center gap-1">
              Скачать все <ChevronRight size={12} />
            </button>
          </div>
          <div className="space-y-3">
            {billing.map((b) => (
              <div key={b.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/8 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-400/10 flex items-center justify-center">
                    <Calendar size={15} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{b.plan} подписка</p>
                    <p className="text-xs text-gray-500">{b.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold">{fmt(b.amount)}</span>
                  <span className="px-2.5 py-1 bg-emerald-400/10 rounded-full text-[9px] text-emerald-400 font-black uppercase">
                    Оплачен
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cancel subscription */}
        <div className="glass-card rounded-3xl p-6 anim-in anim-in-5 border border-red-500/10">
          <h3 className="font-bold text-sm text-gray-400 uppercase tracking-wider mb-3">Управление подпиской</h3>
          <p className="text-xs text-gray-500 mb-4 leading-relaxed">
            Отмена произойдёт в конце текущего периода (01 мая 2026). До этого момента все функции Pro остаются доступными.
          </p>
          <button className="py-3 px-6 rounded-2xl border border-red-500/20 text-red-400 text-sm font-bold hover:bg-red-500/10 spring-btn transition-all">
            Отменить подписку
          </button>
        </div>
      </div>
    </div>
  )
}
