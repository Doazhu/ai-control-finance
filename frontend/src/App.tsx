import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Sidebar from './components/Sidebar'
import DashboardPage from './pages/DashboardPage'
import TransactionsPage from './pages/TransactionsPage'
import ChatPage from './pages/ChatPage'
import SettingsPage from './pages/SettingsPage'
import { useThemeStore } from './store/useThemeStore'

export default function App() {
  const { init } = useThemeStore()

  // Apply saved theme on mount
  useEffect(() => {
    init()
  }, [init])

  return (
    <BrowserRouter>
      <div className="flex min-h-screen">
        <Sidebar />

        <main className="ml-60 flex-1 px-8 py-8 min-h-screen">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </BrowserRouter>
  )
}
