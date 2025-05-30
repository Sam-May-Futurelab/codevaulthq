/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        vault: {
          dark: '#0a0a0a',
          medium: '#1a1a1a',
          light: '#2a2a2a',
          accent: '#00ff88',
          purple: '#8b5cf6',
        }
      },      fontFamily: {
        'mono': ['Share Tech Mono', 'IBM Plex Mono', 'JetBrains Mono', 'Monaco', 'Consolas', 'monospace'],
        'display': ['IBM Plex Mono', 'monospace'],
        'code': ['Share Tech Mono', 'monospace'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(0, 255, 136, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(0, 255, 136, 0.6)' },
        }
      }
    },
  },
  plugins: [],
}
