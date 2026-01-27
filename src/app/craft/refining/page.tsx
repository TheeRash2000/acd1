'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useCraftingStore } from '@/stores/crafting'
import { GoldeniumRRRSelector } from '@/components/crafting/GoldeniumRRRSelector'
import { FocusCalculator } from '@/components/crafting/FocusCalculator'
import { REFINING_FCE, REFINING_ENCHANT_MULTIPLIER, type RefiningMaterialType } from '@/lib/crafting/fce-types'
import { getGoldeniumRRR } from '@/lib/crafting/calculations'

const MATERIAL_TYPES: { id: RefiningMaterialType; name: string; bonusCity: string }[] = [
  { id: 'ore', name: 'Ore (Metal Bars)', bonusCity: 'Thetford' },
  { id: 'wood', name: 'Wood (Planks)', bonusCity: 'Lymhurst' },
  { id: 'hide', name: 'Hide (Leather)', bonusCity: 'Martlock' },
  { id: 'fiber', name: 'Fiber (Cloth)', bonusCity: 'Bridgewatch' },
  { id: 'stone', name: 'Stone (Blocks)', bonusCity: 'Fort Sterling' },
]

const TIERS = [4, 5, 6, 7, 8]
const ENCHANTMENTS = [0, 1, 2, 3, 4]

