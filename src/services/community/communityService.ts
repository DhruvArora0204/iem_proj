import type {
  EQProfile,
  ProfileReview,
  ProfileReport,
  ProfileReportReason,
  BiquadFilterConfig,
  ScenarioType,
} from '@/core/types/audio';
import { supabase } from '@/services/supabase/client';
import { getDatabase } from '@/services/local-db/sqlite';

export const MAX_COMMUNITY_FILTERS = 10;

// Curated & Community Initial Seed Data
export const INITIAL_COMMUNITY_PROFILES: EQProfile[] = [
  {
    id: 'disc-1',
    iemId: 'iem-1',
    iemName: 'Moondrop Blessing 3',
    creatorId: 'lab-acoustics-official',
    creatorName: 'Acoustics Lab Curated',
    name: 'Harman 2019v2 Target Alignment',
    description: 'Precision compensation for standard 711 coupler measurements aligning Blessing 3 to the Harman 2019 IE acoustic curve.',
    profileType: 'measurement_derived',
    scenario: 'music_balanced',
    targetCurve: 'Harman In-Ear 2019v2',
    sourceAttribution: 'Standard IEC 60318-4 Rig',
    preampDb: -2.5,
    isPublic: true,
    isVerified: true, // Lab verified
    upvotesCount: 428,
    ratingAverage: 4.9,
    ratingCount: 38,
    filters: [
      { id: 'f-1', type: 'low_shelf', frequency: 105, gain: 3.5, q: 0.71, enabled: true },
      { id: 'f-2', type: 'peak', frequency: 220, gain: -1.2, q: 1.2, enabled: true },
      { id: 'f-3', type: 'peak', frequency: 1250, gain: 0.8, q: 1.5, enabled: true },
      { id: 'f-4', type: 'peak', frequency: 2800, gain: -1.5, q: 2.0, enabled: true },
      { id: 'f-5', type: 'peak', frequency: 5800, gain: -2.2, q: 2.5, enabled: true },
      { id: 'f-6', type: 'high_shelf', frequency: 10500, gain: 1.0, q: 0.71, enabled: true },
    ],
    createdAt: '2026-01-10T12:00:00Z',
    updatedAt: '2026-01-10T12:00:00Z',
  },
  {
    id: 'disc-2',
    iemId: 'iem-1',
    iemName: 'Moondrop Blessing 3',
    creatorId: 'lab-acoustics-official',
    creatorName: 'Acoustics Lab Curated',
    name: 'IEF Neutral 2023 with Sub-Bass Boost',
    description: 'Flat studio-neutral midrange target curve with a clean +4dB sub-bass shelf below 80 Hz.',
    profileType: 'curated',
    scenario: 'music_bass',
    targetCurve: 'IEF Neutral 2023',
    sourceAttribution: 'Acoustics Lab Curated',
    preampDb: -3.8,
    isPublic: true,
    isVerified: true,
    upvotesCount: 312,
    ratingAverage: 4.7,
    ratingCount: 24,
    filters: [
      { id: 'f-7', type: 'low_shelf', frequency: 80, gain: 4.0, q: 0.8, enabled: true },
      { id: 'f-8', type: 'peak', frequency: 250, gain: -0.8, q: 1.0, enabled: true },
      { id: 'f-9', type: 'peak', frequency: 3200, gain: -2.0, q: 1.8, enabled: true },
      { id: 'f-10', type: 'high_shelf', frequency: 9500, gain: 1.5, q: 0.71, enabled: true },
    ],
    createdAt: '2026-02-14T10:30:00Z',
    updatedAt: '2026-02-14T10:30:00Z',
  },
  {
    id: 'disc-3',
    iemId: 'iem-1',
    iemName: 'Moondrop Blessing 3',
    creatorId: 'user-acousticphantom',
    creatorName: 'AcousticPhantom',
    name: 'FPS Spatial Footstep Cue Extractor',
    description: 'Boosts 2-4 kHz pinna directional cues while attenuating resonant sub-bass clutter for competitive gaming.',
    profileType: 'community',
    scenario: 'gaming_fps',
    targetCurve: 'Subjective Tactical FPS',
    sourceAttribution: 'Community Preset',
    preampDb: -3.5,
    isPublic: true,
    isVerified: false, // Community preset is strictly unverified
    upvotesCount: 189,
    ratingAverage: 4.6,
    ratingCount: 19,
    filters: [
      { id: 'f-11', type: 'high_pass', frequency: 45, gain: 0.0, q: 0.71, enabled: true },
      { id: 'f-12', type: 'peak', frequency: 2800, gain: 3.5, q: 2.2, enabled: true },
      { id: 'f-13', type: 'peak', frequency: 4500, gain: 2.2, q: 2.0, enabled: true },
      { id: 'f-14', type: 'peak', frequency: 7200, gain: -3.0, q: 3.0, enabled: true },
    ],
    createdAt: '2026-03-01T08:15:00Z',
    updatedAt: '2026-03-01T08:15:00Z',
  },
  {
    id: 'disc-4',
    iemId: 'iem-2',
    iemName: 'Truthear Zero: RED',
    creatorId: 'lab-acoustics-official',
    creatorName: 'Acoustics Lab Curated',
    name: 'Harman 2019v2 Bass Contour',
    description: 'Calibrated compensation for Truthear Zero: RED with 10-ohm impedance adapter installed.',
    profileType: 'curated',
    scenario: 'music_balanced',
    targetCurve: 'Harman In-Ear 2019v2',
    sourceAttribution: 'Crinacle 711 Database',
    preampDb: -2.0,
    isPublic: true,
    isVerified: true,
    upvotesCount: 567,
    ratingAverage: 4.8,
    ratingCount: 52,
    filters: [
      { id: 'f-15', type: 'low_shelf', frequency: 105, gain: 2.0, q: 0.71, enabled: true },
      { id: 'f-16', type: 'peak', frequency: 6200, gain: -2.5, q: 3.0, enabled: true },
    ],
    createdAt: '2026-02-20T14:00:00Z',
    updatedAt: '2026-02-20T14:00:00Z',
  },
];

