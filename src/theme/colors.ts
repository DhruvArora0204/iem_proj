export const colors = {
  // Base backgrounds
  background: '#090810',      // Main deep OLED background
  card: '#12101D',            // Card container background
  surfaceElevated: '#1B1829', // Elevated interactive surface
  surfaceHover: '#242036',    // Highlighted surface

  // Neon Purples & Accents
  primary: '#A855F7',         // Primary electric violet
  primaryLight: '#C084FC',    // Light neon purple
  primaryDark: '#7E22CE',     // Deep saturated purple
  accentLavender: '#D8B4FE',  // Soft lavender glow
  accentCyan: '#06B6D4',      // Futuristic secondary accent

  // Typography
  textPrimary: '#F5F3FA',     // High-contrast crisp white/silver
  textSecondary: '#A5A0B5',   // Muted silver-purple text
  textMuted: '#6B6580',       // Low-contrast captions/placeholders

  // Structural Borders & Dividers
  border: '#292438',          // Subtle card border
  borderActive: '#A855F7',    // Focused/active border
  borderGlow: 'rgba(168, 85, 247, 0.4)', // Outer glow border

  // Status & Audio Indicators
  success: '#10B981',         // Verified / Safe headroom
  warning: '#F59E0B',         // Clipping caution (< 0.5 dB headroom)
  danger: '#EF4444',          // Active digital clipping (> 0 dBFS)
  info: '#3B82F6',

  // Audio Graph Curves
  harmanTarget: '#06B6D4',    // Target curve color
  measuredFR: '#A5A0B5',      // Raw measurement curve
  activeEQCurve: '#C084FC',   // Real-time PEQ transfer response
} as const;

export type ColorToken = keyof typeof colors;

