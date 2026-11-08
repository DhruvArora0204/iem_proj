# Audiophile Engineering Roadmap

This document outlines the phased development roadmap for **Audiophile**. Development is strictly sequential, modular, and requires formal validation and acceptance before moving to subsequent phases.

---

## Phase Status Summary

| Phase | Title | Scope | Status |
|---|---|---|---|
| **Phase 0** | Requirements & Architecture | Architecture, DSP specs, Data Models, Roadmap | **COMPLETE** |
| **Phase 1** | Project Foundation | Expo + TS + Zustand + SQLite + Theme + Router | **COMPLETE** |
| **Phase 2** | UI/UX Development | Futuristic Audio Lab design, Skia FR curve, Knobs | **COMPLETE** |
| **Phase 3** | Equalizer DSP Engine | RBJ Biquad filters, Headroom, In-App Player | **COMPLETE** |
| **Phase 4** | IEM Database & Recommendations | IEM catalog, FR measurements, Target curves | **NEXT** |
| **Phase 5** | Backend & Authentication | Supabase Postgres, RLS, Auth, Offline Sync | Pending |
| **Phase 6** | Community Features | Profile sharing, Ratings, Attribution, Moderation | Pending |
| **Phase 7** | Device Integration | Bluetooth/USB DAC detection, Android routing | Pending |
| **Phase 8** | Adaptive Audio Intelligence | Context-aware tuning, spectral analysis | Future |

---

## Detailed Phase Breakdown

### PHASE 0 — Requirements and Architecture
* **Status**: Complete
* **Objectives**:
  - Define end-to-end architecture and system boundaries.
  - Specify DSP pipeline and RBJ biquad coefficient math.
  - Define PostgreSQL and offline SQLite schemas with RLS policies.
  - Analyze Android platform limitations regarding audio routing and capture.
  - Deliver project folder structure and development roadmap.
* **Deliverables**:
  - `README.md`
  - `docs/ARCHITECTURE.md`
  - `docs/DATA_MODELS.md`
  - `docs/FOLDER_STRUCTURE.md`
  - `docs/ROADMAP.md`

---

### PHASE 1 — Project Foundation
* **Status**: Complete
* **Objectives**:
  - Initialize clean Expo React Native application with TypeScript strict mode.
  - Configure Expo Router with 4 main tab destinations: Home, Equalizer, Discover, My Audio.
  - Establish Futuristic Audio Lab theme system (`colors.ts`, `typography.ts`, `spacing.ts`, `glow.ts`).
  - Configure Zustand global state management with initial audio and device stores.
  - Set up TanStack Query provider and offline SQLite database client.
  - Configure Supabase client foundation and environment variable configuration (`.env.example`).
* **Implementation Tasks**:
  1. Initialize Expo project with TypeScript template.
  2. Install verified dependencies (`expo-router`, `zustand`, `@tanstack/react-query`, `expo-sqlite`, `@supabase/supabase-js`, `react-native-reanimated`, `react-native-gesture-handler`, `react-native-svg`).
  3. Create theme tokens reflecting the OLED dark + neon purple design system.
  4. Create root layout and tab navigation bar with neon indicators.
  5. Implement baseline screen placeholders for all 4 navigation destinations.
  6. Create reusable foundational UI components (`ScreenContainer`, `Header`, `Card`, `Button`, `Badge`).
* **Acceptance Criteria**:
  - Application launches cleanly without errors or warnings.
  - Navigation between all 4 tabs is responsive.
  - TypeScript compilation passes with zero type errors.
  - Theme tokens apply consistently across all screens.
  - Zustand stores initialize and mutate state correctly.

---

### PHASE 2 — UI/UX Development
* **Status**: Complete
* **Objectives**:
  - Build the complete visual frontend following the Futuristic Audio Lab aesthetic.
* **Implementation Tasks**:
  1. Build **Equalizer Screen**:
     - Interactive Frequency Response graph (react-native-skia / SVG).
     - Visual draggable filter nodes displaying Hz, Gain, and Q.
     - Custom tactile rotary knobs for Bass, Midrange, Treble, Clarity, Warmth, Vocal Presence.
     - Per-filter band editor (Type, Frequency, Gain, Q, Bypass toggle).
     - Preamp slider and digital peak meter with clipping indicator.
     - Bypass EQ and A/B comparison toggle.
  2. Build **Home Dashboard**:
     - Active IEM card with driver specs and connection status badge.
     - Quick scenario tuning switcher (Music, Gaming, Movie, Podcast).
     - Active EQ profile summary and one-tap equalizer entry.
  3. Build **Discover Screen**:
     - Curated profiles list with target curve tags (Harman 2019v2, IEF Neutral).
     - IEM-specific recommendation cards with measurement sources.
     - Search and filter bar.
  4. Build **My Audio Screen**:
     - Registered IEM library and active device selection.
     - Custom profiles list, favorites, and recent tuning history.
     - Account status and sync indicator.
  5. Build **IEM Selector & Detail Modals**.
