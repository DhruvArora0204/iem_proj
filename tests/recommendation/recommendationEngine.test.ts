import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { RecommendationEngine } from '../../src/core/recommendation/engine';
import { getIEMById, IEM_CATALOG } from '../../src/services/local-db/iemCatalog';
import { TARGET_CURVES, getTargetSplAtFreq } from '../../src/core/measurements/targetCurves';

describe('Recommendation & Compensation Engine', () => {
  it('should interpolate target curves accurately across audible spectrum', () => {
    // Harman target at 1000 Hz must be 0 dB reference
    const spl1k = getTargetSplAtFreq('harman_ie_2019', 1000);
    assert.equal(spl1k, 0.0);

    // Harman target at 2800 Hz should be ~9.5 dB peak
    const splEarGain = getTargetSplAtFreq('harman_ie_2019', 2800);
    assert.ok(Math.abs(splEarGain - 9.5) < 0.1, `Ear gain was ${splEarGain}, expected ~9.5 dB`);

    // Harman target at 20 Hz should be ~8.5 dB sub-bass
    const splSub = getTargetSplAtFreq('harman_ie_2019', 20);
    assert.ok(Math.abs(splSub - 8.5) < 0.1, `Sub-bass was ${splSub}, expected ~8.5 dB`);
  });

  it('should calculate model-specific compensation for Moondrop Blessing 3', () => {
    const blessing3 = getIEMById('iem-1');
    assert.ok(blessing3, 'Blessing 3 must exist in catalog');

    const result = RecommendationEngine.generateCompensationProfile(blessing3, 'harman_ie_2019');
    assert.equal(result.hasMeasuredData, true);
    assert.ok(result.attributionNote.includes('IEC 60318-4'));

    const profile = result.profile;
    assert.equal(profile.iemId, 'iem-1');
    assert.equal(profile.profileType, 'measurement_derived');

    // Blessing 3 measured sub-bass at 105 Hz is 2.8 dB, while Harman target is 4.2 dB.
    // The filter should boost sub-bass by ~ +1.4 dB.
    const bassFilter = profile.filters.find((f) => f.type === 'low_shelf' && f.frequency === 105);
    assert.ok(bassFilter, 'Must have 105 Hz low shelf');
    assert.ok(bassFilter.gain > 0, `Bass filter gain ${bassFilter.gain} should be positive`);

    // Blessing 3 measured pinna gain at 2800 Hz is 11.2 dB, while Harman target is 9.5 dB.
    // The filter should cut pinna excess by ~ -1.7 dB.
    const pinnaFilter = profile.filters.find((f) => f.type === 'peak' && f.frequency === 2800);
    assert.ok(pinnaFilter, 'Must have 2800 Hz peaking filter');
    assert.ok(pinnaFilter.gain < 0, `Pinna filter gain ${pinnaFilter.gain} should be negative`);

    // Preamp should be non-positive to guarantee 0 dBFS headroom
    assert.ok(profile.preampDb <= 0, `Preamp ${profile.preampDb} must be <= 0`);
  });

  it('should generate calibrated scenario profiles (Gaming, Movie, Podcast, Basshead)', () => {
    const zeroRed = getIEMById('iem-2');
    assert.ok(zeroRed, 'Truthear Zero: RED must exist in catalog');

    const scenarios = RecommendationEngine.generateScenarioProfiles(zeroRed);
    assert.equal(scenarios.length, 5);

    // Gaming mode check
    const gaming = scenarios.find((s) => s.scenario === 'gaming_fps');
    assert.ok(gaming, 'Must include gaming profile');
    const hasHighPass = gaming.filters.some((f) => f.type === 'high_pass');
    assert.equal(hasHighPass, true, 'Gaming profile must have high-pass filter to cut rumble');

    // Podcast mode check
    const podcast = scenarios.find((s) => s.scenario === 'podcast_speech');
    assert.ok(podcast, 'Must include podcast profile');
    const vocalBoost = podcast.filters.find((f) => f.frequency === 2500);
    assert.ok(vocalBoost && vocalBoost.gain > 0, 'Podcast must boost vocal speech intelligibility');
  });

  it('should handle unmeasured models transparently without crashing', () => {
    const unmeasuredIEM = {
      id: 'iem-custom-test',
      manufacturerName: 'Prototype Audio',
      name: 'Alpha Planar',
      country: 'USA',
      driverType: 'Planar Magnetic',
      driverCount: 1,
      impedanceOhms: 16,
      sensitivityDbMw: 100,
    };

    const result = RecommendationEngine.generateCompensationProfile(unmeasuredIEM, 'harman_ie_2019');
    assert.equal(result.hasMeasuredData, false);
    assert.ok(result.attributionNote.includes('Coupler measurements pending'));
    assert.equal(result.profile.profileType, 'curated');
    assert.equal(result.profile.isVerified, false);
  });
});