export default function RefiningPage() {
  const { inputs, updateInputs } = useCraftingStore()
  const [selectedMaterial, setSelectedMaterial] = useState<RefiningMaterialType>('ore')
  const [selectedTier, setSelectedTier] = useState(4)
  const [selectedEnchant, setSelectedEnchant] = useState(0)

  const materialData = MATERIAL_TYPES.find((m) => m.id === selectedMaterial)
  const refiningData = REFINING_FCE[selectedMaterial]

  const baseFocus = refiningData?.baseFocus[selectedTier] ?? 0
  const enchantMultiplier = REFINING_ENCHANT_MULTIPLIER[selectedEnchant] ?? 1
  const adjustedBaseFocus = baseFocus * enchantMultiplier

  const rrr = useMemo(() => {
    return getGoldeniumRRR(inputs.goldeniumConfig)
  }, [inputs.goldeniumConfig])

  return (
    <section className="grid gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-text1-light dark:text-text1">
            Refining
          </h1>
          <p className="text-sm text-muted-light dark:text-muted">
            Material refining with Goldenium RRR and Focus calculations.
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
          className="rounded border border-border-light px-3 py-1 text-text1-light hover:text-accent dark:border-border dark:text-text1"
        >
          POTIONS
        </Link>
        <Link
          href="/craft/refining"
          className="rounded border border-amber-400 bg-amber-400/10 px-3 py-1 text-amber-300"
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
        {/* Material Selection */}
        <div className="rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
          <h2 className="mb-4 text-sm font-medium text-text1-light dark:text-text1">
            Material Type
          </h2>

          <div className="grid gap-1">
            {MATERIAL_TYPES.map((material) => (
              <button
                key={material.id}
                type="button"
                onClick={() => setSelectedMaterial(material.id)}
                className={`rounded px-3 py-2 text-left text-xs transition-colors ${
                  selectedMaterial === material.id
                    ? 'bg-amber-400/10 text-amber-300'
                    : 'text-text1-light hover:bg-bg-light/60 dark:text-text1 dark:hover:bg-bg/60'
                }`}
              >
                <div className="font-medium">{material.name}</div>
                <div className="text-[10px] text-muted-light dark:text-muted">
                  Bonus City: {material.bonusCity}
                </div>
              </button>
            ))}
          </div>

          {/* Tier Selection */}
          <div className="mt-4 grid gap-2">
            <label className="text-[11px] uppercase text-muted-light dark:text-muted">Tier</label>
            <div className="flex gap-1">
              {TIERS.map((tier) => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setSelectedTier(tier)}
                  className={`flex-1 rounded px-2 py-1.5 text-xs transition-colors ${
                    selectedTier === tier
                      ? 'bg-amber-400/10 text-amber-300'
                      : 'bg-bg-light text-text1-light hover:bg-bg-light/80 dark:bg-bg dark:text-text1 dark:hover:bg-bg/80'
                  }`}
                >
                  T{tier}
                </button>
              ))}
            </div>
          </div>

          {/* Enchantment Selection */}
          <div className="mt-4 grid gap-2">
            <label className="text-[11px] uppercase text-muted-light dark:text-muted">Enchantment</label>
            <div className="flex gap-1">
              {ENCHANTMENTS.map((enchant) => (
                <button
                  key={enchant}
                  type="button"
                  onClick={() => setSelectedEnchant(enchant)}
                  className={`flex-1 rounded px-2 py-1.5 text-xs transition-colors ${
                    selectedEnchant === enchant
                      ? 'bg-amber-400/10 text-amber-300'
                      : 'bg-bg-light text-text1-light hover:bg-bg-light/80 dark:bg-bg dark:text-text1 dark:hover:bg-bg/80'
                  }`}
                >
                  .{enchant}
                </button>
              ))}
            </div>
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
            itemBonusCity={materialData?.bonusCity}
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
            category="refining"
            materialType={selectedMaterial}
            tier={selectedTier}
            enchantment={selectedEnchant}
          />
        </div>
      </div>

      {/* Selected Refining Info */}
      {refiningData && (
        <div className="rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
          <h2 className="mb-4 text-sm font-medium text-text1-light dark:text-text1">
            T{selectedTier}.{selectedEnchant} {materialData?.name} - FCE Data
          </h2>
          <div className="grid gap-4 sm:grid-cols-5">
            <div className="rounded-lg border border-border-light bg-bg-light/40 p-3 dark:border-border dark:bg-bg/40">
              <div className="text-[10px] uppercase text-muted-light dark:text-muted">Base Focus (T{selectedTier})</div>
              <div className="text-lg font-bold text-text1-light dark:text-text1">{baseFocus}</div>
            </div>
            <div className="rounded-lg border border-border-light bg-bg-light/40 p-3 dark:border-border dark:bg-bg/40">
              <div className="text-[10px] uppercase text-muted-light dark:text-muted">Enchant Multiplier</div>
              <div className="text-lg font-bold text-text1-light dark:text-text1">{enchantMultiplier}x</div>
            </div>
            <div className="rounded-lg border border-border-light bg-bg-light/40 p-3 dark:border-border dark:bg-bg/40">
              <div className="text-[10px] uppercase text-muted-light dark:text-muted">Adjusted Focus</div>
              <div className="text-lg font-bold text-amber-300">{adjustedBaseFocus}</div>
            </div>
            <div className="rounded-lg border border-border-light bg-bg-light/40 p-3 dark:border-border dark:bg-bg/40">
              <div className="text-[10px] uppercase text-muted-light dark:text-muted">Unique FCE/lvl</div>
              <div className="text-lg font-bold text-text1-light dark:text-text1">{refiningData.specUniqueFCE}</div>
            </div>
            <div className="rounded-lg border border-border-light bg-bg-light/40 p-3 dark:border-border dark:bg-bg/40">
              <div className="text-[10px] uppercase text-muted-light dark:text-muted">Mutual FCE/lvl</div>
              <div className="text-lg font-bold text-text1-light dark:text-text1">{refiningData.specMutualFCE}</div>
            </div>
          </div>

          {/* Refining Chain Note */}
          <div className="mt-4 rounded-lg border border-blue-400/30 bg-blue-400/10 p-3 text-[11px] text-blue-300">
            <strong>Refining Mutual Chain:</strong> Ore → Wood → Hide → Fiber → Stone
            <br />
            Each refining spec contributes mutual FCE to the next material in the chain.
          </div>
        </div>
      )}
    </section>
  )
}
