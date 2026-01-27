'use client'
import { useTheme } from '@/stores/theme'
export function ThemeToggle() {
  const { dark, setDark } = useTheme()
  return (
    <button
      onClick={() => setDark(!dark)}
      className="btn-secondary text-xs"
      aria-label="Toggle theme"
      type="button"
    >
      {dark ? 'Light' : 'Dark'}
    </button>
  )
}
