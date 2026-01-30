'use client'

import { useAuth } from '@/components/auth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AccountPage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login?redirectTo=/account')
    }
  }, [loading, user, router])

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-gray-300 dark:bg-gray-700"></div>
          <div className="h-32 rounded bg-gray-300 dark:bg-gray-700"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const avatarUrl = user.user_metadata?.avatar_url
  const displayName =
    user.user_metadata?.custom_claims?.global_name ||
    user.user_metadata?.full_name ||
    user.email?.split('@')[0] ||
    'User'
  const provider = user.app_metadata?.provider || 'email'

  return (
    <div className="mx-auto max-w-2xl py-8">
      <h1 className="mb-6 font-display text-2xl text-accent">Account Settings</h1>

      {/* Profile Card */}
      <div className="mb-6 rounded-lg border border-border-light bg-surface-light p-6 dark:border-border dark:bg-surface">
        <h2 className="mb-4 text-lg font-medium text-text1-light dark:text-text1">
          Profile
        </h2>
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="h-16 w-16 rounded-full"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/20 text-2xl font-medium text-accent">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-lg font-medium text-text1-light dark:text-text1">
              {displayName}
            </p>
            <p className="text-sm text-muted-light dark:text-muted">{user.email}</p>
            <p className="mt-1 text-xs text-muted-light dark:text-muted">
              Signed in with{' '}
              <span className="capitalize">
                {provider === 'discord' ? (
                  <span className="text-[#5865F2]">Discord</span>
                ) : provider === 'google' ? (
                  <span className="text-[#4285F4]">Google</span>
                ) : (
                  provider
                )}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Data Sync Card */}
      <div className="mb-6 rounded-lg border border-border-light bg-surface-light p-6 dark:border-border dark:bg-surface">
        <h2 className="mb-4 text-lg font-medium text-text1-light dark:text-text1">
          Data Sync
        </h2>
        <p className="mb-4 text-sm text-muted-light dark:text-muted">
          Sync your local data (builds, characters, settings) to the cloud so you can
          access it from any device.
        </p>
        <Link
          href="/account/sync"
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent/90"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Manage Sync
        </Link>
      </div>

      {/* Connected Accounts */}
      <div className="mb-6 rounded-lg border border-border-light bg-surface-light p-6 dark:border-border dark:bg-surface">
        <h2 className="mb-4 text-lg font-medium text-text1-light dark:text-text1">
          Connected Accounts
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-border-light bg-bg-light p-3 dark:border-border dark:bg-bg">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#5865F2]">
                <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-text1-light dark:text-text1">Discord</p>
                <p className="text-xs text-muted-light dark:text-muted">
                  {provider === 'discord' ? 'Connected' : 'Not connected'}
                </p>
              </div>
            </div>
            {provider === 'discord' && (
              <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-500">
                Active
              </span>
            )}
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border-light bg-bg-light p-3 dark:border-border dark:bg-bg">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-text1-light dark:text-text1">Google</p>
                <p className="text-xs text-muted-light dark:text-muted">
                  {provider === 'google' ? 'Connected' : 'Not connected'}
                </p>
              </div>
            </div>
            {provider === 'google' && (
              <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-500">
                Active
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-6">
        <h2 className="mb-4 text-lg font-medium text-red-500">Danger Zone</h2>
        <p className="mb-4 text-sm text-muted-light dark:text-muted">
          Once you sign out, your local data will remain on this device but won&apos;t
          be synced until you sign back in.
        </p>
        <button
          onClick={async () => {
            await signOut()
            router.push('/')
          }}
          className="rounded-lg border border-red-500 bg-transparent px-4 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/10"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}
