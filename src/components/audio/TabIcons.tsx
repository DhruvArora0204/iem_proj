import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

interface IconProps {
  color?: string | any;
  size?: number;
}

export const HomeIcon: React.FC<IconProps> = ({ color = '#A855F7', size = 22 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 10.5L12 3L21 10.5V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V10.5Z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9 21V12H15V21"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const EqualizerIcon: React.FC<IconProps> = ({ color = '#A855F7', size = 22 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 21V14" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Path d="M4 10V3" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Circle cx="4" cy="12" r="2.5" stroke={color} strokeWidth={2} />
    <Path d="M12 21V12" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Path d="M12 8V3" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Circle cx="12" cy="10" r="2.5" stroke={color} strokeWidth={2} />
    <Path d="M20 21V16" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Path d="M20 12V3" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Circle cx="20" cy="14" r="2.5" stroke={color} strokeWidth={2} />
  </Svg>
);

export const DiscoverIcon: React.FC<IconProps> = ({ color = '#A855F7', size = 22 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={2} />
    <Path
      d="M14.5 9.5L9.5 14.5L10.5 10.5L14.5 9.5Z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinejoin="round"
    />
    <Path
      d="M16.24 7.76L13.41 13.41L7.76 16.24L10.59 10.59L16.24 7.76Z"
      stroke={color}
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const MyAudioIcon: React.FC<IconProps> = ({ color = '#A855F7', size = 22 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 14C4 9.58172 7.58172 6 12 6C16.4183 6 20 9.58172 20 14"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
    <Rect
      x="3"
      y="13"
      width="4"
      height="7"
      rx="2"
      stroke={color}
      strokeWidth={2}
    />
    <Rect
      x="17"
      y="13"
      width="4"
      height="7"
      rx="2"
      stroke={color}
      strokeWidth={2}
    />
  </Svg>
);
