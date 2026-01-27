'use client'
import { useEffect } from 'react'
import { useTheme } from '@/stores/theme'
export function Providers({ children }: { children: React.ReactNode }) {
  const dark = useTheme((s) => s.dark)
  useEffect(() => {
    const root = document.documentElement
    const body = document.body
    root.classList.toggle('dark', dark)
    body.classList.toggle('dark', dark)
  }, [dark])
  return <>{children}</>
}
