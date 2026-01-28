'use client'

import { useMemo } from 'react'
import type { GoldeniumCraftingConfig } from '@/lib/crafting/types'
import {
  ZONE_QUALITY_LABELS,
  HIDEOUT_POWER_LABELS,
  CRAFTING_BONUSES,
} from '@/constants/crafting-bonuses'
import { getGoldeniumBonusBreakdown } from '@/lib/crafting/calculations'

interface Props {
  config: GoldeniumCraftingConfig
  onChange: (config: GoldeniumCraftingConfig) => void
  itemBonusCity?: string
  currentCity?: string
}

export function RRRSelector({
  config,
  onChange,
  itemBonusCity,
  currentCity,
}: Props) {
  const breakdown = useMemo(() => getGoldeniumBonusBreakdown(config), [config])

  const formatPercent = (value: number) => `${(value * 100).toFixed(2)}%`
  const formatPercentSigned = (value: number) => {
    const percent = (value * 100).toFixed(2)
    return value >= 0 ? `+${percent}%` : `${percent}%`
  }

  // Auto-detect city bonus based on item and current city
  const isCityBonusAvailable = itemBonusCity && currentCity &&
    itemBonusCity.toLowerCase() === currentCity.toLowerCase()

  return (
    <div className="grid gap-3 rounded-xl border border-border-light bg-bg-light/60 p-3 text-xs dark:border-border dark:bg-bg/60">
      <div className="flex items-center justify-between text-[11px] uppercase text-muted-light dark:text-muted">
        <span>RRR Calculator</span>
        <span className={breakdown.rrr >= 0.5 ? 'text-amber-300' : 'text-green-400'}>
          {formatPercent(breakdown.rrr)} RRR
        </span>
      </div>

      {/* Zone Quality */}
      <div className="grid gap-1">
        <label className="text-[11px] text-muted-light dark:text-muted">Zone Quality</label>
        <select
          value={config.zoneQuality}
          onChange={(e) => onChange({ ...config, zoneQuality: parseInt(e.target.value, 10) })}
          className="rounded border border-border-light bg-bg-light px-3 py-2 text-xs dark:border-border dark:bg-bg"
        >
          {Object.entries(ZONE_QUALITY_LABELS).map(([level, label]) => (
            <option key={level} value={level}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Hideout Power */}
      <div className="grid gap-1">
        <label className="text-[11px] text-muted-light dark:text-muted">Hideout Power</label>
        <select
          value={config.hideoutPower}
          onChange={(e) => onChange({ ...config, hideoutPower: parseInt(e.target.value, 10) })}
          className="rounded border border-border-light bg-bg-light px-3 py-2 text-xs dark:border-border dark:bg-bg"
        >
          {Object.entries(HIDEOUT_POWER_LABELS).map(([level, label]) => (
            <option key={level} value={level}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Bonus Toggles */}
      <div className="grid gap-2">
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={config.useCityBonus}
            onChange={(e) => onChange({ ...config, useCityBonus: e.target.checked })}
          />
          <span>
            City Bonus (+15%)
            {itemBonusCity && (
              <span className="ml-1 text-[10px] text-muted-light dark:text-muted">
                ({itemBonusCity})
              </span>
            )}
          </span>
          {isCityBonusAvailable && !config.useCityBonus && (
            <span className="text-[10px] text-amber-300">Available!</span>
          )}
        </label>

        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={config.useFocus}
            onChange={(e) => onChange({ ...config, useFocus: e.target.checked })}
          />
          <span>Use Focus (+59%)</span>
        </label>

        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={config.isOnIsland}
            onChange={(e) => onChange({ ...config, isOnIsland: e.target.checked })}
          />
          <span>On Island (-18%)</span>
        </label>
      </div>

      {/* Breakdown */}
      <div className="grid gap-1 rounded-lg border border-border/40 bg-bg-light/30 p-2 text-[11px] dark:bg-bg/30">
        <div className="text-[10px] uppercase tracking-wide text-muted-light dark:text-muted">
          Bonus Breakdown
        </div>
        <div className="grid gap-0.5">
          <div className="flex justify-between">
            <span>Zone Quality:</span>
            <span>{formatPercentSigned(breakdown.zoneQualityBonus)}</span>
          </div>
          <div className="flex justify-between">
            <span>Hideout Power:</span>
            <span>{formatPercentSigned(breakdown.hideoutPowerBonus)}</span>
          </div>
          {config.useCityBonus && (
            <div className="flex justify-between text-green-400">
              <span>City Bonus:</span>
              <span>{formatPercentSigned(breakdown.cityBonus)}</span>
            </div>
          )}
          {config.useFocus && (
            <div className="flex justify-between text-blue-400">
              <span>Focus Bonus:</span>
              <span>{formatPercentSigned(breakdown.focusBonus)}</span>
            </div>
          )}
          {config.isOnIsland && (
            <div className="flex justify-between text-red-400">
              <span>Island Penalty:</span>
              <span>{formatPercentSigned(breakdown.islandPenalty)}</span>
            </div>
          )}
          <div className="mt-1 flex justify-between border-t border-border/40 pt-1 font-medium">
            <span>Total Bonus:</span>
            <span>{formatPercentSigned(breakdown.totalBonus)}</span>
          </div>
          <div className="flex justify-between font-bold text-text1-light dark:text-text1">
            <span>RRR:</span>
            <span className={breakdown.rrr >= 0.5 ? 'text-amber-300' : 'text-green-400'}>
              {formatPercent(breakdown.rrr)}
            </span>
          </div>
        </div>
      </div>

      {/* Formula explanation */}
      <div className="text-[10px] text-muted-light dark:text-muted">
        Formula: RRR = totalBonus / (1 + totalBonus)
      </div>
    </div>
  )
}

// Export alias for backward compatibility
export { RRRSelector as GoldeniumRRRSelector }
