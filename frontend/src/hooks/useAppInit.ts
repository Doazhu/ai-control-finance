import { useEffect } from 'react'
import { useTransactionStore } from '../store/useTransactionStore'

// Загружает все данные при монтировании авторизованного layout
export function useAppInit() {
  const fetchTransactions = useTransactionStore(s => s.fetchTransactions)

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])
}
