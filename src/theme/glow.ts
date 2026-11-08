import { ViewStyle } from 'react-native';

export const glows = {
  primarySm: {
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  } satisfies ViewStyle,

  primaryLg: {
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 8,
  } satisfies ViewStyle,

  cyanSm: {
    shadowColor: '#06B6D4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  } satisfies ViewStyle,

  subtleBorder: {
    borderWidth: 1,
    borderColor: '#292438',
  } satisfies ViewStyle,

  activeNeonBorder: {
    borderWidth: 1,
    borderColor: '#A855F7',
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 3,
  } satisfies ViewStyle,
};

