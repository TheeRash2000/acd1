import { parseStringPromise } from 'xml2js'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

type ItemIndexEntry = {
  id: string
  name: string
  tier: number
  enchantment: number
  power: number
  slot: string
  itemClass: string
  masteryModifier: number
  masteryTable: string
  specTable: string
}

const DEFAULT_PATHS = [
  process.env.ITEMS_XML_PATH,
  join(process.cwd(), 'data', 'ao-bin-dumps', 'items.xml'),
  '/mnt/data/items.xml',
].filter(Boolean) as string[]

const FORMATTED_ITEMS_PATHS = [
  process.env.FORMATTED_ITEMS_JSON,
  join(process.cwd(), 'src', 'data', 'formatted', 'items.json'),
  join(process.cwd(), 'data', 'formatted', 'items.json'),
].filter(Boolean) as string[]

function loadItemsXmlPath(): string {
  for (const candidate of DEFAULT_PATHS) {
    if (existsSync(candidate)) return candidate
  }
  throw new Error(
    `items.xml not found. Set ITEMS_XML_PATH or place it at ${DEFAULT_PATHS.join(', ')}.`
  )
}

function loadFormattedItems(): Record<string, string> {
  for (const candidate of FORMATTED_ITEMS_PATHS) {
    if (!existsSync(candidate)) continue
    const raw = readFileSync(candidate, 'utf-8')
    const parsed = JSON.parse(raw) as Array<Record<string, any>>
    const map: Record<string, string> = {}
    for (const entry of parsed) {
      const id = entry.UniqueName ?? entry.uniqueName
      const name =
        entry.LocalizedNames?.['EN-US'] ??
        entry.LocalizedNames?.['en-US'] ??
        entry.LocalizedNames?.en ??
        entry.LocalizedNames?.EN ??
        undefined
      if (id && name) {
        map[String(id)] = String(name)
      }
    }
    return map
  }
  return {}
}

function asArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

function getAttr(attrs: Record<string, any> | undefined, keys: string[]): string | undefined {
  if (!attrs) return undefined
  for (const key of keys) {
    if (attrs[key] !== undefined) return String(attrs[key])
    const match = Object.keys(attrs).find((k) => k.toLowerCase() === key.toLowerCase())
    if (match) return String(attrs[match])
  }
  return undefined
}

function parseTier(id: string, raw?: string): number {
  if (raw) {
    const parsed = parseInt(raw.replace('T', ''), 10)
    if (!Number.isNaN(parsed)) return parsed
  }
  const match = id.match(/T(\d+)/)
  return match ? parseInt(match[1], 10) : 1
}

function parseEnchantment(id: string, raw?: string): number {
  if (raw) {
    const parsed = parseInt(raw, 10)
    if (!Number.isNaN(parsed)) return parsed
  }
  const match = id.match(/@(\d+)/)
  return match ? parseInt(match[1], 10) : 0
}

function parseNumber(raw?: string): number {
  if (!raw) return 0
  const parsed = parseFloat(raw)
  return Number.isNaN(parsed) ? 0 : parsed
}

function resolveSlot(raw?: string, id?: string): string {
  const normalized = (raw ?? '').toLowerCase()
  if (normalized.includes('head')) return 'head'
  if (normalized.includes('armor') || normalized.includes('body')) return 'armor'
  if (normalized.includes('shoe') || normalized.includes('feet')) return 'shoes'
  if (normalized.includes('off')) return 'offhand'
  if (normalized.includes('bag')) return 'bag'
  if (normalized.includes('cape')) return 'cape'
  if (normalized.includes('mount')) return 'mount'
  if (normalized.includes('food')) return 'food'
  if (normalized.includes('potion')) return 'potion'
  if (normalized.includes('main') || normalized.includes('weapon')) return 'mainhand'
  if (id && id.includes('_OFF_')) return 'offhand'
  return 'mainhand'
}

function resolveItemClass(raw?: string, id?: string): string {
  if (raw) return raw.toLowerCase()
  if (!id) return 'unknown'
  const match = id.match(/[A-Z]+$/)
  return match ? match[0].toLowerCase() : 'unknown'
}

function extractTables(attrs: Record<string, any>): { masteryTable: string; specTable: string } {
  const masteryTable = getAttr(attrs, [
    'masterytable',
    'masteryTable',
    'masterytableid',
    'masteryTableId',
  ])
  const specTable = getAttr(attrs, [
    'specializationtable',
    'specializationTable',
    'specializationtableid',
    'specializationTableId',
    'spectable',
    'specTable',
  ])

  return {
    masteryTable: masteryTable ?? '',
    specTable: specTable ?? '',
  }
}

