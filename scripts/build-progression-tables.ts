import fs from 'fs'
import path from 'path'

const ROOT = process.cwd()
const SRC_DATA_DIR = path.join(ROOT, 'src', 'data')
const GENERATED_DIR = path.join(ROOT, 'src', 'lib', 'generated')

const MASTERY_MODIFIER = 0.2
const SPEC_MODIFIER = 2.0

type ItemEntry = {
  id: string
  slot: string
  masteryTable: string
  specTable: string
}

function readItemsIndex(): ItemEntry[] {
  const itemsPath = path.join(GENERATED_DIR, 'itemsIndex.json')
  if (!fs.existsSync(itemsPath)) {
    throw new Error('itemsIndex.json not found. Run "npm run gen:items" first.')
  }

  const raw = fs.readFileSync(itemsPath, 'utf-8')
  const parsed = JSON.parse(raw)
  return Object.values(parsed) as ItemEntry[]
}

function buildProgressions() {
  return Array.from({ length: 120 }, (_, i) => ({
    level: i + 1,
    points: (i + 1) * 1000,
    seasonpoints: 0,
  }))
}

function resolveVariant(id: string) {
  const upper = id.toUpperCase()
  if (upper.includes('_ROYAL')) return 'royal'
  if (upper.includes('_AVALON')) return 'avalon'
  if (upper.includes('_CRYSTAL')) return 'crystal'
  if (upper.includes('_MIST')) return 'mist'
  if (upper.includes('_HELL') || upper.includes('_MORGANA') || upper.includes('_UNDEAD') || upper.includes('_KEEPER')) {
    return 'artifact'
  }
  return 'simple'
}

function resolveCrossSpecModifier(item: ItemEntry): number {
  const variant = resolveVariant(item.id)
  const slot = item.slot

  if (slot === 'offhand') {
    const upper = item.id.toUpperCase()
    if (variant === 'simple' && (upper.includes('_OFF_SHIELD') || upper.includes('_OFF_TORCH') || upper.includes('_OFF_TOME'))) {
      return 0.6
    }
    return variant === 'simple' ? 0.2 : 0.1
  }

  if (slot === 'head' || slot === 'armor' || slot === 'shoes') {
    return variant === 'simple' ? 0.2 : 0.1
  }

  return variant === 'simple' ? 0.2 : 0.1
}

function main() {
  const items = readItemsIndex()
  const masteryTables = new Set<string>()
  const specTables = new Map<string, ItemEntry[]>()

  for (const item of items) {
    if (item.masteryTable) masteryTables.add(item.masteryTable)
    if (item.specTable) {
      if (!specTables.has(item.specTable)) specTables.set(item.specTable, [])
      specTables.get(item.specTable)!.push(item)
    }
  }

  const progressions = buildProgressions()
  const output = [
    ...Array.from(masteryTables).map((id) => ({
      uniquename: id,
      MasteryModifier: MASTERY_MODIFIER,
      SpecializationModifier: 0,
      CrossSpecializationModifier: 0,
      progressions,
    })),
    ...Array.from(specTables.entries()).map(([id, entries]) => ({
      uniquename: id,
      MasteryModifier: 0,
      SpecializationModifier: SPEC_MODIFIER,
      CrossSpecializationModifier: resolveCrossSpecModifier(entries[0]),
      progressions,
    })),
  ]

  if (!fs.existsSync(SRC_DATA_DIR)) {
    fs.mkdirSync(SRC_DATA_DIR, { recursive: true })
  }

  const outPath = path.join(SRC_DATA_DIR, 'progressiontables.json')
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2))
  console.log(`Built ${output.length} progression tables`)
}

main()
