-- Run this in your Supabase SQL Editor to ensure all profile columns exist.
-- Uses ALTER TABLE ... ADD COLUMN IF NOT EXISTS so it's safe to run multiple times.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS instagram_handle TEXT,
  ADD COLUMN IF NOT EXISTS tiktok_handle TEXT,
  ADD COLUMN IF NOT EXISTS avatar_color TEXT DEFAULT '#697962',
  ADD COLUMN IF NOT EXISTS reader_type_title TEXT,
  ADD COLUMN IF NOT EXISTS reader_type_description TEXT,
  ADD COLUMN IF NOT EXISTS reading_signature TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY IF NOT EXISTS "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can insert/update their own profile
CREATE POLICY IF NOT EXISTS "Users can upsert own profile"
  ON public.profiles FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Optional: allow reading other users' public profiles (for UserProfileScreen)
CREATE POLICY IF NOT EXISTS "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);
