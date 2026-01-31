import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { Database } from '@/lib/supabase/types'

type CharacterSheet = Database['public']['Tables']['character_sheets']['Row']
type Build = Database['public']['Tables']['builds']['Row']

interface SyncData {
  characters: Array<{
    id: string
    name: string
    masteries: Record<string, number>
    specializations: Record<string, number>
    createdAt: string
    updatedAt: string
  }>
  builds: Array<{
    id: string
    name: string
    weapon?: unknown
    offhand?: unknown
    head?: unknown
    chest?: unknown
    shoes?: unknown
    cape?: unknown
    mount?: unknown
    food?: unknown
    potion?: unknown
    ip: number
    manualIp: number | null
    timestamp: number
  }>
  favorites: string[]
  theme: 'dark' | 'light'
  marketServer: string
}

// GET - Download cloud data
export async function GET() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Fetch characters
    const { data: characters, error: charError } = await supabase
      .from('character_sheets')
      .select('*')
      .eq('user_id', user.id)

    if (charError) throw charError

    // Fetch builds
    const { data: builds, error: buildError } = await supabase
      .from('builds')
      .select('*')
      .eq('user_id', user.id)

    if (buildError) throw buildError

    // Fetch preferences
    const { data: prefs } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    return NextResponse.json({
      characters: characters || [],
      builds: builds || [],
      preferences: prefs || null,
    })
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json({ error: 'Download failed' }, { status: 500 })
  }
}

// POST - Upload local data to cloud
export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data: SyncData = await request.json()

    // Ensure profile exists first
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!existingProfile) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({ id: user.id })

      if (profileError) {
        console.error('Profile creation error:', profileError)
        return NextResponse.json({
          error: 'Failed to create user profile',
          details: profileError.message
        }, { status: 500 })
      }
    }

    let charactersUploaded = 0
    let buildsUploaded = 0

    // Upload characters
    for (const char of data.characters || []) {
      const { error } = await supabase.from('character_sheets').upsert({
        id: char.id,
        user_id: user.id,
        name: char.name,
        masteries: char.masteries,
        specializations: char.specializations,
        created_at: char.createdAt,
        updated_at: char.updatedAt,
      }, { onConflict: 'id' })

      if (!error) charactersUploaded++
      else console.error('Error uploading character:', error)
    }

    // Upload builds
    for (const build of data.builds || []) {
      const slots = {
        weapon: build.weapon,
        offhand: build.offhand,
        head: build.head,
        chest: build.chest,
        shoes: build.shoes,
        cape: build.cape,
        mount: build.mount,
        food: build.food,
        potion: build.potion,
      }

      const { error } = await supabase.from('builds').upsert({
        id: build.id,
        user_id: user.id,
        name: build.name,
        slots: slots,
        ip: build.ip,
        manual_ip: build.manualIp,
      }, { onConflict: 'id' })

      if (!error) buildsUploaded++
      else console.error('Error uploading build:', error)
    }

    // Upload preferences
    const { error: prefError } = await supabase.from('user_preferences').upsert({
      user_id: user.id,
      favorites: data.favorites || [],
      theme: data.theme || 'dark',
      market_server: data.marketServer || 'europe',
    }, { onConflict: 'user_id' })

    return NextResponse.json({
      success: true,
      message: `Uploaded ${charactersUploaded} characters and ${buildsUploaded} builds`,
      uploaded: {
        characters: charactersUploaded,
        builds: buildsUploaded,
        preferences: !prefError,
      },
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

// GET stats only
export async function HEAD() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return new Response(null, { status: 401 })
  }

  try {
    const { count: charCount } = await supabase
      .from('character_sheets')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    const { count: buildCount } = await supabase
      .from('builds')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    const { data: prefs } = await supabase
      .from('user_preferences')
      .select('user_id')
      .eq('user_id', user.id)
      .single()

    return new Response(null, {
      status: 200,
      headers: {
        'X-Characters': String(charCount || 0),
        'X-Builds': String(buildCount || 0),
        'X-Has-Preferences': prefs ? 'true' : 'false',
      },
    })
  } catch (error) {
    return new Response(null, { status: 500 })
  }
}
