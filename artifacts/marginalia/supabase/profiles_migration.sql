-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor).
-- Uses ADD COLUMN IF NOT EXISTS — safe to run multiple times.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username         TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS full_name        TEXT,
  ADD COLUMN IF NOT EXISTS bio              TEXT,
  ADD COLUMN IF NOT EXISTS city             TEXT,
  ADD COLUMN IF NOT EXISTS email            TEXT,
  ADD COLUMN IF NOT EXISTS instagram_handle TEXT,
  ADD COLUMN IF NOT EXISTS tiktok_handle    TEXT,
  ADD COLUMN IF NOT EXISTS avatar_color     TEXT DEFAULT '#697962',
  ADD COLUMN IF NOT EXISTS reader_type_title       TEXT,
  ADD COLUMN IF NOT EXISTS reader_type_description TEXT,
  ADD COLUMN IF NOT EXISTS reading_signature       TEXT,
  ADD COLUMN IF NOT EXISTS updated_at       TIMESTAMPTZ DEFAULT NOW();

-- Notify PostgREST to reload schema cache (so columns are recognised immediately)
NOTIFY pgrst, 'reload schema';

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist (idempotent re-create)
DROP POLICY IF EXISTS "Users can view own profile"       ON public.profiles;
DROP POLICY IF EXISTS "Users can upsert own profile"     ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Allow everyone to read profiles (needed for username→email lookup during login)
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- Only the owning user can insert or update their profile
CREATE POLICY "Users can upsert own profile"
  ON public.profiles FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
