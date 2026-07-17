/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Global Tema Seçici (class-based) ile uyumlu çalışması için
  theme: {
    extend: {
      colors: {
        // Brand & Accent
        primary: {
          DEFAULT: '#FCD535', // Binance Yellow
          active: '#f0b90b',
          disabled: '#3a3a1f',
        },
        'accent-turquoise': '#2dbdb6',

        // Canvas & Surface
        canvas: {
          dark: '#0b0e11',
          light: '#ffffff',
        },
        surface: {
          'card-dark': '#1e2329',
          'elevated-dark': '#2b3139',
          'soft-light': '#fafafa',
          'strong-light': '#f5f5f5',
        },

        // Borders & Hairlines
        hairline: {
          light: '#eaecef',
          dark: '#2b3139',
        },
        'border-strong': '#cdd1d6',

        // Text (Ink & Body)
        ink: '#181a20',
        'body-dark': '#eaecef',
        muted: {
          DEFAULT: '#707a8a',
          strong: '#929aa5',
        },
        'on-primary': '#181a20',
        'on-dark': '#ffffff',

        // Trading Semantics
        trading: {
          up: '#0ecb81',
          down: '#f6465d',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          '"IBM Plex Sans"',
          '"JetBrains Mono"',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      borderRadius: {
        xs: '2px',
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px',
        pill: '9999px',
      },
      spacing: {
        section: '80px',
      },
    },
  },
  plugins: [],
}
