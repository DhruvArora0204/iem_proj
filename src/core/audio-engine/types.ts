import type { BiquadFilterConfig } from '../types/audio';

export type PlaybackStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'stopped';

export type TestTrackType =
  | 'pink_noise'
  | 'sine_sweep'
  | 'reference_tone'
  | 'acoustic_sample';

export interface AudioTestTrack {
  id: string;
  title: string;
  category: TestTrackType;
  durationSec: number;
  description: string;
}

export interface EngineMetrics {
  playbackStatus: PlaybackStatus;
  currentPositionSec: number;
  durationSec: number;
  peakOutputL: number; // Linear 0.0 to 1.0+
  peakOutputR: number; // Linear 0.0 to 1.0+
  isClipping: boolean;
  preampDb: number;
  isBypassed: boolean;
  sampleRate: number;
}

export interface IAudioEngine {
  initialize(): Promise<void>;
  loadTestTrack(track: AudioTestTrack): Promise<void>;
  play(): Promise<void>;
  pause(): Promise<void>;
  stop(): Promise<void>;
  seek(positionSec: number): Promise<void>;
  setPreamp(gainDb: number): void;
  updateFilters(filters: BiquadFilterConfig[]): void;
  setBypass(bypass: boolean): void;
  getMetrics(): EngineMetrics;
  subscribeMetrics(listener: (metrics: EngineMetrics) => void): () => void;
  destroy(): Promise<void>;
}
