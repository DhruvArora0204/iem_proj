import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  freqToX,
  xToFreq,
  gainToY,
  yToGain,
  calculateBiquadMagnitude,
  calculateCumulativeResponse,
  MIN_FREQ,
  MAX_FREQ,
} from '../../src/utils/audioMath';
import type { BiquadFilterConfig } from '../../src/core/types/audio';

describe('audioMath utils', () => {
  it('should accurately map frequency to X and invert back', () => {
    const width = 360;
    const testFrequencies = [20, 100, 1000, 5000, 10000, 20000];

    for (const freq of testFrequencies) {
      const x = freqToX(freq, width);
      const invertedFreq = xToFreq(x, width);
      // Allow slight rounding tolerance (within 2%) on log scale
      const diffRatio = Math.abs(invertedFreq - freq) / freq;
      assert.ok(diffRatio < 0.03, `Inverted freq ${invertedFreq} deviates from ${freq}`);
    }
  });

  it('should accurately map gain to Y and invert back', () => {
    const height = 200;
    const testGains = [-18, -12, -6, 0, 3.5, 6, 12, 18];

    for (const gain of testGains) {
      const y = gainToY(gain, height);
      const invertedGain = yToGain(y, height);
      assert.ok(
        Math.abs(invertedGain - gain) < 0.2,
        `Inverted gain ${invertedGain} deviates from ${gain}`
      );
    }
  });

  it('should evaluate peaking EQ filter magnitude equal to programmed gain at center frequency', () => {
    const filter: BiquadFilterConfig = {
      id: 'f-test',
      type: 'peak',
      frequency: 1000,
      gain: 6.0,
      q: 1.4,
      enabled: true,
    };

    const magAtCenter = calculateBiquadMagnitude(1000, filter, 48000);
    // At center frequency, a peaking filter magnitude must equal programmed gain (6.0 dB)
    assert.ok(
      Math.abs(magAtCenter - 6.0) < 0.1,
      `Magnitude at 1000 Hz was ${magAtCenter}, expected ~6.0 dB`
    );

    // Far from center frequency (e.g. 50 Hz), response should be close to 0 dB
    const magAtLow = calculateBiquadMagnitude(50, filter, 48000);
    assert.ok(
      Math.abs(magAtLow) < 0.5,
      `Magnitude at 50 Hz was ${magAtLow}, expected ~0 dB`
    );
  });

  it('should attenuate deeply at notch frequency', () => {
    const notchFilter: BiquadFilterConfig = {
      id: 'f-notch',
      type: 'notch',
      frequency: 3000,
      gain: 0,
      q: 5.0,
      enabled: true,
    };

    const magAtNotch = calculateBiquadMagnitude(3000, notchFilter, 48000);
    // A notch filter must attenuate by at least 20 dB at center frequency
    assert.ok(
      magAtNotch < -20.0,
      `Notch magnitude at 3000 Hz was ${magAtNotch}, expected < -20 dB`
    );
  });

  it('should calculate cumulative response across cascaded filters with preamp', () => {
    const filters: BiquadFilterConfig[] = [
      { id: '1', type: 'peak', frequency: 1000, gain: 4.0, q: 1.0, enabled: true },
      { id: '2', type: 'peak', frequency: 1000, gain: 2.0, q: 1.0, enabled: true },
    ];

    const preamp = -3.0;
    const response = calculateCumulativeResponse([1000], filters, preamp, false, 48000);

    // Combined at 1000 Hz: -3.0 preamp + 4.0 + 2.0 = ~3.0 dB
    assert.ok(
      Math.abs(response[0].gainDb - 3.0) < 0.2,
      `Combined gain was ${response[0].gainDb}, expected ~3.0 dB`
    );
  });
});