* **Acceptance Criteria**:
  - All UI elements are functional with mock data.
  - Rotary knobs and graph nodes respond smoothly to touch gestures.
  - Zero non-functional placeholder buttons.

---

### PHASE 3 — Equalizer DSP Engine
* **Status**: Complete
* **Objectives**:
  - Implement the core digital signal processing engine.
* **Implementation Tasks**:
  1. Implement RBJ Audio EQ Cookbook biquad formulas in TypeScript/Native DSP.
  2. Implement cascaded multi-band evaluation to compute combined frequency response across 20 Hz - 20 kHz.
  3. Implement auto-preamp headroom calculation to prevent digital clipping.
  4. Implement parameter de-zippering / slew-rate smoothing.
  5. Create in-app audio playback test bench (supporting WAV/FLAC audio files and frequency sweeps).
  6. Add unit test suite validating filter magnitudes against analytical transfer functions.
* **Acceptance Criteria**:
  - Real-time parameter updates produce audible and verified frequency changes.
  - Mathematical frequency response curve exactly matches DSP output.
  - Auto-preamp guarantees signal remains within 0 dBFS.

---

### PHASE 4 — IEM Database and Recommendation Engine
* **Status**: Queued
* **Objectives**:
  - Seed IEM catalog and build recommendation algorithms.
* **Implementation Tasks**:
  1. Construct structured database of top popular IEMs (e.g., Moondrop, Truthear, 7Hz, Sennheiser, Tangzu).
  2. Store standardized frequency response measurements (IEC 60318-4 compliant).
  3. Implement auto-compensation algorithm matching IEM measurements to target curves (Harman, IEF).
  4. Generate scenario-specific presets (FPS footstep focus, cinema dialogue, acoustic intimacy).
  5. Build manual IEM picker with search, filtering by driver type, and specs display.
* **Acceptance Criteria**:
  - Selecting an IEM instantly updates recommended profiles calibrated to that specific model.
  - All recommendations display rig source and target curve attribution.

---

### PHASE 5 — Backend & Authentication
* **Status**: Queued
* **Objectives**:
  - Connect live Supabase PostgreSQL backend with authentication and offline sync.
* **Implementation Tasks**:
  1. Apply PostgreSQL schema migrations and RLS policies.
  2. Implement Supabase Auth (Email & OAuth).
  3. Implement offline SQLite sync engine with automatic conflict resolution.
  4. Persist user IEM ownership, custom profiles, and favorites.
* **Acceptance Criteria**:
  - User can register, authenticate, and manage custom profiles across devices.
  - Full application functions offline, automatically synchronizing changes when reconnected.

---

### PHASE 6 — Community Features
* **Status**: Queued
* **Objectives**:
  - Enable community preset sharing, reviews, and moderation.
* **Implementation Tasks**:
  1. Profile submission workflow with validation and filter limits.
  2. Star ratings and community review threads.
  3. Creator attribution and verified badge system.
  4. Moderation reporting pipeline.
* **Acceptance Criteria**:
  - Users can publish, discover, and rate community presets.
  - Verified status is protected and cannot be self-assigned.

---

### PHASE 7 — Device Integration
* **Status**: Queued
* **Objectives**:
  - Add native audio route detection and investigate system-wide capabilities.
* **Implementation Tasks**:
  1. Detect connected Bluetooth devices and active audio codecs.
  2. Detect connected USB DACs via Android USB host APIs.
  3. Map audio routes to registered IEM profiles.
  4. Android audiofx / `DynamicsProcessing` integration analysis and capability reporting.
* **Acceptance Criteria**:
  - App accurately identifies connected DACs/Bluetooth devices.
  - Unsupported system-wide scenarios are communicated transparently.

---

### PHASE 8 — Adaptive Audio Intelligence (Future Horizon)
* **Status**: Future
* **Objectives**:
  - Explore activity detection, music genre classification, and dynamic acoustic adaptation within Android platform constraints.

