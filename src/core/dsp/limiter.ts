/**
 * Soft-knee peak output limiter for output protection and digital clipping prevention.
 * Uses a smooth non-linear saturation curve that eliminates harsh square-wave clipping
 * if unexpected transients exceed 0 dBFS.
 */
export class SoftKneeLimiter {
  private readonly threshold: number; // e.g. -0.5 dBFS (~0.944 linear)
  private readonly ceiling: number;   // e.g. -0.05 dBFS (~0.994 linear)

  constructor(thresholdDb = -0.5, ceilingDb = -0.05) {
    this.threshold = Math.pow(10, thresholdDb / 20);
    this.ceiling = Math.pow(10, ceilingDb / 20);
  }

  /**
   * Applies soft-knee limiting to a single floating-point sample in [-1.0, 1.0] range.
   */
  public processSample(x: number): number {
    const absX = Math.abs(x);

    // Below threshold: completely linear & bit-transparent
    if (absX <= this.threshold) {
      return x;
    }

    const sign = x < 0 ? -1 : 1;
    const over = absX - this.threshold;
    const range = this.ceiling - this.threshold;

    // Smooth cubic polynomial soft-knee curve
    const normalizedOver = over / (range + 1e-6);
    const compressedOver = range * Math.tanh(normalizedOver);

    const limited = this.threshold + compressedOver;
    return sign * Math.min(this.ceiling, limited);
  }

  /**
   * Processes a stereo frame [L, R] through the limiter.
   */
  public processFrame(left: number, right: number): [number, number] {
    return [this.processSample(left), this.processSample(right)];
  }
}
