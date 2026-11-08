/**
 * Synthesizes laboratory calibration audio signals in PCM Float32 format.
 * Generates test sine tones, Voss-McCartney pink noise, and logarithmic frequency sweeps.
 */
export class SignalGenerator {
  /**
   * Generates a pure sine tone at target frequency (e.g. 1 kHz reference tone).
   */
  public static generateSineTone(
    frequencyHz: number,
    durationSec: number,
    amplitude = 0.5,
    sampleRate = 48000
  ): Float32Array {
    const totalSamples = Math.floor(durationSec * sampleRate);
    const buffer = new Float32Array(totalSamples);
    const phaseIncrement = (2 * Math.PI * frequencyHz) / sampleRate;

    for (let i = 0; i < totalSamples; i++) {
      buffer[i] = amplitude * Math.sin(i * phaseIncrement);
    }
    return buffer;
  }

  /**
   * Generates true 1/f Pink Noise using the Voss-McCartney algorithm.
   * Ideal for frequency response auditioning and acoustic burn-in.
   */
  public static generatePinkNoise(
    durationSec: number,
    amplitude = 0.4,
    sampleRate = 48000
  ): Float32Array {
    const totalSamples = Math.floor(durationSec * sampleRate);
    const buffer = new Float32Array(totalSamples);

    // 7-stage Voss-McCartney generator
    const numRows = 7;
    const rows = new Float32Array(numRows);
    let runningSum = 0;

    for (let i = 0; i < totalSamples; i++) {
      // Find lowest non-zero bit of sample index to pick row to update
      let k = i & -i;
      let rowIndex = 0;
      while ((k >>= 1) > 0 && rowIndex < numRows - 1) {
        rowIndex++;
      }

      runningSum -= rows[rowIndex];
      const newRandom = Math.random() * 2 - 1;
      rows[rowIndex] = newRandom;
      runningSum += newRandom;

      // Add small white noise component to smooth the highest octave
      const white = Math.random() * 2 - 1;
      const pinkSample = (runningSum + white) / (numRows + 1);

      buffer[i] = amplitude * pinkSample;
    }
    return buffer;
  }

  /**
   * Generates a logarithmic sine sweep from startFreq to endFreq (20 Hz to 20,000 Hz).
   * Allows acoustic sweep verification across the entire audible spectrum.
   */
  public static generateLogSweep(
    startFreq = 20,
    endFreq = 20000,
    durationSec = 5,
    amplitude = 0.4,
    sampleRate = 48000
  ): Float32Array {
    const totalSamples = Math.floor(durationSec * sampleRate);
    const buffer = new Float32Array(totalSamples);
    const w1 = 2 * Math.PI * startFreq;
    const w2 = 2 * Math.PI * endFreq;
    const T = durationSec;

    for (let i = 0; i < totalSamples; i++) {
      const t = i / sampleRate;
      // Instantaneous phase for logarithmic sweep: phi(t) = w1 * T / ln(w2/w1) * ( (w2/w1)^(t/T) - 1 )
      const phase = (w1 * T / Math.log(w2 / w1)) * (Math.pow(w2 / w1, t / T) - 1);
      buffer[i] = amplitude * Math.sin(phase);
    }
    return buffer;
  }

  /**
   * Encodes stereo Float32Array buffers into a standard RIFF/WAV Uint8Array byte stream.
   * Can be encoded to a Base64 data:audio/wav URL for playback on any platform.
   */
  public static encodeWav(
    left: Float32Array,
    right: Float32Array,
    sampleRate = 48000
  ): Uint8Array {
    const numChannels = 2;
    const bitsPerSample = 16;
    const bytesPerSample = bitsPerSample / 8;
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const numSamples = left.length;
    const dataSize = numSamples * blockAlign;
    const headerSize = 44;
    const totalSize = headerSize + dataSize;

    const buffer = new ArrayBuffer(totalSize);
    const view = new DataView(buffer);

    // RIFF chunk descriptor
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, totalSize - 8, true);
    this.writeString(view, 8, 'WAVE');

    // "fmt " sub-chunk
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);          // SubChunk1Size (16 for PCM)
    view.setUint16(20, 1, true);           // AudioFormat (1 = PCM)
    view.setUint16(22, numChannels, true); // NumChannels
    view.setUint32(24, sampleRate, true);  // SampleRate
    view.setUint32(28, byteRate, true);    // ByteRate
    view.setUint16(32, blockAlign, true);  // BlockAlign
    view.setUint16(34, bitsPerSample, true);

    // "data" sub-chunk
    this.writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    // Write 16-bit PCM interleaved samples
    let offset = 44;
    for (let i = 0; i < numSamples; i++) {
      // Clamp to [-1.0, 1.0]
      const sL = Math.max(-1, Math.min(1, left[i]));
      const sR = Math.max(-1, Math.min(1, right[i]));

      const intL = sL < 0 ? sL * 0x8000 : sL * 0x7fff;
      const intR = sR < 0 ? sR * 0x8000 : sR * 0x7fff;

      view.setInt16(offset, intL, true);
      view.setInt16(offset + 2, intR, true);
      offset += 4;
    }

    return new Uint8Array(buffer);
  }

  private static writeString(view: DataView, offset: number, string: string): void {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  /**
   * Helper to convert Uint8Array into a data:audio/wav;base64 URI.
   */
  public static toBase64WavDataUri(wavBytes: Uint8Array): string {
    let binary = '';
    const len = wavBytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(wavBytes[i]);
    }
    // Cross-platform base64 encoding
    const base64 = typeof btoa === 'function' ? btoa(binary) : Buffer.from(wavBytes).toString('base64');
    return `data:audio/wav;base64,${base64}`;
  }
}