function resolveProgressionTables(itemId: string): { masteryTable: string; specTable: string } {
  const id = itemId

  if (id.includes('CROSSBOW')) {
    return { masteryTable: 'CROSSBOW_FIGHTER', specTable: getSpecTable(id, 'CROSSBOW') }
  }
  if (id.includes('_SWORD')) {
    return { masteryTable: 'SWORD_FIGHTER', specTable: getSpecTable(id, 'SWORD') }
  }
  if (id.includes('_AXE') && !id.includes('GREATAXE')) {
    return { masteryTable: 'AXE_FIGHTER', specTable: getSpecTable(id, 'AXE') }
  }
  if (id.includes('_MACE') || id.includes('DUALMACE') || id.includes('OATHKEEPERS')) {
    return { masteryTable: 'MACE_FIGHTER', specTable: getSpecTable(id, 'MACE') }
  }
  if (id.includes('_HAMMER') && !id.includes('POLEHAMMER')) {
    return { masteryTable: 'HAMMER_FIGHTER', specTable: getSpecTable(id, 'HAMMER') }
  }
  if (id.includes('_WAR_GLOVES') || id.includes('_BRAWLER_GLOVES') || id.includes('KNUCKLES')) {
    return { masteryTable: 'WAR_GLOVES_FIGHTER', specTable: getSpecTable(id, 'WAR_GLOVES') }
  }
  if (id.includes('_BOW') && !id.includes('CROSSBOW')) {
    return { masteryTable: 'BOW_FIGHTER', specTable: getSpecTable(id, 'BOW') }
  }
  if (id.includes('_SPEAR') || id.includes('_PIKE') || id.includes('_GLAIVE')) {
    return { masteryTable: 'SPEAR_FIGHTER', specTable: getSpecTable(id, 'SPEAR') }
  }
  if (id.includes('_DAGGER')) {
    return { masteryTable: 'DAGGER_FIGHTER', specTable: getSpecTable(id, 'DAGGER') }
  }
  if (id.includes('_QUARTERSTAFF')) {
    return { masteryTable: 'QUARTERSTAFF_FIGHTER', specTable: getSpecTable(id, 'QUARTERSTAFF') }
  }
  if (id.includes('_NATURESTAFF')) {
    return { masteryTable: 'NATURE_STAFF_FIGHTER', specTable: getSpecTable(id, 'NATURE_STAFF') }
  }
  if (id.includes('_SHAPESHIFTER') || id.includes('_PROWLING_STAFF')) {
    return { masteryTable: 'SHAPESHIFTER_FIGHTER', specTable: getSpecTable(id, 'SHAPESHIFTER') }
  }
  if (id.includes('_FIRESTAFF')) {
    return { masteryTable: 'FIRE_STAFF_FIGHTER', specTable: getSpecTable(id, 'FIRE_STAFF') }
  }
  if (id.includes('_HOLYSTAFF')) {
    return { masteryTable: 'HOLY_STAFF_FIGHTER', specTable: getSpecTable(id, 'HOLY_STAFF') }
  }
  if (id.includes('_ARCANESTAFF')) {
    return { masteryTable: 'ARCANE_STAFF_FIGHTER', specTable: getSpecTable(id, 'ARCANE_STAFF') }
  }
  if (id.includes('_FROSTSTAFF')) {
    return { masteryTable: 'FROST_STAFF_FIGHTER', specTable: getSpecTable(id, 'FROST_STAFF') }
  }
  if (id.includes('_CURSEDSTAFF')) {
    return { masteryTable: 'CURSED_STAFF_FIGHTER', specTable: getSpecTable(id, 'CURSED_STAFF') }
  }

  if (id.includes('_PLATE_')) {
    return { masteryTable: 'PLATE_ARMOR_FIGHTER', specTable: getArmorSpecTable(id, 'PLATE') }
  }
  if (id.includes('_LEATHER_')) {
    return { masteryTable: 'LEATHER_ARMOR_FIGHTER', specTable: getArmorSpecTable(id, 'LEATHER') }
  }
  if (id.includes('_CLOTH_')) {
    return { masteryTable: 'CLOTH_ARMOR_FIGHTER', specTable: getArmorSpecTable(id, 'CLOTH') }
  }

  if (id.includes('_SHIELD')) {
    return { masteryTable: 'SHIELD_FIGHTER', specTable: getOffhandSpecTable(id, 'SHIELD') }
  }
  if (id.includes('_TORCH')) {
    return { masteryTable: 'TORCH_FIGHTER', specTable: getOffhandSpecTable(id, 'TORCH') }
  }
  if (id.includes('_TOME')) {
    return { masteryTable: 'TOME_FIGHTER', specTable: getOffhandSpecTable(id, 'TOME') }
  }

  return { masteryTable: 'UNKNOWN_FIGHTER', specTable: `${id}_SPECIALIST` }
}

