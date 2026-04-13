import { create } from 'zustand'
import { ChatMessage } from '../types'

interface ChatStore {
  messages: ChatMessage[]
  isLoading: boolean
  addMessage: (msg: ChatMessage) => void
  updateLastMessage: (content: string, done?: boolean) => void
  setLoading: (v: boolean) => void
  clear: () => void
}

export const useChatStore = create<ChatStore>()((set) => ({
  messages: [],
  isLoading: false,

  addMessage: (msg) =>
    set((s) => ({ messages: [...s.messages, msg] })),

  updateLastMessage: (content, done = false) =>
    set((s) => {
      const msgs = [...s.messages]
      const last = msgs[msgs.length - 1]
      if (last && last.role === 'assistant') {
        msgs[msgs.length - 1] = {
          ...last,
          content,
          isStreaming: !done,
        }
      }
      return { messages: msgs }
    }),

  setLoading: (v) => set({ isLoading: v }),
  clear: () => set({ messages: [] }),
}))
