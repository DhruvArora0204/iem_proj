export type FilterType =
  | 'peak'
  | 'low_shelf'
  | 'high_shelf'
  | 'low_pass'
  | 'high_pass'
  | 'notch';

export interface BiquadFilterConfig {
  id: string;
  type: FilterType;
  frequency: number;  // 20 Hz - 20,000 Hz
  gain: number;       // -24.0 dB to +24.0 dB
  q: number;          // 0.1 to 20.0
  enabled: boolean;
}

export interface MacroKnobsState {
  bass: number;          // -10.0 to +10.0
  midrange: number;      // -10.0 to +10.0
  treble: number;        // -10.0 to +10.0
  clarity: number;       // -10.0 to +10.0
  warmth: number;        // -10.0 to +10.0
  vocalPresence: number; // -10.0 to +10.0
  soundstage: number;    // 0.0 to 10.0 (Stereo Crossfeed depth)
}

export type ProfileCategory =
  | 'curated'
  | 'measurement_derived'
  | 'community'
  | 'user_custom';

export type ScenarioType =
  | 'music_balanced'
  | 'music_bass'
  | 'music_vocal'
  | 'music_classical'
  | 'gaming_fps'
  | 'movie_cinema'
  | 'podcast_speech'
  | 'custom';

export interface IEMModel {
  id: string;
  manufacturerName: string;
  name: string;
  driverType: string; // e.g. '1DD + 2BA', 'Planar Magnetic', 'Single Dynamic'
  driverCount: number;
  impedanceOhms: number;
  sensitivityDbMw: number;
  releaseYear?: number;
  description?: string;
  imageUrl?: string;
  isSavedToLibrary?: boolean;
}

export interface EQProfile {
  id: string;
  iemId?: string;
  iemName?: string;
  creatorId?: string;
  creatorName?: string;
  name: string;
  description?: string;
  profileType: ProfileCategory;
  scenario: ScenarioType;
  targetCurve?: string;
  sourceAttribution?: string;
  preampDb: number;
  isPublic: boolean;
  isVerified: boolean;
  upvotesCount: number;
  filters: BiquadFilterConfig[];
  createdAt: string;
  updatedAt: string;
}

export type AudioRouteType =
  | 'builtin_speaker'
  | 'wired_headphone'
  | 'bluetooth_a2dp'
  | 'usb_dac';

export interface ConnectedDeviceState {
  routeType: AudioRouteType;
  deviceName: string;
  codec?: string; // e.g. 'LDAC (990 kbps)', 'aptX HD', 'AAC', 'UAC2 32-bit/384kHz'
  isExternalDAC: boolean;
  sampleRate: number;
}

