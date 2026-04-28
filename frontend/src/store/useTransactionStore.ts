import { create } from 'zustand'
import { Transaction } from '../types'
import { transactionsApi } from '../api/transactions'

interface TransactionStore {
  transactions:  Transaction[]
  loading:       boolean
  error:         string | null

  fetchTransactions:  () => Promise<void>
  addTransaction:     (t: Omit<Transaction, 'id'>) => Promise<void>
  removeTransaction:  (id: string) => Promise<void>
  updateTransaction:  (id: string, t: Omit<Transaction, 'id'>) => Promise<void>
}

export const useTransactionStore = create<TransactionStore>()((set, get) => ({
  transactions: [],
  loading:      false,
  error:        null,

  fetchTransactions: async () => {
    set({ loading: true, error: null })
    try {
      const transactions = await transactionsApi.getAll()
      set({ transactions, loading: false })
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : 'Ошибка загрузки',
      })
    }
  },

  addTransaction: async (t) => {
    try {
      const created = await transactionsApi.create(t)
      set(s => ({ transactions: [created, ...s.transactions] }))
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Ошибка создания' })
      throw err
    }
  },

  removeTransaction: async (id) => {
    // Оптимистичное обновление — удаляем сразу, откатываем при ошибке
    const prev = get().transactions
    set(s => ({ transactions: s.transactions.filter(t => t.id !== id) }))
    try {
      await transactionsApi.delete(id)
    } catch (err) {
      set({ transactions: prev, error: 'Ошибка удаления' })
    }
  },

  updateTransaction: async (id, t) => {
    try {
      const updated = await transactionsApi.update(id, t)
      set(s => ({
        transactions: s.transactions.map(tx => tx.id === id ? updated : tx),
      }))
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Ошибка обновления' })
      throw err
    }
  },
}))
