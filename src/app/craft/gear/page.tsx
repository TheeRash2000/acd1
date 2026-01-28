'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useCraftingStore } from '@/stores/crafting'
import { GoldeniumRRRSelector } from '@/components/crafting/RRRSelector'
import { FocusCalculator } from '@/components/crafting/FocusCalculator'
import { GEAR_SUBCATEGORY_FCE } from '@/lib/crafting/fce-types'
import { getGoldeniumRRR } from '@/lib/crafting/calculations'

const GEAR_SUBCATEGORIES = Object.entries(GEAR_SUBCATEGORY_FCE).map(([id, data]) => ({
  id,
  name: data.name,
  category: data.craftingCategory,
  bonusCity: data.bonusCity,
}))

const CATEGORY_NAMES: Record<number, string> = {
  1: 'Mage Tower',
  2: 'Hunter Lodge',
  3: 'Warrior Forge',
  4: 'Toolmaker',
}

export default function GearCraftingPage() {
  const { inputs, updateInputs } = useCraftingStore()
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('sword')
  const [isArtifact, setIsArtifact] = useState(false)
  const [isCrystal, setIsCrystal] = useState(false)

  const selectedData = GEAR_SUBCATEGORY_FCE[selectedSubcategory]

  const rrr = useMemo(() => {
    return getGoldeniumRRR(inputs.goldeniumConfig)
  }, [inputs.goldeniumConfig])

  const groupedSubcategories = useMemo(() => {
    const groups: Record<number, typeof GEAR_SUBCATEGORIES> = { 1: [], 2: [], 3: [], 4: [] }
    GEAR_SUBCATEGORIES.forEach((sub) => {
      groups[sub.category].push(sub)
    })
    return groups
  }, [])

  return (
    <section className="grid gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-text1-light dark:text-text1">
            Gear Crafting
          </h1>
          <p className="text-sm text-muted-light dark:text-muted">
            Equipment crafting with Goldenium RRR and Focus calculations.
          </p>
        </div>
      </header>

      {/* Navigation */}
      <nav className="flex flex-wrap items-center gap-2 text-xs">
        <Link
          href="/craft/gear"
          className="rounded border border-amber-400 bg-amber-400/10 px-3 py-1 text-amber-300"
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
        {/* Subcategory Selection */}
        <div className="rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
          <h2 className="mb-4 text-sm font-medium text-text1-light dark:text-text1">
            Equipment Type
          </h2>

          <div className="grid gap-4">
            {[1, 2, 3, 4].map((categoryId) => (
              <div key={categoryId}>
                <h3 className="mb-2 text-[11px] uppercase tracking-wide text-muted-light dark:text-muted">
                  {CATEGORY_NAMES[categoryId]}
                </h3>
                <div className="grid gap-1">
                  {groupedSubcategories[categoryId].map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setSelectedSubcategory(sub.id)}
                      className={`rounded px-3 py-1.5 text-left text-xs transition-colors ${
                        selectedSubcategory === sub.id
                          ? 'bg-amber-400/10 text-amber-300'
                          : 'text-text1-light hover:bg-bg-light/60 dark:text-text1 dark:hover:bg-bg/60'
                      }`}
                    >
                      {sub.name}
                      {sub.bonusCity && (
                        <span className="ml-2 text-[10px] text-muted-light dark:text-muted">
                          ({sub.bonusCity})
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Item Type Toggles */}
          <div className="mt-4 grid gap-2 border-t border-border-light pt-4 dark:border-border">
            <h3 className="text-[11px] uppercase tracking-wide text-muted-light dark:text-muted">
              Item Type
            </h3>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={isArtifact}
                onChange={(e) => {
                  setIsArtifact(e.target.checked)
                  if (e.target.checked) setIsCrystal(false)
                }}
              />
              Artifact Item (15 unique FCE)
            </label>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={isCrystal}
                onChange={(e) => {
                  setIsCrystal(e.target.checked)
                  if (e.target.checked) setIsArtifact(false)
                }}
              />
              Crystal Item (2.15 unique FCE)
            </label>
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
            itemBonusCity={selectedData?.bonusCity}
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
            category="gear"
            subcategory={selectedSubcategory}
            isArtifact={isArtifact}
            isCrystal={isCrystal}
          />
        </div>
      </div>

      {/* Selected Item Info */}
      {selectedData && (
        <div className="rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
          <h2 className="mb-4 text-sm font-medium text-text1-light dark:text-text1">
            {selectedData.name} - FCE Data
          </h2>
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-lg border border-border-light bg-bg-light/40 p-3 dark:border-border dark:bg-bg/40">
              <div className="text-[10px] uppercase text-muted-light dark:text-muted">Base Focus</div>
              <div className="text-lg font-bold text-text1-light dark:text-text1">{selectedData.baseFocus}</div>
            </div>
            <div className="rounded-lg border border-border-light bg-bg-light/40 p-3 dark:border-border dark:bg-bg/40">
              <div className="text-[10px] uppercase text-muted-light dark:text-muted">Unique FCE/lvl</div>
              <div className="text-lg font-bold text-text1-light dark:text-text1">
                {isArtifact ? 15 : isCrystal ? 2.15 : selectedData.specUniqueFCE}
              </div>
            </div>
            <div className="rounded-lg border border-border-light bg-bg-light/40 p-3 dark:border-border dark:bg-bg/40">
              <div className="text-[10px] uppercase text-muted-light dark:text-muted">Mutual FCE/lvl</div>
              <div className="text-lg font-bold text-text1-light dark:text-text1">{selectedData.specMutualFCE}</div>
            </div>
            <div className="rounded-lg border border-border-light bg-bg-light/40 p-3 dark:border-border dark:bg-bg/40">
              <div className="text-[10px] uppercase text-muted-light dark:text-muted">Bonus City</div>
              <div className="text-lg font-bold text-amber-300">{selectedData.bonusCity ?? 'None'}</div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
