'use client';

import { useState } from 'react';
import { CharacterSelector } from './CharacterSelector';
import { MasteryTree } from './MasteryTree';
import { SpecializationPanel } from './SpecializationPanel';
import { IPCalculatorPanel } from './IPCalculatorPanel';
import { useDestinyBoardStore } from '@/stores/destinyBoardStore';

export function DestinyBoardManager() {
  const [selectedMasteryId, setSelectedMasteryId] = useState<string | undefined>();
  const { activeCharacter } = useDestinyBoardStore();

  return (
    <div className="space-y-6">
      {/* Character Selection */}
      <CharacterSelector />

      {activeCharacter ? (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Left: Mastery Tree - matching mockup sidebar */}
          <div className="rounded-lg border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-light dark:text-muted">
              Mastery Tree
            </h2>
            <MasteryTree
              onSelectMastery={setSelectedMasteryId}
              selectedMasteryId={selectedMasteryId}
            />
          </div>

          {/* Right: Specialization Panel */}
          <div className="space-y-4">
            {selectedMasteryId ? (
              <SpecializationPanel masteryId={selectedMasteryId} />
            ) : (
              <div className="rounded-lg border border-border-light bg-surface-light p-12 text-center dark:border-border dark:bg-surface">
                <p className="text-muted-light dark:text-muted">
                  Select a mastery from the tree to view and manage specializations.
                </p>
              </div>
            )}

            {/* IP Calculator (combat only) */}
            <IPCalculatorPanel masteryId={selectedMasteryId} />
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-border-light bg-surface-light p-12 text-center dark:border-border dark:bg-surface">
          <p className="text-muted-light dark:text-muted">
            Create or select a character to begin tracking your Destiny Board progress.
          </p>
        </div>
      )}
    </div>
  );
}
