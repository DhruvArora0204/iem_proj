import { create } from 'zustand';
import type {
  BiquadFilterConfig,
  EQProfile,
  IEMModel,
  MacroKnobsState,
  ScenarioType,
} from '../core/types/audio';

export const DEFAULT_FILTERS: BiquadFilterConfig[] = [
  { id: '1', type: 'low_shelf', frequency: 105, gain: 0.0, q: 0.71, enabled: true },
  { id: '2', type: 'peak', frequency: 250, gain: 0.0, q: 1.0, enabled: true },
  { id: '3', type: 'peak', frequency: 1000, gain: 0.0, q: 1.0, enabled: true },
  { id: '4', type: 'peak', frequency: 3000, gain: 0.0, q: 1.4, enabled: true },
  { id: '5', type: 'peak', frequency: 6000, gain: 0.0, q: 2.0, enabled: true },
  { id: '6', type: 'high_shelf', frequency: 10000, gain: 0.0, q: 0.71, enabled: true },
];

export const DEFAULT_MACRO_KNOBS: MacroKnobsState = {
  bass: 0,
  midrange: 0,
  treble: 0,
  clarity: 0,
  warmth: 0,
  vocalPresence: 0,
  soundstage: 0,
};

export const DEFAULT_IEM: IEMModel = {
  id: 'iem-default-1',
  manufacturerName: 'Moondrop',
  name: 'Blessing 3',
  driverType: '2DD + 4BA Hybrid',
  driverCount: 6,
  impedanceOhms: 14.8,
  sensitivityDbMw: 120.0,
  releaseYear: 2023,
  description: 'Dual dynamic driver + quad balanced armature hybrid benchmark with exceptional clarity.',
  isSavedToLibrary: true,
};

export const DEFAULT_PROFILE: EQProfile = {
  id: 'profile-default-1',
  iemId: 'iem-default-1',
  iemName: 'Moondrop Blessing 3',
  name: 'Harman 2019v2 Target Compensated',
  description: 'Precision PEQ tuning compensating Blessing 3 to the acoustic Harman IE 2019 reference curve.',
  profileType: 'measurement_derived',
  scenario: 'music_balanced',
  targetCurve: 'Harman In-Ear 2019v2',
  sourceAttribution: 'Standard 711 Coupler (IEC 60318-4)',
  preampDb: -2.5,
  isPublic: true,
  isVerified: true,
  upvotesCount: 342,
  filters: [
    { id: 'f1', type: 'low_shelf', frequency: 105, gain: 3.5, q: 0.71, enabled: true },
    { id: 'f2', type: 'peak', frequency: 220, gain: -1.2, q: 1.2, enabled: true },
    { id: 'f3', type: 'peak', frequency: 1250, gain: 0.8, q: 1.5, enabled: true },
    { id: 'f4', type: 'peak', frequency: 2800, gain: -1.5, q: 2.0, enabled: true },
    { id: 'f5', type: 'peak', frequency: 5800, gain: -2.2, q: 2.5, enabled: true },
    { id: 'f6', type: 'high_shelf', frequency: 10500, gain: 1.0, q: 0.71, enabled: true },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export interface AudioStoreState {
  activeIEM: IEMModel;
  activeProfile: EQProfile;
  filters: BiquadFilterConfig[];
  preampDb: number;
  isAutoPreampEnabled: boolean;
  isBypassed: boolean;
  activeScenario: ScenarioType;
  macroKnobs: MacroKnobsState;

  // Actions
  setActiveIEM: (iem: IEMModel) => void;
  setActiveProfile: (profile: EQProfile) => void;
  setFilters: (filters: BiquadFilterConfig[]) => void;
  updateFilter: (id: string, updates: Partial<BiquadFilterConfig>) => void;
  toggleFilter: (id: string) => void;
  addFilter: (filter: BiquadFilterConfig) => void;
  removeFilter: (id: string) => void;
  setPreamp: (db: number) => void;
  setAutoPreamp: (enabled: boolean) => void;
  toggleBypass: () => void;
  setScenario: (scenario: ScenarioType) => void;
  setMacroKnob: (knob: keyof MacroKnobsState, value: number) => void;
  resetMacroKnobs: () => void;
  resetToFlat: () => void;
}

export const useAudioStore = create<AudioStoreState>((set) => ({
  activeIEM: DEFAULT_IEM,
  activeProfile: DEFAULT_PROFILE,
  filters: DEFAULT_PROFILE.filters,
  preampDb: DEFAULT_PROFILE.preampDb,
  isAutoPreampEnabled: true,
  isBypassed: false,
  activeScenario: 'music_balanced',
  macroKnobs: DEFAULT_MACRO_KNOBS,

  setActiveIEM: (iem) => set({ activeIEM: iem }),

  setActiveProfile: (profile) =>
    set({
      activeProfile: profile,
      filters: profile.filters,
      preampDb: profile.preampDb,
      activeScenario: profile.scenario,
    }),

  setFilters: (filters) => set({ filters }),

  updateFilter: (id, updates) =>
    set((state) => ({
      filters: state.filters.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    })),

  toggleFilter: (id) =>
    set((state) => ({
      filters: state.filters.map((f) =>
        f.id === id ? { ...f, enabled: !f.enabled } : f
      ),
    })),

  addFilter: (filter) =>
    set((state) => ({
      filters: [...state.filters, filter],
    })),

  removeFilter: (id) =>
    set((state) => ({
      filters: state.filters.filter((f) => f.id !== id),
    })),

  setPreamp: (db) => set({ preampDb: Math.min(6.0, Math.max(-24.0, db)) }),

  setAutoPreamp: (enabled) => set({ isAutoPreampEnabled: enabled }),

  toggleBypass: () => set((state) => ({ isBypassed: !state.isBypassed })),

  setScenario: (scenario) => set({ activeScenario: scenario }),

  setMacroKnob: (knob, value) =>
    set((state) => ({
      macroKnobs: {
        ...state.macroKnobs,
        [knob]: value,
      },
    })),

  resetMacroKnobs: () => set({ macroKnobs: DEFAULT_MACRO_KNOBS }),

  resetToFlat: () =>
    set({
      filters: DEFAULT_FILTERS,
      preampDb: 0.0,
      macroKnobs: DEFAULT_MACRO_KNOBS,
    }),
}));
