'use client';

import { useMemo, useState } from 'react';
import { calculateFocusCost } from '@/lib/calculators/focus-calculator';

const TIERS = ['T4', 'T5', 'T6', 'T7', 'T8'];
const ACTIVITIES = [
  { id: 'equipment', label: 'Crafting - Equipment' },
  { id: 'consumable', label: 'Crafting - Consumable' },
  { id: 'refining_ore', label: 'Refining - Ore' },
  { id: 'refining_hide', label: 'Refining - Hide' },
  { id: 'refining_stone', label: 'Refining - Stone' },
  { id: 'refining_wood', label: 'Refining - Wood' },
  { id: 'refining_fiber', label: 'Refining - Fiber' },
];

const EQUIPMENT_TYPES = [
  { id: 'simple', label: 'Simple' },
  { id: 'royal', label: 'Royal' },
  { id: 'artifact', label: 'Artifact' },
  { id: 'avalonian', label: 'Avalonian' },
];

interface MutualEntry {
  id: string;
  level: number;
  type: 'simple' | 'royal' | 'artifact' | 'avalonian';
}

export function FocusCalculatorPanel() {
  const [activity, setActivity] = useState<string>('equipment');
  const [tier, setTier] = useState<string>('T6');
  const [masteryLevel, setMasteryLevel] = useState<number>(100);
  const [specLevel, setSpecLevel] = useState<number>(100);
  const [equipmentType, setEquipmentType] = useState<'simple' | 'royal' | 'artifact' | 'avalonian'>('simple');
  const [mutualSpecs, setMutualSpecs] = useState<MutualEntry[]>([
    { id: 'mutual-1', level: 80, type: 'simple' },
  ]);

  const mutualRecord = useMemo(() => {
    return mutualSpecs.reduce<Record<string, { level: number; type: 'simple' | 'royal' | 'artifact' | 'avalonian' }>>(
      (acc, entry) => {
        acc[entry.id] = { level: entry.level, type: entry.type };
        return acc;
      },
      {}
    );
  }, [mutualSpecs]);

  const result = calculateFocusCost({
    activity: activity as any,
    tier,
    masteryLevel,
    equippedSpecLevel: specLevel,
    equipmentType,
    allSpecsInMastery: mutualRecord,
  });

  return (
    <div className="rounded-lg border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-text1-light dark:text-text1">Focus Calculator</h3>
          <p className="text-xs text-muted-light dark:text-muted">Crafting/refining only — separate from combat IP.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <div className="grid gap-2 text-sm">
            <label className="text-xs font-medium text-muted-light dark:text-muted">Activity</label>
            <select
              className="rounded border border-border-light bg-bg-light px-3 py-2 text-sm dark:border-border dark:bg-bg"
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
            >
              {ACTIVITIES.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="grid gap-1">
              <label className="text-xs font-medium text-muted-light dark:text-muted">Tier</label>
              <select
                className="rounded border border-border-light bg-bg-light px-2 py-2 text-sm dark:border-border dark:bg-bg"
                value={tier}
                onChange={(e) => setTier(e.target.value)}
              >
                {TIERS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-1">
              <label className="text-xs font-medium text-muted-light dark:text-muted">Equipment Type</label>
              <select
                className="rounded border border-border-light bg-bg-light px-2 py-2 text-sm dark:border-border dark:bg-bg"
                value={equipmentType}
                onChange={(e) => setEquipmentType(e.target.value as any)}
              >
                {EQUIPMENT_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-light dark:text-muted">Mastery Level (FCE)</label>
            <input
              type="range"
              min={0}
              max={100}
              value={masteryLevel}
              onChange={(e) => setMasteryLevel(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-xs text-muted-light dark:text-muted">{masteryLevel}/100</div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-light dark:text-muted">Equipped Spec Level (unique FCE)</label>
            <input
              type="range"
              min={0}
              max={120}
              value={specLevel}
              onChange={(e) => setSpecLevel(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-xs text-muted-light dark:text-muted">{specLevel}/120</div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded border border-border-light bg-bg-light p-3 text-sm dark:border-border dark:bg-bg">
            <div className="flex justify-between text-muted-light dark:text-muted">
              <span>Base Focus Cost</span>
              <span className="font-semibold text-text1-light dark:text-text1">{result.baseFocusCost}</span>
            </div>
            <div className="flex justify-between text-muted-light dark:text-muted">
              <span>Total FCE</span>
              <span className="font-semibold text-text1-light dark:text-text1">{Math.round(result.totalFCE)}</span>
            </div>
            <div className="flex justify-between text-muted-light dark:text-muted">
              <span>Reduction Factor</span>
              <span className="font-semibold text-text1-light dark:text-text1">{result.reductionFactor.toFixed(2)}×</span>
            </div>
            <div className="flex justify-between text-muted-light dark:text-muted">
              <span>Actual Focus</span>
              <span className="font-semibold text-text1-light dark:text-text1">{result.actualFocusCost}</span>
            </div>
            <div className="flex justify-between text-muted-light dark:text-muted">
              <span>Percent of Base</span>
              <span className="font-semibold text-text1-light dark:text-text1">{result.percentOfBase}%</span>
            </div>
          </div>

          <div className="rounded border border-dashed border-border-light bg-bg-light p-3 text-xs dark:border-border dark:bg-bg">
            <div className="mb-2 flex items-center justify-between">
              <div className="font-semibold text-text1-light dark:text-text1">Mutual FCE (other specs)</div>
              <button
                type="button"
                className="rounded bg-surface-light px-2 py-1 text-xs text-text1-light hover:bg-surface dark:bg-surface dark:text-text1 dark:hover:bg-surface-light/20"
                onClick={() =>
                  setMutualSpecs((prev) => [
                    ...prev,
                    { id: `mutual-${Date.now()}`, level: 0, type: 'simple' },
                  ])
                }
              >
                Add
              </button>
            </div>

            <div className="space-y-2">
              {mutualSpecs.map((entry) => (
                <div key={entry.id} className="rounded border border-border-light bg-bg-light p-2 dark:border-border dark:bg-bg">
                  <div className="flex items-center gap-2">
                    <select
                      className="rounded border border-border-light bg-surface-light px-2 py-1 text-xs dark:border-border dark:bg-surface"
                      value={entry.type}
                      onChange={(e) =>
                        setMutualSpecs((prev) =>
                          prev.map((item) =>
                            item.id === entry.id ? { ...item, type: e.target.value as any } : item
                          )
                        )
                      }
                    >
                      {EQUIPMENT_TYPES.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="range"
                      min={0}
                      max={120}
                      value={entry.level}
                      onChange={(e) =>
                        setMutualSpecs((prev) =>
                          prev.map((item) =>
                            item.id === entry.id ? { ...item, level: parseInt(e.target.value) } : item
                          )
                        )
                      }
                      className="flex-1"
                    />
                    <span className="w-12 text-right text-xs text-text1-light dark:text-text1">{entry.level}</span>
                    <button
                      type="button"
                      className="text-xs text-muted-light hover:text-red-500"
                      onClick={() => setMutualSpecs((prev) => prev.filter((item) => item.id !== entry.id))}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              {mutualSpecs.length === 0 && (
                <div className="text-muted-light dark:text-muted">No additional specs added.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
