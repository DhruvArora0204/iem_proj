import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { BiquadSection, calculateRBJCoefficients } from '../../src/core/dsp/biquad';
import { SoftKneeLimiter } from '../../src/core/dsp/limiter';
import { calculateHeadroomMetrics } from '../../src/core/dsp/headroom';
import { BiquadCascadeProcessor } from '../../src/core/dsp/cascade';
import { SignalGenerator } from '../../src/core/dsp/signalGenerator';
import type { BiquadFilterConfig } from '../../src/core/types/audio';

describe('BiquadSection & RBJ Coefficients', () => {
  it('should calculate valid normalized coefficients for peaking filter', () => {
    const config: BiquadFilterConfig = {
      id: 'f1',
      type: 'peak',
      frequency: 1000,
      gain: 6.0,
      q: 1.414,
      enabled: true,
    };

    const coeffs = calculateRBJCoefficients(config, 48000);
    assert.ok(Number.isFinite(coeffs.b0), 'b0 must be finite');
    assert.ok(Number.isFinite(coeffs.b1), 'b1 must be finite');
    assert.ok(Number.isFinite(coeffs.b2), 'b2 must be finite');
    assert.ok(Number.isFinite(coeffs.a1), 'a1 must be finite');
    assert.ok(Number.isFinite(coeffs.a2), 'a2 must be finite');

    // Stability check: poles inside unit circle (|a2| < 1)
    assert.ok(Math.abs(coeffs.a2) < 1.0, `Poles must be stable: |a2| = ${Math.abs(coeffs.a2)}`);
  });

  it('should output silence when input is silence', () => {
    const config: BiquadFilterConfig = {
      id: 'f1',
      type: 'peak',
      frequency: 1000,
      gain: 4.0,
      q: 1.0,
      enabled: true,
    };

    const section = new BiquadSection(config, 48000);
    const [outL, outR] = section.processSample(0, 0);
    assert.equal(outL, 0);
    assert.equal(outR, 0);
  });
});

describe('SoftKneeLimiter', () => {
  const limiter = new SoftKneeLimiter(-0.5, -0.05);

  it('should be completely transparent for normal signals below -0.5 dBFS', () => {
    const input = 0.5; // ~ -6 dBFS
    const output = limiter.processSample(input);
    assert.equal(output, input);
  });

  it('should limit signal strictly below ceiling for heavy overloads (+6 dBFS)', () => {
    const overload = 2.0; // +6 dBFS
    const output = limiter.processSample(overload);
    assert.ok(output < 1.0, `Limited output ${output} must be strictly < 1.0`);
    assert.ok(output > 0.9, `Limited output ${output} must be compressed around ceiling`);
  });

  it('should preserve polarity for negative signals', () => {
    const negOverload = -1.8;
    const output = limiter.processSample(negOverload);
    assert.ok(output < 0, 'Negative signal must remain negative');
    assert.ok(output > -1.0, 'Negative signal must be clamped > -1.0');
  });
});

describe('Headroom Calculator', () => {
  it('should recommend exact negative preamp when positive gain is present', () => {
    const filters: BiquadFilterConfig[] = [
      { id: '1', type: 'low_shelf', frequency: 105, gain: 4.5, q: 0.71, enabled: true },
      { id: '2', type: 'peak', frequency: 2500, gain: 2.0, q: 1.4, enabled: true },
    ];

    const metrics = calculateHeadroomMetrics(filters, 0.0, 48000);
    assert.ok(metrics.maxPeakGainDb > 4.0, 'Max peak gain must be at least shelf gain');
    assert.ok(metrics.recommendedPreampDb <= -4.0, 'Recommended preamp must attenuate boost');
    assert.equal(metrics.isClippingRisk, true, 'Without preamp, boost causes clipping risk');
  });

  it('should report no clipping risk when adequate preamp is applied', () => {
    const filters: BiquadFilterConfig[] = [
      { id: '1', type: 'low_shelf', frequency: 105, gain: 3.0, q: 0.71, enabled: true },
    ];

    const metrics = calculateHeadroomMetrics(filters, -3.5, 48000);
    assert.equal(metrics.isClippingRisk, false, 'Preamp of -3.5 dB provides safe headroom');
  });
});

describe('SignalGenerator', () => {
  it('should generate valid sine tone with expected amplitude', () => {
    const sine = SignalGenerator.generateSineTone(1000, 0.1, 0.8, 48000);
    assert.equal(sine.length, 4800);
    const max = Math.max(...sine);
    assert.ok(Math.abs(max - 0.8) < 0.01, `Sine peak ${max} should match amplitude 0.8`);
  });

  it('should encode valid 44-byte RIFF/WAVE header', () => {
    const left = new Float32Array(480);
    const right = new Float32Array(480);
    const wavBytes = SignalGenerator.encodeWav(left, right, 48000);

    // RIFF header is 44 bytes + (480 * 2 channels * 2 bytes/sample) = 44 + 1920 = 1964 bytes
    assert.equal(wavBytes.length, 1964);

    // Check ASCII markers: "RIFF" and "WAVE"
    const headerStr = String.fromCharCode(...wavBytes.slice(0, 4));
    const formatStr = String.fromCharCode(...wavBytes.slice(8, 12));
    assert.equal(headerStr, 'RIFF');
    assert.equal(formatStr, 'WAVE');
  });
});

describe('BiquadCascadeProcessor', () => {
  it('should process buffer and track peak levels accurately', () => {
    const filters: BiquadFilterConfig[] = [
      { id: '1', type: 'peak', frequency: 1000, gain: 3.0, q: 1.0, enabled: true },
    ];

    const processor = new BiquadCascadeProcessor(filters, -2.0, 48000);
    const inputL = SignalGenerator.generateSineTone(1000, 0.05, 0.5, 48000);
    const inputR = SignalGenerator.generateSineTone(1000, 0.05, 0.5, 48000);
    const outL = new Float32Array(inputL.length);
    const outR = new Float32Array(inputR.length);

    const result = processor.processBuffer(inputL, inputR, outL, outR);
    assert.ok(result.peakL > 0.4, 'Processed peak must reflect audio content');
    assert.equal(result.hasClipped, false, 'Preamp prevented clipping');
  });
});
