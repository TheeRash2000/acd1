import { DESTINY_BOARD_NODES } from '@/data/destinyNodes'

type NodeTree = Record<string, any>

function collectNodes(node: NodeTree | string[], acc: string[] = []) {
  if (Array.isArray(node)) {
    for (const item of node) acc.push(item)
    return acc
  }
  for (const value of Object.values(node)) {
    collectNodes(value as NodeTree | string[], acc)
  }
  return acc
}

const NODE_NAMES = collectNodes(DESTINY_BOARD_NODES as NodeTree)

function normalizeToIdBase(value: string) {
  return value
    .toUpperCase()
    .replace(/['’.]/g, '')
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

export function nodeNameToTableId(name: string): string {
  const trimmed = name.trim()
  const specialistSuffixes = [
    'Combat Specialist',
    'Crafting Specialist',
    'Tailoring Specialist',
  ]
  for (const suffix of specialistSuffixes) {
    if (trimmed.endsWith(` ${suffix}`)) {
      const base = trimmed.slice(0, -suffix.length - 1)
      return `${normalizeToIdBase(base)}_SPECIALIST`
    }
  }

  if (trimmed.endsWith(' Fighter')) {
    const base = trimmed.slice(0, -' Fighter'.length)
    return `${normalizeToIdBase(base)}_FIGHTER`
  }

  if (trimmed.endsWith(' Crafter')) {
    const base = trimmed.slice(0, -' Crafter'.length)
    return `${normalizeToIdBase(base)}_CRAFTER`
  }

  return normalizeToIdBase(trimmed)
}

export const DESTINY_NODE_NAMES = NODE_NAMES
export const DESTINY_NODE_TABLE_IDS = Array.from(
  new Set(NODE_NAMES.map((name) => nodeNameToTableId(name)))
)
