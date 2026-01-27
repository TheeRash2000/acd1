type GoldResponse = {
  rate: number
  change24h: number
}

const serverHosts = {
  europe: 'https://europe.albion-online-data.com',
  america: 'https://west.albion-online-data.com',
  asia: 'https://east.albion-online-data.com',
} as const

function normalizeGold(data: any): GoldResponse {
  if (Array.isArray(data) && data.length > 0) {
    const oldest = data[0]
    const latest = data[data.length - 1]
    const rate = Number(latest?.price ?? latest?.rate ?? latest?.value ?? 0)
    const oldRate = Number(oldest?.price ?? oldest?.rate ?? oldest?.value ?? rate)
    return { rate, change24h: rate - oldRate }
  }

  const rate = Number(data?.price ?? data?.rate ?? data?.value ?? 0)
  const change24h = Number(data?.change24h ?? data?.change_24h ?? 0)
  return { rate, change24h }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const server = (searchParams.get('server') || 'europe') as keyof typeof serverHosts
    const host = serverHosts[server] ?? serverHosts.europe
    const baseUrl = `${host}/api/v2/stats/gold`

    let res = await fetch(`${baseUrl}?count=2`, { cache: 'no-store' })
    if (!res.ok) {
      res = await fetch(baseUrl, { cache: 'no-store' })
    }
    if (!res.ok) {
      return Response.json({ error: 'Failed to fetch gold price' }, { status: res.status })
    }

    const data = await res.json()
    return Response.json(normalizeGold(data))
  } catch (err: any) {
    return Response.json({ error: err?.message ?? 'Gold price error' }, { status: 500 })
  }
}
