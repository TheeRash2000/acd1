import { parseStringPromise } from 'xml2js'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

interface ParsedItem {
  id: string
  name: string
  tier: number
  enchantment?: number
  power: number
  slot: string
  itemClass: string
  masteryTable: string
  specTable: string
}

function loadFormattedNames(): Record<string, string> {
  const candidates = [
    join(process.cwd(), 'src', 'data', 'formatted', 'items.json'),
    join(process.cwd(), 'data', 'formatted', 'items.json'),
  ]
  for (const candidate of candidates) {
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
        entry.LocalizedNames?.EN
      if (id && name) {
        map[String(id)] = String(name)
      }
    }
    return map
  }
  return {}
}

async function parseItemsXML() {
  const xmlPath = join(process.cwd(), 'data', 'ao-bin-dumps', 'items.xml')
  const jsonPath = join(process.cwd(), 'data', 'ao-bin-dumps', 'items.json')
  const items: ParsedItem[] = []
  const nameMap = loadFormattedNames()

  if (existsSync(xmlPath)) {
    const xml = readFileSync(xmlPath, 'utf-8')
    const parsed = await parseStringPromise(xml, { explicitArray: false })
    const root = parsed?.items ?? {}

    for (const [category, data] of Object.entries(root)) {
      if (category === '$') continue
      if (!data || typeof data !== 'object') continue

      const itemList = normalizeItemList(data as any)
      for (const item of itemList) {
        const attrs = item?.$ ?? item
        if (!attrs) continue
        const rawId = attrs.id ?? attrs.uniquename
        if (!rawId) continue

        const { masteryTable, specTable } = resolveProgressionTables(item, category)
        const tierValue = parseInt(String(attrs.tiertype ?? attrs.tier ?? '').replace('T', ''), 10)

        items.push({
          id: rawId,
          name: nameMap[rawId] ?? attrs.name ?? rawId,
          tier: Number.isNaN(tierValue) ? 1 : tierValue,
          enchantment: attrs.enchantmentlevel ? parseInt(String(attrs.enchantmentlevel), 10) : undefined,
          power: parseInt(String(attrs.power ?? 0), 10),
          slot: resolveSlot(category, item),
          itemClass: resolveItemClass(category, item),
          masteryTable,
          specTable,
        })
      }
    }
  } else if (existsSync(jsonPath)) {
    const raw = JSON.parse(readFileSync(jsonPath, 'utf-8'))
    const rootJson = raw?.items ?? raw

    for (const [category, data] of Object.entries(rootJson ?? {})) {
      if (String(category).startsWith('@')) continue
      if (!data || typeof data !== 'object') continue

      const itemList = normalizeJsonItemList(data)
      for (const item of itemList) {
        const rawId = extractJsonId(item)
        if (!rawId) continue
        const normalizedCategory = String(category)
        const { masteryTable, specTable } = resolveProgressionTables({ $: { id: rawId } }, normalizedCategory)

        items.push({
          id: rawId,
          name: nameMap[rawId] ?? extractJsonName(item, rawId),
          tier: extractJsonTier(item, rawId),
          enchantment: extractJsonEnchantment(item, rawId),
          power: extractJsonPower(item),
          slot: extractJsonSlot(item, rawId),
          itemClass: extractJsonClass(item, rawId, normalizedCategory),
          masteryTable,
          specTable,
        })
      }
    }
  } else {
    throw new Error('Missing items.xml or items.json in data/ao-bin-dumps')
  }

  const outDir = join(process.cwd(), 'public', 'data')
  mkdirSync(outDir, { recursive: true })
  writeFileSync(join(outDir, 'items.json'), JSON.stringify(items, null, 2))

  const progressionTables = new Set<string>()
  for (const item of items) {
    progressionTables.add(item.masteryTable)
    progressionTables.add(item.specTable)
  }
  const tablesPayload = JSON.stringify(Array.from(progressionTables).sort(), null, 2)
  writeFileSync(join(outDir, 'progression-tables.json'), tablesPayload)
  writeFileSync(join(process.cwd(), 'src', 'data', 'progression-tables.json'), tablesPayload)

  console.log(`Parsed ${items.length} items`)
  console.log(`Found ${progressionTables.size} unique progression tables`)
}

function normalizeItemList(data: any): any[] {
  if (!data) return []
  if (Array.isArray(data)) return data
  if (data.item) return Array.isArray(data.item) ? data.item : [data.item]
  if (data.$ || data.id || data.uniquename) return [data]
  return []
}

