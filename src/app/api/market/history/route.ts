const serverHosts = {
  europe: 'https://europe.albion-online-data.com',
  america: 'https://west.albion-online-data.com',
  asia: 'https://east.albion-online-data.com',
} as const

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const server = (searchParams.get('server') || 'europe') as keyof typeof serverHosts
    const item = searchParams.get('item')
    const locations = searchParams.get('locations')
    const timeScale = searchParams.get('timeScale') || '24'
    const qualities = searchParams.get('qualities') || '1,2,3,4,5'

    if (!item) {
      return Response.json([])
    }

    const host = serverHosts[server] ?? serverHosts.europe
    const params = new URLSearchParams({
      'time-scale': timeScale,
      qualities,
    })
    if (locations) {
      params.set('locations', locations)
    }

    const res = await fetch(`${host}/api/v2/stats/history/${item}?${params.toString()}`, {
      cache: 'no-store',
    })
    if (!res.ok) {
      return Response.json({ error: 'Failed to fetch market history' }, { status: res.status })
    }

    const data = await res.json()
    return Response.json(data)
  } catch (error: any) {
    return Response.json({ error: error?.message ?? 'Market history error' }, { status: 500 })
  }
}
