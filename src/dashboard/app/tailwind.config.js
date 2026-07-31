/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        kit: {
          cyan: '#00d4ff',
          purple: '#7b2fff',
          green: '#00ff88',
          red: '#ff4757',
          gold: '#ffd700',
          dark: '#0a0a0f',
          card: '#12121a',
          border: '#1e1e2e',
        },
      },
    },
  },
  plugins: [],
};
