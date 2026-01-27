import itemsData from '@/data/crafting/items.json'
import requirementsData from '@/data/crafting/requirements.json'
import artifactsData from '@/data/crafting/artifacts.json'
import materialsData from '@/data/crafting/materials.json'
import journalsData from '@/data/crafting/journals.json'
import type { ArtifactRequirement, CraftingRequirement, Item, Journal, Material } from './types'

export const items = itemsData as Item[]
export const requirements = requirementsData as CraftingRequirement[]
export const artifacts = artifactsData as ArtifactRequirement[]
export const materials = materialsData as Material[]
export const journals = journalsData as Journal[]

const NON_CRAFTABLE_PATTERNS = [
  'STATUE',
  'DECORATION',
  'SKIN',
  'MOUNT',
  'VANITY',
  'EMOTE',
  'FURNITURE',
  'TROPHY',
  'CONSUMABLE_EVENT',
  'QUESTITEM',
  'TOKEN_SEASON',
  'SILVER_BAG',
  'BATTLE_TOKEN',
  'SEASON_REWARD',
  'EVENT_ITEM',
  'ANNIVERSARY',
  'PAINTING',
  'CARPET',
  'TABLE',
  'CHAIR',
  'OUTFIT',
  'KEEPER_OUTFIT',
  'MORGANA_OUTFIT',
  'HERETIC_OUTFIT',
  'UNDEAD_OUTFIT',
  'ANIMATION',
  'CONSUMABLE_PARTY',
  'FIREWORK',
  'STORY_ITEM',
  'ADVENTURE_ITEM',
  'TOKEN_EVENT',
  'GOLD_BAG',
  'MOUNT_BATTLE',
  'MOUNT_EVENT',
  'MOUNT_SKIN',
  'PLACEHOLDER',
  'TEST_ITEM',
  'DEBUG',
]

const CRAFTABLE_ITEM_CATEGORIES = new Set<Item['category']>(['gear', 'food', 'potion'])

export function isItemCraftable(item: Item): boolean {
  const upperId = item.item_id.toUpperCase()
  for (const pattern of NON_CRAFTABLE_PATTERNS) {
    if (upperId.includes(pattern)) {
      return false
    }
  }

  if (CRAFTABLE_ITEM_CATEGORIES.has(item.category)) {
    return true
  }

  return false
}

export function getCraftableItems(allItems: Item[]): Item[] {
  return allItems.filter((item) => isItemCraftable(item))
}

export function getItemById(itemId: string): Item | undefined {
  return items.find((item) => item.item_id === itemId)
}

export function getItemsByCategory(category: Item['category']): Item[] {
  return items.filter((item) => item.category === category)
}

export function getItemVariants(baseItemId: string): Item[] {
  return items.filter((item) => item.base_item_id === baseItemId)
}

export function getCraftingRequirements(itemId: string): CraftingRequirement[] {
  return requirements.filter((req) => req.item_id === itemId)
}

export function getArtifactRequirements(itemId: string): ArtifactRequirement[] {
  return artifacts.filter((req) => req.item_id === itemId)
}

export function getMaterialById(materialId: string): Material | undefined {
  return materials.find((mat) => mat.material_id === materialId)
}

export function getJournalById(journalId: string): Journal | undefined {
  return journals.find((journal) => journal.journal_id === journalId)
}

export function getAvailableJournals(): Journal[] {
  return journals
}

export function formatJournalName(name: string): string {
  return name.replace(/\s*\(Partially Full\)/i, '').trim()
}

const JOURNAL_TYPE_PATTERNS: Array<{ id: string; patterns: RegExp[] }> = [
  {
    id: 'WARRIOR',
    patterns: [
      /_SWORD/i,
      /_AXE/i,
      /_MACE/i,
      /_HAMMER/i,
      /_POLEHAMMER/i,
      /_HALBERD/i,
      /_CROSSBOW/i,
      /_PLATE_/i,
      /_SHIELD/i,
    ],
  },
  {
    id: 'HUNTER',
    patterns: [
      /_BOW/i,
      /_SPEAR/i,
      /_DAGGER/i,
      /_QUARTERSTAFF/i,
      /_LEATHER_/i,
      /_NATURE/i,
      /_WAR_GLOVES/i,
    ],
  },
  {
    id: 'MAGE',
    patterns: [
      /_FIRE/i,
      /_FROST/i,
      /_ARCANE/i,
      /_HOLY/i,
      /_CURSED/i,
      /_CLOTH_/i,
    ],
  },
]

export function getAutoJournalForItem(item: Item): Journal | undefined {
  if (item.category !== 'gear') return undefined
  const entry = JOURNAL_TYPE_PATTERNS.find((type) =>
    type.patterns.some((pattern) => pattern.test(item.item_id))
  )
  if (!entry) return undefined
  const journalId = `T${item.tier}_JOURNAL_${entry.id}`
  return getJournalById(journalId)
}
