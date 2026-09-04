import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './features/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // ─── SmartCare Brand Palette ──────────────────────────────────────
        teal: {
          DEFAULT: '#0f5ca8',
          50: '#eaf4fd',
          100: '#d0e9f9',
          200: '#a0d0f2',
          300: '#6db5e9',
          400: '#3a9ae0',
          500: '#1a82d4',
          600: '#0f5ca8',   // ← primary brand
          700: '#0b4787',
          800: '#083468',
          900: '#05234a',
        },
        mint: '#eaf4fd',
        saffron: {
          DEFAULT: '#d97706',
          light: '#fef3c7',
        },
        clinical: {
          red: '#dc2626',
          yellow: '#d97706',
          green: '#16a34a',
          navy: '#0a3b69',
          'light-blue': '#f0f7fc',
        },
        // ─── Semantic tokens (CSS variables set in globals.css) ───────────
        surface: 'var(--surface)',
        'surface-raised': 'var(--surface-raised)',
        'surface-sunken': 'var(--surface-sunken)',
        'on-surface': 'var(--text)',
        'text-muted': 'var(--text-muted)',
        border: 'var(--line)',
        accent: 'var(--teal)',
      },
      fontFamily: {
        sans: ['var(--font-noto)', 'Noto Sans', 'system-ui', 'sans-serif'],
      },
      screens: {
        xs: '360px',
        sm: '480px',
        md: '768px',
        lg: '900px',
        xl: '1200px',
        '2xl': '1440px',
      },
      spacing: {
        'safe-left': 'max(1.15rem, calc(0.85rem + env(safe-area-inset-left, 0px)))',
        'safe-right': 'max(1.15rem, calc(0.85rem + env(safe-area-inset-right, 0px)))',
        'safe-bottom': 'max(1rem, calc(0.75rem + env(safe-area-inset-bottom, 0px)))',
      },
      borderRadius: {
        token: '0.65rem',
        card: '0.85rem',
        modal: '1.1rem',
      },
      boxShadow: {
        card: '0 1px 4px 0 rgba(15, 92, 168, 0.07), 0 2px 12px 0 rgba(15, 92, 168, 0.06)',
        'card-hover': '0 4px 18px 0 rgba(15, 92, 168, 0.13)',
        modal: '0 8px 40px 0 rgba(10, 59, 105, 0.2)',
        topbar: '0 1px 0 var(--line)',
      },
      zIndex: {
        nav: '100',
        sidebar: '400',
        backdrop: '399',
        'bottom-nav': '350',
        modal: '500',
        toast: '600',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
