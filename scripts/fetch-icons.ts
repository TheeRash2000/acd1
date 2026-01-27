import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const defaultBaseUrls = [
  'https://raw.githubusercontent.com/ao-data/albion-assets/main/icons/items',
  'https://raw.githubusercontent.com/ao-data/albion-assets/master/icons/items',
  'https://raw.githubusercontent.com/ao-data/albion-assets/main/icons',
  'https://raw.githubusercontent.com/ao-data/albion-assets/master/icons',
]
const defaultItems = ['T4_BAG', 'T4_SWORD', 'T4_TOOL_SLEDGEHAMMER', 'T4_TOME']

async function fetchIcon(itemName: string, outDir: string, baseUrls: string[]) {
  for (const baseUrl of baseUrls) {
    const url = `${baseUrl}/${itemName}.png`
    const res = await fetch(url)
    if (!res.ok) continue
    const buffer = Buffer.from(await res.arrayBuffer())
    await writeFile(path.join(outDir, `${itemName}.png`), buffer)
    console.log(`Saved ${itemName}.png`)
    return
  }
  console.warn(`Failed to fetch ${itemName}: icon not found in known paths`)
}

async function main() {
  const args = process.argv.slice(2)
  const baseUrlIndex = args.indexOf('--base-url')
  const overrideBaseUrl = baseUrlIndex >= 0 ? args[baseUrlIndex + 1] : null
  const items = args.filter((arg, index) => index !== baseUrlIndex && index !== baseUrlIndex + 1)
  const itemNames = items.length ? items : defaultItems
  const baseUrls = overrideBaseUrl ? [overrideBaseUrl] : defaultBaseUrls
  const outDir = path.join(process.cwd(), 'public', 'icons', 'items')
  await mkdir(outDir, { recursive: true })

  for (const itemName of itemNames) {
    await fetchIcon(itemName, outDir, baseUrls)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
