'use client'

import { useState } from 'react'
import { useAuth } from '@/components/auth'
import type { Build } from '@/stores/builds'

interface ShareBuildModalProps {
  build: Build
  onClose: () => void
}

export function ShareBuildModal({ build, onClose }: ShareBuildModalProps) {
  const { user, isConfigured } = useAuth()
  const [step, setStep] = useState<'initial' | 'uploading' | 'sharing' | 'done' | 'error'>('initial')
  const [error, setError] = useState<string | null>(null)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    if (!user) {
      setError('Please sign in to share builds')
      setStep('error')
      return
    }

    try {
      // Step 1: Upload to cloud
      setStep('uploading')

      // Format build for upload
      const buildData = {
        id: build.id,
        name: build.name,
        weapon: build.weapon,
        offhand: build.offhand,
        head: build.head,
        chest: build.chest,
        shoes: build.shoes,
        cape: build.cape,
        mount: build.mount,
        food: build.food,
        potion: build.potion,
        ip: build.ip,
        manualIp: build.manualIp,
        timestamp: build.timestamp,
      }

      const slots = {
        weapon: build.weapon,
        offhand: build.offhand,
        head: build.head,
        chest: build.chest,
        shoes: build.shoes,
        cape: build.cape,
        mount: build.mount,
        food: build.food,
        potion: build.potion,
      }

      // Upload build to cloud
      const uploadRes = await fetch('/api/builds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: build.id,
          name: build.name,
          slots,
          ip: build.ip,
          isPublic: true,
        }),
      })

      if (!uploadRes.ok) {
        const data = await uploadRes.json()
        throw new Error(data.error || 'Failed to upload build')
      }

      const { build: uploadedBuild } = await uploadRes.json()

      // Step 2: Generate share URL
      setStep('sharing')
      const url = `${window.location.origin}/builds/shared/${uploadedBuild.id}`
      setShareUrl(url)
      setStep('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to share build')
      setStep('error')
    }
  }

  const handleCopy = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-md rounded-2xl border border-border-light bg-surface-light p-6 shadow-2xl dark:border-border dark:bg-surface">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text1-light dark:text-text1">
            Share Build
          </h2>
          <button
            className="text-xs text-muted-light hover:text-text1-light dark:text-muted dark:hover:text-text1"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="mt-4">
          {step === 'initial' && (
            <>
              <p className="mb-4 text-sm text-muted-light dark:text-muted">
                Share <strong className="text-text1-light dark:text-text1">{build.name}</strong> with the community.
                This will upload your build and make it publicly accessible.
              </p>
              {!user && (
                <div className="mb-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-400">
                  You need to sign in to share builds.
                </div>
              )}
              {!isConfigured && user && (
                <div className="mb-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-400">
                  Cloud sync is not configured. Please set up Supabase.
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleShare}
                  disabled={!user || !isConfigured}
                  className="flex-1 rounded-lg bg-accent px-4 py-2 font-medium text-white transition-colors hover:bg-accent/90 disabled:opacity-50"
                >
                  Share Build
                </button>
                <button
                  onClick={onClose}
                  className="rounded-lg border border-border-light bg-bg-light px-4 py-2 font-medium text-text1-light transition-colors hover:bg-surface-light dark:border-border dark:bg-bg dark:text-text1 dark:hover:bg-surface"
                >
                  Cancel
                </button>
              </div>
            </>
          )}

          {step === 'uploading' && (
            <div className="flex flex-col items-center py-8">
              <svg className="h-8 w-8 animate-spin text-accent" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="mt-4 text-sm text-muted-light dark:text-muted">Uploading build...</p>
            </div>
          )}

          {step === 'sharing' && (
            <div className="flex flex-col items-center py-8">
              <svg className="h-8 w-8 animate-spin text-accent" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="mt-4 text-sm text-muted-light dark:text-muted">Generating share link...</p>
            </div>
          )}

          {step === 'done' && shareUrl && (
            <>
              <div className="mb-4 rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-center text-green-500">
                Build shared successfully!
              </div>
              <div className="mb-4">
                <label className="mb-1 block text-xs text-muted-light dark:text-muted">
                  Share Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="flex-1 rounded-lg border border-border-light bg-bg-light px-3 py-2 text-sm text-text1-light dark:border-border dark:bg-bg dark:text-text1"
                  />
                  <button
                    onClick={handleCopy}
                    className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent/90"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-full rounded-lg border border-border-light bg-bg-light px-4 py-2 font-medium text-text1-light transition-colors hover:bg-surface-light dark:border-border dark:bg-bg dark:text-text1 dark:hover:bg-surface"
              >
                Close
              </button>
            </>
          )}

          {step === 'error' && (
            <>
              <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-center text-red-400">
                {error || 'Something went wrong'}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setStep('initial')}
                  className="flex-1 rounded-lg bg-accent px-4 py-2 font-medium text-white transition-colors hover:bg-accent/90"
                >
                  Try Again
                </button>
                <button
                  onClick={onClose}
                  className="rounded-lg border border-border-light bg-bg-light px-4 py-2 font-medium text-text1-light transition-colors hover:bg-surface-light dark:border-border dark:bg-bg dark:text-text1 dark:hover:bg-surface"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
