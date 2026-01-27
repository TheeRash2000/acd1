import type { Config } from 'tailwindcss'
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT: '#0D1117', light: '#F6F8FA' },
        surface: { DEFAULT: '#161B22', light: '#FFFFFF' },
        text1: { DEFAULT: '#E6EDF3', light: '#0B1220' },
        accent: '#C89B3C',
        success: '#3FB950',
        danger: '#DA3633',
        muted: { DEFAULT: '#8B949E', light: '#57606A' },
        border: { DEFAULT: '#30363D', light: '#D0D7DE' },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'], display: ['Cinzel', 'serif'] }
    }
  },
  plugins: []
} satisfies Config
