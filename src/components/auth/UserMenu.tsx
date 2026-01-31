'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from './AuthProvider'

export function UserMenu() {
  const { user, loading, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (loading) {
    return (
      <div className="h-8 w-8 animate-pulse rounded-full bg-gray-300 dark:bg-gray-700" />
    )
  }

  if (!user) {
    return (
      <Link
        href="/auth/login"
        className="rounded-lg border border-accent bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/20"
      >
        Sign In
      </Link>
    )
  }

  const avatarUrl = user.user_metadata?.avatar_url
  const displayName =
    user.user_metadata?.custom_claims?.global_name ||
    user.user_metadata?.full_name ||
    user.email?.split('@')[0] ||
    'User'

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-border-light bg-surface-light px-2 py-1 text-xs transition-colors hover:border-accent dark:border-border dark:bg-surface"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="h-6 w-6 rounded-full"
          />
        ) : (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/20 text-xs font-medium text-accent">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="max-w-[100px] truncate text-text1-light dark:text-text1">
          {displayName}
        </span>
        <svg
          className={`h-4 w-4 text-muted-light transition-transform dark:text-muted ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border border-border-light bg-surface-light p-2 shadow-lg dark:border-border dark:bg-surface">
          <div className="border-b border-border-light px-3 py-2 dark:border-border">
            <p className="truncate text-sm font-medium text-text1-light dark:text-text1">
              {displayName}
            </p>
            <p className="truncate text-xs text-muted-light dark:text-muted">
              {user.email}
            </p>
          </div>

          <div className="mt-2 space-y-1">
            <Link
              href="/account"
              onClick={() => setIsOpen(false)}
              className="block rounded px-3 py-2 text-sm text-text1-light hover:bg-bg-light dark:text-text1 dark:hover:bg-bg"
            >
              Account Settings
            </Link>
            <Link
              href="/account/sync"
              onClick={() => setIsOpen(false)}
              className="block rounded px-3 py-2 text-sm text-text1-light hover:bg-bg-light dark:text-text1 dark:hover:bg-bg"
            >
              Sync Data
            </Link>
          </div>

          <div className="mt-2 border-t border-border-light pt-2 dark:border-border">
            <button
              onClick={async () => {
                await signOut()
                setIsOpen(false)
                window.location.href = '/'
              }}
              className="block w-full rounded px-3 py-2 text-left text-sm text-red-500 hover:bg-red-500/10"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
