/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['Satoshi', 'system-ui', 'sans-serif'],
        heading: ['Cabinet Grotesk', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float-1':       'float-orb-1 25s ease-in-out infinite',
        'float-2':       'float-orb-2 30s ease-in-out infinite',
        'pulse-slow':    'pulse-glow 10s ease-in-out infinite',
        'bounce-in':     'bounceIn 0.8s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'rotate-border': 'rotateBorder 4s linear infinite',
      },
      keyframes: {
        'float-orb-1': {
          '0%,100%': { transform: 'translate(0,0) scale(1)' },
          '50%':     { transform: 'translate(100px,-50px) scale(1.1)' },
        },
        'float-orb-2': {
          '0%,100%': { transform: 'translate(0,0) scale(1)' },
          '50%':     { transform: 'translate(-80px,60px) scale(1.05)' },
        },
        'pulse-glow': {
          '0%,100%': { opacity: '0.3' },
          '50%':     { opacity: '0.6' },
        },
        'bounceIn': {
          '0%':   { opacity: '0', transform: 'translateY(40px) scale(0.9)' },
          '70%':  { transform: 'translateY(-5px) scale(1.02)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'rotateBorder': {
          from: { transform: 'rotate(0deg)' },
          to:   { transform: 'rotate(360deg)' },
        },
      },
    },
  },
  plugins: [],
}
