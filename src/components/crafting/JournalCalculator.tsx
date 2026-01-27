'use client'

import { useMemo, useState } from 'react'
import { calculateJournalProfit } from '@/lib/crafting/calculations'
import { formatJournalName, getAvailableJournals, getJournalById } from '@/lib/crafting/data'

function formatPrice(price: number) {
  if (!Number.isFinite(price)) return '--'
  if (price >= 1000000) return `${(price / 1000000).toFixed(2)}M`
  if (price >= 1000) return `${(price / 1000).toFixed(2)}k`
  return price.toFixed(0)
}

export function JournalCalculator() {
  const journals = useMemo(() => getAvailableJournals(), [])
  const [selectedJournalId, setSelectedJournalId] = useState('')
  const [currentFame, setCurrentFame] = useState(0)
  const [journalCost, setJournalCost] = useState(0)

  const selectedJournal = selectedJournalId ? getJournalById(selectedJournalId) : undefined

  const result = useMemo(() => {
    if (!selectedJournal || currentFame <= 0) return null
    return calculateJournalProfit(selectedJournal, currentFame, journalCost)
  }, [selectedJournal, currentFame, journalCost])

  return (
    <div className="grid gap-3 rounded-xl border border-border-light bg-bg-light/40 p-3 text-xs dark:border-border dark:bg-bg/40">
      <div className="text-[11px] uppercase tracking-wide text-muted-light dark:text-muted">
        Journal Profit Calculator
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <select
          value={selectedJournalId}
          onChange={(event) => setSelectedJournalId(event.target.value)}
          className="rounded border border-border-light bg-bg-light px-3 py-2 text-xs dark:border-border dark:bg-bg"
        >
          <option value="">Select Journal</option>
          {journals.map((journal) => (
          <option key={journal.journal_id} value={journal.journal_id}>
            {formatJournalName(journal.name)}
          </option>
        ))}
      </select>
        <input
          type="number"
          placeholder="Fame per activity"
          value={currentFame || ''}
          onChange={(event) => setCurrentFame(parseInt(event.target.value, 10) || 0)}
          className="rounded border border-border-light bg-bg-light px-3 py-2 text-xs dark:border-border dark:bg-bg"
        />
      </div>
      <input
        type="number"
        placeholder="Journal cost (silver)"
        value={journalCost || ''}
        onChange={(event) => setJournalCost(parseInt(event.target.value, 10) || 0)}
        className="rounded border border-border-light bg-bg-light px-3 py-2 text-xs dark:border-border dark:bg-bg"
      />
      {selectedJournal && result && (
        <div className="grid gap-1 text-[11px] text-muted-light dark:text-muted">
          <div className="flex justify-between">
            <span>Fills needed</span>
            <span>{result.fills_needed}</span>
          </div>
          <div className="flex justify-between">
            <span>Total profit</span>
            <span>{formatPrice(result.profit)}</span>
          </div>
          {result.fills_needed > 0 && (
            <div className="flex justify-between">
              <span>Profit per fill</span>
              <span>{formatPrice(result.profit / result.fills_needed)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
