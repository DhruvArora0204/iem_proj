import type { BiquadFilterConfig } from '../core/types/audio';

export const MIN_FREQ = 20;
export const MAX_FREQ = 20000;
export const MIN_DB = -18;
export const MAX_DB = 18;

/**
 * Maps a frequency in Hz (20 - 20,000) to a horizontal pixel X coordinate on a log10 scale.
 */
export function freqToX(freq: number, width: number): number {
  const clampedFreq = Math.max(MIN_FREQ, Math.min(MAX_FREQ, freq));
  const logMin = Math.log10(MIN_FREQ);
  const logMax = Math.log10(MAX_FREQ);
  const ratio = (Math.log10(clampedFreq) - logMin) / (logMax - logMin);
  return ratio * width;
}

/**
 * Maps a horizontal pixel X coordinate back to a frequency in Hz on a log10 scale.
 */
export function xToFreq(x: number, width: number): number {
  if (width <= 0) return 1000;
  const ratio = Math.max(0, Math.min(1, x / width));
  const logMin = Math.log10(MIN_FREQ);
  const logMax = Math.log10(MAX_FREQ);
  const logFreq = logMin + ratio * (logMax - logMin);
  return Math.round(Math.pow(10, logFreq));
}

/**
 * Maps a gain in dB (-18 to +18) to a vertical pixel Y coordinate.
 */
export function gainToY(gainDb: number, height: number): number {
  const clampedGain = Math.max(MIN_DB, Math.min(MAX_DB, gainDb));
  const ratio = (MAX_DB - clampedGain) / (MAX_DB - MIN_DB);
  return ratio * height;
}

/**
 * Maps a vertical pixel Y coordinate back to a gain in dB.
 */
export function yToGain(y: number, height: number): number {
  if (height <= 0) return 0;
  const ratio = Math.max(0, Math.min(1, y / height));
  const gain = MAX_DB - ratio * (MAX_DB - MIN_DB);
  return Math.round(gain * 10) / 10;
}

/**
 * Evaluates the analytical magnitude response (in dB) of a single RBJ biquad filter at frequency f.
 */
export function calculateBiquadMagnitude(
  freq: number,
  filter: BiquadFilterConfig,
  sampleRate = 48000
): number {
  if (!filter.enabled) return 0;

  const f0 = filter.frequency;
  const gainDb = filter.gain;
  const q = Math.max(0.1, filter.q);

  if (filter.type === 'peak' && Math.abs(gainDb) < 0.01) {
    return 0;
  }

  const w0 = (2 * Math.PI * f0) / sampleRate;
  const cosW0 = Math.cos(w0);
  const sinW0 = Math.sin(w0);
  const alpha = sinW0 / (2 * q);
  const A = Math.pow(10, gainDb / 40);

  let b0 = 1, b1 = 0, b2 = 0, a0 = 1, a1 = 0, a2 = 0;

  switch (filter.type) {
    case 'peak': {
      b0 = 1 + alpha * A;
      b1 = -2 * cosW0;
      b2 = 1 - alpha * A;
      a0 = 1 + alpha / A;
      a1 = -2 * cosW0;
      a2 = 1 - alpha / A;
      break;
    }
    case 'low_shelf': {
      const sqrtA2 = 2 * Math.sqrt(A) * alpha;
      b0 = A * ((A + 1) - (A - 1) * cosW0 + sqrtA2);
      b1 = 2 * A * ((A - 1) - (A + 1) * cosW0);
      b2 = A * ((A + 1) - (A - 1) * cosW0 - sqrtA2);
      a0 = (A + 1) + (A - 1) * cosW0 + sqrtA2;
      a1 = -2 * ((A - 1) + (A + 1) * cosW0);
      a2 = (A + 1) + (A - 1) * cosW0 - sqrtA2;
      break;
    }
    case 'high_shelf': {
      const sqrtA2 = 2 * Math.sqrt(A) * alpha;
      b0 = A * ((A + 1) + (A - 1) * cosW0 + sqrtA2);
      b1 = -2 * A * ((A - 1) + (A + 1) * cosW0);
      b2 = A * ((A + 1) + (A - 1) * cosW0 - sqrtA2);
      a0 = (A + 1) - (A - 1) * cosW0 + sqrtA2;
      a1 = 2 * ((A - 1) - (A + 1) * cosW0);
      a2 = (A + 1) - (A - 1) * cosW0 - sqrtA2;
      break;
    }
    case 'low_pass': {
      b0 = (1 - cosW0) / 2;
      b1 = 1 - cosW0;
      b2 = (1 - cosW0) / 2;
      a0 = 1 + alpha;
      a1 = -2 * cosW0;
      a2 = 1 - alpha;
      break;
    }
    case 'high_pass': {
      b0 = (1 + cosW0) / 2;
      b1 = -(1 + cosW0);
      b2 = (1 + cosW0) / 2;
      a0 = 1 + alpha;
      a1 = -2 * cosW0;
      a2 = 1 - alpha;
      break;
    }
    case 'notch': {
      b0 = 1;
      b1 = -2 * cosW0;
      b2 = 1;
      a0 = 1 + alpha;
      a1 = -2 * cosW0;
      a2 = 1 - alpha;
      break;
    }
  }

  // Normalize coefficients by a0
  const nb0 = b0 / a0;
  const nb1 = b1 / a0;
  const nb2 = b2 / a0;
  const na1 = a1 / a0;
  const na2 = a2 / a0;

  // Evaluate transfer function H(e^jw) at frequency f
  const w = (2 * Math.PI * freq) / sampleRate;
  const cosW = Math.cos(w);
  const cos2W = Math.cos(2 * w);
  const sinW = Math.sin(w);
  const sin2W = Math.sin(2 * w);

  // Numerator: (nb0 + nb1*cos(w) + nb2*cos(2w)) + j*(-nb1*sin(w) - nb2*sin(2w))
  const numReal = nb0 + nb1 * cosW + nb2 * cos2W;
  const numImag = -nb1 * sinW - nb2 * sin2W;

  // Denominator: (1 + na1*cos(w) + na2*cos(2w)) + j*(-na1*sin(w) - na2*sin(2w))
  const denReal = 1 + na1 * cosW + na2 * cos2W;
  const denImag = -na1 * sinW - na2 * sin2W;

  const numMagSq = numReal * numReal + numImag * numImag;
  const denMagSq = denReal * denReal + denImag * denImag;

  if (denMagSq < 1e-12) return 0;

  const mag = Math.sqrt(numMagSq / denMagSq);
  if (mag <= 1e-6) return -60;

  return 20 * Math.log10(mag);
}

