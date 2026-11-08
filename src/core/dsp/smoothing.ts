/**
 * Slew-rate parameter smoother (de-zippering) that linearly ramps values
 * toward target parameters over a given smoothing window (in samples).
 * Prevents zipper noise and DC clicks during real-time rotary knob adjustments.
 */
export class ParameterSmoother {
  private currentValue: number;
  private targetValue: number;
  private step: number;
  private remainingSteps: number;

  constructor(initialValue: number) {
    this.currentValue = initialValue;
    this.targetValue = initialValue;
    this.step = 0;
    this.remainingSteps = 0;
  }

  /**
   * Sets a new target value to ramp toward over smoothSamples.
   */
  public setTarget(target: number, smoothSamples = 480): void {
    this.targetValue = target;
    const diff = target - this.currentValue;

    if (Math.abs(diff) < 1e-5 || smoothSamples <= 1) {
      this.currentValue = target;
      this.step = 0;
      this.remainingSteps = 0;
      return;
    }

    this.remainingSteps = smoothSamples;
    this.step = diff / smoothSamples;
  }

  /**
   * Advances the smoother by one sample and returns the interpolated value.
   */
  public next(): number {
    if (this.remainingSteps > 0) {
      this.currentValue += this.step;
      this.remainingSteps--;
      if (this.remainingSteps === 0) {
        this.currentValue = this.targetValue;
      }
    }
    return this.currentValue;
  }

  public getCurrent(): number {
    return this.currentValue;
  }

  public isSmoothing(): boolean {
    return this.remainingSteps > 0;
  }
}

