import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, Trash2, Sparkles } from 'lucide-react'
import { useChatStore } from '../store/useChatStore'
import { useTransactionStore } from '../store/useTransactionStore'
import { ChatMessage } from '../types'
import clsx from 'clsx'

// TODO: заменить на реальный SSE-стриминг от бэкенда
async function mockStream(
  userText: string,
  updateFn: (text: string, done: boolean) => void
) {
  const responses: Record<string, string> = {
    default:
      'Проанализировал твои финансы за апрель. Основная статья расходов — жильё (35 000 ₽, ~65% расходов). ' +
      'Норма сбережений составляет около 27%, что близко к цели в 30%. ' +
      'Рекомендую сократить расходы на еду вне дома — сейчас это 3 800 ₽, ' +
      'что при регулярности может дать ещё 2-3% к норме сбережений.',
  }

  const text = responses.default
  let accumulated = ''

  for (const char of text) {
    await new Promise((r) => setTimeout(r, 18))
    accumulated += char
    updateFn(accumulated, false)
  }
  updateFn(accumulated, true)
}

export default function ChatPage() {
  const { messages, isLoading, addMessage, updateLastMessage, setLoading, clear } = useChatStore()
  const { transactions } = useTransactionStore()
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    const text = input.trim()
    if (!text || isLoading) return

    setInput('')

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
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

    // TODO: реальный запрос — POST /api/chat с SSE-ответом
    // const es = new EventSource(`/api/chat?q=${encodeURIComponent(text)}`)
    // es.onmessage = (e) => updateLastMessage(e.data, false)
    // es.onerror = () => { updateLastMessage(buffer, true); es.close(); setLoading(false) }
    await mockStream(text, (content, done) => {
      updateLastMessage(content, done)
      if (done) setLoading(false)
    })
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const isEmpty = messages.length === 0

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">AI Ассистент</h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            {transactions.length} транзакций в контексте
          </p>
        </div>
        {!isEmpty && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={clear}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm
              text-slate-500 dark:text-slate-400
              hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Trash2 size={15} />
            Очистить
          </motion.button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {isEmpty && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full gap-4 text-center"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-600/15">
              <Sparkles size={28} className="text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                Спроси про свои финансы
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                Анализ расходов, советы по бюджету, прогнозы — AI видит все твои транзакции
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {[
                'Сколько я потратил в апреле?',
                'Какая категория самая затратная?',
                'Как улучшить норму сбережений?',
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => { setInput(q); textareaRef.current?.focus() }}
                  className="rounded-full border border-slate-200 dark:border-slate-700
                    px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400
                    hover:border-violet-400 hover:text-violet-600 dark:hover:text-violet-400
                    transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={clsx('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
            >
              {/* Avatar */}
              <div className={clsx(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                msg.role === 'user'
                  ? 'bg-violet-600'
                  : 'bg-slate-200 dark:bg-slate-700'
              )}>
                {msg.role === 'user'
                  ? <User size={15} className="text-white" />
                  : <Bot size={15} className="text-slate-600 dark:text-slate-300" />
                }
              </div>

              {/* Bubble */}
              <div className={clsx(
                'max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                msg.role === 'user'
                  ? 'bg-violet-600 text-white rounded-tr-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm shadow-sm'
              )}>
                {msg.content}
                {msg.isStreaming && (
                  <span className="ml-1 inline-block w-1.5 h-4 bg-current opacity-70 animate-pulse rounded-sm" />
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex gap-3 items-end">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Напиши вопрос про свои финансы..."
            className="flex-1 resize-none rounded-xl border border-slate-200 dark:border-slate-700
              bg-white dark:bg-slate-800
              px-4 py-3 text-sm text-slate-900 dark:text-slate-100
              placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500
              min-h-[48px] max-h-32 overflow-y-auto"
          />
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={send}
            disabled={!input.trim() || isLoading}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl
              bg-violet-600 text-white
              hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed
              transition-colors"
          >
            <Send size={17} />
          </motion.button>
        </div>
        <p className="mt-2 text-xs text-slate-400 text-center">
          Enter — отправить · Shift+Enter — новая строка
        </p>
      </div>
    </div>
  )
}
