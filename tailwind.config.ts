import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Syrealize Brand Colors
        primary: {
          DEFAULT: '#10282A',
          dark: '#0A1B1D',
          light: '#1A3A3D',
        },
        accent: {
          DEFAULT: '#d91636',
          dark: '#B01229',
          light: '#E6385A',
        },
        text: {
          DEFAULT: '#3D4D55',
          light: '#6B7B83',
          dark: '#2A3A42',
        },
        background: {
          DEFAULT: '#f7f7f7',
          white: '#ffffff',
          light: '#fafafa',
        },
        // Gray scale for borders and backgrounds
        gray: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        // Dark mode colors
        dark: {
          bg: '#0F1419',
          surface: '#1A1F26',
          border: '#2A3139',
          text: '#E1E8ED',
          'text-muted': '#8899A6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'system-ui', 'sans-serif'],
        display: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(16, 40, 42, 0.08)',
        'soft-lg': '0 4px 16px rgba(16, 40, 42, 0.12)',
        'soft-xl': '0 8px 32px rgba(16, 40, 42, 0.16)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
export default config
