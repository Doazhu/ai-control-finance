/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@tremor/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        tremor: {
          brand: {
            faint: '#f5f3ff',
            muted: '#ede9fe',
            subtle: '#a78bfa',
            DEFAULT: '#7c3aed',
            emphasis: '#6d28d9',
            inverted: '#ffffff',
          },
          background: {
            muted: '#f8fafc',
            subtle: '#f1f5f9',
            DEFAULT: '#ffffff',
            emphasis: '#334155',
          },
          border: {
            DEFAULT: '#e2e8f0',
          },
          ring: {
            DEFAULT: '#e2e8f0',
          },
          content: {
            subtle: '#94a3b8',
            DEFAULT: '#64748b',
            emphasis: '#334155',
            strong: '#0f172a',
            inverted: '#ffffff',
          },
        },
        'dark-tremor': {
          brand: {
            faint: '#1e1b4b',
            muted: '#2e1065',
            subtle: '#7c3aed',
            DEFAULT: '#8b5cf6',
            emphasis: '#a78bfa',
            inverted: '#0f172a',
          },
          background: {
            muted: '#0f172a',
            subtle: '#1e293b',
            DEFAULT: '#1e293b',
            emphasis: '#94a3b8',
          },
          border: {
            DEFAULT: '#334155',
          },
          ring: {
            DEFAULT: '#334155',
          },
          content: {
            subtle: '#475569',
            DEFAULT: '#94a3b8',
            emphasis: '#e2e8f0',
            strong: '#f8fafc',
            inverted: '#0f172a',
          },
        },
      },
    },
  },
  plugins: [],
}
