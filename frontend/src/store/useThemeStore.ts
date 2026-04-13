import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Theme } from '../types'

interface ThemeStore {
  theme: Theme
  toggle: () => void
  init: () => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'dark',

      init: () => {
        const theme = get().theme
        document.documentElement.classList.toggle('dark', theme === 'dark')
      },

      toggle: () => {
        const next: Theme = get().theme === 'dark' ? 'light' : 'dark'
        document.documentElement.classList.toggle('dark', next === 'dark')
        set({ theme: next })
      },
    }),
    { name: 'finance-ai-theme' }
  )
)
