import { parseStringPromise } from 'xml2js'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

type CraftSpell = {
  uniquename: string
  slots: number[]
  tag?: string
}

type CraftingSpellList = {
  reference?: string
  addSpells: CraftSpell[]
  removeSpells: string[]
}

type ItemIndexEntry = {
  id: string
  slotType: 'weapon' | 'offhand' | 'head' | 'chest' | 'shoes' | 'cape' | 'mount' | 'food' | 'potion'
  hands?: '1h' | '2h'
  abilityPower: number
  baseItemPower?: number
  weight?: number
  attackDamage?: number
  attackType?: string
  craftingSpellList: CraftingSpellList
}

type DamagePacket = {
  label: string
  base: number
  damageType: 'physical' | 'magic' | 'true'
  count: number
  interval?: number
  aoeBonusPerTarget?: number
}

type SpellIndexEntry = {
  components: DamagePacket[]
}

const DEFAULT_ITEMS_PATHS = [
  process.env.ITEMS_XML_PATH,
  join(process.cwd(), 'data', 'items.xml'),
  join(process.cwd(), 'data', 'ao-bin-dumps', 'items.xml'),
  '/mnt/data/items.xml',
].filter(Boolean) as string[]

const DEFAULT_SPELLS_PATHS = [
  process.env.SPELLS_XML_PATH,
  join(process.cwd(), 'data', 'spells.xml'),
  join(process.cwd(), 'data', 'ao-bin-dumps', 'spells.xml'),
  '/mnt/data/spells.xml',
].filter(Boolean) as string[]

const DEFAULT_LOCALIZATION_PATHS = [
  process.env.LOCALIZATION_XML_PATH,
  join(process.cwd(), 'data', 'localization.xml'),
  join(process.cwd(), 'data', 'ao-bin-dumps', 'localization.xml'),
  '/mnt/data/localization.xml',
].filter(Boolean) as string[]

const OUTPUT_DIR = join(process.cwd(), 'src', 'lib', 'data', 'generated')

function resolvePath(candidates: string[], label: string) {
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate
  }
  throw new Error(`${label} not found. Tried: ${candidates.join(', ')}`)
}

function asArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

function parseNumber(raw?: string, fallback = 0): number {
  if (!raw) return fallback
  const parsed = parseFloat(raw)
  return Number.isNaN(parsed) ? fallback : parsed
}

function parseIntSafe(raw?: string, fallback = 0): number {
  if (!raw) return fallback
  const parsed = parseInt(raw, 10)
  return Number.isNaN(parsed) ? fallback : parsed
}

function resolveSlotType(
  tag: string,
  attrs: Record<string, any>
): ItemIndexEntry['slotType'] | null {
  const slot = String(attrs.slottype ?? '').toLowerCase()
  if (slot === 'mainhand' || tag === 'weapon' || tag === 'transformationweapon') return 'weapon'
  if (slot === 'offhand') return 'offhand'
  if (slot === 'head') return 'head'
  if (slot === 'armor' || slot === 'body') return 'chest'
  if (slot === 'shoes' || slot === 'feet') return 'shoes'
  if (slot === 'cape' || tag === 'cape') return 'cape'
  if (tag === 'mount' || slot === 'mount') return 'mount'

  const shopCategory = String(attrs.shopcategory ?? '').toLowerCase()
  const consumable = String(attrs.consumablecategory ?? attrs.consumabletype ?? '').toLowerCase()

  if (shopCategory.includes('food') || consumable.includes('food')) return 'food'
  if (shopCategory.includes('potion') || consumable.includes('potion')) return 'potion'

  return null
}

function parseCraftSpellList(node: any): CraftingSpellList {
  if (!node) {
    return { addSpells: [], removeSpells: [] }
  }

  const reference = node.$?.reference ?? node.reference
  const addSpells = asArray(node.craftspell).map((spell) => {
    const attrs = spell.$ ?? spell
    const slotsRaw = String(attrs.slots ?? '')
    const slots = slotsRaw
      ? slotsRaw
          .split('|')
          .map((value: string) => parseIntSafe(value))
          .filter((value: number) => value > 0)
      : []

    return {
      uniquename: String(attrs.uniquename),
      slots,
      tag: attrs.tag ? String(attrs.tag) : undefined,
    }
  })

  const removeSpells = asArray(node.removespell).map((spell) => {
    const attrs = spell.$ ?? spell
    return String(attrs.uniquename)
  })

  return {
    reference: reference ? String(reference) : undefined,
    addSpells,
    removeSpells,
  }
}