function getSpecTable(itemId: string, weaponType: string): string {
  const specMap: Record<string, string> = {
    T4_1H_SWORD: 'SWORD_SPECIALIST',
    T4_2H_CLAYMORE: 'CLAYMORE_SPECIALIST',
    T4_2H_DUALSWORD: 'DUAL_SWORDS_SPECIALIST',
    T6_2H_CLARENT: 'CLARENT_BLADE_SPECIALIST',
    T6_2H_CARVING: 'CARVING_SWORD_SPECIALIST',
    T7_2H_GALATINE: 'GALATINE_PAIR_SPECIALIST',
    T8_2H_KINGMAKER: 'KINGMAKER_SPECIALIST',
    T8_2H_INFINITY: 'INFINITY_BLADE_SPECIALIST',
    T6_2H_DUALMACE_AVALON: 'OATHKEEPERS_SPECIALIST',
    T7_2H_DUALMACE_AVALON: 'OATHKEEPERS_SPECIALIST',
    T8_2H_DUALMACE_AVALON: 'OATHKEEPERS_SPECIALIST',
  }

  if (weaponType === 'CROSSBOW') {
    if (itemId.includes('CROSSBOW_CANNON_AVALON')) return 'ENERGY_SHAPER_SPECIALIST'
    if (itemId.includes('DUALCROSSBOW_CRYSTAL')) return 'ARCLIGHT_BLASTERS_SPECIALIST'
    if (itemId.includes('DUALCROSSBOW')) return 'BOLTCASTERS_SPECIALIST'
    if (itemId.includes('REPEATINGCROSSBOW')) return 'WEEPING_REPEATER_SPECIALIST'
    if (itemId.includes('CROSSBOWLARGE_MORGANA')) return 'SIEGEBOW_SPECIALIST'
    if (itemId.includes('CROSSBOW_SIEGE')) return 'SIEGEBOW_SPECIALIST'
    if (itemId.includes('CROSSBOWLARGE')) return 'HEAVY_CROSSBOW_SPECIALIST'
    if (itemId.includes('2H_CROSSBOW') || itemId.includes('2HCROSSBOW')) return 'LIGHT_CROSSBOW_SPECIALIST'
    if (itemId.includes('1H_CROSSBOW') || itemId.includes('1HCROSSBOW')) return 'CROSSBOW_SPECIALIST'
  }

  if (weaponType === 'MACE' && (itemId.includes('DUALMACE') || itemId.includes('OATHKEEPERS'))) {
    return 'OATHKEEPERS_SPECIALIST'
  }

  return specMap[itemId] || `${weaponType}_SPECIALIST`
}

function getArmorSpecTable(itemId: string, armorType: string): string {
  if (itemId.includes('_SET1')) return `${armorType}_SET1_SPECIALIST`
  if (itemId.includes('_SET2')) return `${armorType}_SET2_SPECIALIST`
  if (itemId.includes('_SET3')) return `${armorType}_SET3_SPECIALIST`
  if (itemId.includes('_KEEPER')) return `${armorType}_KEEPER_SPECIALIST`
  if (itemId.includes('_MORGANA')) return `${armorType}_MORGANA_SPECIALIST`
  if (itemId.includes('_HELL')) return `${armorType}_HELL_SPECIALIST`
  if (itemId.includes('_UNDEAD')) return `${armorType}_UNDEAD_SPECIALIST`
  if (itemId.includes('_AVALON')) return `${armorType}_AVALON_SPECIALIST`
  if (itemId.includes('_ROYAL')) return `${armorType}_ROYAL_SPECIALIST`
  return `${armorType}_SPECIALIST`
}

