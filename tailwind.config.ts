import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        aura: '0 28px 80px rgba(2, 6, 23, 0.45)'
      },
      colors: {
        aura: {
          cyan: '#5eead4',
          blue: '#60a5fa',
          gold: '#f59e0b',
          rose: '#fb7185',
          slate: '#0f172a'
        }
      }
    }
  },
  plugins: []
};

export default config;
