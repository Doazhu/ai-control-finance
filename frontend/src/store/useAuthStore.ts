import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthStore {
  token: string | null
  login: (token: string) => void
  logout: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      token: null,
      login: (token) => set({ token }),
      logout: () => set({ token: null }),
      isAuthenticated: () => !!get().token,
    }),
    { name: 'finai-auth' }
  )
)
