import { useState } from 'react'
import { Bell, TrendingUp, AlertCircle, Sparkles, CheckCheck, Trash2, Check } from 'lucide-react'

interface Notif {
  id: string
  type: 'ai' | 'alert' | 'income' | 'system'
  title: string
  body: string
  time: string
  read: boolean
}

const INITIAL: Notif[] = [
  { id: '1', type: 'ai',     title: 'FinAI рекомендует',       body: 'Ты тратишь на 23% больше на еду по сравнению с прошлым месяцем. Разбери подробнее?', time: '2 мин назад',   read: false },
  { id: '2', type: 'alert',  title: 'Лимит близок',            body: 'Категория «Подписки» достигла 87% месячного лимита. Осталось 1 200 ₽.',              time: '15 мин назад',  read: false },
  { id: '3', type: 'income', title: 'Пополнение счёта',        body: 'Зачислено 120 000 ₽ — Зарплата. Баланс: 145 320 ₽.',                               time: '1 час назад',   read: false },
  { id: '4', type: 'ai',     title: 'Анализ недели готов',     body: 'Сбережения выросли на 4% относительно цели. Хочешь посмотреть отчёт?',               time: '3 часа назад',  read: true },
  { id: '5', type: 'system', title: 'Обновление безопасности', body: 'Ваш аккаунт использует двухфакторную аутентификацию. Всё в порядке.',               time: 'Вчера',         read: true },
  { id: '6', type: 'income', title: 'Кэшбэк начислен',        body: 'Получен кэшбэк 840 ₽ за операции прошлого месяца.',                                  time: 'Вчера',         read: true },
  { id: '7', type: 'alert',  title: 'Необычная трата',         body: 'Операция на 15 000 ₽ в категории «Прочее» — это ты?',                               time: '2 дня назад',   read: true },
]

const typeConfig = {
  ai:     { icon: Sparkles,     color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-l-purple-400' },
  alert:  { icon: AlertCircle,  color: 'text-red-400',    bg: 'bg-red-400/10',    border: 'border-l-red-400' },
  income: { icon: TrendingUp,   color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-l-emerald-400' },
  system: { icon: Bell,         color: 'text-cyan-400',   bg: 'bg-cyan-400/10',   border: 'border-l-cyan-400' },
}

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notif[]>(INITIAL)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const markAll = () => setNotifs((n) => n.map((x) => ({ ...x, read: true })))
  const markOne = (id: string) => setNotifs((n) => n.map((x) => x.id === id ? { ...x, read: true } : x))
  const deleteOne = (id: string) => setNotifs((n) => n.filter((x) => x.id !== id))
  const clearAll = () => setNotifs([])

  const displayed = filter === 'unread' ? notifs.filter((n) => !n.read) : notifs
  const unreadCount = notifs.filter((n) => !n.read).length

  return (
    <div className="p-4 lg:p-8 relative overflow-x-hidden">
      <div className="particles-overlay pointer-events-none" />
      <div className="gradient-glow top-[-100px] right-[-100px] bg-cyan-500/10" style={{ animation: 'float-orb-1 25s ease-in-out infinite' }} />

      <div className="max-w-2xl mx-auto relative z-10 space-y-6">
        {/* Header */}
        <header className="flex justify-between items-center anim-in">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Уведомления
            </h1>
            <p className="text-gray-400 mt-1">
              {unreadCount > 0 ? (
                <><span className="text-cyan-400 font-bold">{unreadCount}</span> непрочитанных</>
              ) : (
                'Всё прочитано'
              )}
            </p>
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button onClick={markAll} className="flex items-center gap-1.5 px-4 py-2 glass-card rounded-xl text-xs font-bold hover:text-emerald-400 spring-btn">
                <CheckCheck size={14} /> Прочитать все
              </button>
            )}
            {notifs.length > 0 && (
              <button onClick={clearAll} className="flex items-center gap-1.5 px-4 py-2 glass-card rounded-xl text-xs font-bold hover:text-red-400 spring-btn">
                <Trash2 size={14} /> Очистить
              </button>
            )}
          </div>
        </header>

        {/* Filter tabs */}
        <div className="flex rounded-2xl border border-white/10 overflow-hidden bg-white/5 self-start anim-in anim-in-1 w-fit">
          {(['all', 'unread'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2.5 text-xs font-black uppercase tracking-wider transition-all ${
                filter === f
                  ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {f === 'all' ? 'Все' : 'Непрочитанные'}
              {f === 'unread' && unreadCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-white/20 rounded-full text-[9px]">{unreadCount}</span>
              )}
            </button>
          ))}
        </div>

        {/* List */}
        {displayed.length === 0 ? (
          <div className="glass-card rounded-3xl p-16 text-center anim-in anim-in-2">
            <Bell size={40} className="text-gray-600 mx-auto mb-4" />
            <p className="font-bold text-gray-400">Уведомлений нет</p>
            <p className="text-sm text-gray-600 mt-1">Мы сообщим о важных событиях</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayed.map((n, i) => {
              const cfg = typeConfig[n.type]
              const Icon = cfg.icon
              return (
                <div
                  key={n.id}
                  className={`glass-card rounded-2xl p-4 flex gap-4 group anim-in border-l-2 ${cfg.border} ${
                    !n.read ? 'bg-white/5' : ''
                  }`}
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0`}>
                    <Icon size={18} className={cfg.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-bold leading-tight ${!n.read ? 'text-white' : 'text-gray-300'}`}>
                        {n.title}
                        {!n.read && <span className="ml-2 inline-block w-1.5 h-1.5 bg-cyan-400 rounded-full align-middle" />}
                      </p>
                      <span className="text-[10px] text-gray-600 whitespace-nowrap font-bold">{n.time}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">{n.body}</p>
                  </div>
                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!n.read && (
                      <button onClick={() => markOne(n.id)} className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/20 spring-btn">
                        <Check size={12} />
                      </button>
                    )}
                    <button onClick={() => deleteOne(n.id)} className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 hover:bg-red-500/20 spring-btn">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Settings tip */}
        <div className="glass-card rounded-2xl p-4 flex items-center gap-3 anim-in anim-in-4 border-l-2 border-l-cyan-400">
          <Bell size={16} className="text-cyan-400 shrink-0" />
          <p className="text-xs text-gray-400">
            Настрой какие уведомления получать в{' '}
            <a href="/settings" className="text-cyan-400 font-bold hover:underline">Настройках → Уведомления</a>
          </p>
        </div>
      </div>
    </div>
  )
}