function resolveSpellPool(
  itemId: string,
  itemsIndex: Record<string, ItemIndexEntry>,
  visited: Set<string>
): CraftSpell[] {
  if (visited.has(itemId)) return []
  visited.add(itemId)

  const item = itemsIndex[itemId]
  if (!item) return []

  const { reference, addSpells, removeSpells } = item.craftingSpellList
  let spells: CraftSpell[] = []

  if (reference) {
    spells = resolveSpellPool(reference, itemsIndex, visited)
  }

  if (removeSpells.length > 0) {
    const toRemove = new Set(removeSpells)
    spells = spells.filter((spell) => !toRemove.has(spell.uniquename))
  }

  for (const spell of addSpells) {
    const existing = spells.find((entry) => entry.uniquename === spell.uniquename)
    if (existing) {
      existing.slots = spell.slots.length > 0 ? spell.slots : existing.slots
      if (spell.tag) existing.tag = spell.tag
    } else {
      spells.push({ ...spell })
    }
  }

  return spells
}

function mapDamageType(raw?: string): DamagePacket['damageType'] {
  const normalized = String(raw ?? '').toLowerCase()
  if (normalized.includes('magic')) return 'magic'
  if (normalized.includes('true')) return 'true'
  return 'physical'
}

function parseValueOverrides(node: any): Array<{ min: number; value: number }> {
  const overrides: Array<{ min: number; value: number }> = []
  const valueOverride = node?.valueoverride
  const ifCharge = valueOverride?.IfCharge ?? valueOverride?.ifcharge
  const changeNodes = asArray(ifCharge?.change)
  for (const change of changeNodes) {
    const attrs = change.$ ?? change
    const min = parseIntSafe(attrs.mincharges ?? attrs.minCharge ?? attrs.min ?? '0')
    const value = parseNumber(attrs.value)
    if (!Number.isNaN(value)) {
      overrides.push({ min, value })
    }
  }
  return overrides.sort((a, b) => a.min - b.min)
}

function buildHitValues(
  base: number,
  count: number,
  overrides: Array<{ min: number; value: number }>
): number[] {
  const values: number[] = []
  for (let i = 1; i <= count; i += 1) {
    const match = overrides.filter((entry) => entry.min <= i).pop()
    const value = match ? Math.abs(match.value) : base
    values.push(value)
  }
  return values
}

function extractDirectPackets(node: any, context: { count?: number; interval?: number }, label: string) {
  const packets: DamagePacket[] = []
  for (const direct of asArray(node.directattributechange)) {
    const attrs = direct.$ ?? direct
    if (String(attrs.attribute).toLowerCase() !== 'health') continue
    const rawChange = parseNumber(attrs.change)
    if (rawChange >= 0) continue

    const base = Math.abs(rawChange)
    const damageType = mapDamageType(attrs.effecttype ?? attrs.damagetype)
    const aoeBonus = parseNumber(attrs.targetcountvaluebonusfactor, 0)
    const count = Math.max(1, context.count ?? 1)
    const overrides = parseValueOverrides(direct)

    if (overrides.length > 0 && count > 1) {
      const hitValues = buildHitValues(base, count, overrides)
      const uniqueValues = new Set(hitValues)
      if (uniqueValues.size === 1) {
        packets.push({
          label,
          base: hitValues[0],
          damageType,
          count,
          interval: context.interval,
          aoeBonusPerTarget: aoeBonus || undefined,
        })
      } else {
        hitValues.forEach((value, index) => {
          packets.push({
            label: `${label} Hit ${index + 1}`,
            base: value,
            damageType,
            count: 1,
            interval: context.interval,
            aoeBonusPerTarget: aoeBonus || undefined,
          })
        })
      }
      continue
    }

    packets.push({
      label,
      base,
      damageType,
      count,
      interval: context.interval,
      aoeBonusPerTarget: aoeBonus || undefined,
    })
  }
  return packets
}

