import { NextRequest } from 'next/server'
import { ao } from '@/lib/ao-data'

export async function GET(_: NextRequest, { params }: { params: { name: string } }) {
  const name = decodeURIComponent(params.name)
  try {
    const { data } = await ao.get(`/api/killboard/${name}`)
    return Response.json(data)
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: e.response?.status ?? 500 })
  }
}
