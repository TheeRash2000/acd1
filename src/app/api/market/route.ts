const serverHosts = {
  europe: 'https://europe.albion-online-data.com',
  america: 'https://west.albion-online-data.com',
  asia: 'https://east.albion-online-data.com',
} as const

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const server = (searchParams.get('server') || 'europe') as keyof typeof serverHosts
    const items = searchParams.get('items')
    const locations = searchParams.get('locations')
    const host = serverHosts[server] ?? serverHosts.europe

    if (!items) {
      return Response.json([])
    }

    const params = new URLSearchParams({ qualities: '1,2,3,4,5' })
    if (locations) {
      params.set('locations', locations)
    }

    const res = await fetch(`${host}/api/v2/stats/prices/${items}?${params.toString()}`, {
      cache: 'no-store',
    })
    if (!res.ok) {
      return Response.json({ error: 'Failed to fetch market prices' }, { status: res.status })
    }

    const data = await res.json()
    return Response.json(data)
  } catch (error: any) {
    return Response.json({ error: error?.message ?? 'Market price error' }, { status: 500 })
  }
}
