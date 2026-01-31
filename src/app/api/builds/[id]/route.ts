import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/builds/[id] - Get a specific build
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const supabase = await createClient()

    // First try to get as public build
    const { data: build, error } = await supabase
      .from('builds')
      .select('*, profiles(discord_username)')
      .eq('id', id)
      .single()

    if (error || !build) {
      return NextResponse.json({ error: 'Build not found' }, { status: 404 })
    }

    // Check if build is public or belongs to current user
    const { data: { user } } = await supabase.auth.getUser()

    if (!build.is_public && (!user || build.user_id !== user.id)) {
      return NextResponse.json({ error: 'Build not found' }, { status: 404 })
    }

    return NextResponse.json({ build })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch build' }, { status: 500 })
  }
}

// PATCH /api/builds/[id] - Update build (including making public)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const supabase = await createClient()

    // Check auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { isPublic } = body

    const { data: build, error } = await supabase
      .from('builds')
      .update({ is_public: isPublic })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ build })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update build' }, { status: 500 })
  }
}

// DELETE /api/builds/[id] - Delete a build
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const supabase = await createClient()

    // Check auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('builds')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete build' }, { status: 500 })
  }
}
