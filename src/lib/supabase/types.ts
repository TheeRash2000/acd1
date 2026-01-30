export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          discord_id: string | null
          discord_username: string | null
          google_email: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          discord_id?: string | null
          discord_username?: string | null
          google_email?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          discord_id?: string | null
          discord_username?: string | null
          google_email?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      character_sheets: {
        Row: {
          id: string
          user_id: string
          name: string
          masteries: Json
          specializations: Json
          is_primary: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          masteries?: Json
          specializations?: Json
          is_primary?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          masteries?: Json
          specializations?: Json
          is_primary?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      builds: {
        Row: {
          id: string
          user_id: string
          name: string
          slots: Json
          ip: number
          manual_ip: number | null
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          slots: Json
          ip?: number
          manual_ip?: number | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          slots?: Json
          ip?: number
          manual_ip?: number | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      hideout_presets: {
        Row: {
          id: string
          user_id: string
          name: string
          config: Json
          is_favorite: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          config: Json
          is_favorite?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          config?: Json
          is_favorite?: boolean
          created_at?: string
        }
      }
      user_preferences: {
        Row: {
          user_id: string
          favorites: string[]
          market_server: string
          theme: string
          crafting_inputs: Json
          updated_at: string
        }
        Insert: {
          user_id: string
          favorites?: string[]
          market_server?: string
          theme?: string
          crafting_inputs?: Json
          updated_at?: string
        }
        Update: {
          user_id?: string
          favorites?: string[]
          market_server?: string
          theme?: string
          crafting_inputs?: Json
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type CharacterSheet = Database['public']['Tables']['character_sheets']['Row']
export type Build = Database['public']['Tables']['builds']['Row']
export type HideoutPreset = Database['public']['Tables']['hideout_presets']['Row']
export type UserPreferences = Database['public']['Tables']['user_preferences']['Row']
