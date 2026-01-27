import { parseStringPromise } from 'xml2js'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

type ItemRecord = {
  item_id: string
  name: string
  tier: number
  enchantment: number
  base_item_id: string
  category: 'gear' | 'food' | 'potion'
  subcategory: string
  is_artifact: boolean
  artifact_type?: 'avalonian' | 'elder' | 'keeper' | 'morgana' | 'heretic'
  city_bonus?: string
}

type CraftingRequirement = {
  item_id: string
  material_id: string
  amount: number
  is_primary: boolean
}

type ArtifactRequirement = {
  item_id: string
  artifact_id: string
  artifact_name: string
  amount: number
}

type MaterialRecord = {
  material_id: string
  name: string
  tier: string
  category: 'resources' | 'refined' | 'artifacts'
}

type JournalRecord = {
  journal_id: string
  name: string
  tier: number
  type: 'combat' | 'gathering' | 'crafting'
  fame_required: number
  fame_per_kill: number
  silver_value: number
}

const DEFAULT_ITEMS_PATHS = [
  process.env.ITEMS_XML_PATH,
  join(process.cwd(), 'data', 'ao-bin-dumps', 'items.xml'),
  '/mnt/data/items.xml',
].filter(Boolean) as string[]

const DEFAULT_FORMATTED_ITEMS_PATHS = [
  process.env.FORMATTED_ITEMS_JSON,
  join(process.cwd(), 'src', 'data', 'formatted', 'items.json'),
  join(process.cwd(), 'data', 'formatted', 'items.json'),
].filter(Boolean) as string[]

const ARTIFACT_PATTERNS: Record<string, RegExp> = {
  avalonian: /_AVALON$/i,
  elder: /_SET1$|_UNDEAD$|_ELDER$/i,
  keeper: /_SET2$|_KEEPER$/i,
  morgana: /_SET3$|_MORGANA$/i,
  heretic: /_SET4$|_HELL$|_HERETIC$/i,
}

const CITY_BONUS_MAP: Record<string, string> = {
  plate: 'Bridgewatch',
  leather: 'Bridgewatch',
  cloth: 'Thetford',
  bow: 'Lymhurst',
  tool: 'Lymhurst',
  planks: 'Lymhurst',
  stone: 'Fort Sterling',
  mount: 'Fort Sterling',
  potions: 'Thetford',
  magic: 'Thetford',
  gathering: 'Martlock',
  crop: 'Martlock',
}

function loadItemsXmlPath(): string {
  for (const candidate of DEFAULT_ITEMS_PATHS) {
    if (candidate && existsSync(candidate)) return candidate
  }
  throw new Error(`items.xml not found. Tried: ${DEFAULT_ITEMS_PATHS.join(', ')}`)
}

