import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  communityService,
  MAX_COMMUNITY_FILTERS,
} from '../../src/services/community/communityService';
import type { BiquadFilterConfig } from '../../src/core/types/audio';

describe('CommunityService — Presets, Ratings, and Moderation', () => {
  const validFilters: BiquadFilterConfig[] = [
    { id: '1', type: 'low_shelf', frequency: 100, gain: 3.0, q: 0.71, enabled: true },
    { id: '2', type: 'peak', frequency: 3000, gain: -2.0, q: 1.5, enabled: true },
  ];

  it('should validate profile name length and filter limits', () => {
    // Too short name
    const resShortName = communityService.validateProfileForPublishing({
      name: 'ab',
      scenario: 'music_balanced',
      preampDb: -3.0,
      filters: validFilters,
      creatorId: 'user-1',
      creatorName: 'TestUser',
    });
    assert.equal(resShortName.isValid, false);
    assert.ok(resShortName.errors.some((e) => e.includes('at least 3 characters')));

    // Exceed max filter bands (11 bands)
    const tooManyFilters: BiquadFilterConfig[] = Array.from({ length: 11 }, (_, i) => ({
      id: `f-${i}`,
      type: 'peak',
      frequency: 1000 + i * 100,
      gain: 1.0,
      q: 1.0,
      enabled: true,
    }));

    const resTooMany = communityService.validateProfileForPublishing({
      name: 'Valid Name Here',
      scenario: 'music_balanced',
      preampDb: -2.0,
      filters: tooManyFilters,
      creatorId: 'user-1',
      creatorName: 'TestUser',
    });
    assert.equal(resTooMany.isValid, false);
    assert.ok(resTooMany.errors.some((e) => e.includes(`cannot exceed ${MAX_COMMUNITY_FILTERS}`)));
  });

  it('should alert clipping risk when positive boost has insufficient preamp', () => {
    // Filter has +4.0 dB boost, but preamp is 0 dB
    const boostFilters: BiquadFilterConfig[] = [
      { id: '1', type: 'peak', frequency: 2500, gain: 4.0, q: 1.0, enabled: true },
    ];

    const res = communityService.validateProfileForPublishing({
      name: 'High Boost Preset',
      scenario: 'music_bass',
      preampDb: 0.0,
      filters: boostFilters,
      creatorId: 'user-1',
      creatorName: 'BassLover',
    });

    assert.equal(res.isValid, true);
    assert.ok(res.headroomWarning);
    assert.ok(res.headroomWarning?.includes('Digital clipping alert'));
  });

  it('should publish community profile with strictly enforced isVerified=false', async () => {
    const res = await communityService.publishProfile({
      name: 'Warm Acoustic Intimacy',
      description: 'Lush mids for vocal jazz and acoustic guitars.',
      iemId: 'iem-1',
      iemName: 'Moondrop Blessing 3',
      scenario: 'music_vocal',
      targetCurve: 'Warm Tilt Target',
      preampDb: -3.0,
      filters: validFilters,
      creatorId: 'user-42',
      creatorName: 'AcousticFanatic',
    });

    assert.equal(res.success, true);
    assert.ok(res.profile);
    assert.equal(res.profile.profileType, 'community');
    assert.equal(res.profile.isVerified, false); // Strict security check: cannot self-verify
    assert.equal(res.profile.isPublic, true);
    assert.equal(res.profile.creatorName, 'AcousticFanatic');

    const profiles = await communityService.getProfiles();
    assert.ok(profiles.some((p) => p.id === res.profile!.id));
  });

  it('should toggle upvotes accurately', async () => {
    const profiles = await communityService.getProfiles();
    const target = profiles[0];
    const initialUpvotes = target.upvotesCount;

    // Upvote
    const upRes1 = await communityService.toggleUpvote(target.id);
    assert.equal(upRes1.upvoted, true);
    assert.equal(upRes1.upvotesCount, initialUpvotes + 1);

    // Un-upvote
    const upRes2 = await communityService.toggleUpvote(target.id);
    assert.equal(upRes2.upvoted, false);
    assert.equal(upRes2.upvotesCount, initialUpvotes);
  });

  it('should submit reviews, update average ratings, and prevent duplicate review entries', async () => {
    const profiles = await communityService.getProfiles();
    const testProfile = profiles[0];

    // Submit 5-star review
    const res1 = await communityService.submitReview(
      testProfile.id,
      5,
      'Sensational tuning! Balanced midrange and crisp imaging.',
      { id: 'user-reviewer-1', name: 'AudiophilePro' }
    );
    assert.equal(res1.success, true);
    assert.ok(res1.review);

    const reviewsAfter1 = await communityService.getReviews(testProfile.id);
    assert.ok(reviewsAfter1.some((r) => r.userId === 'user-reviewer-1'));

    // Update same user review to 4-star
    const res2 = await communityService.submitReview(
      testProfile.id,
      4,
      'Updated: Upper treble can be slightly peaky on energetic tracks.',
      { id: 'user-reviewer-1', name: 'AudiophilePro' }
    );
    assert.equal(res2.success, true);

    const reviewsAfter2 = await communityService.getReviews(testProfile.id);
    // User should not have duplicate reviews
    const userReviews = reviewsAfter2.filter((r) => r.userId === 'user-reviewer-1');
    assert.equal(userReviews.length, 1);
    assert.equal(userReviews[0].rating, 4);

    // Invalid rating (>5)
    const resInvalid = await communityService.submitReview(
      testProfile.id,
      6,
      'Super good',
      { id: 'user-reviewer-2', name: 'Tester' }
    );
    assert.equal(resInvalid.success, false);
    assert.ok(resInvalid.error?.includes('between 1 and 5'));
  });

  it('should submit and track moderation reports', async () => {
    const profiles = await communityService.getProfiles();
    const target = profiles[0];

    const reportRes = await communityService.reportProfile({
      profileId: target.id,
      reporterId: 'user-reporter-99',
      reporterName: 'AudioSafetyMonitor',
      reason: 'distortion_clipping',
      details: 'Preset introduces +12 dB boost without preamp causing DAC clipping on dynamic peaks.',
    });

    assert.equal(reportRes.success, true);
    assert.ok(reportRes.report);
    assert.equal(reportRes.report.reason, 'distortion_clipping');
    assert.equal(reportRes.report.status, 'pending');

    const allReports = communityService.getReports();
    assert.ok(allReports.some((r) => r.id === reportRes.report!.id));
  });
});

