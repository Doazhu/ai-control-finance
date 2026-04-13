export interface Transaction {
  id: string
  description: string
  amount: number
  category: string
  type: 'income' | 'expense'
  date: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isStreaming?: boolean
}

export type Theme = 'dark' | 'light'
