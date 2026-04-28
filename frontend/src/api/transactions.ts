import { api } from './client'
import { Transaction } from '../types'

// Формат ответа с бэкенда
interface ApiTransaction {
  id:          string
  user_id:     string
  amount:      string   // decimal строка "120000.00"
  type:        'income' | 'expense'
  category:    string
  description: string
  date:        string   // "2026-04-01"
  created_at:  string
}

// Конвертация бэкенд → фронтенд
function fromApi(t: ApiTransaction): Transaction {
  return {
    id:          t.id,
    description: t.description,
    amount:      parseFloat(t.amount),
    category:    t.category || 'Прочее',
    type:        t.type,
    date:        t.date,
  }
}

export const transactionsApi = {
  // Получить все транзакции пользователя
  getAll: async (): Promise<Transaction[]> => {
    const data = await api.get<ApiTransaction[]>('/transaction')
    if (!data || !Array.isArray(data)) return []
    return data.map(fromApi)
  },

  // Создать транзакцию
  create: async (t: Omit<Transaction, 'id'>): Promise<Transaction> => {
    const data = await api.post<ApiTransaction>('/transaction', {
      amount:      String(t.amount),
      type:        t.type,
      category:    t.category,
      description: t.description,
      date:        t.date,
    })
    return fromApi(data)
  },

  // Удалить транзакцию
  delete: async (id: string): Promise<void> => {
    await api.delete(`/transaction/${id}`)
  },

  // Обновить транзакцию
  update: async (id: string, t: Omit<Transaction, 'id'>): Promise<Transaction> => {
    const data = await api.put<ApiTransaction>(`/transaction/${id}`, {
      amount:      String(t.amount),
      type:        t.type,
      category:    t.category,
      description: t.description,
      date:        t.date,
    })
    return fromApi(data)
  },
}
