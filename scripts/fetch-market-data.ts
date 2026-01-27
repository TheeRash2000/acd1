import { writeFileSync } from 'fs'
import { join } from 'path'
import axios from 'axios'

interface MarketSnapshot {
  itemId: string
  price: number
  volume: number
  quality: string
  change24h: number
  timestamp: number
}

const ao = axios.create({
  baseURL: 'https://europe-west1-albion-online-data.cloudfunctions.net',
  timeout: 15000,
})

async function fetchMarketData() {
  try {
    const { data } = await ao.get('/api/latest-prices')

    const snapshot: MarketSnapshot[] = data.map((item: any) => ({
      itemId: item.item_id,
      price: item.avg_price,
      volume: item.volume,
      quality: item.quality,
      change24h: item.change_24h || 0,
      timestamp: Date.now(),
    }))

    writeFileSync(
      join(process.cwd(), 'public', 'data', 'market-latest.json'),
      JSON.stringify(snapshot, null, 2)
    )

    console.log(`Fetched ${snapshot.length} market prices`)
  } catch (error: any) {
    console.error('Failed to fetch market data:', error?.message ?? error)
    generateMockMarketData()
  }
}

function generateMockMarketData() {
  console.log('Generating mock market data...')
  const snapshot: MarketSnapshot[] = []
  const qualities = ['Normal', 'Good', 'Outstanding', 'Excellent', 'Masterpiece']

  for (let i = 0; i < 200; i += 1) {
    snapshot.push({
      itemId: `MOCK_ITEM_${i + 1}`,
      price: Math.floor(Math.random() * 1000000) + 1000,
      volume: Math.floor(Math.random() * 1000) + 10,
      quality: qualities[Math.floor(Math.random() * qualities.length)],
      change24h: Math.round((Math.random() * 10 - 5) * 10) / 10,
      timestamp: Date.now(),
    })
  }

  writeFileSync(
    join(process.cwd(), 'public', 'data', 'market-latest.json'),
    JSON.stringify(snapshot, null, 2)
  )
}

fetchMarketData().catch((error) => {
  console.error(error)
  process.exit(1)
})
