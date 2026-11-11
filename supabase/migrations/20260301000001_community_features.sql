-- ==============================================================================
-- MIGRATION: 20260301000001_community_features.sql
-- PURPOSE: Community Presets Sharing, Reviews, Ratings, and Moderation Reporting
-- ==============================================================================

-- 1. COMMUNITY PROFILE REVIEWS
CREATE TABLE IF NOT EXISTS profile_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES eq_profiles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL CHECK (char_length(comment) >= 3),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_profile_user_review UNIQUE (profile_id, user_id)
);

-- Index for speedy review lookup per profile
CREATE INDEX IF NOT EXISTS idx_profile_reviews_profile_id ON profile_reviews(profile_id);

-- 2. MODERATION PROFILE REPORTS
CREATE TABLE IF NOT EXISTS profile_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES eq_profiles(id) ON DELETE CASCADE,
    reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reason VARCHAR(64) NOT NULL,
    details TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'actioned', 'dismissed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profile_reports_status ON profile_reports(status);

-- 3. VERIFICATION LOCKDOWN TRIGGER
-- Enforces that community-submitted profiles cannot grant themselves 'is_verified = true'.
CREATE OR REPLACE FUNCTION enforce_community_verification_lock()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.profile_type = 'community' AND NEW.is_verified = TRUE THEN
        NEW.is_verified := FALSE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enforce_community_verification ON eq_profiles;
CREATE TRIGGER trg_enforce_community_verification
BEFORE INSERT OR UPDATE ON eq_profiles
FOR EACH ROW
EXECUTE FUNCTION enforce_community_verification_lock();

-- 4. ROW LEVEL SECURITY (RLS)
ALTER TABLE profile_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_reports ENABLE ROW LEVEL SECURITY;

-- Reviews RLS
DROP POLICY IF EXISTS "Public read reviews on visible profiles" ON profile_reviews;
CREATE POLICY "Public read reviews on visible profiles" ON profile_reviews FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM eq_profiles p
        WHERE p.id = profile_reviews.profile_id
        AND (p.is_public = TRUE OR p.creator_id = auth.uid())
    ));

DROP POLICY IF EXISTS "Users insert own reviews" ON profile_reviews;
CREATE POLICY "Users insert own reviews" ON profile_reviews FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own reviews" ON profile_reviews;
CREATE POLICY "Users update own reviews" ON profile_reviews FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own reviews" ON profile_reviews;
CREATE POLICY "Users delete own reviews" ON profile_reviews FOR DELETE
    USING (auth.uid() = user_id);

-- Reports RLS
DROP POLICY IF EXISTS "Users insert own reports" ON profile_reports;
CREATE POLICY "Users insert own reports" ON profile_reports FOR INSERT
    WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Reporters view own reports" ON profile_reports;
CREATE POLICY "Reporters view own reports" ON profile_reports FOR SELECT
    USING (auth.uid() = reporter_id);

