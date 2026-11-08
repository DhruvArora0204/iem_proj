import type { BiquadFilterConfig } from '../types/audio';

export interface BiquadCoefficients {
  b0: number;
  b1: number;
  b2: number;
  a1: number;
  a2: number;
}

/**
 * Calculates normalized biquad coefficients according to the Robert Bristow-Johnson (RBJ) Audio EQ Cookbook.
 * Direct Form II Transposed structure uses normalized coefficients where a0 = 1.0.
 */
export function calculateRBJCoefficients(
  filter: BiquadFilterConfig,
  sampleRate = 48000
): BiquadCoefficients {
  const f0 = Math.max(10, Math.min(sampleRate / 2 - 100, filter.frequency));
  const gainDb = filter.gain;
  const q = Math.max(0.05, Math.min(30.0, filter.q));

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
      a2 = (A + 1) - (A - 1) * cosW0 - sqrtA2;
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

  // Normalize by a0
  return {
    b0: b0 / a0,
    b1: b1 / a0,
    b2: b2 / a0,
    a1: a1 / a0,
    a2: a2 / a0,
  };
}

/**
 * Single second-order IIR Biquad filter stage implemented using Direct Form II Transposed.
 * Advantages of Direct Form II Transposed:
 * - Minimal state storage (2 delay registers per channel).
 * - High numerical stability under floating-point precision.
 * - Smooth state transitions when coefficients are updated dynamically.
 */
export class BiquadSection {
  private coeffs: BiquadCoefficients;
  // Delay registers for Left and Right channels
  private z1_L = 0;
  private z2_L = 0;
  private z1_R = 0;
  private z2_R = 0;

  constructor(filterConfig: BiquadFilterConfig, sampleRate = 48000) {
    this.coeffs = calculateRBJCoefficients(filterConfig, sampleRate);
  }

  public updateCoefficients(filterConfig: BiquadFilterConfig, sampleRate = 48000): void {
    this.coeffs = calculateRBJCoefficients(filterConfig, sampleRate);
  }

  /**
   * Resets delay registers to prevent DC thump.
   */
  public reset(): void {
    this.z1_L = 0;
    this.z2_L = 0;
    this.z1_R = 0;
    this.z2_R = 0;
  }

  /**
   * Processes a single stereo sample [left, right] in-place.
   * Direct Form II Transposed equations:
   * y[n]  = b0 * x[n] + z1[n-1]
   * z1[n] = b1 * x[n] - a1 * y[n] + z2[n-1]
   * z2[n] = b2 * x[n] - a2 * y[n]
   */
  public processSample(inL: number, inR: number): [number, number] {
    const { b0, b1, b2, a1, a2 } = this.coeffs;

    // Left channel
    const outL = b0 * inL + this.z1_L;
    this.z1_L = b1 * inL - a1 * outL + this.z2_L;
    this.z2_L = b2 * inL - a2 * outL;

    // Right channel
    const outR = b0 * inR + this.z1_R;
    this.z1_R = b1 * inR - a1 * outR + this.z2_R;
    this.z2_R = b2 * inR - a2 * outR;

    return [outL, outR];
  }

  public getCoefficients(): BiquadCoefficients {
    return { ...this.coeffs };
  }
}
