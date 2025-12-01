import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        'xs': '480px',
        'sm': '576px',
        'md': '768px',
        'lg': '992px',
        'xl': '1200px',
      },
      // ===== FONT SIZES (+3px من الـ default) =====
      fontSize: {
        'xs': ['0.8125rem', { lineHeight: '1.5' }],      // 13px (كان 10px)
        'sm': ['0.9375rem', { lineHeight: '1.5' }],      // 15px (كان 12px)
        'base': ['1.1875rem', { lineHeight: '1.6' }],    // 19px (كان 16px)
        'lg': ['1.3125rem', { lineHeight: '1.6' }],      // 21px (كان 18px)
        'xl': ['1.4375rem', { lineHeight: '1.5' }],      // 23px (كان 20px)
        '2xl': ['1.6875rem', { lineHeight: '1.4' }],     // 27px (كان 24px)
        '3xl': ['2.0625rem', { lineHeight: '1.3' }],     // 33px (كان 30px)
        '4xl': ['2.4375rem', { lineHeight: '1.2' }],     // 39px (كان 36px)
        '5xl': ['3.1875rem', { lineHeight: '1.1' }],     // 51px (كان 48px)
      },
      // ===== COLORS - تحكم مركزي =====
      colors: {
        // Brand Primary - Pink
        primary: {
          50: '#fff1f5',
          100: '#ffe4ec',
          200: '#ffcadb',
          300: '#ffa0bc',
          400: '#ff6b9d',
          500: '#ff5a8e',
          600: '#ff4979',  // Main brand color
          700: '#e63869',
          800: '#cc2f5c',
          900: '#b32750',
          950: '#500f24',
        },
        // Brand Secondary - Teal
        secondary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',  // Main secondary
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        // Warm backgrounds
        warm: {
          50: '#fffbf7',
          100: '#fff8f9',
          200: '#fef3f4',
        },
        // Semantic Colors - للاستخدام السريع
        brand: {
          pink: '#ff4979',
          'pink-light': '#ffa0bc',
          'pink-dark': '#e63869',
          teal: '#14b8a6',
          'teal-light': '#5eead4',
          'teal-dark': '#0d9488',
        },
        // UI States
        success: {
          light: '#d1fae5',
          DEFAULT: '#10b981',
          dark: '#059669',
        },
        warning: {
          light: '#fef3c7',
          DEFAULT: '#f59e0b',
          dark: '#d97706',
        },
        error: {
          light: '#fee2e2',
          DEFAULT: '#ef4444',
          dark: '#dc2626',
        },
        // Text Colors
        text: {
          primary: '#1e293b',
          secondary: '#64748b',
          muted: '#94a3b8',
          inverse: '#ffffff',
        },
        // Background Colors
        surface: {
          DEFAULT: '#ffffff',
          secondary: '#f8fafc',
          tertiary: '#f1f5f9',
          dark: '#0f172a',
        },
      },
      fontFamily: {
        cairo: ['var(--font-cairo)', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}

export default config
