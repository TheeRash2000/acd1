import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/builds - Get public builds
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = parseInt(searchParams.get('offset') || '0')

  try {
    const supabase = await createClient()

    const { data: builds, error, count } = await supabase
      .from('builds')
      .select('id, name, slots, ip, created_at, profiles(discord_username)', { count: 'exact' })
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      builds: builds || [],
      total: count || 0,
      limit,
      offset,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch builds' }, { status: 500 })
  }
}

// POST /api/builds - Create or update a build
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, name, slots, ip, isPublic } = body

    if (!name || !slots) {
      return NextResponse.json({ error: 'Name and slots are required' }, { status: 400 })
    }

    const buildData = {
      user_id: user.id,
      name,
      slots,
      ip: ip || 0,
      is_public: isPublic || false,
    }

    let result
    if (id) {
      // Update existing
      result = await supabase
        .from('builds')
        .update(buildData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()
    } else {
      // Create new
      result = await supabase
        .from('builds')
        .insert(buildData)
        .select()
        .single()
    }

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }

    return NextResponse.json({ build: result.data })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save build' }, { status: 500 })
  }
}