/**
 * Computes the combined frequency response across an array of test frequencies.
 */
export function calculateCumulativeResponse(
  frequencies: number[],
  filters: BiquadFilterConfig[],
  preampDb: number,
  isBypassed: boolean,
  sampleRate = 48000
): { freq: number; gainDb: number }[] {
  if (isBypassed) {
    return frequencies.map((f) => ({ freq: f, gainDb: 0 }));
  }

  return frequencies.map((f) => {
    let totalGain = preampDb;
    for (const filter of filters) {
      if (filter.enabled) {
        totalGain += calculateBiquadMagnitude(f, filter, sampleRate);
      }
    }
    return { freq: f, gainDb: totalGain };
  });
}

/**
 * Standard log-spaced frequency points (approx 80 points) from 20 Hz to 20,000 Hz for smooth spline rendering.
 */
export function generateLogFrequencies(pointsCount = 80): number[] {
  const logMin = Math.log10(MIN_FREQ);
  const logMax = Math.log10(MAX_FREQ);
  const step = (logMax - logMin) / (pointsCount - 1);
  const result: number[] = [];
  for (let i = 0; i < pointsCount; i++) {
    result.push(Math.round(Math.pow(10, logMin + i * step)));
  }
  return result;
}

/**
 * Reference Harman Target curve approximation points (IEC 60318-4) relative to 1 kHz (0 dB)
 */
export const HARMAN_TARGET_POINTS: { freq: number; gainDb: number }[] = [
  { freq: 20, gainDb: 6.0 },
  { freq: 30, gainDb: 5.8 },
  { freq: 50, gainDb: 5.2 },
  { freq: 80, gainDb: 4.2 },
  { freq: 105, gainDb: 3.2 },
  { freq: 200, gainDb: 1.2 },
  { freq: 500, gainDb: 0.2 },
  { freq: 1000, gainDb: 0.0 },
  { freq: 2000, gainDb: 4.8 },
  { freq: 3000, gainDb: 9.0 },
  { freq: 4000, gainDb: 7.2 },
  { freq: 5000, gainDb: 5.0 },
  { freq: 6000, gainDb: 4.0 },
  { freq: 8000, gainDb: 5.5 },
  { freq: 10000, gainDb: 2.0 },
  { freq: 15000, gainDb: -2.0 },
  { freq: 20000, gainDb: -6.0 },
];

