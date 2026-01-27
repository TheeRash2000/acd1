import fs from 'fs';
import path from 'path';

interface ItemIndexEntry {
  id: string;
  name: string;
  tier: number;
  enchantment: number;
  power: number;
  slot: string;
  itemClass: string;
  masteryModifier: number;
  masteryTable: string;
  specTable: string;
}

interface Progression {
  level: number;
  points: number;
  seasonpoints: number;
}

interface ProgressionTable {
  uniquename: string;
  MasteryModifier: number;
  SpecializationModifier: number;
  CrossSpecializationModifier: number;
  progressions: Progression[];
}

interface DynamicTemplate {
  mappings: Array<{
    continent: string;
    biome: string;
    pvpwarninglevel: string;
    clustertier: string;
    templatepool: string;
  }>;
  poolCount: number;
  lastUpdated: string;
}

const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const GENERATED_DIR = path.join(process.cwd(), 'src', 'lib', 'generated');

let cachedItemsIndex: Record<string, ItemIndexEntry> | null = null;
let cachedProgressionTables: ProgressionTable[] | null = null;
let cachedDynamicTemplates: DynamicTemplate | null = null;

function getItemsIndex(): Record<string, ItemIndexEntry> {
  if (cachedItemsIndex !== null) return cachedItemsIndex;

  const filePath = path.join(GENERATED_DIR, 'itemsIndex.json');
  if (!fs.existsSync(filePath)) {
    throw new Error('itemsIndex.json not found. Run "npm run gen:items" first.');
  }

  cachedItemsIndex = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  return cachedItemsIndex as Record<string, ItemIndexEntry>;
}

export function getItemById(id: string): ItemIndexEntry | undefined {
  const items = getItemsIndex();
  return items[id];
}

export function getAllItems(): ItemIndexEntry[] {
  return Object.values(getItemsIndex());
}

export function getProgressionTables(): ProgressionTable[] {
  if (cachedProgressionTables !== null) return cachedProgressionTables;

  const filePath = path.join(DATA_DIR, 'progressiontables.json');
  if (!fs.existsSync(filePath)) {
    console.warn('Progression tables not found. Run "npm run fetch-data" first.');
    return [];
  }

  cachedProgressionTables = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  return cachedProgressionTables as ProgressionTable[];
}

export function getDynamicTemplates(): DynamicTemplate | null {
  if (cachedDynamicTemplates) return cachedDynamicTemplates;

  const filePath = path.join(DATA_DIR, 'dynamictemplates.json');
  if (!fs.existsSync(filePath)) {
    console.warn('Dynamic templates not found. Run "npm run fetch-data" first.');
    return null;
  }

  cachedDynamicTemplates = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  return cachedDynamicTemplates;
}

export function searchItems(query: string): ItemIndexEntry[] {
  const items = getAllItems();
  const lowerQuery = query.toLowerCase();
  return items.filter(
    (item) =>
      item.name.toLowerCase().includes(lowerQuery) ||
      item.id.toLowerCase().includes(lowerQuery)
  );
}

export function getItemsByTier(tier: number): ItemIndexEntry[] {
  const items = getAllItems();
  return items.filter((item) => item.tier === tier);
}

export function getProgressionTable(uniquename: string): ProgressionTable {
  const tables = getProgressionTables();
  const table = tables.find((t) => t.uniquename === uniquename);

  if (!table) {
    throw new Error(`Missing progression table: ${uniquename}`);
  }

  if (
    typeof table.MasteryModifier !== 'number' ||
    typeof table.SpecializationModifier !== 'number' ||
    typeof table.CrossSpecializationModifier !== 'number' ||
    Number.isNaN(table.MasteryModifier) ||
    Number.isNaN(table.SpecializationModifier) ||
    Number.isNaN(table.CrossSpecializationModifier)
  ) {
    throw new Error(`Missing modifier fields in progression table: ${uniquename}`);
  }

  return table;
}

export function getProgressionTableByName(uniquename: string): ProgressionTable | undefined {
  const tables = getProgressionTables();
  return tables.find((t) => t.uniquename === uniquename);
}
