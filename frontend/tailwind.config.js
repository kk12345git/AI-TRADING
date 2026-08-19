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
        background: '#090D16',
        card: '#0F172A',
        cardBorder: '#1E293B',
        accentGreen: '#10B981',
        accentRed: '#EF4444',
        accentYellow: '#F59E0B',
        accentBlue: '#3B82F6',
        accentPurple: '#8B5CF6',
      },
    },
  },
  plugins: [],

  darkMode: 'class',
}
