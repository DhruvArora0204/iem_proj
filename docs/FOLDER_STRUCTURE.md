# Audiophile Folder Structure & Architecture Layout

```
audiophile/
├── .env.example                     # Environment configuration template
├── .gitignore                       # Git ignore definitions
├── app.json                         # Expo configuration (plugins, bundleId, splash)
├── babel.config.js                  # Reanimated plugin configuration
├── package.json                     # NPM dependencies and scripts
├── tsconfig.json                    # Strict TypeScript configuration
│
├── docs/                            # Architectural documentation & specifications
│   ├── ARCHITECTURE.md              # System design, DSP specs, Android limitations
│   ├── DATA_MODELS.md               # PostgreSQL + SQLite schemas, RLS, ER diagram
│   ├── FOLDER_STRUCTURE.md          # File & folder structure (this file)
│   └── ROADMAP.md                   # Phased engineering roadmap
│
├── src/                             # Core TypeScript application source
│   ├── app/                         # Expo Router (file-based navigation)
│   │   ├── _layout.tsx              # Root app layout (Providers, Fonts, Theme)
│   │   ├── (tabs)/                  # Main bottom-tab destinations
│   │   │   ├── _layout.tsx          # Custom tab bar with glowing neon accents
│   │   │   ├── index.tsx            # Home: active IEM, quick EQ scenario, stats
│   │   │   ├── equalizer.tsx        # Equalizer: Interactive FR graph, knobs, PEQ
│   │   │   ├── discover.tsx         # Discover: Curated & community presets
│   │   │   └── my-audio.tsx         # My Audio: IEM library, saved presets, settings
│   │   ├── iem/
│   │   │   └── [id].tsx             # IEM detail view (specs, FR curve, recommendations)
│   │   ├── profile/
│   │   │   ├── [id].tsx             # Profile details, filter inspector & clone
│   │   │   └── new.tsx              # Create / Export custom profile
│   │   ├── player/
│   │   │   └── modal.tsx            # Audio playback test bench modal
│   │   └── +not-found.tsx           # 404 fallback
│   │
│   ├── core/                        # DSP & Audio Signal Processing
│   │   ├── dsp/
│   │   │   ├── biquad.ts            # RBJ Audio EQ Cookbook coefficient calculation
│   │   │   ├── cascade.ts           # Multi-band biquad cascade evaluator
│   │   │   ├── headroom.ts          # Auto-preamp and peak headroom calculator
│   │   │   ├── limiter.ts           # Soft-knee output protection limiter
│   │   │   ├── smoothing.ts         # Parameter de-zippering / ramp interpolation
│   │   │   └── crossfeed.ts         # Haas effect / stereo soundstage crossfeed
│   │   └── audio-engine/
│   │       ├── types.ts             # Audio engine interfaces and state types
│   │       ├── AudioEngine.ts       # Unified audio engine facade
│   │       ├── InAppAudioPlayer.ts  # In-app audio player implementation
│   │       └── NativeAudioBridge.ts # Platform bridge to Android audiofx/Oboe
│   │
│   ├── components/                  # Reusable UI component library
│   │   ├── common/                  # Primitives
│   │   │   ├── Button.tsx           # Glowing futuristic button
│   │   │   ├── Card.tsx             # Dark obsidian card with subtle borders
│   │   │   ├── Badge.tsx            # Category & verification tags
│   │   │   ├── Input.tsx            # Form inputs
│   │   │   └── Modal.tsx            # Dialog & bottom sheet wrapper
│   │   ├── audio/                   # Audio-specific interactive components
│   │   │   ├── RotaryKnob.tsx       # Gesture-based smooth rotary dial
│   │   │   ├── FrequencyResponseGraph.tsx # Skia-rendered curve + interactive nodes
│   │   │   ├── FilterBandItem.tsx   # Per-filter frequency/gain/Q controller
│   │   │   ├── PreampSlider.tsx     # Headroom & preamp gain slider
│   │   │   ├── AudioVisualizer.tsx  # Real-time FFT / spectrum analyzer
│   │   │   └── LevelMeter.tsx       # Peak/RMS output meter with clipping alert
│   │   └── layout/                  # Headers, safe area wrappers, tab bars
│   │       ├── Header.tsx           # App brand header with status badge
│   │       └── ScreenContainer.tsx  # Dark theme container with ambient glow
│   │
│   ├── features/                    # Feature-specific components and logic
│   │   ├── equalizer/               # EQ studio hooks, macro-knob controllers
│   │   │   ├── hooks/useEqualizer.ts
│   │   │   ├── components/MacroKnobsGrid.tsx
│   │   │   └── components/FilterList.tsx
│   │   ├── iem/                     # IEM selector, library card, search
│   │   │   ├── components/IEMCard.tsx
│   │   │   ├── components/IEMPickerModal.tsx
│   │   │   └── hooks/useIEMLibrary.ts
│   │   ├── presets/                 # Preset cards, scenario quick-switcher
│   │   │   ├── components/ScenarioChips.tsx
│   │   │   └── components/ProfileCard.tsx
│   │   └── devices/                 # Device detection and capability monitor
│   │       ├── hooks/useAudioRoute.ts
│   │       └── components/DeviceStatusPill.tsx
│   │
│   ├── services/                    # Data access, network, and storage
│   │   ├── supabase/                # Cloud backend
│   │   │   ├── client.ts            # Supabase client singleton
│   │   │   └── queries/             # IEMs, Profiles, Ratings API
│   │   ├── local-db/                # Offline SQLite database
│   │   │   ├── sqlite.ts            # SQLite connection and migration runner
│   │   │   ├── iemRepo.ts           # Local IEM queries
│   │   │   └── profileRepo.ts       # Local profile queries
│   │   └── sync/                    # Offline-first synchronization engine
│   │       └── syncManager.ts       # Upstream/downstream delta sync
│   │
│   ├── store/                       # Runtime global application state (Zustand)
│   │   ├── useAudioStore.ts         # Active IEM, active profile, filters state
│   │   ├── useDeviceStore.ts        # Detected audio route, DAC/Bluetooth status
│   │   └── useUserStore.ts          # Auth session, user preferences
│   │
│   ├── theme/                       # Futuristic Audio Lab Design System
│   │   ├── colors.ts                # Palette constants (Void, Obsidian, Neons)
│   │   ├── typography.ts            # Font families, sizes, line heights
│   │   ├── spacing.ts               # 4px/8px grid scale
│   │   ├── glow.ts                  # Skia/Shadow glow presets
│   │   └── index.ts                 # Centralized theme export
│   │
│   └── utils/                       # Mathematical & helper utilities
│       ├── formatting.ts            # Frequency (Hz/kHz), Gain (dB), Q formatting
│       └── validation.ts            # PEQ range validation
│
└── tests/                           # Unit and integration test suites
    ├── dsp/
    │   ├── biquad.test.ts           # Validates RBJ filter response curves
    │   ├── cascade.test.ts          # Validates multi-band gain summation
    │   └── headroom.test.ts         # Validates peak gain & auto-preamp math
    └── store/
        └── useAudioStore.test.ts    # Validates Zustand actions and state transitions
```

