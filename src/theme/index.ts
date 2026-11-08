import { colors } from './colors';
import { typography } from './typography';
import { spacing, borderRadius } from './spacing';
import { glows } from './glow';

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  glows,
};

export type Theme = typeof theme;
export { colors, typography, spacing, borderRadius, glows };

