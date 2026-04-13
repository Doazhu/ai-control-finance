import { create } from 'zustand'
import { Transaction } from '../types'
import { mockTransactions } from '../data/mockData'

interface TransactionStore {
  transactions: Transaction[]
  addTransaction: (t: Transaction) => void
  removeTransaction: (id: string) => void
}

export const useTransactionStore = create<TransactionStore>()((set) => ({
  transactions: mockTransactions,

  addTransaction: (t) =>
    set((s) => ({ transactions: [t, ...s.transactions] })),

  removeTransaction: (id) =>
    set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) })),
}))
