'use client'

import { useMemo } from 'react'
import type { HideoutConfig, SavedHideout } from '@/lib/crafting/types'

interface Props {
  locationType: 'city' | 'hideout'
  selectedCity: string
  hideoutConfig: HideoutConfig
  onLocationTypeChange: (value: 'city' | 'hideout') => void
  onCityChange: (value: string) => void
  onHideoutChange: (value: HideoutConfig) => void
  computedRrr: number
  savedHideouts?: SavedHideout[]
  activeHideoutId?: string | null
  onSavePreset?: () => void
  onSelectPreset?: (id: string | null) => void
  onRemovePreset?: (id: string) => void
}

const CITY_OPTIONS = [
  'Bridgewatch',
  'Lymhurst',
  'Martlock',
  'Thetford',
  'Fort Sterling',
  'Caerleon',
  'Brecilien',
]

const FOOD_PRESETS = [
  { label: 'No nutrition bonus (0%)', value: 0 },
  { label: 'Basic meal (+15%)', value: 15 },
  { label: 'Hearty meal (+30%)', value: 30 },
  { label: 'Feast (+50%)', value: 50 },
  { label: 'Maxed nutrition (+100%)', value: 100 },
]

const MAP_QUALITY_PRESETS = [
  { label: 'Normal map (0%)', value: 0 },
  { label: 'Well-kept map (+5%)', value: 5 },
  { label: 'High quality (+10%)', value: 10 },
  { label: 'Excellent (+15%)', value: 15 },
  { label: 'Pristine (+20%)', value: 20 },
]

