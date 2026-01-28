'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useCraftingStore } from '@/stores/crafting'
import { GoldeniumRRRSelector } from '@/components/crafting/RRRSelector'
import { FocusCalculator } from '@/components/crafting/FocusCalculator'
import { POTION_FCE } from '@/lib/crafting/fce-types'
import { getGoldeniumRRR } from '@/lib/crafting/calculations'

const POTION_TYPES = Object.entries(POTION_FCE).map(([id, data]) => ({
  id,
  name: id.charAt(0).toUpperCase() + id.slice(1) + ' Potion',
  ...data,
}))

// Potions bonus city is Thetford
const POTION_BONUS_CITY = 'Thetford'

export default function PotionCraftingPage() {
  const { inputs, updateInputs } = useCraftingStore()
  const [selectedPotion, setSelectedPotion] = useState<string>('healing')

  const selectedData = POTION_FCE[selectedPotion]

  const rrr = useMemo(() => {
    return getGoldeniumRRR(inputs.goldeniumConfig)
  }, [inputs.goldeniumConfig])

  return (
    <section className="grid gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-text1-light dark:text-text1">
            Potion Crafting
          </h1>
          <p className="text-sm text-muted-light dark:text-muted">
            Potion crafting with Goldenium RRR and Focus calculations.
          </p>
        </div>
      </header>

      {/* Navigation */}
      <nav className="flex flex-wrap items-center gap-2 text-xs">
        <Link
          href="/craft/gear"
          className="rounded border border-border-light px-3 py-1 text-text1-light hover:text-accent dark:border-border dark:text-text1"
        >
          GEAR
        </Link>
        <Link
          href="/craft/food"
          className="rounded border border-border-light px-3 py-1 text-text1-light hover:text-accent dark:border-border dark:text-text1"
        >
          FOOD
        </Link>
        <Link
          href="/craft/potions"
          className="rounded border border-amber-400 bg-amber-400/10 px-3 py-1 text-amber-300"
        >
          POTIONS
        </Link>
        <Link
          href="/craft/refining"
          className="rounded border border-border-light px-3 py-1 text-text1-light hover:text-accent dark:border-border dark:text-text1"
        >
          REFINING
        </Link>
        <Link
          href="/craft"
          className="ml-auto rounded border border-border-light px-3 py-1 text-text1-light hover:text-accent dark:border-border dark:text-text1"
        >
          Classic View
        </Link>
      </nav>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Potion Type Selection */}
        <div className="rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
          <h2 className="mb-4 text-sm font-medium text-text1-light dark:text-text1">
            Potion Type
          </h2>

          <div className="grid gap-1">
            {POTION_TYPES.map((potion) => (
              <button
                key={potion.id}
                type="button"
                onClick={() => setSelectedPotion(potion.id)}
                className={`rounded px-3 py-2 text-left text-xs transition-colors ${
                  selectedPotion === potion.id
                    ? 'bg-amber-400/10 text-amber-300'
                    : 'text-text1-light hover:bg-bg-light/60 dark:text-text1 dark:hover:bg-bg/60'
                }`}
              >
                <div className="font-medium">{potion.name}</div>
                <div className="text-[10px] text-muted-light dark:text-muted">
                  Base Focus: {potion.baseFocus}
                </div>
              </button>
            ))}
          </div>

          <div className="mt-4 rounded-lg border border-amber-400/30 bg-amber-400/10 p-2 text-[11px] text-amber-300">
            All potions have bonus crafting in {POTION_BONUS_CITY}
          </div>
        </div>

        {/* RRR Calculator */}
        <div className="rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
          <h2 className="mb-4 text-sm font-medium text-text1-light dark:text-text1">
            Return Rate (Goldenium)
          </h2>

          <GoldeniumRRRSelector
            config={inputs.goldeniumConfig}
            onChange={(config) => updateInputs({ goldeniumConfig: config })}
            itemBonusCity={POTION_BONUS_CITY}
          />

          <div className="mt-4 rounded-lg border border-border-light bg-bg-light/40 p-3 dark:border-border dark:bg-bg/40">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-light dark:text-muted">Material Return Rate:</span>
              <span className="text-lg font-bold text-green-400">
                {(rrr * 100).toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* Focus Calculator */}
        <div className="rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
          <h2 className="mb-4 text-sm font-medium text-text1-light dark:text-text1">
            Focus Cost (FCE)
          </h2>

          <FocusCalculator
            category="potion"
            subcategory={selectedPotion}
          />
        </div>
      </div>

      {/* Selected Potion Info */}
      {selectedData && (
        <div className="rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
          <h2 className="mb-4 text-sm font-medium text-text1-light dark:text-text1">
            {selectedPotion.charAt(0).toUpperCase() + selectedPotion.slice(1)} Potion - FCE Data
          </h2>
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-lg border border-border-light bg-bg-light/40 p-3 dark:border-border dark:bg-bg/40">
              <div className="text-[10px] uppercase text-muted-light dark:text-muted">Base Focus</div>
              <div className="text-lg font-bold text-text1-light dark:text-text1">{selectedData.baseFocus}</div>
            </div>
            <div className="rounded-lg border border-border-light bg-bg-light/40 p-3 dark:border-border dark:bg-bg/40">
              <div className="text-[10px] uppercase text-muted-light dark:text-muted">Unique FCE/lvl</div>
              <div className="text-lg font-bold text-text1-light dark:text-text1">{selectedData.specUniqueFCE}</div>
            </div>
            <div className="rounded-lg border border-border-light bg-bg-light/40 p-3 dark:border-border dark:bg-bg/40">
              <div className="text-[10px] uppercase text-muted-light dark:text-muted">Mutual FCE/lvl</div>
              <div className="text-lg font-bold text-text1-light dark:text-text1">{selectedData.specMutualFCE}</div>
            </div>
            <div className="rounded-lg border border-border-light bg-bg-light/40 p-3 dark:border-border dark:bg-bg/40">
              <div className="text-[10px] uppercase text-muted-light dark:text-muted">Bonus City</div>
              <div className="text-lg font-bold text-amber-300">{POTION_BONUS_CITY}</div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
