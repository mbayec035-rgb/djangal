/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        void: 'rgb(var(--color-void) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        raised: 'rgb(var(--color-raised) / <alpha-value>)',
        line: 'rgb(var(--color-line) / <alpha-value>)',
        muted: 'rgb(var(--color-muted) / <alpha-value>)',
        text: 'rgb(var(--color-text) / <alpha-value>)',
        white: 'rgb(var(--color-text) / <alpha-value>)',
        neon: 'rgb(var(--color-neon) / <alpha-value>)',
        electric: 'rgb(var(--color-electric) / <alpha-value>)',
        danger: 'rgb(var(--color-danger) / <alpha-value>)',
        warning: 'rgb(var(--color-warning) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'neon-sm': '0 0 18px rgba(0, 255, 157, 0.12)',
        'neon-md': '0 0 30px rgba(0, 255, 157, 0.2)',
        'cyan-sm': '0 0 18px rgba(0, 217, 255, 0.12)',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-120%)', opacity: '0' },
          '15%': { opacity: '0.45' },
          '70%': { opacity: '0.22' },
          '100%': { transform: 'translateY(520%)', opacity: '0' },
        },
        cursor: {
          '0%, 45%': { opacity: '1' },
          '46%, 100%': { opacity: '0' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 0 rgba(0, 255, 157, 0)' },
          '50%': { boxShadow: '0 0 20px rgba(0, 255, 157, 0.2)' },
        },
        gridMove: {
          from: { backgroundPosition: '0 0' },
          to: { backgroundPosition: '32px 32px' },
        },
      },
      animation: {
        scan: 'scan 5s linear infinite',
        cursor: 'cursor 1s steps(1) infinite',
        'glow-pulse': 'glowPulse 2.6s ease-in-out infinite',
        'grid-move': 'gridMove 18s linear infinite',
      },
    },
  },
  plugins: [],
};
