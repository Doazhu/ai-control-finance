import { motion } from 'framer-motion'
import { Construction } from 'lucide-react'

export default function SettingsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center h-96 gap-4 text-center"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-500/15">
        <Construction size={28} className="text-amber-600 dark:text-amber-400" />
      </div>
      <div>
        <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">В разработке</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Страница настроек скоро появится</p>
      </div>
    </motion.div>
  )
}
