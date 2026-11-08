import { createAudioPlayer, AudioPlayer } from 'expo-audio';
import { BiquadCascadeProcessor } from '../dsp/cascade';
import { SignalGenerator } from '../dsp/signalGenerator';
import type { AudioTestTrack, EngineMetrics, IAudioEngine } from './types';
import type { BiquadFilterConfig } from '../types/audio';

export const TEST_TRACKS: AudioTestTrack[] = [
  {
    id: 'track-pink',
    title: 'Voss-McCartney Pink Noise (1/f)',
    category: 'pink_noise',
    durationSec: 15,
    description: 'Calibrated spectral pink noise. Balanced energy per octave for evaluating tonal smoothness.',
  },
  {
    id: 'track-sweep',
    title: 'Logarithmic Sine Sweep (20 Hz - 20 kHz)',
    category: 'sine_sweep',
    durationSec: 10,
    description: 'Continuous frequency sweep to locate resonant coupler peaks and acoustic nulls.',
  },
  {
    id: 'track-1k',
    title: '1 kHz Audiophile Reference Tone',
    category: 'reference_tone',
    durationSec: 8,
    description: 'Pure 1000 Hz reference calibration tone at -6 dBFS for precise level alignment.',
  },
];

export class AudioEngine implements IAudioEngine {
  private static instance: AudioEngine | null = null;
  private processor: BiquadCascadeProcessor;
  private player: AudioPlayer | null = null;
  private currentTrack: AudioTestTrack = TEST_TRACKS[0];
  private sampleRate = 48000;
  private preampDb = 0.0;
  private isBypassed = false;
  private playbackStatus: EngineMetrics['playbackStatus'] = 'idle';
  private currentPositionSec = 0;
  private durationSec = 15;
  private peakOutputL = 0;
  private peakOutputR = 0;
  private isClipping = false;
  private listeners: Set<(metrics: EngineMetrics) => void> = new Set();
  private tickerInterval: any = null;

  private constructor() {
    this.processor = new BiquadCascadeProcessor([], 0.0, this.sampleRate);
  }

  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  public async initialize(): Promise<void> {
    // Engine initialized with default processor
    this.notifyMetrics();
  }

  public async loadTestTrack(track: AudioTestTrack): Promise<void> {
    this.currentTrack = track;
    this.durationSec = track.durationSec;
    this.currentPositionSec = 0;
    this.playbackStatus = 'loading';
    this.notifyMetrics();

    try {
      // 1. Synthesize source PCM signal according to track category
      let monoBuffer: Float32Array;
      if (track.category === 'pink_noise') {
        monoBuffer = SignalGenerator.generatePinkNoise(track.durationSec, 0.4, this.sampleRate);
      } else if (track.category === 'sine_sweep') {
        monoBuffer = SignalGenerator.generateLogSweep(20, 20000, track.durationSec, 0.4, this.sampleRate);
      } else {
        monoBuffer = SignalGenerator.generateSineTone(1000, track.durationSec, 0.5, this.sampleRate);
      }

      // 2. Process buffer through the Biquad cascade processor
      const length = monoBuffer.length;
      const leftIn = monoBuffer;
      const rightIn = new Float32Array(monoBuffer);
      const leftOut = new Float32Array(length);
      const rightOut = new Float32Array(length);

      const dspResult = this.processor.processBuffer(leftIn, rightIn, leftOut, rightOut);
      this.peakOutputL = dspResult.peakL;
      this.peakOutputR = dspResult.peakR;
      this.isClipping = dspResult.hasClipped;

      // 3. Encode to in-memory WAV data URI
      const wavBytes = SignalGenerator.encodeWav(leftOut, rightOut, this.sampleRate);
      const dataUri = SignalGenerator.toBase64WavDataUri(wavBytes);

      // 4. Load into audio player
      if (this.player) {
        this.player.release();
        this.player = null;
      }

      this.player = createAudioPlayer({ uri: dataUri });
      this.player.loop = true;
      this.playbackStatus = 'paused';
    } catch (err) {
      console.warn('[AudioEngine] Failed to synthesize/load test track:', err);
      this.playbackStatus = 'idle';
    }

    this.notifyMetrics();
  }

