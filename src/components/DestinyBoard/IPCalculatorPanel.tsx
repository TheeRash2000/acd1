'use client';

import { useEffect, useMemo, useState } from 'react';
import { calculateItemIP } from '@/lib/calculators/ip-calculator';
import { getMastery, getSpecializationsForMastery, getSpecialization } from '@/lib/destiny-board/masteries';
import { useDestinyBoardStore } from '@/stores/destinyBoardStore';

const TIERS = ['T4', 'T5', 'T6', 'T7', 'T8'];

type TabSlot = 'mainhand' | 'offhand' | 'armor' | 'gathering';

function slotFromCategory(category?: string): TabSlot {
  if (!category) return 'mainhand';
  if (category.includes('armor')) return 'armor';
  if (category === 'offhand') return 'offhand';
  if (category === 'gathering') return 'gathering';
  return 'mainhand';
}

interface IPCalculatorPanelProps {
  masteryId?: string;
}

export function IPCalculatorPanel({ masteryId }: IPCalculatorPanelProps) {
  const { activeCharacter } = useDestinyBoardStore();
  const [selectedSpecId, setSelectedSpecId] = useState<string | undefined>();
  const [tier, setTier] = useState<string>('T6');

  const mastery = masteryId ? getMastery(masteryId) : undefined;
  const specializations = useMemo(
    () => (masteryId ? getSpecializationsForMastery(masteryId) : []),
    [masteryId]
  );

  useEffect(() => {
    if (specializations.length > 0) {
      setSelectedSpecId((prev) => prev && specializations.some((s) => s.id === prev) ? prev : specializations[0].id);
    } else {
      setSelectedSpecId(undefined);
    }
  }, [specializations]);

  if (!activeCharacter) {
    return null;
  }

  if (!masteryId || !mastery) {
    return (
      <div className="rounded-lg border border-border-light bg-surface-light p-4 text-sm text-muted-light dark:border-border dark:bg-surface dark:text-muted">
        Select a mastery to view the IP calculator.
      </div>
    );
  }

  const selectedSpec = selectedSpecId ? getSpecialization(selectedSpecId) : undefined;
  const masteryLevel = activeCharacter.masteries[masteryId] || 0;
  const equippedSpecLevel = selectedSpecId ? activeCharacter.specializations[selectedSpecId] || 0 : 0;

  const allSpecsInMastery = specializations.reduce<Record<string, { level: number; type: string }>>(
    (acc, spec) => {
      const level = activeCharacter.specializations[spec.id] || 0;
      acc[spec.id] = { level, type: spec.type };
      return acc;
    },
    {}
  );

  const inputReady = selectedSpec && mastery;
  const calculation = inputReady
    ? calculateItemIP({
        itemTier: tier,
        equipmentType: selectedSpec.type,
        slot: slotFromCategory(mastery.category),
        masteryLevel,
        equippedSpecId: selectedSpec.id,
        equippedSpecLevel,
        allSpecsInMastery,
      })
    : null;

  const breakdown = calculation?.breakdown.bySpecialization.map((entry) => {
    const spec = getSpecialization(entry.specId);
    return {
      ...entry,
      name: spec?.name?.replace(' Combat Specialist', '').replace(' Specialist', '') || entry.specId,
    };
  });

  return (
    <div className="rounded-lg border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-text1-light dark:text-text1">IP Calculator</h3>
          <p className="text-xs text-muted-light dark:text-muted">
            Uses combat IP formula only. Crafting focus is separate.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-light dark:text-muted">
          <label className="text-xs">Tier</label>
          <select
            className="rounded border border-border-light bg-bg-light px-2 py-1 text-xs dark:border-border dark:bg-bg"
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
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-light dark:text-muted">Equipped Specialization</label>
          <select
            className="w-full rounded border border-border-light bg-bg-light px-2 py-2 text-sm dark:border-border dark:bg-bg"
            value={selectedSpecId}
            onChange={(e) => setSelectedSpecId(e.target.value)}
          >
            {specializations.map((spec) => (
              <option key={spec.id} value={spec.id}>
                {spec.name.replace(' Combat Specialist', '').replace(' Specialist', '')}
              </option>
            ))}
          </select>
          <div className="text-xs text-muted-light dark:text-muted">
            Mastery {masteryLevel}/{mastery.maxLevel} • Spec {equippedSpecLevel}/{selectedSpec?.maxLevel ?? 120}
          </div>
        </div>

        <div className="space-y-1 rounded border border-border-light bg-bg-light p-3 text-sm dark:border-border dark:bg-bg">
          <div className="flex justify-between text-muted-light dark:text-muted">
            <span>Base IP</span>
            <span className="font-semibold text-text1-light dark:text-text1">{calculation?.baseIP ?? '—'}</span>
          </div>
          <div className="flex justify-between text-muted-light dark:text-muted">
            <span>Mastery ({masteryLevel} × 0.2)</span>
            <span className="font-semibold text-text1-light dark:text-text1">{calculation ? calculation.masteryIP.toFixed(1) : '—'}</span>
          </div>
          <div className="flex justify-between text-muted-light dark:text-muted">
            <span>Spec Unique (2.0/level)</span>
            <span className="font-semibold text-text1-light dark:text-text1">{calculation ? calculation.specializationIP.unique.toFixed(1) : '—'}</span>
          </div>
          <div className="flex justify-between text-muted-light dark:text-muted">
            <span>Spec Mutual</span>
            <span className="font-semibold text-text1-light dark:text-text1">{calculation ? calculation.specializationIP.mutual.toFixed(1) : '—'}</span>
          </div>
          <div className="flex justify-between text-muted-light dark:text-muted">
            <span>Mastery Modifier ({calculation ? calculation.masteryModifierPercent : 0}%)</span>
            <span className="font-semibold text-text1-light dark:text-text1">{calculation ? calculation.masteryModifierBonus.toFixed(1) : '—'}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded border border-border-light bg-bg-light p-3 dark:border-border dark:bg-bg">
        <div className="flex items-center justify-between">
          <div className="text-xs uppercase tracking-wide text-muted-light dark:text-muted">Final IP</div>
          <div className="text-lg font-semibold text-text1-light dark:text-text1">
            {calculation ? calculation.finalIP : '—'}
          </div>
        </div>
      </div>

      {breakdown && (
        <div className="mt-3 space-y-2 text-xs">
          <div className="font-semibold text-text1-light dark:text-text1">Breakdown by spec</div>
          {breakdown.map((entry) => (
            <div key={entry.specId} className="flex items-center justify-between rounded border border-border-light bg-bg-light px-2 py-1 dark:border-border dark:bg-bg">
              <div className="truncate text-muted-light dark:text-muted">{entry.name}</div>
              <div className="flex items-center gap-3 text-text1-light dark:text-text1">
                <span>{entry.level}/120</span>
                <span className="text-muted-light dark:text-muted">{entry.uniqueIP ? `+${entry.uniqueIP.toFixed(1)} unique` : ''}</span>
                <span className="text-muted-light dark:text-muted">+{entry.mutualIP.toFixed(1)} mutual</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
