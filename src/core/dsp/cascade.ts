import { BiquadSection } from './biquad';
import { SoftKneeLimiter } from './limiter';
import { ParameterSmoother } from './smoothing';
import type { BiquadFilterConfig } from '../types/audio';

export interface ProcessBufferResult {
  peakL: number;
  peakR: number;
  hasClipped: boolean;
}

/**
 * Cascaded multi-band parametric EQ processor.
 * Routes audio through:
 * Preamp Gain Stage -> Cascaded DF-II Transposed Biquads -> Soft-Knee Limiter -> Output.
 */
export class BiquadCascadeProcessor {
  private sections: { id: string; filter: BiquadSection; enabled: boolean }[] = [];
  private limiter: SoftKneeLimiter;
  private preampSmoother: ParameterSmoother;
  private isBypassed = false;
  private readonly sampleRate: number;

  constructor(filters: BiquadFilterConfig[] = [], preampDb = 0.0, sampleRate = 48000) {
    this.sampleRate = sampleRate;
    this.limiter = new SoftKneeLimiter(-0.5, -0.05);
    const initialLinPreamp = Math.pow(10, preampDb / 20);
    this.preampSmoother = new ParameterSmoother(initialLinPreamp);

    this.configureFilters(filters);
  }

  public configureFilters(filters: BiquadFilterConfig[]): void {
    this.sections = filters.map((f) => ({
      id: f.id,
      filter: new BiquadSection(f, this.sampleRate),
      enabled: f.enabled,
    }));
  }

  public updateSingleFilter(filterConfig: BiquadFilterConfig): void {
    const target = this.sections.find((s) => s.id === filterConfig.id);
    if (target) {
      target.filter.updateCoefficients(filterConfig, this.sampleRate);
      target.enabled = filterConfig.enabled;
    } else {
      this.sections.push({
        id: filterConfig.id,
        filter: new BiquadSection(filterConfig, this.sampleRate),
        enabled: filterConfig.enabled,
      });
    }
  }

  public setPreampDb(preampDb: number, smoothSamples = 480): void {
    const linGain = Math.pow(10, preampDb / 20);
    this.preampSmoother.setTarget(linGain, smoothSamples);
  }

  public setBypass(bypass: boolean): void {
    this.isBypassed = bypass;
  }

  public reset(): void {
    for (const section of this.sections) {
      section.filter.reset();
    }
  }

  /**
   * Processes a buffer of stereo PCM samples.
   * Modifies leftOut and rightOut in-place or writes to new arrays.
   */
  public processBuffer(
    leftIn: Float32Array,
    rightIn: Float32Array,
    leftOut: Float32Array,
    rightOut: Float32Array
  ): ProcessBufferResult {
    const length = leftIn.length;
    let peakL = 0;
    let peakR = 0;
    let hasClipped = false;

    for (let i = 0; i < length; i++) {
      let l = leftIn[i];
      let r = rightIn[i];

      if (!this.isBypassed) {
        // 1. Apply smoothed preamp attenuation
        const linPreamp = this.preampSmoother.next();
        l *= linPreamp;
        r *= linPreamp;

        // 2. Cascade through active biquad stages
        for (const section of this.sections) {
          if (section.enabled) {
            const [outL, outR] = section.filter.processSample(l, r);
            l = outL;
            r = outR;
          }
        }

        // 3. Peak protection soft-knee limiter
        if (Math.abs(l) > 1.0 || Math.abs(r) > 1.0) {
          hasClipped = true;
        }
        [l, r] = this.limiter.processFrame(l, r);
      }

      leftOut[i] = l;
      rightOut[i] = r;

      if (Math.abs(l) > peakL) peakL = Math.abs(l);
      if (Math.abs(r) > peakR) peakR = Math.abs(r);
    }

    return { peakL, peakR, hasClipped };
  }
}