export function RRRSelector({
  locationType,
  selectedCity,
  hideoutConfig,
  onLocationTypeChange,
  onCityChange,
  onHideoutChange,
  computedRrr,
  savedHideouts = [],
  activeHideoutId = null,
  onSavePreset,
  onSelectPreset,
  onRemovePreset,
}: Props) {
  const safeHideout = useMemo(
    () => ({
      ...hideoutConfig,
      foodBonus: hideoutConfig.foodBonus ?? 0,
      mapQualityBonus: hideoutConfig.mapQualityBonus ?? 0,
      energyLevel: hideoutConfig.energyLevel ?? 100,
    }),
    [hideoutConfig]
  )
  const rrrLabel = useMemo(() => `${(computedRrr * 100).toFixed(1)}%`, [computedRrr])
  const capped = computedRrr >= 0.5

  return (
    <div className="grid gap-3 rounded-xl border border-border-light bg-bg-light/60 p-3 text-xs dark:border-border dark:bg-bg/60">
      <div className="flex items-center justify-between text-[11px] uppercase text-muted-light dark:text-muted">
        <span>RRR Location</span>
        <span className={capped ? 'text-amber-300' : 'text-text1-light dark:text-text1'}>
          {rrrLabel}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-xs">
          <input
            type="radio"
            value="city"
            checked={locationType === 'city'}
            onChange={() => onLocationTypeChange('city')}
          />
          Royal City
        </label>
        <label className="flex items-center gap-2 text-xs">
          <input
            type="radio"
            value="hideout"
            checked={locationType === 'hideout'}
            onChange={() => onLocationTypeChange('hideout')}
          />
          Hideout
        </label>
      </div>

      {locationType === 'city' ? (
        <select
          value={selectedCity}
          onChange={(event) => onCityChange(event.target.value)}
          className="rounded border border-border-light bg-bg-light px-3 py-2 text-xs dark:border-border dark:bg-bg"
        >
          {CITY_OPTIONS.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      ) : (
        <div className="grid gap-2">
          {savedHideouts.length > 0 && (
            <div className="grid gap-1 text-xs">
              <label className="text-muted-light dark:text-muted">Saved Hideouts</label>
              <div className="flex gap-2">
                <select
                  value={activeHideoutId ?? ''}
                  onChange={(event) => onSelectPreset?.(event.target.value || null)}
                  className="flex-1 rounded border border-border-light bg-bg-light px-3 py-2 text-xs dark:border-border dark:bg-bg"
                >
                  <option value="">Select hideout...</option>
                  {savedHideouts.map((hideout) => (
                    <option key={hideout.id} value={hideout.id}>
                      {hideout.name || 'Unnamed'} {hideout.guild ? `(${hideout.guild})` : ''}
                    </option>
                  ))}
                </select>
                {activeHideoutId && onRemovePreset && (
                  <button
                    type="button"
                    className="btn-secondary px-2 text-xs"
                    onClick={() => onRemovePreset(activeHideoutId)}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          )}
          <input
            type="text"
            placeholder="Hideout name"
            value={safeHideout.name}
            onChange={(event) => onHideoutChange({ ...safeHideout, name: event.target.value })}
            className="rounded border border-border-light bg-bg-light px-3 py-2 text-xs dark:border-border dark:bg-bg"
          />
          <input
            type="text"
            placeholder="Guild name (optional)"
            value={safeHideout.guild ?? ''}
            onChange={(event) =>
              onHideoutChange({ ...safeHideout, guild: event.target.value })
            }
            className="rounded border border-border-light bg-bg-light px-3 py-2 text-xs dark:border-border dark:bg-bg"
          />
          <div className="grid gap-2 sm:grid-cols-2">
            <select
              value={safeHideout.buildingType}
              onChange={(event) =>
                onHideoutChange({
                  ...safeHideout,
                  buildingType: event.target.value as HideoutConfig['buildingType'],
                })
              }
              className="rounded border border-border-light bg-bg-light px-3 py-2 text-xs dark:border-border dark:bg-bg"
            >
              <option value="forge">Forge</option>
              <option value="workbench">Workbench</option>
              <option value="tailor">Tailor</option>
              <option value="toolmaker">Toolmaker</option>
              <option value="alchemy">Alchemy Lab</option>
              <option value="cook">Kitchen</option>
            </select>
            <select
              value={safeHideout.buildingTier}
              onChange={(event) =>
                onHideoutChange({
                  ...safeHideout,
                  buildingTier: parseInt(event.target.value, 10),
                })
              }
              className="rounded border border-border-light bg-bg-light px-3 py-2 text-xs dark:border-border dark:bg-bg"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((tier) => (
                <option key={tier} value={tier}>
                  Tier {tier}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-1 text-xs">
            <label className="text-muted-light dark:text-muted">Food preset</label>
            <select
              value={safeHideout.foodBonus}
              onChange={(event) =>
                onHideoutChange({
                  ...safeHideout,
                  foodBonus: parseInt(event.target.value, 10),
                })
              }
              className="rounded border border-border-light bg-bg-light px-3 py-2 text-xs dark:border-border dark:bg-bg"
            >
              {FOOD_PRESETS.map((preset) => (
                <option key={preset.value} value={preset.value}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-1 text-xs">
            <label className="text-muted-light dark:text-muted">Map quality</label>
            <select
              value={safeHideout.mapQualityBonus}
              onChange={(event) =>
                onHideoutChange({
                  ...safeHideout,
                  mapQualityBonus: parseInt(event.target.value, 10),
                })
              }
              className="rounded border border-border-light bg-bg-light px-3 py-2 text-xs dark:border-border dark:bg-bg"
            >
              {MAP_QUALITY_PRESETS.map((preset) => (
                <option key={preset.value} value={preset.value}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-1">
            <div className="flex items-center justify-between text-[11px] text-muted-light dark:text-muted">
              <span>Food Bonus</span>
              <span>{safeHideout.foodBonus}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={safeHideout.foodBonus}
              onChange={(event) =>
                onHideoutChange({
                  ...safeHideout,
                  foodBonus: parseInt(event.target.value, 10),
                })
              }
            />
          </div>
          <div className="grid gap-1">
            <div className="flex items-center justify-between text-[11px] text-muted-light dark:text-muted">
              <span>Map Quality Bonus</span>
              <span>{safeHideout.mapQualityBonus}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              value={safeHideout.mapQualityBonus}
              onChange={(event) =>
                onHideoutChange({
                  ...safeHideout,
                  mapQualityBonus: parseInt(event.target.value, 10),
                })
              }
            />
          </div>
          <div className="grid gap-1">
            <div className="flex items-center justify-between text-[11px] text-muted-light dark:text-muted">
              <span>Energy Level</span>
              <span>{safeHideout.energyLevel}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={safeHideout.energyLevel}
              onChange={(event) =>
                onHideoutChange({
                  ...safeHideout,
                  energyLevel: parseInt(event.target.value, 10),
                })
              }
            />
          </div>
          {onSavePreset && (
            <button type="button" className="btn-secondary px-3 py-2 text-xs" onClick={onSavePreset}>
              Save Hideout Preset
            </button>
          )}
        </div>
      )}
      {capped && <div className="text-[11px] text-amber-300">RRR capped at 50%.</div>}
    </div>
  )
}
