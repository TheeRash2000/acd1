import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

type CharacterSheet = Database['public']['Tables']['character_sheets']['Row']
type Build = Database['public']['Tables']['builds']['Row']
type UserPreferences = Database['public']['Tables']['user_preferences']['Row']

export interface LocalData {
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
    weapon?: any
    offhand?: any
    head?: any
    chest?: any
    shoes?: any
    cape?: any
    mount?: any
    food?: any
    potion?: any
    ip: number
    manualIp: number | null
    timestamp: number
  }>
  favorites: string[]
  theme: 'dark' | 'light'
  marketServer: string
}

export interface SyncResult {
  success: boolean
  message: string
  uploaded?: {
    characters: number
    builds: number
    preferences: boolean
  }
  downloaded?: {
    characters: number
    builds: number
    preferences: boolean
  }
}

/**
 * Get all local data from localStorage
 */
export function getLocalData(): LocalData {
  const destinyBoard = localStorage.getItem('destiny-board-storage')
  const builds = localStorage.getItem('builds')
  const favorites = localStorage.getItem('albion-market-favorites')
  const theme = localStorage.getItem('theme')
  const marketServer = localStorage.getItem('albion-market-server')

  let characters: LocalData['characters'] = []
  let buildsList: LocalData['builds'] = []
  let favoritesList: string[] = []

  if (destinyBoard) {
    try {
      const data = JSON.parse(destinyBoard)
      characters = data.state?.characters || []
    } catch (e) {
      console.error('Error parsing destiny board data:', e)
    }
  }

  if (builds) {
    try {
      const data = JSON.parse(builds)
      buildsList = data.state?.builds || []
    } catch (e) {
      console.error('Error parsing builds data:', e)
    }
  }

  if (favorites) {
    try {
      favoritesList = JSON.parse(favorites) || []
    } catch (e) {
      console.error('Error parsing favorites:', e)
    }
  }

  let themeValue: 'dark' | 'light' = 'dark'
  if (theme) {
    try {
      const data = JSON.parse(theme)
      themeValue = data.state?.dark ? 'dark' : 'light'
    } catch (e) {
      console.error('Error parsing theme:', e)
    }
  }

  let serverValue = 'europe'
  if (marketServer) {
    try {
      const data = JSON.parse(marketServer)
      serverValue = data.state?.server || 'europe'
    } catch (e) {
      console.error('Error parsing market server:', e)
    }
  }

  return {
    characters,
    builds: buildsList,
    favorites: favoritesList,
    theme: themeValue,
    marketServer: serverValue,
  }
}

/**
 * Ensure user profile exists in database
 */
export async function ensureProfile(userId: string): Promise<boolean> {
  const supabase = createClient()

  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single()

  if (existing) return true

  const { error } = await supabase
    .from('profiles')
    .insert({ id: userId })

  if (error) {
    console.error('Error creating profile:', error)
    return false
  }

  return true
}

/**
 * Upload local data to Supabase
 */
export async function uploadToCloud(userId: string): Promise<SyncResult> {
  const supabase = createClient()
  const localData = getLocalData()

  try {
    // Ensure profile exists
    const profileCreated = await ensureProfile(userId)
    if (!profileCreated) {
      return { success: false, message: 'Failed to create user profile' }
    }

    let charactersUploaded = 0
    let buildsUploaded = 0

    // Upload characters
    for (const char of localData.characters) {
      const { error } = await supabase.from('character_sheets').upsert({
        id: char.id,
        user_id: userId,
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
    for (const build of localData.builds) {
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
        user_id: userId,
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
      user_id: userId,
      favorites: localData.favorites,
      theme: localData.theme,
      market_server: localData.marketServer,
    }, { onConflict: 'user_id' })

    return {
      success: true,
      message: `Uploaded ${charactersUploaded} characters and ${buildsUploaded} builds`,
      uploaded: {
        characters: charactersUploaded,
        builds: buildsUploaded,
        preferences: !prefError,
      },
    }
  } catch (error) {
    console.error('Upload error:', error)
    return { success: false, message: 'Upload failed: ' + String(error) }
  }
}

/**
 * Download cloud data to localStorage
 */
export async function downloadFromCloud(userId: string): Promise<SyncResult> {
  const supabase = createClient()

  try {
    // Fetch characters
    const { data: characters, error: charError } = await supabase
      .from('character_sheets')
      .select('*')
      .eq('user_id', userId)

    if (charError) throw charError

    // Fetch builds
    const { data: builds, error: buildError } = await supabase
      .from('builds')
      .select('*')
      .eq('user_id', userId)

    if (buildError) throw buildError

    // Fetch preferences
    const { data: prefs } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    // Update localStorage - Characters
    if (characters && characters.length > 0) {
      const destinyBoardData = {
        state: {
          activeCharacter: characters[0],
          characters: characters.map((c) => ({
            id: c.id,
            name: c.name,
            masteries: c.masteries as Record<string, number>,
            specializations: c.specializations as Record<string, number>,
            createdAt: c.created_at,
            updatedAt: c.updated_at,
          })),
        },
        version: 1,
      }
      localStorage.setItem('destiny-board-storage', JSON.stringify(destinyBoardData))
    }

    // Update localStorage - Builds
    if (builds && builds.length > 0) {
      const buildsData = {
        state: {
          current: { name: 'New Build', ip: 0, manualIp: null },
          builds: builds.map((b) => ({
            id: b.id,
            name: b.name,
            ...(b.slots as Record<string, any>),
            ip: b.ip,
            manualIp: b.manual_ip,
            timestamp: new Date(b.updated_at).getTime(),
          })),
        },
      }
      localStorage.setItem('builds', JSON.stringify(buildsData))
    }

    // Update localStorage - Preferences
    if (prefs) {
      if (prefs.favorites) {
        localStorage.setItem('albion-market-favorites', JSON.stringify(prefs.favorites))
      }
      if (prefs.theme) {
        localStorage.setItem('theme', JSON.stringify({
          state: { dark: prefs.theme === 'dark' },
        }))
      }
      if (prefs.market_server) {
        localStorage.setItem('albion-market-server', JSON.stringify({
          state: { server: prefs.market_server },
        }))
      }
    }

    return {
      success: true,
      message: `Downloaded ${characters?.length || 0} characters and ${builds?.length || 0} builds`,
      downloaded: {
        characters: characters?.length || 0,
        builds: builds?.length || 0,
        preferences: !!prefs,
      },
    }
  } catch (error) {
    console.error('Download error:', error)
    return { success: false, message: 'Download failed: ' + String(error) }
  }
}

/**
 * Get cloud data stats without downloading
 */
export async function getCloudStats(userId: string): Promise<{
  characters: number
  builds: number
  hasPreferences: boolean
} | null> {
  const supabase = createClient()

  try {
    const { count: charCount } = await supabase
      .from('character_sheets')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    const { count: buildCount } = await supabase
      .from('builds')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    const { data: prefs } = await supabase
      .from('user_preferences')
      .select('user_id')
      .eq('user_id', userId)
      .single()

    return {
      characters: charCount || 0,
      builds: buildCount || 0,
      hasPreferences: !!prefs,
    }
  } catch (error) {
    console.error('Error fetching cloud stats:', error)
    return null
  }
}
