import { useState, useRef, useEffect, FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Send, Trash2, Sparkles, Zap, TrendingUp, ShieldCheck } from 'lucide-react'
import { useChatStore } from '../store/useChatStore'
import { useAuthStore } from '../store/useAuthStore'
import { ChatMessage } from '../types'

const SUGGESTIONS = [
  'Сколько я потратил в этом месяце?',
  'Какая категория самая затратная?',
  'Как улучшить норму сбережений?',
  'Прогноз трат на следующий месяц',
]

async function callBackend(
  question: string,
  token: string,
  onChunk: (text: string, done: boolean) => void
) {
  try {
    const res = await fetch('/api/v1/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message: question }),
    })
    if (!res.ok) {
      const errText = await res.text().catch(() => 'Ошибка сервера')
      throw new Error(errText.trim() || 'Ошибка сервера')
    }
    // Backend streams SSE: "data: {text}\n\n" lines, ends with "data: [DONE]\n\n"
    const text = await res.text()
    const reply = text
      .split('\n')
      .filter(line => line.startsWith('data: ') && !line.includes('[DONE]'))
      .map(line => line.slice(6).trim())
      .join('')
    // Simulate streaming char by char for visual effect
    let buf = ''
    for (const ch of reply) {
      await new Promise((r) => setTimeout(r, 12))
      buf += ch
      onChunk(buf, false)
    }
    onChunk(buf, true)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Ошибка сети'
    onChunk(`⚠️ ${msg}`, true)
  }
}