export const INITIAL_REVIEWS: Record<string, ProfileReview[]> = {
  'disc-1': [
    {
      id: 'rev-1',
      profileId: 'disc-1',
      userId: 'user-101',
      userName: 'HarmonicVoyager',
      rating: 5,
      comment: 'Remarkable accuracy. The upper midrange shoutiness of the Blessing 3 is perfectly tempered without losing clarity.',
      createdAt: '2026-01-15T14:20:00Z',
    },
    {
      id: 'rev-2',
      profileId: 'disc-1',
      userId: 'user-102',
      userName: 'SpatialAudioGeek',
      rating: 5,
      comment: 'Super clean bass transition. Highly recommend testing with FLAC orchestral pieces.',
      createdAt: '2026-01-22T09:12:00Z',
    },
  ],
  'disc-3': [
    {
      id: 'rev-3',
      profileId: 'disc-3',
      userId: 'user-103',
      userName: 'TacticalSniper',
      rating: 5,
      comment: 'Footsteps in Valorant and CS2 are noticeably more distinguishable with the sub-bass shelf rolled off.',
      createdAt: '2026-03-02T16:45:00Z',
    },
    {
      id: 'rev-4',
      profileId: 'disc-3',
      userId: 'user-104',
      userName: 'AudiophileGamer',
      rating: 4,
      comment: 'Works well for gaming, but a bit too lean in low end for casual pop music listening.',
      createdAt: '2026-03-03T11:05:00Z',
    },
  ],
};

export interface PublishProfileInput {
  name: string;
  description?: string;
  iemId?: string;
  iemName?: string;
  scenario: ScenarioType;
  targetCurve?: string;
  preampDb: number;
  filters: BiquadFilterConfig[];
  creatorId: string;
  creatorName: string;
}

export interface PublishValidationResult {
  isValid: boolean;
  errors: string[];
  headroomWarning?: string;
}

class CommunityService {
  private profiles: EQProfile[] = [...INITIAL_COMMUNITY_PROFILES];
  private reviews: Record<string, ProfileReview[]> = { ...INITIAL_REVIEWS };
  private upvotedProfileIds: Set<string> = new Set();
  private reports: ProfileReport[] = [];

