export interface Item {
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

let itemsCache: Item[] | null = null
let itemsMap: Map<string, Item> | null = null

export async function getAllItems(): Promise<Item[]> {
  if (itemsCache) return itemsCache
  
  try {
    if (typeof window === 'undefined') {
      const { readFile } = await import('fs/promises')
      const path = await import('path')
      const filePath = path.join(process.cwd(), 'public', 'data', 'items.json')
      const raw = await readFile(filePath, 'utf-8')
      itemsCache = JSON.parse(raw) as Item[]
      itemsMap = new Map(itemsCache.map((item) => [item.id, item]))
      return itemsCache
    }

    const response = await fetch('/data/items.json')
    if (!response.ok) return []
    itemsCache = (await response.json()) as Item[]
    itemsMap = new Map(itemsCache.map((item) => [item.id, item]))
    return itemsCache
  } catch (error) {
    console.error('Failed to load items:', error)
    return []
  }
}

export async function getItemById(id: string): Promise<Item | undefined> {
  if (itemsMap) return itemsMap.get(id)
  const items = await getAllItems()
  return itemsMap?.get(id) ?? items.find((item) => item.id === id)
}

export async function searchItems(query: string): Promise<Item[]> {
  const items = await getAllItems()
  const lower = query.toLowerCase()
  return items.filter((item) => item.id.toLowerCase().includes(lower) || item.name.toLowerCase().includes(lower))
}

export async function getItemsBySlot(slot: string): Promise<Item[]> {
  const items = await getAllItems()
  return items.filter((item) => item.slot === slot)
}

export async function getItemsByClass(itemClass: string): Promise<Item[]> {
  const items = await getAllItems()
  return items.filter((item) => item.itemClass === itemClass)
}

export async function getItemsByMasteryTable(masteryTable: string): Promise<Item[]> {
  const items = await getAllItems()
  return items.filter((item) => item.masteryTable === masteryTable)
}

export async function validateItems(): Promise<{ valid: boolean; errors: string[] }> {
  const items = await getAllItems()
  const errors: string[] = []

  for (const item of items) {
    if (!item.id) errors.push('Missing id')
    if (item.power === undefined) errors.push(`${item.id}: Missing power`)
    if (!item.masteryTable) errors.push(`${item.id}: Missing masteryTable`)
    if (!item.specTable) errors.push(`${item.id}: Missing specTable`)
  }

  return { valid: errors.length === 0, errors }
}