function getOffhandSpecTable(itemId: string, offhandType: string): string {
  const specMap: Record<string, string> = {
    T4_OFF_SHIELD: 'SHIELD_SPECIALIST',
    T6_OFF_SARCOPHAGUS: 'SARCOPHAGUS_SPECIALIST',
    T6_OFF_CAIIFF_SHIELD: 'CAIIFF_SHIELD_SPECIALIST',
    T7_OFF_FACEBREAKER: 'FACEBREAKER_SPECIALIST',
    T8_OFF_ASTRAL_AEGIS: 'ASTRAL_AEGIS_SPECIALIST',
    T4_OFF_TORCH: 'TORCH_SPECIALIST',
    T6_OFF_MISTCALLER: 'MISTCALLER_SPECIALIST',
    T6_OFF_LEERING_CANE: 'LEERING_CANE_SPECIALIST',
    T7_OFF_CRYPTCANDLE: 'CRYPTCANDLE_SPECIALIST',
    T8_OFF_SACRED_SCEPTER: 'SACRED_SCEPTER_SPECIALIST',
    T4_OFF_TOME: 'TOME_SPECIALIST',
    T6_OFF_EYE_OF_SECRETS: 'EYE_OF_SECRETS_SPECIALIST',
    T6_OFF_MUISAK: 'MUISAK_SPECIALIST',
    T7_OFF_TAPROOT: 'TAPROOT_SPECIALIST',
    T8_OFF_CELESTIAL_CENSER: 'CELESTIAL_CENSER_SPECIALIST',
  }

  return specMap[itemId] || `${offhandType}_SPECIALIST`
}

function collectItems(node: any, out: ItemIndexEntry[]) {
  if (!node || typeof node !== 'object') return

  if (Array.isArray(node)) {
    node.forEach((entry) => collectItems(entry, out))
    return
  }

  const attrs = node.$ ?? {}
  const id = String(attrs.uniquename ?? attrs.id ?? '').trim()
  if (id) {
    const name = String(attrs.name ?? id)
    const tierRaw = getAttr(attrs, ['tier', 'tiertype'])
    const enchantmentRaw = getAttr(attrs, ['enchantmentlevel'])
    const powerRaw = getAttr(attrs, ['itempower', 'power'])
    const slotRaw = getAttr(attrs, ['slottype'])
    const masteryModifierRaw = getAttr(attrs, ['masterymodifier'])
    const classRaw =
      getAttr(attrs, ['craftingcategory', 'itemclass', 'itemtype', 'itemClass']) ??
      getAttr(attrs, ['shopsubcategory1'])

    const tables = extractTables(attrs)
    const resolvedTables =
      tables.masteryTable || tables.specTable ? tables : resolveProgressionTables(id)

    out.push({
      id,
      name,
      tier: parseTier(id, tierRaw),
      enchantment: parseEnchantment(id, enchantmentRaw),
      power: parseNumber(powerRaw),
      slot: resolveSlot(slotRaw, id),
      itemClass: resolveItemClass(classRaw, id),
      masteryModifier: parseNumber(masteryModifierRaw),
      masteryTable: resolvedTables.masteryTable,
      specTable: resolvedTables.specTable,
    })
  }

  for (const value of Object.values(node)) {
    if (value && typeof value === 'object') collectItems(value, out)
  }
}

async function main() {
  const xmlPath = loadItemsXmlPath()
  const xmlData = readFileSync(xmlPath, 'utf-8')
  const parsed = await parseStringPromise(xmlData, { explicitArray: false })
  const formattedNames = loadFormattedItems()

  const items: ItemIndexEntry[] = []
  collectItems(parsed?.items ?? parsed, items)

  if (Object.keys(formattedNames).length > 0) {
    for (const item of items) {
      const name = formattedNames[item.id]
      if (name) item.name = name
    }
  }

  const index: Record<string, ItemIndexEntry> = {}
  for (const item of items) {
    const existing = index[item.id]
    if (!existing) {
      index[item.id] = item
      continue
    }
    if (existing.power > 0 && item.power <= 0) {
      continue
    }
    if (item.power > existing.power) {
      index[item.id] = item
      continue
    }
    if (existing.power === 0 && item.power === 0) {
      index[item.id] = item
    }
  }

  const outDir = join(process.cwd(), 'src', 'lib', 'generated')
  mkdirSync(outDir, { recursive: true })
  const outPath = join(outDir, 'itemsIndex.json')
  writeFileSync(outPath, JSON.stringify(index, null, 2))

  console.log(`Generated ${Object.keys(index).length} item entries at ${outPath}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
