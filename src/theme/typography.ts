export const typography = {
  fontSizes: {
    xs: 11,
    sm: 13,
    md: 15,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    display: 32,
    hero: 40,
  },
  lineHeights: {
    xs: 15,
    sm: 18,
    md: 22,
    base: 24,
    lg: 26,
    xl: 28,
    xxl: 32,
    display: 40,
    hero: 48,
  },
  fontWeights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1.2,
    widest: 2.0, // Used for audio lab titles and category labels
  },
} as const;
