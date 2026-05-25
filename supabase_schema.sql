-- Execute this in the Supabase SQL Editor

-- 1. Create Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY, -- Device ID or Auth UUID
    username TEXT NOT NULL,
    ponts BIGINT NOT NULL DEFAULT 0,
    prs BIGINT NOT NULL DEFAULT 0,
    last_claim_time BIGINT NOT NULL DEFAULT extract(epoch from now()) * 1000
);

-- 2. Create Flex Broadcasts Table
CREATE TABLE IF NOT EXISTS public.flex_broadcasts (
    id TEXT PRIMARY KEY,
    author_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    flex_json TEXT NOT NULL,
    audio_id TEXT,
    video_id TEXT,
    timestamp BIGINT NOT NULL DEFAULT extract(epoch from now()) * 1000
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flex_broadcasts ENABLE ROW LEVEL SECURITY;

-- Setup Policies (MVP level - fully open for demonstration/MVP purposes)

-- Profiles: Anyone can read, anyone can insert/update (since auth is local device ID)
CREATE POLICY "Public profiles are viewable by everyone." 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." 
ON public.profiles FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own profile." 
ON public.profiles FOR UPDATE USING (true);

-- Flex Broadcasts: Anyone can read, anyone can broadcast
CREATE POLICY "Broadcasts are viewable by everyone." 
ON public.flex_broadcasts FOR SELECT USING (true);

CREATE POLICY "Users can broadcast flexes." 
ON public.flex_broadcasts FOR INSERT WITH CHECK (true);

-- Enable Realtime for Flex Broadcasts
begin;
  -- remove the supabase_realtime publication if it exists
  drop publication if exists supabase_realtime;
  
  -- create the publication with the necessary tables
  create publication supabase_realtime for table flex_broadcasts;
commit;

-- 3. Storage
-- Create a new bucket 'peep_media' via the Storage UI, and make it PUBLIC.
-- Go to Storage -> Buckets -> peep_media -> Settings -> Make bucket public.
