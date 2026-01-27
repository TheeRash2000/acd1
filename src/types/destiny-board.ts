/**
 * Destiny Board Types - Based on Albion Wiki
 * Dual-layer structure: Mastery (100 levels) + Specialization (120 levels)
 */

export type EquipmentCategory =
  | 'weapon_warrior'
  | 'weapon_hunter'
  | 'weapon_mage'
  | 'armor_plate'
  | 'armor_leather'
  | 'armor_cloth'
  | 'offhand'
  | 'gathering'
  | 'refining'
  | 'farming'
  | 'crafting';

export type EquipmentType =
  | 'simple' // Normal equipment (0.2 mutual IP, 3000 FCE)
  | '2.simple' // Second variant
  | '3.simple' // Third variant
  | 'royal' // Royal equipment (0.1 mutual IP, 1500 FCE)
  | 'artifact' // Generic artifact (0.1 mutual IP, 1500 FCE)
  | 'artifact1' // Artifact tier 1 (0.1 mutual IP, 1500 FCE)
  | 'artifact2' // Artifact tier 2
  | 'artifact3' // Artifact tier 3
  | 'misty' // Misty equipment (0.1 despite "simple-like")
  | 'avalonian' // Avalonian equipment (0.1 mutual IP, 1500 FCE)
  | 'crystal'; // Crystal League equipment (0.1 mutual IP, 1500 FCE)

export interface MasteryNode {
  id: string; // 'mastery_axe'
  name: string; // 'Axe Fighter'
  category: EquipmentCategory;
  maxLevel: 100;

  // IP contribution (combat)
  ipPerLevel: 0.2; // ALWAYS 0.2 for all masteries

  // Focus contribution (crafting only)
  focusPerLevel?: 30; // For crafting masteries
  craftingFocusTotal?: 3000; // At level 100

  // Specializations under this mastery
  specializationIds: string[];
}

export interface SpecializationNode {
  id: string; // 'spec_battleaxe'
  name: string; // 'Battleaxe Combat Specialist'
  masteryId: string; // 'mastery_axe'
  itemId: string; // 'T4_2H_AXE' (for linking to actual items)

  type: EquipmentType;
  maxLevel: 120; // Can go to 120 (elite levels 100-120 cost silver)

  // IP contribution (combat)
  uniqueIpPerLevel: 2.0; // ALWAYS 2.0 for unique
  mutualIpPerLevel: number; // 0.1, 0.2, or 0.6 depending on type

  // Focus contribution (crafting only)
  uniqueFocusPerLevel?: number; // Varies by equipment type
  mutualFocusPerLevel?: number; // Varies by equipment type

  // Quality contribution (crafting only)
  uniqueQualityPerLevel?: number;
  mutualQualityPerLevel?: number;
}

export interface CharacterSheet {
  id: string;
  name: string;

  // Mastery levels (0-100)
  masteries: Record<string, number>; // masteryId → level

  // Specialization levels (0-120)
  specializations: Record<string, number>; // specId → level

  createdAt: string;
  updatedAt: string;
}

export interface IPCalculationResult {
  baseIP: number;
  masteryIP: number;
  specializationIP: {
    unique: number; // From equipped item's spec
    mutual: number; // From all other specs in mastery
  };
  destinyBoardTotal: number; // Sum of above (before modifier)
  masteryModifierPercent: number; // 0%, 5%, 10%, 15%, 20%
  masteryModifierBonus: number; // destinyBoardTotal × modifier%
  finalIP: number; // baseIP + destinyBoardTotal + masteryModifierBonus
  breakdown: {
    bySpecialization: Array<{
      specId: string;
      name: string;
      level: number;
      uniqueIP: number;
      mutualIP: number;
    }>;
  };
}

export interface FocusCalculationResult {
  baseActivity: string; // 'crafting_equipment', 'crafting_consumable', 'refining'
  baseFocusCost: number;
  totalFCE: number;
  reductionFactor: number; // 2 ^ (FCE / 10000)
  actualFocusCost: number; // baseCost / reductionFactor
  percentOfBase: number; // (actualCost / baseCost) × 100
  breakdown: {
    masteryFCE: number;
    uniqueFCE: number;
    mutualFCE: number;
  };
}

export interface DestinyBoardFilters {
  category?: EquipmentCategory;
  searchTerm?: string;
  showMaxedOnly?: boolean;
  showUnlockedOnly?: boolean;
}

export interface DestinyBoardState {
  // Active character
  activeCharacter: CharacterSheet | null;

  // All characters
  characters: CharacterSheet[];

  // Actions
  setActiveCharacter: (characterId: string) => void;
  createCharacter: (name: string) => CharacterSheet;
  deleteCharacter: (characterId: string) => void;
  updateMastery: (characterId: string, masteryId: string, level: number) => void;
  updateSpecialization: (characterId: string, specId: string, level: number) => void;
  importCharacterData: (data: Partial<CharacterSheet>) => void;
  exportCharacterData: (characterId: string) => string;
}
