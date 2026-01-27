'use client'
import { useEffect, useMemo, useState } from 'react'
import { useCharacterSync } from '@/stores/characterSync'
import { useCharacterSpecs } from '@/hooks/useCharacterSpecs'
import { IPDisplay } from '@/components/IPDisplay'
import { getAllItems, Item } from '@/lib/items'

type Quality = 'normal' | 'good' | 'outstanding' | 'excellent' | 'masterpiece'

const QUALITY_OPTIONS: { label: string; value: Quality }[] = [
  { label: 'Normal', value: 'normal' },
  { label: 'Good', value: 'good' },
  { label: 'Outstanding', value: 'outstanding' },
  { label: 'Excellent', value: 'excellent' },
  { label: 'Masterpiece', value: 'masterpiece' },
]

export default function CalculatorPage() {
  const { characters } = useCharacterSync()
  const [selectedCharacter, setSelectedCharacter] = useState('')
  const [selectedItem, setSelectedItem] = useState('')
  const [quality, setQuality] = useState<Quality>('excellent')
  const [contentType, setContentType] = useState('openWorld')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<Item[]>([])
  const [itemSearch, setItemSearch] = useState('')

  const { specs, hasCharacter } = useCharacterSpecs(selectedCharacter)

  useEffect(() => {
    let active = true
    getAllItems().then((allItems) => {
      if (!active) return
      setItems(allItems)
    })
    return () => {
      active = false
    }
  }, [])

  const filteredItems = useMemo(() => {
    const lower = itemSearch.trim().toLowerCase()
    return items
      .filter((item) => item.slot === 'mainhand')
      .filter((item) =>
        lower
          ? item.id.toLowerCase().includes(lower) || item.name.toLowerCase().includes(lower)
          : true
      )
  }, [items, itemSearch])

  const handleCalculate = async () => {
    if (!hasCharacter || !selectedItem) return
    setLoading(true)

    try {
      const response = await fetch('/api/ip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: selectedItem,
          quality,
          characterSpecs: specs,
          contentType,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error ?? 'IP calculation failed')
      }
      setResult(data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6">
      <header className="grid gap-2">
        <h1 className="font-display text-2xl text-text1-light dark:text-text1">IP Calculator</h1>
        <p className="text-sm text-muted-light dark:text-muted">
          Calculate IP using live Character Sync spec tables.
        </p>
      </header>

      <section className="grid gap-3 rounded-xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
        <label className="text-xs font-semibold text-muted-light dark:text-muted">Character</label>
        <select
          value={selectedCharacter}
          onChange={(e) => setSelectedCharacter(e.target.value)}
          className="w-full rounded border border-border-light bg-bg-light px-3 py-2 text-sm text-text1-light dark:border-border dark:bg-bg dark:text-text1"
        >
          <option value="">Select character...</option>
          {characters.filter(Boolean).map((character) => (
            <option key={character!.name} value={character!.name}>
              {character!.name} ({character!.server})
            </option>
          ))}
        </select>
      </section>

      <section className="grid gap-3 rounded-xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
        <label className="text-xs font-semibold text-muted-light dark:text-muted">Item Search</label>
        <input
          value={itemSearch}
          onChange={(e) => setItemSearch(e.target.value)}
          className="w-full rounded border border-border-light bg-bg-light px-3 py-2 text-sm text-text1-light dark:border-border dark:bg-bg dark:text-text1"
          placeholder="Search item ID or name"
        />
        <label className="text-xs font-semibold text-muted-light dark:text-muted">Mainhand Item</label>
        <select
          value={selectedItem}
          onChange={(e) => setSelectedItem(e.target.value)}
          className="w-full rounded border border-border-light bg-bg-light px-3 py-2 text-sm text-text1-light dark:border-border dark:bg-bg dark:text-text1"
        >
          <option value="">Select item...</option>
          {filteredItems.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} (T{item.tier})
            </option>
          ))}
        </select>
      </section>

      <section className="grid gap-3 rounded-xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
        <label className="text-xs font-semibold text-muted-light dark:text-muted">Quality</label>
        <select
          value={quality}
          onChange={(e) => setQuality(e.target.value as Quality)}
          className="w-full rounded border border-border-light bg-bg-light px-3 py-2 text-sm text-text1-light dark:border-border dark:bg-bg dark:text-text1"
        >
          {QUALITY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <label className="text-xs font-semibold text-muted-light dark:text-muted">Content Type</label>
        <select
          value={contentType}
          onChange={(e) => setContentType(e.target.value)}
          className="w-full rounded border border-border-light bg-bg-light px-3 py-2 text-sm text-text1-light dark:border-border dark:bg-bg dark:text-text1"
        >
          <option value="openWorld">Open World</option>
          <option value="instanced">Instanced</option>
          <option value="corrupted">Corrupted</option>
        </select>
      </section>

      <button
        onClick={handleCalculate}
        disabled={!hasCharacter || !selectedItem || loading}
        className="btn-forge w-full rounded-lg py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? 'Calculating...' : 'Calculate IP'}
      </button>

      {result && <IPDisplay result={result} showDebug />}
    </div>
  )
}