export default function ChatPage() {
  const { messages, isLoading, addMessage, updateLastMessage, setLoading, clear } = useChatStore()
  const token = useAuthStore((s) => s.token) ?? ''
  const [input, setInput] = useState('')
  const bottomRef  = useRef<HTMLDivElement>(null)
  const inputRef   = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (text?: string) => {
    const q = (text ?? input).trim()
    if (!q || isLoading) return
    setInput('')

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: q,
      timestamp: new Date(),
    }
    addMessage(userMsg)

    const assistantMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    }
    addMessage(assistantMsg)
    setLoading(true)

    await callBackend(q, token, (content, done) => {
      updateLastMessage(content, done)
      if (done) setLoading(false)
    })
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    send()
  }

  const isEmpty = messages.length === 0

  const fmt = (d: Date) =>
    d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="flex h-screen bg-[#080b14] overflow-hidden">
      {/* Main chat area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Ambient */}
        <div className="particles-overlay pointer-events-none" />
        <div
          className="gradient-glow top-[-100px] right-[-100px] bg-cyan-500/10"
          style={{ animation: 'float-orb-1 25s ease-in-out infinite, pulse-glow 10s ease-in-out infinite' }}
        />
        <div
          className="gradient-glow bottom-[10%] left-[5%] bg-purple-600/10"
          style={{ animation: 'float-orb-2 30s ease-in-out infinite' }}
        />

        {/* Header */}
        <header className="flex justify-between items-center px-8 py-6 border-b border-white/5 anim-in relative z-10">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                FinAI Ассистент
              </h1>
              <p className="text-xs text-emerald-400 flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                Онлайн · На базе Gemini
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!isEmpty && (
              <button
                onClick={clear}
                className="px-4 py-2 glass-card rounded-xl text-xs font-bold hover:text-red-400 spring-btn"
              >
                <Trash2 size={14} className="inline mr-1" />
                Очистить
              </button>
            )}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-cyan-600 p-0.5 shadow-lg">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                alt="Avatar"
                className="w-full h-full rounded-full bg-[#080b14]"
              />
            </div>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-8 py-8 space-y-6 relative z-10">
          {/* Empty state */}
          {isEmpty && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full gap-6 text-center"
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-400 to-purple-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <Sparkles className="text-white" size={32} />
              </div>
              <div>
                <p className="text-xl font-bold mb-2">Задай вопрос о своих финансах</p>
                <p className="text-gray-400 text-sm max-w-sm">
                  Анализ расходов, советы по бюджету, прогнозы — AI видит все твои транзакции
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setInput(s); inputRef.current?.focus() }}
                    className="glass-card rounded-full px-4 py-2 text-xs font-bold hover:text-cyan-400 hover:border-cyan-400/30 spring-btn"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Message list */}
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex gap-4 max-w-3xl ${msg.role === 'user' ? 'flex-row-reverse ml-auto' : ''}`}
              >
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${
                  msg.role === 'assistant'
                    ? 'bg-gradient-to-tr from-cyan-400 to-purple-500 shadow-lg shadow-cyan-500/20'
                    : 'bg-white/5 border border-white/10'
                }`}>
                  {msg.role === 'assistant'
                    ? <Sparkles className="text-white" size={18} />
                    : <span className="text-sm">👤</span>
                  }
                </div>

                {/* Bubble */}
                <div className="space-y-1">
                  <div className={`p-5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'assistant'
                      ? 'glass-card !hover:transform-none rounded-tl-none border-l-2 border-l-cyan-400'
                      : 'bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 backdrop-blur-md border border-white/10 rounded-tr-none'
                  }`}>
                    {msg.content}
                    {msg.isStreaming && (
                      <span className="ml-1 inline-flex gap-0.5 align-middle">
                        <span className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce [animation-delay:0ms]" />
                        <span className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce [animation-delay:150ms]" />
                        <span className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce [animation-delay:300ms]" />
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-500 font-bold px-1">
                    {fmt(msg.timestamp)}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="px-8 pb-8 relative z-10">
          {/* Quick action chips */}
          {isEmpty && (
            <div className="flex gap-2 mb-4 flex-wrap">
              {['Прогноз на месяц', 'Оптимизация трат', 'Советы по сбережениям'].map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="px-4 py-2 glass-card rounded-full text-[10px] font-black tracking-wider uppercase hover:text-cyan-400 spring-btn"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Rotating border input */}
          <form onSubmit={onSubmit}>
            <div className="rotating-border">
              <div className="relative bg-[#0a0f1d] rounded-[1.4rem] p-2 flex items-center gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Задай вопрос ИИ о своих финансах..."
                  disabled={isLoading}
                  className="flex-1 bg-transparent border-none py-3 px-2 text-sm focus:outline-none placeholder:text-gray-600 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-400 to-purple-500 text-white flex items-center justify-center shadow-lg shadow-cyan-500/40 hover:scale-110 spring-btn disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
            <p className="mt-2 text-[10px] text-gray-600 text-center">
              Enter — отправить · FinAI видит твои транзакции в реальном времени
            </p>
          </form>
        </div>
      </main>

      {/* Right sidebar — Insights */}
      <aside className="w-80 border-l border-white/10 hidden xl:flex flex-col bg-[#0a0f1d] sticky top-0 h-screen">
        <div className="p-6 border-b border-white/10">
          <h3 className="font-bold flex items-center gap-2">
            <Zap size={16} className="text-purple-500" />
            Инсайты
          </h3>
        </div>

        <div className="flex-1 p-6 space-y-8 overflow-y-auto">
          {/* Portfolio analysis */}
          <div className="space-y-3 anim-in">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Анализ финансов</p>
            <div className="glass-card p-4 rounded-2xl border-l-2 border-l-emerald-400">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-xs font-bold">Финансовое здоровье</h4>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">Хорошее</span>
              </div>
              <p className="text-[10px] text-gray-400 leading-relaxed">
                Норма сбережений: 27%. Расходы стабильны. Рекомендуется увеличить инвестиционную долю.
              </p>
            </div>
          </div>

          {/* AI recommendations */}
          <div className="space-y-3 anim-in anim-in-1">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Рекомендации ИИ</p>
            <div className="space-y-3">
              <div className="glass-card p-3 rounded-2xl cursor-pointer hover:border-cyan-400/50 transition-all spring-btn">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-400/10 flex items-center justify-center text-cyan-400">
                    <TrendingUp size={14} />
                  </div>
                  <div>
                    <h5 className="text-[10px] font-bold">Инвест-копилка</h5>
                    <p className="text-[9px] text-gray-500">Повысить ROI на 2.1%</p>
                  </div>
                </div>
              </div>
              <div className="glass-card p-3 rounded-2xl cursor-pointer hover:border-purple-500/50 transition-all spring-btn">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                    <ShieldCheck size={14} />
                  </div>
                  <div>
                    <h5 className="text-[10px] font-bold">Налоговый вычет</h5>
                    <p className="text-[9px] text-gray-500">Возврат до 52 000 ₽</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pro upsell */}
          <div className="glass-card p-5 rounded-3xl bg-gradient-to-br from-cyan-400/5 to-purple-500/5 anim-in anim-in-2">
            <h4 className="text-xs font-bold mb-2 flex items-center gap-2">
              <Zap size={12} className="text-yellow-400" />
              Переходи на Pro
            </h4>
            <p className="text-[10px] text-gray-400 mb-4 leading-relaxed">
              Получи доступ к глубокому анализу ИИ и прогнозам на 12 месяцев.
            </p>
            <button className="block w-full py-2 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-xl text-[10px] font-bold text-center hover:scale-105 transition-transform shadow-lg spring-btn">
              Подробнее
            </button>
          </div>
        </div>
      </aside>
    </div>
  )
}
