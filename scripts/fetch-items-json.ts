import https from 'https'
import { mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'

const ITEMS_URL =
  'https://raw.githubusercontent.com/ao-data/ao-bin-dumps/refs/heads/master/items.json'

async function fetchItemsJson() {
  const outDir = join(process.cwd(), 'data', 'ao-bin-dumps')
  const outFile = join(outDir, 'items.json')
  mkdirSync(outDir, { recursive: true })

  await new Promise<void>((resolve, reject) => {
    https
      .get(ITEMS_URL, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`Failed to download items.json (HTTP ${res.statusCode})`))
          res.resume()
          return
        }
        let data = ''
        res.on('data', (chunk) => {
          data += chunk
        })
        res.on('end', () => {
          writeFileSync(outFile, data)
          resolve()
        })
      })
      .on('error', reject)
  })

  console.log(`Saved items.json to ${outFile}`)
}

fetchItemsJson().catch((error) => {
  console.error('Failed to fetch items.json:', error)
  process.exit(1)
})