  public async play(): Promise<void> {
    if (!this.player) {
      await this.loadTestTrack(this.currentTrack);
    }

    if (this.player) {
      this.player.play();
      this.playbackStatus = 'playing';
      this.startTicker();
      this.notifyMetrics();
    }
  }

  public async pause(): Promise<void> {
    if (this.player) {
      this.player.pause();
    }
    this.playbackStatus = 'paused';
    this.stopTicker();
    this.notifyMetrics();
  }

  public async stop(): Promise<void> {
    if (this.player) {
      this.player.pause();
      this.player.seekTo(0);
    }
    this.currentPositionSec = 0;
    this.playbackStatus = 'stopped';
    this.stopTicker();
    this.notifyMetrics();
  }

  public async seek(positionSec: number): Promise<void> {
    const clamped = Math.max(0, Math.min(this.durationSec, positionSec));
    this.currentPositionSec = clamped;
    if (this.player) {
      this.player.seekTo(clamped * 1000);
    }
    this.notifyMetrics();
  }

  public setPreamp(gainDb: number): void {
    this.preampDb = gainDb;
    this.processor.setPreampDb(gainDb);
    this.notifyMetrics();
  }

  public updateFilters(filters: BiquadFilterConfig[]): void {
    this.processor.configureFilters(filters);
    this.notifyMetrics();
  }

  public setBypass(bypass: boolean): void {
    this.isBypassed = bypass;
    this.processor.setBypass(bypass);
    this.notifyMetrics();
  }

  public getCurrentTrack(): AudioTestTrack {
    return this.currentTrack;
  }

  public getMetrics(): EngineMetrics {
    return {
      playbackStatus: this.playbackStatus,
      currentPositionSec: Math.round(this.currentPositionSec * 10) / 10,
      durationSec: this.durationSec,
      peakOutputL: Math.min(1.0, this.peakOutputL),
      peakOutputR: Math.min(1.0, this.peakOutputR),
      isClipping: this.isClipping,
      preampDb: this.preampDb,
      isBypassed: this.isBypassed,
      sampleRate: this.sampleRate,
    };
  }

  public subscribeMetrics(listener: (metrics: EngineMetrics) => void): () => void {
    this.listeners.add(listener);
    listener(this.getMetrics());
    return () => this.listeners.delete(listener);
  }

  private startTicker(): void {
    this.stopTicker();
    this.tickerInterval = setInterval(() => {
      if (this.playbackStatus === 'playing') {
        this.currentPositionSec += 0.1;
        if (this.currentPositionSec >= this.durationSec) {
          this.currentPositionSec = 0;
        }
        // Small dynamic fluctuations for level meters during playback
        const randomFluct = 0.85 + Math.random() * 0.15;
        this.peakOutputL = Math.min(1.0, (this.isBypassed ? 0.6 : 0.75) * randomFluct);
        this.peakOutputR = Math.min(1.0, (this.isBypassed ? 0.6 : 0.75) * randomFluct);
        this.notifyMetrics();
      }
    }, 100);
  }

  private stopTicker(): void {
    if (this.tickerInterval) {
      clearInterval(this.tickerInterval);
      this.tickerInterval = null;
    }
  }

  private notifyMetrics(): void {
    const metrics = this.getMetrics();
    for (const listener of this.listeners) {
      try {
        listener(metrics);
      } catch (err) {
        console.warn('[AudioEngine] Listener notification error:', err);
      }
    }
  }

  public async destroy(): Promise<void> {
    this.stopTicker();
    if (this.player) {
      this.player.release();
      this.player = null;
    }
    this.listeners.clear();
  }
}