function extractDotPackets(node: any, label: string) {
  const packets: DamagePacket[] = []
  for (const dot of asArray(node.attributechangeovertime)) {
    const attrs = dot.$ ?? dot
    if (String(attrs.attribute).toLowerCase() !== 'health') continue
    const rawChange = parseNumber(attrs.change)
    if (rawChange >= 0) continue

    const base = Math.abs(rawChange)
    const damageType = mapDamageType(attrs.effecttype ?? attrs.damagetype)
    const count = Math.max(1, parseIntSafe(attrs.count, 1))
    const interval = parseNumber(attrs.interval ?? attrs.initialinterval)
    const aoeBonus = parseNumber(attrs.targetcountvaluebonusfactor, 0)

    packets.push({
      label,
      base,
      damageType,
      count,
      interval: Number.isNaN(interval) || interval === 0 ? undefined : interval,
      aoeBonusPerTarget: aoeBonus || undefined,
    })
  }
  return packets
}

function buildSpellComponents(
  spell: any,
  activesById: Map<string, any>,
  visited: Set<string>,
  context?: { directCountOverride?: number; intervalOverride?: number }
): DamagePacket[] {
  const spellId = String(spell.$?.uniquename ?? '')
  if (!spellId || visited.has(spellId)) return []
  visited.add(spellId)

  const components: DamagePacket[] = []
  components.push(
    ...extractDirectPackets(
      spell,
      { count: context?.directCountOverride ?? 1, interval: context?.intervalOverride },
      'Direct'
    )
  )
  components.push(...extractDotPackets(spell, 'DoT'))

  for (const channel of asArray(spell.channelingspell)) {
    const attrs = channel.$ ?? channel
    const count = Math.max(1, parseIntSafe(attrs.effectcount, 1))
    const interval = parseNumber(attrs.effectinterval)
    components.push(
      ...extractDirectPackets(channel, { count, interval }, 'Channel'),
      ...extractDotPackets(channel, 'Channel DoT')
    )

    for (const apply of asArray(channel.applyspell)) {
      const applyAttrs = apply.$ ?? apply
      const targetSpellId = applyAttrs.spell ? String(applyAttrs.spell) : ''
      if (!targetSpellId) continue
      const targetSpell = activesById.get(targetSpellId)
      if (targetSpell) {
        const nested = buildSpellComponents(targetSpell, activesById, visited, {
          directCountOverride: count,
          intervalOverride: interval,
        })
        components.push(...nested.map((packet) => ({ ...packet, label: `Applied: ${packet.label}` })))
      }
    }
  }

  for (const area of asArray(spell.spelleffectarea)) {
    const attrs = area.$ ?? area
    const effectId = attrs.effect ? String(attrs.effect) : ''
    if (!effectId) continue
    const effectSpell = activesById.get(effectId)
    if (effectSpell) {
      const nested = buildSpellComponents(effectSpell, activesById, visited)
      components.push(...nested.map((packet) => ({ ...packet, label: `Area: ${packet.label}` })))
    }
  }

  for (const aura of asArray(spell.aura)) {
    const attrs = aura.$ ?? aura
    const auraSpellId = attrs.spell ? String(attrs.spell) : ''
    if (!auraSpellId) continue
    const auraSpell = activesById.get(auraSpellId)
    if (auraSpell) {
      const nested = buildSpellComponents(auraSpell, activesById, visited)
      components.push(...nested.map((packet) => ({ ...packet, label: `Aura: ${packet.label}` })))
    }
  }

  for (const apply of asArray(spell.applyspell)) {
    const attrs = apply.$ ?? apply
    const targetSpellId = attrs.spell ? String(attrs.spell) : ''
    if (!targetSpellId) continue
    const targetSpell = activesById.get(targetSpellId)
    if (targetSpell) {
      const nested = buildSpellComponents(targetSpell, activesById, visited)
      components.push(...nested.map((packet) => ({ ...packet, label: `Applied: ${packet.label}` })))
    }
  }

  return components
}