function normalizeJsonItemList(data: any): any[] {
  if (!data) return []
  if (Array.isArray(data)) return data
  if (Array.isArray((data as any).item)) return (data as any).item
  if ((data as any).item) return [(data as any).item]
  if ((data as any)['@uniquename'] || (data as any)['@id'] || (data as any).id || (data as any).uniquename) {
    return [data]
  }
  return []
}

function extractJsonId(item: any): string | null {
  return (
    item?.id ??
    item?.ID ??
    item?.['@uniquename'] ??
    item?.['@id'] ??
    item?.UniqueName ??
    item?.uniquename ??
    item?.uniqueName ??
    item?.ItemID ??
    item?.ItemName ??
    null
  )
}

function extractJsonName(item: any, fallback: string): string {
  return (
    item?.name ??
    item?.Name ??
    item?.['@name'] ??
    item?.LocalizedNames?.['EN-US'] ??
    item?.LocalizedNames?.en ??
    fallback
  )
}

function extractJsonTier(item: any, id: string): number {
  const raw = item?.tier ?? item?.Tier ?? item?.['@tier']
  const parsed = raw !== undefined ? parseInt(String(raw), 10) : NaN
  if (!Number.isNaN(parsed)) return parsed
  const match = id.match(/T(\\d+)/)
  return match ? parseInt(match[1], 10) : 1
}

function extractJsonEnchantment(item: any, id: string): number | undefined {
  const raw = item?.enchantmentlevel ?? item?.EnchantmentLevel ?? item?.['@enchantmentlevel']
  if (raw !== undefined) return parseInt(String(raw), 10)
  const match = id.match(/@(\\d+)/)
  return match ? parseInt(match[1], 10) : undefined
}

function extractJsonPower(item: any): number {
  const raw = item?.power ?? item?.ItemPower ?? item?.Itempower ?? item?.['@itempower'] ?? item?.['@power']
  const parsed = parseInt(String(raw ?? 0), 10)
  return Number.isNaN(parsed) ? 0 : parsed
}

function extractJsonSlot(item: any, id: string): string {
  const raw = String(item?.SlotType ?? item?.slot ?? item?.['@slottype'] ?? '')
  const normalized = raw.toLowerCase()
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
  return resolveSlot('ITEMS', { $: { id } })
}

function extractJsonClass(item: any, id: string, category: string): string {
  const raw = item?.itemClass ?? item?.ItemClass ?? item?.WeaponCategory ?? item?.ItemType
  if (raw) return String(raw).toLowerCase()
  return resolveItemClass(category, { $: { id } })
}

function resolveProgressionTables(item: any, category: string): { masteryTable: string; specTable: string } {
  const attrs = item?.$ ?? item
  const id = String(attrs?.id ?? attrs?.uniquename ?? '')

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
  if (id.includes('_WAR_GLOVES') || id.includes('_BRAWLER_GLOVES')) {
    return { masteryTable: 'WAR_GLOVES_FIGHTER', specTable: getSpecTable(id, 'WAR_GLOVES') }
  }
  if (id.includes('CROSSBOW')) {
    return { masteryTable: 'CROSSBOW_FIGHTER', specTable: getSpecTable(id, 'CROSSBOW') }
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

  console.warn(`Unknown item type for ${id}, using fallback`)
  return {
    masteryTable: `${String(category).toUpperCase()}_FIGHTER`,
    specTable: `${id}_SPECIALIST`,
  }
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
    if (itemId.includes('DUALCROSSBOW')) return 'BOLTCASTERS_SPECIALIST'
    if (itemId.includes('REPEATINGCROSSBOW')) return 'WEEPING_REPEATER_SPECIALIST'
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

function resolveSlot(category: string, item: any): string {
  const attrs = item?.$ ?? item
  const id = String(attrs?.id ?? attrs?.uniquename ?? '')

  if (id.includes('_HEAD_')) return 'head'
  if (id.includes('_ARMOR_')) return 'armor'
  if (id.includes('_SHOES_')) return 'shoes'
  if (id.includes('_OFF_')) return 'offhand'
  if (id.includes('_BAG_')) return 'bag'
  if (id.includes('_CAPE_')) return 'cape'
  if (id.includes('_MOUNT_')) return 'mount'
  if (id.includes('_FOOD_')) return 'food'
  if (id.includes('_POTION_')) return 'potion'

  return 'mainhand'
}

function resolveItemClass(category: string, item: any): string {
  const attrs = item?.$ ?? item
  const id = String(attrs?.id ?? attrs?.uniquename ?? '')

  const match = id.match(/[A-Z]+$/)
  if (match) return match[0].toLowerCase()

  return String(category).toLowerCase()
}

parseItemsXML().catch(console.error)