  // 1. VALIDATION
  public validateProfileForPublishing(input: PublishProfileInput): PublishValidationResult {
    const errors: string[] = [];

    if (!input.name || input.name.trim().length < 3) {
      errors.push('Profile name must be at least 3 characters long.');
    }

    if (!input.filters || input.filters.length === 0) {
      errors.push('Profile must include at least one filter band.');
    } else if (input.filters.length > MAX_COMMUNITY_FILTERS) {
      errors.push(`Profile cannot exceed ${MAX_COMMUNITY_FILTERS} parametric filter bands (current: ${input.filters.length}).`);
    }

    let maxGain = 0;
    input.filters.forEach((f, idx) => {
      if (f.frequency < 20 || f.frequency > 20000) {
        errors.push(`Band ${idx + 1} frequency (${f.frequency} Hz) outside audible range (20 Hz - 20,000 Hz).`);
      }
      if (f.gain < -24 || f.gain > 24) {
        errors.push(`Band ${idx + 1} gain (${f.gain} dB) outside supported range (-24 dB to +24 dB).`);
      }
      if (f.q < 0.1 || f.q > 20) {
        errors.push(`Band ${idx + 1} Q factor (${f.q}) outside stable range (0.1 to 20.0).`);
      }
      if (f.enabled && f.gain > maxGain) {
        maxGain = f.gain;
      }
    });

    let headroomWarning: string | undefined;
    if (maxGain > 0) {
      const requiredPreamp = -maxGain;
      if (input.preampDb > requiredPreamp + 0.1) {
        headroomWarning = `Digital clipping alert: Positive gain peak is +${maxGain.toFixed(1)} dB, but Preamp is ${input.preampDb > 0 ? '+' : ''}${input.preampDb.toFixed(1)} dB. Recommend setting Preamp to ≤ ${requiredPreamp.toFixed(1)} dB.`;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      headroomWarning,
    };
  }

  // 2. GET ALL PROFILES
  public async getProfiles(): Promise<EQProfile[]> {
    return this.profiles.map((p) => ({
      ...p,
      userUpvoted: this.upvotedProfileIds.has(p.id),
    }));
  }

  // 3. PUBLISH COMMUNITY PROFILE
  public async publishProfile(input: PublishProfileInput): Promise<{ success: boolean; profile?: EQProfile; error?: string }> {
    const validation = this.validateProfileForPublishing(input);
    if (!validation.isValid) {
      return { success: false, error: validation.errors.join(' ') };
    }

    const now = new Date().toISOString();
    const newProfile: EQProfile = {
      id: `comm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      iemId: input.iemId,
      iemName: input.iemName || 'Universal IEM',
      creatorId: input.creatorId,
      creatorName: input.creatorName || 'Audiophile User',
      name: input.name.trim(),
      description: input.description?.trim() || 'Community shared parametric tuning.',
      profileType: 'community', // STRICT: Community type
      scenario: input.scenario,
      targetCurve: input.targetCurve || 'Subjective Listening',
      sourceAttribution: `Shared by @${input.creatorName || 'User'}`,
      preampDb: input.preampDb,
      isPublic: true,
      isVerified: false, // CRITICAL: Verified badge is strictly protected and cannot be self-assigned
      upvotesCount: 0,
      ratingAverage: 0,
      ratingCount: 0,
      filters: input.filters.map((f, i) => ({
        ...f,
        id: `band-${i + 1}`,
      })),
      createdAt: now,
      updatedAt: now,
    };

    // Store in-memory
    this.profiles.unshift(newProfile);

    // Save to SQLite if available
    try {
      const db = await getDatabase();
      if (db) {
        await db.runAsync(
          `INSERT INTO local_profiles (
            id, iem_id, creator_id, name, description, profile_type, scenario,
            target_curve, source_attribution, preamp_db, is_public, is_verified,
            sync_status, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'synced', ?, ?);`,
          [
            newProfile.id,
            newProfile.iemId || null,
            newProfile.creatorId || null,
            newProfile.name,
            newProfile.description || '',
            newProfile.profileType,
            newProfile.scenario,
            newProfile.targetCurve || null,
            newProfile.sourceAttribution || null,
            newProfile.preampDb,
            1, // is_public
            0, // is_verified ALWAYS 0
            newProfile.createdAt,
            newProfile.updatedAt,
          ]
        );
      }
    } catch (e) {
      console.warn('[CommunityService] Local DB write error:', e);
    }

    // Attempt remote Supabase push
    try {
      await supabase.from('eq_profiles').insert({
        id: newProfile.id,
        creator_id: input.creatorId,
        iem_id: input.iemId || null,
        name: newProfile.name,
        description: newProfile.description,
        profile_type: 'community',
        scenario: newProfile.scenario,
        target_curve: newProfile.targetCurve,
        source_attribution: newProfile.sourceAttribution,
        preamp_db: newProfile.preampDb,
        is_public: true,
        is_verified: false,
      });
    } catch {
      // Offline mode silent fallback
    }

    return { success: true, profile: newProfile };
  }

  // 4. TOGGLE UPVOTE
  public async toggleUpvote(profileId: string): Promise<{ upvoted: boolean; upvotesCount: number }> {
    const profile = this.profiles.find((p) => p.id === profileId);
    if (!profile) {
      throw new Error(`Profile ${profileId} not found`);
    }

    const hasUpvoted = this.upvotedProfileIds.has(profileId);
    if (hasUpvoted) {
      this.upvotedProfileIds.delete(profileId);
      profile.upvotesCount = Math.max(0, profile.upvotesCount - 1);
    } else {
      this.upvotedProfileIds.add(profileId);
      profile.upvotesCount += 1;
    }

    return { upvoted: !hasUpvoted, upvotesCount: profile.upvotesCount };
  }

  // 5. REVIEWS & RATINGS
  public async getReviews(profileId: string): Promise<ProfileReview[]> {
    return this.reviews[profileId] || [];
  }

  public async submitReview(
    profileId: string,
    rating: number,
    comment: string,
    user: { id: string; name: string; avatarUrl?: string }
  ): Promise<{ success: boolean; review?: ProfileReview; error?: string }> {
    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return { success: false, error: 'Rating must be an integer between 1 and 5 stars.' };
    }
    if (!comment || comment.trim().length < 3) {
      return { success: false, error: 'Review comment must be at least 3 characters long.' };
    }

    const profile = this.profiles.find((p) => p.id === profileId);
    if (!profile) {
      return { success: false, error: 'Target profile not found.' };
    }

    const profileReviews = this.reviews[profileId] || [];
    const existingIndex = profileReviews.findIndex((r) => r.userId === user.id);

    const now = new Date().toISOString();
    let review: ProfileReview;

    if (existingIndex >= 0) {
      // Update existing review
      review = {
        ...profileReviews[existingIndex],
        rating,
        comment: comment.trim(),
        updatedAt: now,
      };
      profileReviews[existingIndex] = review;
    } else {
      // Add new review
      review = {
        id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        profileId,
        userId: user.id,
        userName: user.name,
        userAvatarUrl: user.avatarUrl,
        rating,
        comment: comment.trim(),
        createdAt: now,
      };
      profileReviews.unshift(review);
    }

    this.reviews[profileId] = profileReviews;

    // Recalculate average rating
    const totalRating = profileReviews.reduce((sum, r) => sum + r.rating, 0);
    profile.ratingCount = profileReviews.length;
    profile.ratingAverage = Number((totalRating / profileReviews.length).toFixed(1));
    profile.userRating = rating;

    // Persist to local SQLite
    try {
      const db = await getDatabase();
      if (db) {
        await db.runAsync(
          `INSERT OR REPLACE INTO local_reviews (id, profile_id, user_id, user_name, rating, comment, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?);`,
          [review.id, profileId, user.id, user.name, rating, review.comment, review.createdAt]
        );
      }
    } catch (e) {
      console.warn('[CommunityService] Local review write error:', e);
    }

    // Remote push if available
    try {
      await supabase.from('profile_reviews').upsert({
        profile_id: profileId,
        user_id: user.id,
        rating,
        comment: review.comment,
        updated_at: now,
      });
    } catch {
      // Offline fallback
    }

    return { success: true, review };
  }

  // 6. MODERATION REPORTING
  public async reportProfile(params: {
    profileId: string;
    reporterId: string;
    reporterName?: string;
    reason: ProfileReportReason;
    details?: string;
  }): Promise<{ success: boolean; report?: ProfileReport; error?: string }> {
    const profile = this.profiles.find((p) => p.id === params.profileId);
    if (!profile) {
      return { success: false, error: 'Reported profile does not exist.' };
    }

    const report: ProfileReport = {
      id: `rep-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      profileId: params.profileId,
      reporterId: params.reporterId,
      reporterName: params.reporterName,
      reason: params.reason,
      details: params.details?.trim(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    this.reports.push(report);

    // Save locally
    try {
      const db = await getDatabase();
      if (db) {
        await db.runAsync(
          `INSERT INTO local_reports (id, profile_id, reporter_id, reason, details, status, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?);`,
          [report.id, report.profileId, report.reporterId, report.reason, report.details || null, report.status, report.createdAt]
        );
      }
    } catch (e) {
      console.warn('[CommunityService] Local report write error:', e);
    }

    // Remote push
    try {
      await supabase.from('profile_reports').insert({
        id: report.id,
        profile_id: report.profileId,
        reporter_id: report.reporterId,
        reason: report.reason,
        details: report.details,
        status: 'pending',
      });
    } catch {
      // Offline fallback
    }

    return { success: true, report };
  }

  public getReports(): ProfileReport[] {
    return [...this.reports];
  }
}

export const communityService = new CommunityService();
