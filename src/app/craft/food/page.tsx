'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useCraftingStore } from '@/stores/crafting'
import { GoldeniumRRRSelector } from '@/components/crafting/GoldeniumRRRSelector'
import { FocusCalculator } from '@/components/crafting/FocusCalculator'
import { FOOD_FCE } from '@/lib/crafting/fce-types'
import { getGoldeniumRRR } from '@/lib/crafting/calculations'

const FOOD_TYPES = Object.entries(FOOD_FCE).map(([id, data]) => ({
  id,
  name: id.charAt(0).toUpperCase() + id.slice(1),
  ...data,
}))

const FOOD_BONUS_CITIES: Record<string, string> = {
  soup: 'Martlock',
  salad: 'Lymhurst',
  pie: 'Bridgewatch',
  omelette: 'Thetford',
  sandwich: 'Fort Sterling',
  stew: 'Caerleon',
  roast: 'Caerleon',
}

export default function FoodCraftingPage() {
  const { inputs, updateInputs } = useCraftingStore()
  const [selectedFood, setSelectedFood] = useState<string>('soup')

  const selectedData = FOOD_FCE[selectedFood]
  const bonusCity = FOOD_BONUS_CITIES[selectedFood]

  const rrr = useMemo(() => {
    return getGoldeniumRRR(inputs.goldeniumConfig)
  }, [inputs.goldeniumConfig])

  return (
    <section className="grid gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-text1-light dark:text-text1">
            Food Crafting
          </h1>
          <p className="text-sm text-muted-light dark:text-muted">
            Food crafting with Goldenium RRR and Focus calculations.
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
          className="rounded border border-amber-400 bg-amber-400/10 px-3 py-1 text-amber-300"
        >
          FOOD
        </Link>
        <Link
          href="/craft/potions"
          className="rounded border border-border-light px-3 py-1 text-text1-light hover:text-accent dark:border-border dark:text-text1"
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
        {/* Food Type Selection */}
        <div className="rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
          <h2 className="mb-4 text-sm font-medium text-text1-light dark:text-text1">
            Food Type
          </h2>

          <div className="grid gap-1">
            {FOOD_TYPES.map((food) => (
              <button
                key={food.id}
                type="button"
                onClick={() => setSelectedFood(food.id)}
                className={`rounded px-3 py-2 text-left text-xs transition-colors ${
                  selectedFood === food.id
                    ? 'bg-amber-400/10 text-amber-300'
                    : 'text-text1-light hover:bg-bg-light/60 dark:text-text1 dark:hover:bg-bg/60'
                }`}
              >
                <div className="font-medium">{food.name}</div>
                <div className="text-[10px] text-muted-light dark:text-muted">
                  Base Focus: {food.baseFocus} | Bonus: {FOOD_BONUS_CITIES[food.id] ?? 'None'}
                </div>
              </button>
            ))}
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
            itemBonusCity={bonusCity}
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
            category="food"
            subcategory={selectedFood}
          />
        </div>
      </div>

      {/* Selected Food Info */}
      {selectedData && (
        <div className="rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
          <h2 className="mb-4 text-sm font-medium text-text1-light dark:text-text1">
            {selectedFood.charAt(0).toUpperCase() + selectedFood.slice(1)} - FCE Data
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
              <div className="text-lg font-bold text-amber-300">{bonusCity ?? 'None'}</div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
