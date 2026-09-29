/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#07080B',
        brandNoir: '#07080B',
        surfaceBase: '#0C0E14',
        surfaceCard: '#11141E',
        surfaceElevated: '#171B28',
        surfaceHover: '#1D2232',
        cardBorder: 'rgba(255, 255, 255, 0.07)',
        cardBorderSubtle: 'rgba(255, 255, 255, 0.04)',
        gold: {
          400: '#F3C96A',
          500: '#E5B842',
          600: '#C79A27',
          DEFAULT: '#E5B842',
        },
        emerald: {
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          DEFAULT: '#10B981',
        },
        rose: {
          400: '#FB7185',
          500: '#F43F5E',
          600: '#E11D48',
          DEFAULT: '#F43F5E',
        },
        accentGreen: '#10B981',
        accentRed: '#F43F5E',
        accentYellow: '#E5B842',
        accentBlue: '#38BDF8',
        accentPurple: '#A78BFA',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'luxe': '0 20px 40px -15px rgba(0, 0, 0, 0.7), inset 0 1px 0 0 rgba(255, 255, 255, 0.07)',
        'luxe-sm': '0 8px 20px -6px rgba(0, 0, 0, 0.6), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
        'gold-glow': '0 0 25px -5px rgba(229, 184, 66, 0.25)',
        'emerald-glow': '0 0 25px -5px rgba(16, 185, 129, 0.25)',
        'rose-glow': '0 0 25px -5px rgba(244, 63, 94, 0.25)',
      }
    },
  },
  plugins: [],
  darkMode: 'class',
}
