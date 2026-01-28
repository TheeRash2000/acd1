'use client';

import { getMastery, getSpecializationsForMastery } from '@/lib/destiny-board/masteries';
import { useDestinyBoardStore } from '@/stores/destinyBoardStore';
import { Minus, Plus, CheckCircle2 } from 'lucide-react';

interface SpecializationPanelProps {
  masteryId: string;
}

export function SpecializationPanel({ masteryId }: SpecializationPanelProps) {
  const { activeCharacter, updateMastery, updateSpecialization } = useDestinyBoardStore();
  const mastery = getMastery(masteryId);
  const specializations = getSpecializationsForMastery(masteryId);

  if (!mastery || !activeCharacter) {
    return null;
  }

  const masteryLevel = activeCharacter.masteries[masteryId] || 0;
  const masteryMaxed = masteryLevel >= mastery.maxLevel;

  const handleMasteryChange = (delta: number) => {
    const newLevel = Math.max(0, Math.min(100, masteryLevel + delta));
    updateMastery(activeCharacter.id, masteryId, newLevel);
  };

  const handleSpecChange = (specId: string, delta: number) => {
    const currentLevel = activeCharacter.specializations[specId] || 0;
    const newLevel = Math.max(0, Math.min(120, currentLevel + delta));
    updateSpecialization(activeCharacter.id, specId, newLevel);
  };

  const getTotalIP = () => {
    const masteryIP = masteryLevel * mastery.ipPerLevel;
    const specIP = specializations.reduce((total, spec) => {
      const level = activeCharacter.specializations[spec.id] || 0;
      return total + level * spec.uniqueIpPerLevel;
    }, 0);
    return masteryIP + specIP;
  };

  return (
    <div className="space-y-4">
      {/* Mastery Header - matching mockup */}
      <div className="rounded-lg border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
        <div className="mb-3 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text1-light dark:text-text1">
              {mastery.name}
            </h2>
            <div className="mt-1 flex items-center gap-2 text-sm text-muted-light dark:text-muted">
              <span>Mastery {masteryLevel}/{mastery.maxLevel}</span>
              {masteryMaxed && <CheckCircle2 size={16} className="text-green-500" />}
            </div>
          </div>
        </div>

        {/* Stats - matching mockup format */}
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-light dark:text-muted">IP Bonus:</span>
            <span className="font-medium">{(masteryLevel * mastery.ipPerLevel).toFixed(1)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-light dark:text-muted">Focus (Crafting):</span>
            <span className="font-medium">{mastery.craftingFocusTotal} FCE</span>
          </div>
        </div>

        {/* Mastery Level Control */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleMasteryChange(-10)}
              className="rounded bg-bg-light p-2 hover:bg-bg dark:bg-bg dark:hover:bg-bg-light/20"
            >
              <Minus size={16} />
            </button>
            <input
              type="range"
              min="0"
              max={mastery.maxLevel}
              value={masteryLevel}
              onChange={(e) =>
                updateMastery(activeCharacter.id, masteryId, parseInt(e.target.value))
              }
              className="flex-1"
            />
            <button
              onClick={() => handleMasteryChange(10)}
              className="rounded bg-bg-light p-2 hover:bg-bg dark:bg-bg dark:hover:bg-bg-light/20"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Specializations List - matching mockup tree format */}
      <div className="rounded-lg border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
        <h3 className="mb-3 font-semibold text-text1-light dark:text-text1">Specializations:</h3>
        <div className="space-y-2">
          {specializations.map((spec) => {
            const level = activeCharacter.specializations[spec.id] || 0;
            const isMaxed = level >= spec.maxLevel;

            return (
              <div
                key={spec.id}
                className="rounded border border-border-light bg-bg-light p-2 dark:border-border dark:bg-bg"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-light dark:text-muted">├─</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-text1-light dark:text-text1">
                        {spec.name.replace(' Combat Specialist', '').replace(' Specialist', '')}
                      </div>
                      <div className="text-xs text-muted-light dark:text-muted">
                        {spec.type}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {level}/{spec.maxLevel}
                    </span>
                    {isMaxed && <CheckCircle2 size={16} className="text-green-500" />}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSpecChange(spec.id, -10)}
                    className="rounded bg-surface-light p-1 hover:bg-surface dark:bg-surface dark:hover:bg-surface-light/20"
                  >
                    <Minus size={12} />
                  </button>
                  <input
                    type="range"
                    min="0"
                    max={spec.maxLevel}
                    value={level}
                    onChange={(e) =>
                      updateSpecialization(activeCharacter.id, spec.id, parseInt(e.target.value))
                    }
                    className="flex-1"
                  />
                  <button
                    onClick={() => handleSpecChange(spec.id, 10)}
                    className="rounded bg-surface-light p-1 hover:bg-surface dark:bg-surface dark:hover:bg-surface-light/20"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
