/**
 * Item Power (IP) Calculator
 * Based on verified Wiki formulas and in-game mechanics
 *
 * FORMULA:
 * Total IP = Base IP (from tier)
 *          + Mastery IP Bonus
 *          + Specialization IP Bonuses (unique + mutual from all specs)
 *          + (Mastery Modifier % × Total Destiny Board IP)
 */

import type { IPCalculationResult, SpecializationNode } from '@/types/destiny-board';
import {
  IP_CONSTANTS,
  getMasteryModifier,
  getBaseIP,
  getMutualIPRate,
} from '@/constants/albion-constants';

export interface IPCalculationInput {
  itemTier: string; // 'T4', 'T5', etc.
  equipmentType: string; // 'simple', 'royal', 'artifact1', etc.
  slot?: 'mainhand' | 'offhand' | 'armor' | 'gathering';
  masteryLevel: number; // 0-100
  equippedSpecId: string; // Which spec is currently equipped
  equippedSpecLevel: number; // 0-120
  allSpecsInMastery: Record<string, { level: number; type: string }>; // All other specs
}

/**
 * Calculate Item Power for an equipped item
 * 
 * Example from Wiki:
 * T5 Expert's Knight Boots (Base IP: 800)
 * - Mastery: Plate Boots Fighter Level 100 → 20 IP
 * - Knight Boots Spec Level 32 → 64 unique + 6.4 mutual
 * - Soldier Boots Spec Level 63 → 12.6 mutual
 * - Guardian Boots Spec Level 61 → 12.2 mutual
 * - Royal Boots Spec Level 30 → 3 mutual
 * Total Destiny Board IP: 118.2
 * Mastery Modifier (T5 = 5%): 118.2 × 0.05 = 5.91 ≈ 6
 * FINAL IP: 800 + 118.2 + 6 = 924 IP ✅
 */
export function calculateItemIP(input: IPCalculationInput): IPCalculationResult {
  const {
    itemTier,
    equipmentType,
    slot = 'mainhand',
    masteryLevel,
    equippedSpecId,
    equippedSpecLevel,
    allSpecsInMastery,
  } = input;

  // 1. Base IP from tier
  const baseIP = getBaseIP(itemTier);

  // 2. Mastery IP (always 0.2/level)
  const masteryIP = masteryLevel * IP_CONSTANTS.MASTERY_IP_PER_LEVEL;

  // 3. Unique IP from equipped specialization (always 2.0/level)
  const uniqueIP = equippedSpecLevel * IP_CONSTANTS.SPECIALIZATION_UNIQUE_IP_PER_LEVEL;

  // 4. Mutual IP from ALL specs in mastery (including equipped)
  let mutualIP = 0;
  const breakdownBySpec: Array<{
    specId: string;
    name: string;
    level: number;
    uniqueIP: number;
    mutualIP: number;
  }> = [];

  // Add equipped spec's mutual contribution
  const equippedMutualRate = getMutualIPRate(equipmentType, slot);
  const equippedMutualIP = equippedSpecLevel * equippedMutualRate;
  mutualIP += equippedMutualIP;

  breakdownBySpec.push({
    specId: equippedSpecId,
    name: equippedSpecId, // Will be replaced with actual name
    level: equippedSpecLevel,
    uniqueIP,
    mutualIP: equippedMutualIP,
  });

  // Add mutual IP from all other specs
  for (const [specId, spec] of Object.entries(allSpecsInMastery)) {
    if (specId === equippedSpecId) continue; // Already counted above

    const specMutualRate = getMutualIPRate(spec.type, slot);
    const specMutualIP = spec.level * specMutualRate;
    mutualIP += specMutualIP;

    breakdownBySpec.push({
      specId,
      name: specId,
      level: spec.level,
      uniqueIP: 0, // Only equipped spec gets unique IP
      mutualIP: specMutualIP,
    });
  }

  // 5. Total before mastery modifier
  const destinyBoardTotal = masteryIP + uniqueIP + mutualIP;

  // 6. Mastery Modifier (T5-T8 only)
  const modifierPercent = getMasteryModifier(itemTier);
  const modifierBonus = destinyBoardTotal * modifierPercent;

  // 7. Final IP
  const finalIP = baseIP + destinyBoardTotal + modifierBonus;

  return {
    baseIP,
    masteryIP,
    specializationIP: {
      unique: uniqueIP,
      mutual: mutualIP,
    },
    destinyBoardTotal,
    masteryModifierPercent: modifierPercent * 100,
    masteryModifierBonus: modifierBonus,
    finalIP: Math.round(finalIP),
    breakdown: {
      bySpecialization: breakdownBySpec,
    },
  };
}

/**
 * Calculate IP difference between current and target levels
 * Useful for showing "how much IP will I gain if I level up?"
 */
export function calculateIPDifference(
  current: IPCalculationInput,
  target: Partial<IPCalculationInput>
): number {
  const currentIP = calculateItemIP(current);
  const targetIP = calculateItemIP({ ...current, ...target });
  return targetIP.finalIP - currentIP.finalIP;
}

/**
 * Calculate IP per level for a specific progression
 * Useful for optimization: "which spec should I level next?"
 */
export function calculateIPPerLevel(
  input: IPCalculationInput,
  targetSpecId: string
): number {
  const current = calculateItemIP(input);

  // Simulate +1 level
  const nextLevelInput = { ...input };
  if (targetSpecId === input.equippedSpecId) {
    nextLevelInput.equippedSpecLevel += 1;
  } else {
    nextLevelInput.allSpecsInMastery = {
      ...input.allSpecsInMastery,
      [targetSpecId]: {
        ...input.allSpecsInMastery[targetSpecId],
        level: input.allSpecsInMastery[targetSpecId].level + 1,
      },
    };
  }

  const next = calculateItemIP(nextLevelInput);
  return next.finalIP - current.finalIP;
}

/**
 * Find optimal spec to level for maximum IP gain
 */
export function findOptimalSpecToLevel(
  input: IPCalculationInput,
  availableSpecs: string[]
): { specId: string; ipGain: number } | null {
  let bestSpec: string | null = null;
  let bestIPGain = 0;

  for (const specId of availableSpecs) {
    const ipGain = calculateIPPerLevel(input, specId);
    if (ipGain > bestIPGain) {
      bestIPGain = ipGain;
      bestSpec = specId;
    }
  }

  return bestSpec ? { specId: bestSpec, ipGain: bestIPGain } : null;
}
