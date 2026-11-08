-- AUDIOPHILE DATABASE SCHEMA MIGRATION
-- Generated for Supabase PostgreSQL with Row Level Security (RLS)

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. MANUFACTURERS
CREATE TABLE IF NOT EXISTS manufacturers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    country VARCHAR(60),
    website_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. IEM MODELS
CREATE TABLE IF NOT EXISTS iem_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    manufacturer_id UUID NOT NULL REFERENCES manufacturers(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    driver_type VARCHAR(50) NOT NULL,
    driver_count INTEGER DEFAULT 1,
    impedance_ohms NUMERIC(6, 2) NOT NULL,
    sensitivity_db_mw NUMERIC(6, 2) NOT NULL,
    release_year INTEGER,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_manufacturer_iem UNIQUE (manufacturer_id, name)
);

-- 4. MEASUREMENT SOURCES
CREATE TABLE IF NOT EXISTS measurement_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    rig_type VARCHAR(80) NOT NULL,
    target_curve VARCHAR(100) NOT NULL,
    url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. IEM MEASUREMENTS
CREATE TABLE IF NOT EXISTS iem_measurements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    iem_id UUID NOT NULL REFERENCES iem_models(id) ON DELETE CASCADE,
    source_id UUID NOT NULL REFERENCES measurement_sources(id) ON DELETE RESTRICT,
    sample_points JSONB NOT NULL,
    raw_data_url TEXT,
    measured_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. EQ PROFILES
DO $$ BEGIN
    CREATE TYPE eq_profile_type AS ENUM ('curated', 'measurement_derived', 'community', 'user_custom');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE eq_scenario AS ENUM ('music_balanced', 'music_bass', 'music_vocal', 'music_classical', 'gaming_fps', 'movie_cinema', 'podcast_speech', 'custom');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS eq_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    iem_id UUID REFERENCES iem_models(id) ON DELETE CASCADE,
    creator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name VARCHAR(120) NOT NULL,
    description TEXT,
    profile_type eq_profile_type NOT NULL DEFAULT 'user_custom',
    scenario eq_scenario NOT NULL DEFAULT 'music_balanced',
    target_curve VARCHAR(100),
    source_attribution TEXT,
    preamp_db NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    upvotes_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. EQ FILTERS
DO $$ BEGIN
    CREATE TYPE eq_filter_type AS ENUM ('peak', 'low_shelf', 'high_shelf', 'low_pass', 'high_pass', 'notch');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS eq_filters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES eq_profiles(id) ON DELETE CASCADE,
    filter_index INTEGER NOT NULL,
    filter_type eq_filter_type NOT NULL,
    frequency_hz NUMERIC(8, 2) NOT NULL CHECK (frequency_hz >= 20 AND frequency_hz <= 20000),
    gain_db NUMERIC(5, 2) NOT NULL CHECK (gain_db >= -24.0 AND gain_db <= 24.0),
    q_factor NUMERIC(6, 3) NOT NULL CHECK (q_factor >= 0.05 AND q_factor <= 30.0),
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT uq_profile_filter_index UNIQUE (profile_id, filter_index)
);

-- 8. USER SAVED IEMS
CREATE TABLE IF NOT EXISTS user_iems (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    iem_id UUID NOT NULL REFERENCES iem_models(id) ON DELETE CASCADE,
    active_profile_id UUID REFERENCES eq_profiles(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_user_iem UNIQUE (user_id, iem_id)
);

-- 9. PROFILE RATINGS & FAVOURITES
CREATE TABLE IF NOT EXISTS profile_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES eq_profiles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_profile_user_rating UNIQUE (profile_id, user_id)
);

CREATE TABLE IF NOT EXISTS profile_favourites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES eq_profiles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_profile_user_fav UNIQUE (profile_id, user_id)
);

-- 10. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE manufacturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE iem_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurement_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE iem_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE eq_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE eq_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_iems ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_favourites ENABLE ROW LEVEL SECURITY;

-- Read policies
DROP POLICY IF EXISTS "Public read manufacturers" ON manufacturers;
CREATE POLICY "Public read manufacturers" ON manufacturers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read iem_models" ON iem_models;
CREATE POLICY "Public read iem_models" ON iem_models FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read measurement_sources" ON measurement_sources;
CREATE POLICY "Public read measurement_sources" ON measurement_sources FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read iem_measurements" ON iem_measurements;
CREATE POLICY "Public read iem_measurements" ON iem_measurements FOR SELECT USING (true);

-- EQ Profiles RLS: Public profiles or owned profiles are visible
DROP POLICY IF EXISTS "Read eq_profiles" ON eq_profiles;
CREATE POLICY "Read eq_profiles" ON eq_profiles FOR SELECT
    USING (is_public = true OR auth.uid() = creator_id);

DROP POLICY IF EXISTS "Insert own eq_profiles" ON eq_profiles;
CREATE POLICY "Insert own eq_profiles" ON eq_profiles FOR INSERT
    WITH CHECK (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Update own eq_profiles" ON eq_profiles;
CREATE POLICY "Update own eq_profiles" ON eq_profiles FOR UPDATE
    USING (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Delete own eq_profiles" ON eq_profiles;
CREATE POLICY "Delete own eq_profiles" ON eq_profiles FOR DELETE
    USING (auth.uid() = creator_id);

-- EQ Filters RLS: Visible if parent profile is visible
DROP POLICY IF EXISTS "Read eq_filters" ON eq_filters;
CREATE POLICY "Read eq_filters" ON eq_filters FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM eq_profiles p 
        WHERE p.id = eq_filters.profile_id 
        AND (p.is_public = true OR p.creator_id = auth.uid())
    ));

DROP POLICY IF EXISTS "Manage own eq_filters" ON eq_filters;
CREATE POLICY "Manage own eq_filters" ON eq_filters FOR ALL
    USING (EXISTS (
        SELECT 1 FROM eq_profiles p 
        WHERE p.id = eq_filters.profile_id 
        AND p.creator_id = auth.uid()
    ));

-- User IEMs RLS: Strictly private per user
DROP POLICY IF EXISTS "Users manage own iems" ON user_iems;
CREATE POLICY "Users manage own iems" ON user_iems FOR ALL
    USING (auth.uid() = user_id);

-- Ratings and Favourites RLS
DROP POLICY IF EXISTS "Users manage own ratings" ON profile_ratings;
CREATE POLICY "Users manage own ratings" ON profile_ratings FOR ALL
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own favourites" ON profile_favourites;
CREATE POLICY "Users manage own favourites" ON profile_favourites FOR ALL
    USING (auth.uid() = user_id);
