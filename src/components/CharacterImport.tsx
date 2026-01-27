'use client'
import { useEffect, useRef, useState } from 'react'
import useSWR from 'swr'
import { useCharacters } from '@/stores/characters'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type CharacterImportProps = {
  onImported?: () => void
}

export function CharacterImport({ onImported }: CharacterImportProps) {
  const [name, setName] = useState('')
  const lastSavedKey = useRef<string | null>(null)
  const addCharacter = useCharacters((s) => s.addCharacter)
  const { data, error, isValidating, mutate } = useSWR(
    name ? `/api/killboard/${encodeURIComponent(name)}` : null,
    fetcher,
    { refreshInterval: 15 * 60 * 1000, revalidateOnFocus: false }
  )

  useEffect(() => {
    if (!data || data?.error || !name) return
    const resolvedName = data?.name ?? data?.Name ?? name
    const server = data?.server ?? data?.ServerName ?? data?.data?.server ?? 'Unknown'
    const key = `${resolvedName}:${server}`
    if (lastSavedKey.current === key) return
    addCharacter({ name: resolvedName, server, lastFetched: Date.now() })
    lastSavedKey.current = key
    onImported?.()
  }, [data, addCharacter, name, onImported])

  return (
    <form
      className="grid gap-3"
      onSubmit={(event) => {
        event.preventDefault()
        if (name) mutate()
      }}
    >
      <input
        className="rounded border border-border-light bg-surface-light px-3 py-2 text-text1-light dark:border-border dark:bg-surface dark:text-text1"
        placeholder="Character name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button
        className="btn-forge"
        type="submit"
        disabled={!name || isValidating}
      >
        {isValidating ? 'Importing...' : 'Import Character'}
      </button>
      {error && <p className="text-danger text-sm">Killboard error</p>}
      {data && !data?.error && (
        <p className="text-xs text-muted-light dark:text-muted">Character imported from killboard.</p>
      )}
    </form>
  )
}
