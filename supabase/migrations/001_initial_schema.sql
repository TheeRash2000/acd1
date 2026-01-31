-- AlbionCodex Database Schema
-- Run this in your Supabase SQL Editor

-- Users table (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  discord_id TEXT,
  discord_username TEXT,
  google_email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Character sheets (destiny board data)
CREATE TABLE IF NOT EXISTS public.character_sheets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  masteries JSONB DEFAULT '{}',
  specializations JSONB DEFAULT '{}',
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Equipment builds
CREATE TABLE IF NOT EXISTS public.builds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  slots JSONB NOT NULL DEFAULT '{}',
  ip INTEGER DEFAULT 0,
  manual_ip INTEGER,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hideout presets
CREATE TABLE IF NOT EXISTS public.hideout_presets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User preferences (key-value store)
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  favorites TEXT[] DEFAULT '{}',
  market_server TEXT DEFAULT 'europe',
  theme TEXT DEFAULT 'dark',
  crafting_inputs JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.character_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.builds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hideout_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Character sheets policies
CREATE POLICY "Users can view own character sheets" ON public.character_sheets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own character sheets" ON public.character_sheets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own character sheets" ON public.character_sheets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own character sheets" ON public.character_sheets
  FOR DELETE USING (auth.uid() = user_id);

-- Builds policies
CREATE POLICY "Users can view own builds" ON public.builds
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Public builds are viewable by all" ON public.builds
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can insert own builds" ON public.builds
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own builds" ON public.builds
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own builds" ON public.builds
  FOR DELETE USING (auth.uid() = user_id);

-- Hideout presets policies
CREATE POLICY "Users can manage own hideout presets" ON public.hideout_presets
  FOR ALL USING (auth.uid() = user_id);

-- User preferences policies
CREATE POLICY "Users can manage own preferences" ON public.user_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_character_sheets_user_id ON public.character_sheets(user_id);
CREATE INDEX IF NOT EXISTS idx_builds_user_id ON public.builds(user_id);
CREATE INDEX IF NOT EXISTS idx_builds_is_public ON public.builds(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_hideout_presets_user_id ON public.hideout_presets(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_character_sheets_updated_at
  BEFORE UPDATE ON public.character_sheets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_builds_updated_at
  BEFORE UPDATE ON public.builds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
