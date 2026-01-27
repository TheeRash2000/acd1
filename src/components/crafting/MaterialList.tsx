'use client'

import type { ArtifactRequirement, CraftingRequirement } from '@/lib/crafting/types'
import { getMaterialById } from '@/lib/crafting/data'

interface Props {
  requirements: CraftingRequirement[]
  artifactRequirements: ArtifactRequirement[]
  marketPrices: Map<string, number>
  rrr: number
  enchantmentMultiplier?: number
  useManualPrices?: boolean
  manualPrices?: Record<string, number>
  onManualPriceChange?: (materialId: string, price: number) => void
  usePerMaterialMarkets?: boolean
  materialMarkets?: Record<string, string>
  marketOptions?: string[]
  formatMarketLabel?: (value: string) => string
  onMaterialMarketChange?: (materialId: string, market: string) => void
}

function formatPrice(price: number) {
  if (!Number.isFinite(price)) return '--'
  if (price >= 1000000) return `${(price / 1000000).toFixed(2)}M`
  if (price >= 1000) return `${(price / 1000).toFixed(2)}k`
  return price.toFixed(0)
}

function resolvePrice(
  materialId: string,
  marketPrices: Map<string, number>,
  useManualPrices?: boolean,
  manualPrices?: Record<string, number>
) {
  if (useManualPrices && manualPrices && manualPrices[materialId] !== undefined) {
    return manualPrices[materialId]
  }
  return marketPrices.get(materialId) ?? 0
}

export function MaterialList({
  requirements,
  artifactRequirements,
  marketPrices,
  rrr,
  enchantmentMultiplier = 1,
  useManualPrices,
  manualPrices,
  onManualPriceChange,
  usePerMaterialMarkets,
  materialMarkets,
  marketOptions,
  formatMarketLabel,
  onMaterialMarketChange,
}: Props) {
  const totalMaterialCost = requirements.reduce((sum, req) => {
    const price = resolvePrice(req.material_id, marketPrices, useManualPrices, manualPrices)
    const effectiveAmount = req.amount * enchantmentMultiplier * (1 - rrr)
    return sum + price * effectiveAmount
  }, 0)

  return (
    <div className="grid gap-3 rounded-xl border border-border-light bg-bg-light/40 p-3 text-xs dark:border-border dark:bg-bg/40">
      <div className="text-[11px] uppercase tracking-wide text-muted-light dark:text-muted">Materials</div>
      <div className="grid gap-2">
        {requirements.map((req) => {
          const material = getMaterialById(req.material_id)
          const price = resolvePrice(req.material_id, marketPrices, useManualPrices, manualPrices)
          const effectiveAmount = req.amount * enchantmentMultiplier * (1 - rrr)
          const total = price * effectiveAmount
          const marketValue = materialMarkets?.[req.material_id] ?? (marketOptions?.[0] ?? '')
          return (
            <div key={req.material_id} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <img
                  src={`https://render.albiononline.com/v1/item/${req.material_id}.png`}
                  alt={material?.name ?? req.material_id}
                  className="h-8 w-8 rounded"
                />
                <div>
                  <div className="text-text1-light dark:text-text1">{material?.name ?? req.material_id}</div>
                  <div className="text-[11px] text-muted-light dark:text-muted">
                    Qty {effectiveAmount.toFixed(1)} - {formatPrice(price)}
                  </div>
                  {usePerMaterialMarkets && marketOptions && onMaterialMarketChange ? (
                    <div className="mt-1">
                      <select
                        value={marketValue}
                        onChange={(event) =>
                          onMaterialMarketChange(req.material_id, event.target.value)
                        }
                        className="rounded border border-border-light bg-bg-light px-2 py-1 text-[11px] dark:border-border dark:bg-bg"
                      >
                        {marketOptions.map((option) => (
                          <option key={option} value={option}>
                            {formatMarketLabel ? formatMarketLabel(option) : option}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="flex items-center gap-2 text-text1-light dark:text-text1">
                {useManualPrices && onManualPriceChange ? (
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={Number.isFinite(price) ? price : 0}
                    onChange={(event) =>
                      onManualPriceChange(req.material_id, parseFloat(event.target.value) || 0)
                    }
                    className="w-20 rounded border border-border-light bg-bg-light px-2 py-1 text-[11px] dark:border-border dark:bg-bg"
                  />
                ) : null}
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex items-center justify-between border-t border-border/40 pt-2 text-[11px] text-muted-light dark:text-muted">
        <span>Total Material Cost</span>
        <span className="text-text1-light dark:text-text1">{formatPrice(totalMaterialCost)}</span>
      </div>
      <div className="text-[11px] text-muted-light dark:text-muted">RRR: {(rrr * 100).toFixed(1)}%</div>

      {artifactRequirements.length > 0 && (
        <div className="grid gap-2 border-t border-border/40 pt-2">
          <div className="text-[11px] uppercase tracking-wide text-muted-light dark:text-muted">
            Artifact Requirements
          </div>
          {artifactRequirements.map((artifact) => (
            <div key={artifact.artifact_id} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <img
                  src={`https://render.albiononline.com/v1/item/${artifact.artifact_id}.png`}
                  alt={artifact.artifact_name}
                  className="h-8 w-8 rounded"
                />
                <div className="text-text1-light dark:text-text1">
                  {artifact.artifact_name} x{artifact.amount}
                </div>
                {usePerMaterialMarkets && marketOptions && onMaterialMarketChange ? (
                  <select
                    value={materialMarkets?.[artifact.artifact_id] ?? marketOptions[0]}
                    onChange={(event) =>
                      onMaterialMarketChange(artifact.artifact_id, event.target.value)
                    }
                    className="ml-2 rounded border border-border-light bg-bg-light px-2 py-1 text-[11px] dark:border-border dark:bg-bg"
                  >
                    {marketOptions.map((option) => (
                      <option key={option} value={option}>
                        {formatMarketLabel ? formatMarketLabel(option) : option}
                      </option>
                    ))}
                  </select>
                ) : null}
              </div>
              <div className="flex items-center gap-2 text-muted-light dark:text-muted">
                {useManualPrices && onManualPriceChange ? (
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={
                      Number.isFinite(
                        resolvePrice(artifact.artifact_id, marketPrices, useManualPrices, manualPrices)
                      )
                        ? resolvePrice(
                            artifact.artifact_id,
                            marketPrices,
                            useManualPrices,
                            manualPrices
                          )
                        : 0
                    }
                    onChange={(event) =>
                      onManualPriceChange(artifact.artifact_id, parseFloat(event.target.value) || 0)
                    }
                    className="w-20 rounded border border-border-light bg-bg-light px-2 py-1 text-[11px] dark:border-border dark:bg-bg"
                  />
                ) : null}
                <span>
                  {formatPrice(
                    resolvePrice(artifact.artifact_id, marketPrices, useManualPrices, manualPrices)
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
