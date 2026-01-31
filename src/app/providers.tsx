'use client'
import { useEffect } from 'react'
import { useTheme } from '@/stores/theme'
import { AuthProvider } from '@/components/auth'

export function Providers({ children }: { children: React.ReactNode }) {
  const dark = useTheme((s) => s.dark)
  useEffect(() => {
    const root = document.documentElement
    const body = document.body
    root.classList.toggle('dark', dark)
    body.classList.toggle('dark', dark)
  }, [dark])
  return <AuthProvider>{children}</AuthProvider>
}
