'use client';

import { ALL_MASTERIES } from '@/lib/destiny-board/masteries';
import { useDestinyBoardStore } from '@/stores/destinyBoardStore';
import { CheckCircle2 } from 'lucide-react';

interface MasteryTreeProps {
  onSelectMastery: (masteryId: string) => void;
  selectedMasteryId?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  weapon_warrior: 'Warrior Weapons',
  weapon_hunter: 'Hunter Weapons',
  weapon_mage: 'Mage Weapons',
  armor_warrior: 'Plate Armor',
  armor_hunter: 'Leather Armor',
  armor_mage: 'Cloth Armor',
  offhand: 'Off-Hand',
};

export function MasteryTree({ onSelectMastery, selectedMasteryId }: MasteryTreeProps) {
  const { activeCharacter } = useDestinyBoardStore();

  // Group masteries by category
  const masteriesByCategory = ALL_MASTERIES.reduce(
    (acc, mastery) => {
      if (!acc[mastery.category]) {
        acc[mastery.category] = [];
      }
      acc[mastery.category].push(mastery);
      return acc;
    },
    {} as Record<string, typeof ALL_MASTERIES>
  );

  const getMasteryProgress = (masteryId: string): number => {
    return activeCharacter?.masteries[masteryId] || 0;
  };

  const getMasteryCompletion = (masteryId: string): number => {
    if (!activeCharacter) return 0;
    const level = activeCharacter.masteries[masteryId] || 0;
    return (level / 100) * 100;
  };

  return (
    <div className="space-y-4">
      {Object.entries(masteriesByCategory).map(([category, masteries]) => (
        <div key={category}>
          <h3 className="mb-2 text-sm font-semibold text-text1-light dark:text-text1">
            {CATEGORY_LABELS[category] || category}
          </h3>
          <div className="space-y-1">
            {masteries.map((mastery) => {
              const level = getMasteryProgress(mastery.id);
              const isMaxed = level >= mastery.maxLevel;
              const isSelected = selectedMasteryId === mastery.id;

              return (
                <button
                  key={mastery.id}
                  onClick={() => onSelectMastery(mastery.id)}
                  className={`flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm transition-colors ${
                    isSelected
                      ? 'bg-accent/10 text-accent'
                      : 'text-text1-light hover:bg-bg-light/50 dark:text-text1 dark:hover:bg-bg/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-muted-light dark:text-muted">├─</span>
                    <span className="font-medium">{mastery.name.replace(' Fighter', '')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isSelected && <span className="text-accent">[●]</span>}
                    {isMaxed && <CheckCircle2 size={14} className="text-green-500" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
