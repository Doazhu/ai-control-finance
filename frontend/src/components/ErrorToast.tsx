import { useEffect } from 'react'
import { AlertCircle, X } from 'lucide-react'
import { useTransactionStore } from '../store/useTransactionStore'

export default function ErrorToast() {
  const error = useTransactionStore(s => s.error)
  const setError = () => useTransactionStore.setState({ error: null })

  useEffect(() => {
    if (!error) return
    const t = setTimeout(() => useTransactionStore.setState({ error: null }), 4000)
    return () => clearTimeout(t)
  }, [error])

  if (!error) return null

  return (
    <div className="fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-4 py-3 bg-red-500/15 border border-red-500/30 rounded-2xl backdrop-blur-xl shadow-2xl anim-in">
      <AlertCircle size={16} className="text-red-400 shrink-0" />
      <p className="text-sm font-bold text-red-300">{error}</p>
      <button
        onClick={setError}
        className="ml-2 text-red-400 hover:text-red-200 spring-btn"
      >
        <X size={14} />
      </button>
    </div>
  )
}
