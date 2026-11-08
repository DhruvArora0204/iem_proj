export interface TargetCurvePoint {
  freq: number;
  spl: number; // normalized relative to 1 kHz (0 dB)
}

export type TargetCurveType = 'harman_ie_2019' | 'ief_neutral_2023' | 'diffuse_field';

export interface TargetCurveDefinition {
  id: TargetCurveType;
  name: string;
  description: string;
  sourceRig: string;
  points: TargetCurvePoint[];
}

/**
 * Standard Harman In-Ear 2019v2 Target Curve.
 * Characterized by a +9 dB sub-bass shelf below 105 Hz and a +9.5 dB ear-gain peak at 2.8 kHz.
 */
export const HARMAN_IE_2019: TargetCurveDefinition = {
  id: 'harman_ie_2019',
  name: 'Harman In-Ear 2019v2',
  description: 'Acoustic research target preferred by 64% of listeners across blind listening tests.',
  sourceRig: 'IEC 60318-4 (711) Coupler',
  points: [
    { freq: 20, spl: 8.5 },
    { freq: 30, spl: 8.2 },
    { freq: 50, spl: 7.2 },
    { freq: 80, spl: 5.5 },
    { freq: 105, spl: 4.2 },
    { freq: 200, spl: 1.8 },
    { freq: 500, spl: 0.2 },
    { freq: 1000, spl: 0.0 },
    { freq: 1500, spl: 2.2 },
    { freq: 2000, spl: 5.8 },
    { freq: 2800, spl: 9.5 },
    { freq: 3500, spl: 8.2 },
    { freq: 4500, spl: 5.5 },
    { freq: 6000, spl: 4.0 },
    { freq: 8000, spl: 6.0 },
    { freq: 10000, spl: 2.5 },
    { freq: 15000, spl: -2.0 },
    { freq: 20000, spl: -6.0 },
  ],
};

/**
 * IEF Neutral 2023 Target Curve.
 * Studio reference curve with flat lower midrange and diffuse-field compensated pinna rise.
 */
export const IEF_NEUTRAL_2023: TargetCurveDefinition = {
  id: 'ief_neutral_2023',
  name: 'IEF Neutral 2023',
  description: 'Studio monitoring reference target curve with uncolored neutral midrange and smooth ear gain.',
  sourceRig: 'IEC 60318-4 (711) Coupler',
  points: [
    { freq: 20, spl: 0.0 },
    { freq: 50, spl: 0.0 },
    { freq: 105, spl: 0.0 },
    { freq: 200, spl: 0.0 },
    { freq: 500, spl: 0.0 },
    { freq: 1000, spl: 0.0 },
    { freq: 1500, spl: 1.5 },
    { freq: 2000, spl: 4.5 },
    { freq: 2700, spl: 8.0 },
    { freq: 3500, spl: 6.5 },
    { freq: 5000, spl: 3.5 },
    { freq: 8000, spl: 4.0 },
    { freq: 10000, spl: 1.0 },
    { freq: 15000, spl: -4.0 },
    { freq: 20000, spl: -8.0 },
  ],
};

/**
 * Diffuse Field (DF) Reference Target Curve.
 * Simulates sound arriving from all angles simultaneously in an ideal reverberant acoustic space.
 */
export const DIFFUSE_FIELD: TargetCurveDefinition = {
  id: 'diffuse_field',
  name: 'Diffuse Field (DF)',
  description: 'Classic acoustic room reverberation target curve.',
  sourceRig: 'IEC 60318-4 (711) Coupler',
  points: [
    { freq: 20, spl: -1.0 },
    { freq: 100, spl: -0.5 },
    { freq: 500, spl: 0.0 },
    { freq: 1000, spl: 0.0 },
    { freq: 2000, spl: 5.0 },
    { freq: 3000, spl: 11.5 },
    { freq: 4000, spl: 8.0 },
    { freq: 6000, spl: 3.0 },
    { freq: 8000, spl: 6.0 },
    { freq: 10000, spl: 3.0 },
    { freq: 15000, spl: -2.0 },
    { freq: 20000, spl: -6.0 },
  ],
};

export const TARGET_CURVES: Record<TargetCurveType, TargetCurveDefinition> = {
  harman_ie_2019: HARMAN_IE_2019,
  ief_neutral_2023: IEF_NEUTRAL_2023,
  diffuse_field: DIFFUSE_FIELD,
};

/**
 * Log-linear interpolation of target SPL value at any frequency (20 - 20,000 Hz).
 */
export function getTargetSplAtFreq(curveType: TargetCurveType, freq: number): number {
  const curve = TARGET_CURVES[curveType] || HARMAN_IE_2019;
  const points = curve.points;

  if (freq <= points[0].freq) return points[0].spl;
  if (freq >= points[points.length - 1].freq) return points[points.length - 1].spl;

  // Find bounding frequency points
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    if (freq >= p1.freq && freq <= p2.freq) {
      const logF1 = Math.log10(p1.freq);
      const logF2 = Math.log10(p2.freq);
      const logF = Math.log10(freq);
      const ratio = (logF - logF1) / (logF2 - logF1);
      return p1.spl + ratio * (p2.spl - p1.spl);
    }
  }

  return 0.0;
}

