# Audiophile — Intelligent IEM Tuning & Personal Audio Optimization Platform

Audiophile is a premium, Android-first audio companion designed for audiophiles, music enthusiasts, and In-Ear Monitor (IEM) users. It delivers intelligent acoustic optimization, parametric equalization (PEQ), and scenario-specific sound profiles without demanding advanced audio engineering knowledge.

---

## Visual Identity: Futuristic Audio Lab

The platform follows a dark-first **Futuristic Audio Lab** aesthetic:
- **Main Background**: `#090810` (OLED Deep Void)
- **Card Background**: `#12101D` (Dark Obsidian)
- **Elevated Surfaces**: `#1B1829` (Chamber Violet)
- **Neon Accents**: `#A855F7` (Primary Purple), `#C084FC` (Light Neon), `#7E22CE` (Deep Arc)
- **Text**: `#F5F3FA` (Crisp Phosphor White), `#A5A0B5` (Muted Metallic Silver)
- **Borders & Dividers**: `#292438` (Subtle Grid Border)

---

## Core Capabilities

1. **Intelligent Device Management**
   - Device detection across Bluetooth audio codecs (LDAC, aptX, AAC, SBC) and connected USB DACs (UAC2).
   - Distinguishes between audio transport (DAC/dongle) and physical acoustic transducer (passive IEM).
   - Personal IEM library with technical specs (driver topologies: DD, Planar, BA, EST, hybrid; impedance; sensitivity).

2. **Precision Parametric Equalizer (PEQ)**
   - Cascaded Biquad filter engine implementing Robert Bristow-Johnson (RBJ) Audio EQ Cookbook coefficients.
   - Filter topologies: Peaking (Bell), Low-Shelf, High-Shelf, High-Pass, Low-Pass, Notch.
   - Interactive Skia-powered frequency response curve with real-time gain/Q draggable nodes.
   - Intelligent auto-preamp and soft-knee peak protection to prevent digital clipping (0 dBFS inter-sample overs).
   - High-level rotary macro-knobs (Bass, Midrange, Treble, Clarity, Warmth, Vocal Presence) mapped to calibrated multi-band offsets.

3. **Curated IEM Database & Recommendation Engine**
   - Verified measurements from standardized couplers (IEC 60318-4 / 711 clone, GRAS 43AG, B&K 5128).
   - Target curves: Harman In-Ear Target (2019v2), IEF Neutral, Diffuse Field.
   - Clear classification: *Curated*, *Measurement-Derived*, *Community-Submitted*, and *User-Created*.

4. **Scenario-Adaptive Profiles**
   - Contextual sound tuning for Music (Balanced, Basshead, Vocal, Classical), Gaming (Footstep localization, pinna cue enhancement), Movies (Dialogue intelligibility), and Podcasts (Vocal isolation).

5. **Offline-First & Cloud-Synchronized Architecture**
   - Local SQLite database for 100% offline functionality.
   - Supabase PostgreSQL with Row Level Security (RLS) for cloud sync, profile sharing, and community ratings.

---

## Architecture Documentation

- [System Architecture & DSP Specifications](docs/ARCHITECTURE.md)
- [Data Models & Schema](docs/DATA_MODELS.md)
- [Folder Structure](docs/FOLDER_STRUCTURE.md)
- [Development Roadmap](docs/ROADMAP.md)

---

## Development Status

- **Current Phase**: **PHASE 0 — Requirements and Architecture** (Complete)
- **Next Phase**: **PHASE 1 — Project Foundation** (Ready to initiate upon approval)

