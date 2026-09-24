/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary accent – Cyan
        primary: {
          50:  '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
          950: '#083344',
        },
        // Dark backgrounds
        dark: {
          bg:      '#0a0f1e',
          surface: '#0f1629',
          card:    '#131c35',
          border:  '#1e2d4a',
          muted:   '#1a2540',
        },
        // Light backgrounds
        light: {
          bg:      '#f8fafc',
          surface: '#f1f5f9',
          card:    '#ffffff',
          border:  '#e2e8f0',
          muted:   '#f8fafc',
        },
        // Status / trend colours
        emerging: { DEFAULT: '#a855f7', light: '#f3e8ff', dark: '#3b0764' },
        rising:   { DEFAULT: '#06b6d4', light: '#ecfeff', dark: '#083344' },
        trending: { DEFAULT: '#10b981', light: '#ecfdf5', dark: '#064e3b' },
        stable:   { DEFAULT: '#3b82f6', light: '#eff6ff', dark: '#1e3a5f' },
        declining:{ DEFAULT: '#f59e0b', light: '#fffbeb', dark: '#78350f' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'fade-in':     'fadeIn 0.4s ease-in-out',
        'slide-up':    'slideUp 0.4s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
        'pulse-soft':  'pulseSoft 2s ease-in-out infinite',
        'shimmer':     'shimmer 1.5s linear infinite',
        'glow':        'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn:    { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp:   { '0%': { transform: 'translateY(16px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        slideRight:{ '0%': { transform: 'translateX(-16px)', opacity: '0' }, '100%': { transform: 'translateX(0)', opacity: '1' } },
        pulseSoft: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.6' } },
        shimmer:   { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        glow:      { '0%': { boxShadow: '0 0 5px #06b6d440' }, '100%': { boxShadow: '0 0 20px #06b6d480' } },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'grid-pattern':    "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(148 163 184 / 0.05)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e\")",
      },
      boxShadow: {
        'glow-sm':  '0 0 10px rgba(6,182,212,0.2)',
        'glow-md':  '0 0 20px rgba(6,182,212,0.3)',
        'glow-lg':  '0 0 40px rgba(6,182,212,0.4)',
        'card':     '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
        'card-md':  '0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)',
        'card-lg':  '0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)',
      },
    },
  },
  plugins: [],
};

export default config;
