import type { Config } from 'tailwindcss'
import relumeTailwindPreset from '@relume_io/relume-tailwind'

/**
 * Relume's preset supplies the section scale, container, and UI colors.
 * These overrides retint that system to the Glasses Near Me forest palette
 * (scheme 3 #074F37, ink #080706, mint #EAF9F4) instead of stock Relume black.
 */
const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@relume_io/relume-ui/dist/**/*.{js,ts,jsx,tsx}',
  ],
  presets: [relumeTailwindPreset],
  corePlugins: {
    // Payload admin ships its own reset. Preflight would restyle /admin.
    preflight: false,
  },
  theme: {
    container: {
      center: true,
      screens: {
        // Relume's preset uses 100% here, which emits `@media (min-width: 100%)`
        // and Next rejects that query. 100vw keeps the container full-bleed
        // until the lg/xl max widths below.
        sm: '100vw',
        md: '100vw',
        lg: '992px',
        xl: '80rem',
      },
    },
    extend: {
      colors: {
        brand: {
          black: '#080706',
          white: '#ffffff',
          forest: '#074F37',
          'forest-deep': '#042E20',
          'forest-mid': '#0A7250',
          mint: '#66D2AE',
          accent: '#0D9769',
          mist: '#EAF9F4',
        },
        neutral: {
          DEFAULT: '#616161',
          black: '#080706',
          white: '#ffffff',
          lightest: '#F5F5F5',
          lighter: '#E7E7E7',
          light: '#BABABA',
          dark: '#424242',
          darker: '#1C1917',
          darkest: '#080706',
        },
        background: {
          DEFAULT: '#ffffff',
          primary: '#ffffff',
          secondary: '#F5F5F5',
          tertiary: '#EAF9F4',
          alternative: '#1C1917',
          success: '#EAF9F4',
          error: '#FFF1F1',
        },
        border: {
          DEFAULT: '#080706',
          primary: '#080706',
          secondary: '#D4D4D4',
          tertiary: '#424242',
          alternative: '#ffffff',
          success: '#0D9769',
          error: '#A72F2F',
        },
        text: {
          DEFAULT: '#080706',
          primary: '#080706',
          secondary: '#616161',
          alternative: '#ffffff',
          success: '#0A502D',
          error: '#A72F2F',
        },
        link: {
          DEFAULT: '#0D9769',
          primary: '#0D9769',
          secondary: '#074F37',
          alternative: '#ffffff',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Fraunces', 'Iowan Old Style', 'Palatino', 'serif'],
      },
      borderRadius: {
        sm: '16px',
        md: '16px',
        lg: '20px',
        xl: '24px',
      },
    },
  },
}

export default config
