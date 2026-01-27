import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { parseStringPromise } from 'xml2js'

type SpellEntry = {
  uniquename: string
  slots: number[]
}

type SpellIndexEntry = {
  components: Array<unknown>
}

const GENERATED_DIR = join(process.cwd(), 'src', 'lib', 'data', 'generated')
const poolsPath = join(GENERATED_DIR, 'weaponSpellPoolsResolved.json')
const spellsPath = join(GENERATED_DIR, 'spellsIndex.json')

const pools = JSON.parse(readFileSync(poolsPath, 'utf-8')) as Record<string, SpellEntry[]>
const spellsIndex = JSON.parse(readFileSync(spellsPath, 'utf-8')) as Record<string, SpellIndexEntry>

const spellsXmlPathCandidates = [
  process.env.SPELLS_XML_PATH,
  join(process.cwd(), 'data', 'spells.xml'),
  join(process.cwd(), 'data', 'ao-bin-dumps', 'spells.xml'),
  '/mnt/data/spells.xml',
].filter(Boolean) as string[]

const spellsXmlPath = spellsXmlPathCandidates.find((path) => existsSync(path))

type SpellMeta = {
  uitype?: string
  category?: string
  node?: any
}

const spellMeta = new Map<string, SpellMeta>()

async function loadSpellMeta() {
  if (!spellsXmlPath) return
  const xml = readFileSync(spellsXmlPath, 'utf-8')
  const parsed = await parseStringPromise(xml, { explicitArray: false })
  const actives = parsed?.spells?.activespell
  const list = Array.isArray(actives) ? actives : actives ? [actives] : []
  for (const spell of list) {
    const attrs = spell.$ ?? spell
    const id = attrs?.uniquename ? String(attrs.uniquename) : ''
    if (!id) continue
    spellMeta.set(id, {
      uitype: attrs.uitype ? String(attrs.uitype) : undefined,
      category: attrs.category ? String(attrs.category) : undefined,
      node: spell,
    })
  }
}

function hasDamageTags(node: any): boolean {
  if (!node || typeof node !== 'object') return false
  if (Array.isArray(node)) {
    return node.some((child) => hasDamageTags(child))
  }

  const checkDirect = (entry: any) => {
    const attrs = entry?.$ ?? entry
    if (String(attrs?.attribute ?? '').toLowerCase() !== 'health') return false
    const change = parseFloat(attrs?.change)
    return !Number.isNaN(change) && change < 0
  }

  const direct = node.directattributechange
  if (direct) {
    const list = Array.isArray(direct) ? direct : [direct]
    if (list.some(checkDirect)) return true
  }

  const dot = node.attributechangeovertime
  if (dot) {
    const list = Array.isArray(dot) ? dot : [dot]
    if (list.some(checkDirect)) return true
  }

  for (const value of Object.values(node)) {
    if (hasDamageTags(value)) return true
  }

  return false
}

const missingDamage: string[] = []
const missingNonDamage: string[] = []
const checked = new Set<string>()

async function run() {
  await loadSpellMeta()

  for (const pool of Object.values(pools)) {
    for (const spell of pool) {
      const usesCombatSlot = spell.slots.some((slot) => slot === 1 || slot === 2 || slot === 3)
      if (!usesCombatSlot) continue
      if (checked.has(spell.uniquename)) continue
      checked.add(spell.uniquename)
      const entry = spellsIndex[spell.uniquename]
      if (!entry || !Array.isArray(entry.components) || entry.components.length === 0) {
        const meta = spellMeta.get(spell.uniquename)
        const shouldBeDamage = meta?.node ? hasDamageTags(meta.node) : false
        if (shouldBeDamage) {
          missingDamage.push(spell.uniquename)
        } else {
          missingNonDamage.push(spell.uniquename)
        }
      }
    }
  }

  if (missingNonDamage.length > 0) {
    console.warn('Non-damage spells without packets (expected for buffs/heals):')
    for (const id of missingNonDamage) {
      console.warn(`- ${id}`)
    }
  }

  if (missingDamage.length > 0) {
    console.error('Damage spells missing damage components:')
    for (const id of missingDamage) {
      console.error(`- ${id}`)
    }
    process.exit(1)
  }

  console.log(`✅ Spell validation passed for ${checked.size} spells.`)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
