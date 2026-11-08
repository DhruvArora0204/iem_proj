import type { BiquadFilterConfig } from '../types/audio';
import { calculateCumulativeResponse, generateLogFrequencies } from '../../utils/audioMath';

export interface HeadroomMetrics {
  maxPeakGainDb: number;
  peakFrequencyHz: number;
  recommendedPreampDb: number;
  isClippingRisk: boolean;
  effectiveHeadroomDb: number;
}

/**
 * Evaluates the multi-band cascade across the audible spectrum (20 Hz - 20 kHz)
 * to locate peak positive gains and compute the exact negative preamp needed to guarantee 0 dBFS headroom.
 */
export function calculateHeadroomMetrics(
  filters: BiquadFilterConfig[],
  currentPreampDb = 0,
  sampleRate = 48000
): HeadroomMetrics {
  const testFrequencies = generateLogFrequencies(120);

  // Evaluate filters without current preamp first to find pure filter gain envelope
  const rawResponse = calculateCumulativeResponse(testFrequencies, filters, 0, false, sampleRate);

  let maxGain = 0;
  let peakFreq = 1000;

  for (const pt of rawResponse) {
    if (pt.gainDb > maxGain) {
      maxGain = pt.gainDb;
      peakFreq = pt.freq;
    }
  }

  // Recommended preamp is negative of max positive boost (rounded to 1 decimal place)
  const recommendedPreampDb = maxGain > 0 ? -Math.round(maxGain * 10) / 10 : 0.0;

  // Effective peak after current preamp
  const effectivePeak = maxGain + currentPreampDb;
  const effectiveHeadroomDb = -effectivePeak;
  const isClippingRisk = effectivePeak > 0.05;

  return {
    maxPeakGainDb: Math.round(maxGain * 10) / 10,
    peakFrequencyHz: peakFreq,
    recommendedPreampDb,
    isClippingRisk,
    effectiveHeadroomDb: Math.round(effectiveHeadroomDb * 10) / 10,
  };
}

