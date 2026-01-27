'use client'

import { useState } from 'react'
import { DestinyBoardManager } from '@/components/DestinyBoard/DestinyBoardManager'
import { FocusCalculatorPanel } from '@/components/DestinyBoard/FocusCalculatorPanel'

const TABS = [
  { id: 'fighting', label: 'Fighting (IP & Specs)' },
  { id: 'crafting', label: 'Crafting / Refining (Focus)' },
]

export default function CharacterSyncPage() {
  const [activeTab, setActiveTab] = useState<string>('fighting')

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl text-text1-light dark:text-text1">Destiny Board Dashboard</h1>
            <p className="text-sm text-muted-light dark:text-muted">
              Fighting progression (IP) and crafting/refining focus calculators in separate tabs.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-accent text-white'
                  : 'border border-border-light bg-surface-light text-text1-light hover:border-accent dark:border-border dark:bg-surface dark:text-text1'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {activeTab === 'fighting' ? (
        <DestinyBoardManager />
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg border border-border-light bg-surface-light p-4 text-sm text-muted-light dark:border-border dark:bg-surface dark:text-muted">
            Crafting, refining, and gathering use focus (FCE) formulas, not combat IP. This tab keeps them separate to avoid mixing formulas.
          </div>
          <FocusCalculatorPanel />
        </div>
      )}
    </div>
  )
}
