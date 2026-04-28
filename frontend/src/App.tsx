import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import DashboardPage from './pages/DashboardPage'
import TransactionsPage from './pages/TransactionsPage'
import ChatPage from './pages/ChatPage'
import SettingsPage from './pages/SettingsPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import NotificationsPage from './pages/NotificationsPage'
import SearchPage from './pages/SearchPage'
import SubscriptionPage from './pages/SubscriptionPage'
import BudgetPage from './pages/BudgetPage'
import { useAuthStore } from './store/useAuthStore'
import { useAppInit } from './hooks/useAppInit'
import ErrorToast from './components/ErrorToast'

function ProtectedLayout() {
  useAppInit() // загружаем транзакции при входе

  return (
    <div className="flex min-h-screen bg-[#080b14]">
      <Sidebar />
      <ErrorToast />
      <main className="flex-1 min-h-screen overflow-y-auto">
        <Routes>
          <Route path="/"              element={<DashboardPage />} />
          <Route path="/transactions"  element={<TransactionsPage />} />
          <Route path="/budget"        element={<BudgetPage />} />
          <Route path="/chat"          element={<ChatPage />} />
          <Route path="/search"        element={<SearchPage />} />
          <Route path="/profile"       element={<ProfilePage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/subscription"  element={<SubscriptionPage />} />
          <Route path="/settings"      element={<SettingsPage />} />
          <Route path="*"              element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/*"
          element={
            <RequireAuth>
              <ProtectedLayout />
            </RequireAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