function loadFormattedItems(): Record<string, string> {
  for (const candidate of DEFAULT_FORMATTED_ITEMS_PATHS) {
    if (!candidate || !existsSync(candidate)) continue
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

function parseTier(id: string, raw?: string): number {
  if (raw) {
    const parsed = parseInt(raw.replace('T', ''), 10)
    if (!Number.isNaN(parsed)) return parsed
  }
  const match = id.match(/T(\d+)/)
  return match ? parseInt(match[1], 10) : 1
}

function parseItemId(itemId: string): { baseId: string; tier: number; enchantment: number } {
  const tierMatch = itemId.match(/T(\d+)/)
  const tier = tierMatch ? parseInt(tierMatch[1], 10) : 1

  let enchantment = 0
  let baseId = itemId

  const levelMatch = itemId.match(/LEVEL(\d+)/)
  if (levelMatch) {
    enchantment = parseInt(levelMatch[1], 10)
    baseId = itemId.replace(/_LEVEL\d+@\d+/, '')
  } else if (itemId.includes('@')) {
    const parts = itemId.split('@')
    baseId = parts[0]
    enchantment = parseInt(parts[1], 10) || 0
  } else if (/\.\d+$/.test(itemId)) {
    const parts = itemId.split('.')
    baseId = parts[0]
    enchantment = parseInt(parts[1], 10) || 0
  }

  return { baseId, tier, enchantment }
}

function isLikelyItemId(id: string): boolean {
  return /^T\d+_/.test(id)
}

function getArtifactType(itemId: string): ItemRecord['artifact_type'] | undefined {
  for (const [type, pattern] of Object.entries(ARTIFACT_PATTERNS)) {
    if (pattern.test(itemId)) return type as ItemRecord['artifact_type']
  }
  return undefined
}

function resolveCategory(itemId: string, shopCategory?: string): ItemRecord['category'] {
  const upper = itemId.toUpperCase()
  if (upper.includes('MEAL') || upper.includes('FOOD')) return 'food'
  if (upper.includes('POTION')) return 'potion'
  if (shopCategory?.toLowerCase().includes('consumable')) return 'food'
  return 'gear'
}

function resolveSubcategory(attrs: Record<string, any>): string {
  return (
    attrs.shopsubcategory3 ??
    attrs.shopsubcategory2 ??
    attrs.shopsubcategory1 ??
    attrs.craftingcategory ??
    attrs.itemclass ??
    'unknown'
  ).toString()
}

function resolveCityBonus(subcategory: string): string | undefined {
  const key = subcategory.toLowerCase()
  return CITY_BONUS_MAP[key]
}

function materialCategory(materialId: string): MaterialRecord['category'] {
  const upper = materialId.toUpperCase()
  if (upper.includes('ARTEFACT') || upper.includes('ARTEFACT')) return 'artifacts'
  if (upper.includes('PLANKS') || upper.includes('CLOTH') || upper.includes('LEATHER') || upper.includes('METALBAR') || upper.includes('STONEBLOCK')) {
    return 'refined'
  }
  return 'resources'
}

function collectItems(
  node: any,
  formattedNames: Record<string, string>,
  items: Map<string, ItemRecord>,
  requirements: CraftingRequirement[],
  artifacts: ArtifactRequirement[],
  materials: Map<string, MaterialRecord>,
  journals: JournalRecord[]
) {
  if (!node || typeof node !== 'object') return
  if (Array.isArray(node)) {
    node.forEach((entry) =>
      collectItems(entry, formattedNames, items, requirements, artifacts, materials, journals)
    )
    return
  }

  const attrs = node.$ ?? {}
  const id = String(attrs.uniquename ?? attrs.id ?? '').trim()

  if (id && isLikelyItemId(id)) {
    const baseInfo = parseItemId(id)
    const subcategory = resolveSubcategory(attrs)
    const category = resolveCategory(id, attrs.shopcategory)
    const artifactType = getArtifactType(id)
    const name = formattedNames[id] ?? attrs.name ?? id
    const isArtifact = Boolean(artifactType)
    const cityBonus = resolveCityBonus(subcategory)

    const entry: ItemRecord = {
      item_id: id,
      name,
      tier: parseTier(id, attrs.tier),
      enchantment: baseInfo.enchantment,
      base_item_id: baseInfo.baseId,
      category,
      subcategory,
      is_artifact: isArtifact,
      artifact_type: artifactType,
      city_bonus: cityBonus,
    }
    items.set(id, entry)

    const craftingReqs = asArray(node.craftingrequirements)
    for (const req of craftingReqs) {
      const craftResources = asArray(req.craftresource)
      for (const resource of craftResources) {
        const resourceId = resource?.$?.uniquename
        const count = parseFloat(resource?.$?.count ?? '0')
        if (!resourceId || Number.isNaN(count) || count <= 0) continue
        const isArtifactReq = resourceId.toUpperCase().includes('ARTEFACT')
        if (isArtifactReq) {
          artifacts.push({
            item_id: id,
            artifact_id: resourceId,
            artifact_name: formattedNames[resourceId] ?? resourceId,
            amount: count,
          })
        } else {
          requirements.push({
            item_id: id,
            material_id: resourceId,
            amount: count,
            is_primary: true,
          })
        }
        if (!materials.has(resourceId)) {
          materials.set(resourceId, {
            material_id: resourceId,
            name: formattedNames[resourceId] ?? resourceId,
            tier: `T${parseTier(resourceId)}`,
            category: materialCategory(resourceId),
          })
        }
      }
    }

    if (node.enchantments?.enchantment) {
      const enchantments = asArray(node.enchantments.enchantment)
      for (const enchantment of enchantments) {
        const level = parseInt(enchantment?.$?.enchantmentlevel ?? '0', 10)
        if (!level) continue
        const variantId = `${baseInfo.baseId}@${level}`
        const variantName = formattedNames[variantId] ?? `${name} .${level}`
        const variantEntry: ItemRecord = {
          ...entry,
          item_id: variantId,
          name: variantName,
          enchantment: level,
          base_item_id: baseInfo.baseId,
        }
        items.set(variantId, variantEntry)
        const enchantReqs = asArray(enchantment.craftingrequirements)
        for (const req of enchantReqs) {
          const craftResources = asArray(req.craftresource)
          for (const resource of craftResources) {
            const resourceId = resource?.$?.uniquename
            const count = parseFloat(resource?.$?.count ?? '0')
            if (!resourceId || Number.isNaN(count) || count <= 0) continue
            const isArtifactReq = resourceId.toUpperCase().includes('ARTEFACT')
            if (isArtifactReq) {
              artifacts.push({
                item_id: variantId,
                artifact_id: resourceId,
                artifact_name: formattedNames[resourceId] ?? resourceId,
                amount: count,
              })
            } else {
              requirements.push({
                item_id: variantId,
                material_id: resourceId,
                amount: count,
                is_primary: true,
              })
            }
            if (!materials.has(resourceId)) {
              materials.set(resourceId, {
                material_id: resourceId,
                name: formattedNames[resourceId] ?? resourceId,
                tier: `T${parseTier(resourceId)}`,
                category: materialCategory(resourceId),
              })
            }
          }
        }
      }
    }

    if (node.famefillingmissions && id.includes('JOURNAL')) {
      const maxFame = parseFloat(attrs.maxfame ?? '0')
      const baseLoot = parseFloat(attrs.baselootamount ?? '0')
      const journalType: JournalRecord['type'] = id.includes('WARRIOR') || id.includes('HUNTER') || id.includes('MAGE')
        ? 'combat'
        : id.includes('JOURNAL_') && id.includes('TOOL')
          ? 'gathering'
          : 'crafting'
      journals.push({
        journal_id: id,
        name: formattedNames[id] ?? name,
        tier: parseTier(id, attrs.tier),
        type: journalType,
        fame_required: maxFame,
        fame_per_kill: 0,
        silver_value: baseLoot,
      })
    }
  }

  for (const value of Object.values(node)) {
    if (value && typeof value === 'object') {
      collectItems(value, formattedNames, items, requirements, artifacts, materials, journals)
    }
  }
}

async function main() {
  const xmlPath = loadItemsXmlPath()
  const xmlData = readFileSync(xmlPath, 'utf-8')
  const parsed = await parseStringPromise(xmlData, { explicitArray: false })
  const formattedNames = loadFormattedItems()

  const items = new Map<string, ItemRecord>()
  const requirements: CraftingRequirement[] = []
  const artifacts: ArtifactRequirement[] = []
  const materials = new Map<string, MaterialRecord>()
  const journals: JournalRecord[] = []

  collectItems(parsed?.items ?? parsed, formattedNames, items, requirements, artifacts, materials, journals)

  const baseItems = Array.from(items.values()).filter((item) => item.enchantment === 0)
  for (const item of baseItems) {
    for (let level = 1; level <= 4; level += 1) {
      const variantId = `${item.base_item_id}@${level}`
      if (items.has(variantId)) continue
      items.set(variantId, {
        ...item,
        item_id: variantId,
        name: `${item.name} .${level}`,
        enchantment: level,
        base_item_id: item.base_item_id,
      })
    }
  }

  const outDir = join(process.cwd(), 'src', 'data', 'crafting')
  mkdirSync(outDir, { recursive: true })

  writeFileSync(join(outDir, 'items.json'), JSON.stringify(Array.from(items.values()), null, 2))
  writeFileSync(join(outDir, 'requirements.json'), JSON.stringify(requirements, null, 2))
  writeFileSync(join(outDir, 'artifacts.json'), JSON.stringify(artifacts, null, 2))
  writeFileSync(join(outDir, 'materials.json'), JSON.stringify(Array.from(materials.values()), null, 2))
  writeFileSync(join(outDir, 'journals.json'), JSON.stringify(journals, null, 2))

  console.log(`Crafting items: ${items.size}`)
  console.log(`Requirements: ${requirements.length}`)
  console.log(`Artifacts: ${artifacts.length}`)
  console.log(`Materials: ${materials.size}`)
  console.log(`Journals: ${journals.length}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