async function generateIndexes() {
  const itemsPath = resolvePath(DEFAULT_ITEMS_PATHS, 'items.xml')
  const spellsPath = resolvePath(DEFAULT_SPELLS_PATHS, 'spells.xml')
  const localizationPath = resolvePath(DEFAULT_LOCALIZATION_PATHS, 'localization.xml')

  const itemsXml = readFileSync(itemsPath, 'utf8')
  const spellsXml = readFileSync(spellsPath, 'utf8')
  const localizationXml = readFileSync(localizationPath, 'utf8')

  const itemsParsed = await parseStringPromise(itemsXml, { explicitArray: false })
  const spellsParsed = await parseStringPromise(spellsXml, { explicitArray: false })
  const localizationParsed = await parseStringPromise(localizationXml, { explicitArray: false })

  const itemsIndex: Record<string, ItemIndexEntry> = {}
  const itemsRoot = itemsParsed.items ?? {}

  const itemTags = [
    'weapon',
    'equipmentitem',
    'mount',
    'consumableitem',
    'consumablefrominventoryitem',
    'transformationweapon',
  ]

  for (const tag of itemTags) {
    for (const item of asArray(itemsRoot[tag])) {
      const attrs = item.$ ?? item
      if (!attrs?.uniquename) continue
      const slotType = resolveSlotType(tag, attrs)
      if (!slotType) continue

      const id = String(attrs.uniquename)
      const abilityPower = parseNumber(attrs.abilitypower, 120)
      const twoHanded = String(attrs.twohanded ?? '').toLowerCase() === 'true'
      const hands = slotType === 'weapon' ? (twoHanded ? '2h' : '1h') : undefined
      const baseItemPower = attrs.itempower ? parseNumber(attrs.itempower) : undefined
      const weight = attrs.weight ? parseNumber(attrs.weight) : undefined
      const attackDamage =
        slotType === 'weapon' && attrs.attackdamage ? parseNumber(attrs.attackdamage) : undefined
      const attackType = slotType === 'weapon' && attrs.attacktype ? String(attrs.attacktype) : undefined
      const craftingSpellList = parseCraftSpellList(item.craftingspelllist)

      itemsIndex[id] = {
        id,
        slotType,
        hands,
        abilityPower,
        baseItemPower,
        weight,
        attackDamage,
        attackType,
        craftingSpellList,
      }
    }
  }

  const weaponSpellPoolsResolved: Record<string, CraftSpell[]> = {}
  for (const [id, item] of Object.entries(itemsIndex)) {
    if (item.slotType !== 'weapon') continue
    if (!item.craftingSpellList.reference && item.craftingSpellList.addSpells.length === 0) continue
    weaponSpellPoolsResolved[id] = resolveSpellPool(id, itemsIndex, new Set())
  }

  const actives = asArray(spellsParsed.spells?.activespell)
  const activesById = new Map(actives.map((spell: any) => [String(spell.$?.uniquename ?? ''), spell]))
  const spellsIndex: Record<string, SpellIndexEntry> = {}
  const spellDisplayNames: Record<string, string> = {}

  const localizationEntries = asArray(localizationParsed?.localization?.entry)
  const localizationMap = new Map<string, string>()
  for (const entry of localizationEntries) {
    const key = entry.$?.key ? String(entry.$.key) : ''
    const text = typeof entry._ === 'string' ? entry._ : entry.text
    if (key && text) localizationMap.set(key, String(text))
  }

  for (const spell of actives) {
    const id = String(spell.$?.uniquename ?? '')
    if (!id) continue
    const components = buildSpellComponents(spell, activesById, new Set())
    spellsIndex[id] = { components }

    const nameTag = spell.$?.namelocatag ? String(spell.$.namelocatag) : ''
    if (nameTag && localizationMap.has(nameTag)) {
      spellDisplayNames[id] = localizationMap.get(nameTag) as string
    }
  }

  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  writeFileSync(join(OUTPUT_DIR, 'itemsIndex.json'), JSON.stringify(itemsIndex, null, 2))
  writeFileSync(join(OUTPUT_DIR, 'spellsIndex.json'), JSON.stringify(spellsIndex, null, 2))
  writeFileSync(join(OUTPUT_DIR, 'spellDisplayNames.json'), JSON.stringify(spellDisplayNames, null, 2))
  writeFileSync(
    join(OUTPUT_DIR, 'weaponSpellPoolsResolved.json'),
    JSON.stringify(weaponSpellPoolsResolved, null, 2)
  )

  console.log(
    `Generated ${Object.keys(itemsIndex).length} items, ${Object.keys(spellsIndex).length} spells.`
  )
}

generateIndexes().catch((error) => {
  console.error(error)
  process.exit(1)
})
