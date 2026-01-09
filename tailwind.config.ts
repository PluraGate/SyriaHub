import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      'xs': '480px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        // Syrian Identity Derivative Palette
        // Inspired by syrianidentity.sy but using softer derivatives
        primary: {
          DEFAULT: '#1A3D40',      // Deep Teal - derived from #10282A
          dark: '#0F2A2C',         // Darker teal
          light: '#2A5558',        // Lighter teal
        },
        accent: {
          DEFAULT: '#C41E3A',      // Heritage Red - derived from #D91636
          dark: '#A01830',         // Deeper red
          light: '#E04360',        // Softer red
        },
        secondary: {
          DEFAULT: '#4AA3A5',      // Sage Teal - derived from #3E9798
          dark: '#3A8385',         // Darker sage
          light: '#7ABFC0',        // Lighter sage (derived from #7AA8A1)
        },
        text: {
          DEFAULT: '#2A3A42',      // Deep slate - derived from #3D4D55
          light: '#5A6A72',        // Medium gray
          muted: '#8899A6',        // Muted gray
        },
        background: {
          DEFAULT: '#F5F5F3',      // Warm off-white - from identity
          white: '#FFFFFF',
          warm: '#F2F0E6',         // Warmer background - from identity
        },
        surface: {
          DEFAULT: '#FFFFFF',
          elevated: '#FAFAFA',
        },
        border: {
          DEFAULT: '#E5E5E5',
          light: '#F0F0F0',
        },
        // Syrian identity grayscale
        gray: {
          50: '#FAFAFA',
          100: '#F5F5F3',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#6B7B83',          // From identity #6B7B83
          600: '#5A6A72',
          700: '#3D4D55',          // From identity
          800: '#2A3A42',          // From identity
          900: '#1A3D40',
        },
        // Dark mode colors - Syrian teal tones
        dark: {
          bg: '#0A1B1D',           // Very dark teal - from identity
          surface: '#142628',     // Dark teal surface
          border: '#243A3D',      // Teal border
          text: '#E8EDEE',        // Light text
          'text-muted': '#8A9EA3', // Muted text
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-outfit)', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'Cambria', 'serif'],
        arabic: ['var(--font-arabic)', 'Cairo', 'Tahoma', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['4rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-lg': ['3rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        'display': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        'pill': '9999px',
      },
      boxShadow: {
        'soft': '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
        'soft-md': '0 4px 6px rgba(0, 0, 0, 0.04), 0 2px 4px rgba(0, 0, 0, 0.02)',
        'soft-lg': '0 10px 15px rgba(0, 0, 0, 0.04), 0 4px 6px rgba(0, 0, 0, 0.02)',
        'soft-xl': '0 20px 25px rgba(0, 0, 0, 0.06), 0 8px 10px rgba(0, 0, 0, 0.02)',
        'glow-coral': '0 0 20px rgba(222, 95, 67, 0.15)',
      },
      keyframes: {
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(-5%)', animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)' },
          '50%': { transform: 'translateY(0)', animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'bounce-subtle': 'bounce-subtle 3s infinite',
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
export default config
