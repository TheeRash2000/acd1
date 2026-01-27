import { getAllItems } from '@/lib/items'
import { PROGRESSION_TABLES } from '@/data/progressionTables'

async function main() {
  const items = await getAllItems()
  const missing: string[] = []

  for (const item of items) {
    if (!PROGRESSION_TABLES.includes(item.masteryTable)) {
      missing.push(`${item.id}: mastery ${item.masteryTable}`)
    }
    if (!PROGRESSION_TABLES.includes(item.specTable)) {
      missing.push(`${item.id}: spec ${item.specTable}`)
    }
  }

  if (missing.length > 0) {
    console.error('Missing progression tables:', missing)
    process.exit(1)
  } else {
    console.log(`All ${items.length} items have valid progression tables`)
  }
}

main().catch((error) => {
  console.error('Validation failed:', error)
  process.exit(1)
})
