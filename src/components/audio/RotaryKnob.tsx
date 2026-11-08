import React, { useRef, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';

interface RotaryKnobProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  size?: number;
  color?: string;
  onChange: (val: number) => void;
  onReset?: () => void;
}

export const RotaryKnob: React.FC<RotaryKnobProps> = ({
  label,
  value,
  min = -10,
  max = 10,
  step = 0.5,
  unit = 'dB',
  size = 84,
  color = colors.primary,
  onChange,
  onReset,
}) => {
  const valueRef = useRef(value);
  valueRef.current = value;

  const startValRef = useRef(value);
  const lastTapRef = useRef<number>(0);

  const radius = size / 2;
  const strokeWidth = 5;
  const arcRadius = radius - strokeWidth - 2;

  // Knob rotation: -135deg (min) to +135deg (max)
  const MIN_ANGLE = -135;
  const MAX_ANGLE = 135;
  const TOTAL_ANGLE = MAX_ANGLE - MIN_ANGLE; // 270 deg

  const normalized = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const currentAngle = MIN_ANGLE + normalized * TOTAL_ANGLE;

  // Convert polar to cartesian
  const polarToCartesian = (centerX: number, centerY: number, r: number, angleInDegrees: number) => {
    // 0 deg is straight up (12 o'clock)
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + r * Math.cos(angleInRadians),
      y: centerY + r * Math.sin(angleInRadians),
    };
  };

  // Helper to describe an SVG arc
  const describeArc = (x: number, y: number, r: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, r, endAngle);
    const end = polarToCartesian(x, y, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return ['M', start.x, start.y, 'A', r, r, 0, largeArcFlag, 0, end.x, end.y].join(' ');
  };

  const bgArc = useMemo(() => {
    return describeArc(radius, radius, arcRadius, MIN_ANGLE, MAX_ANGLE);
  }, [radius, arcRadius]);

  const activeArc = useMemo(() => {
    // If center is 0 (bipolar), draw arc from 0 to currentAngle
    const zeroRatio = (0 - min) / (max - min);
    const zeroAngle = MIN_ANGLE + zeroRatio * TOTAL_ANGLE;
    if (Math.abs(currentAngle - zeroAngle) < 1) return '';

    if (currentAngle >= zeroAngle) {
      return describeArc(radius, radius, arcRadius, zeroAngle, currentAngle);
    } else {
      return describeArc(radius, radius, arcRadius, currentAngle, zeroAngle);
    }
  }, [radius, arcRadius, currentAngle, min, max]);

  // Pointer position at current angle
  const pointerStart = polarToCartesian(radius, radius, arcRadius - 10, currentAngle);
  const pointerEnd = polarToCartesian(radius, radius, arcRadius - 3, currentAngle);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          startValRef.current = valueRef.current;
          const now = Date.now();
          if (now - lastTapRef.current < 300) {
            // Double tap to reset
            onReset ? onReset() : onChange(0);
          }
          lastTapRef.current = now;
        },
        onPanResponderMove: (_: GestureResponderEvent, gestureState: PanResponderGestureState) => {
          // Sensitivity: 150px drag spans full range
          const sensitivity = 150;
          const deltaY = -gestureState.dy; // dragging up increases value
          const valDelta = (deltaY / sensitivity) * (max - min);
          let newVal = startValRef.current + valDelta;
          newVal = Math.round(newVal / step) * step;
          newVal = Math.max(min, Math.min(max, newVal));
          onChange(newVal);
        },
      }),
    [min, max, step, onChange, onReset]
  );

  return (
    <View style={styles.container}>
      <View
        style={[styles.dialWrapper, { width: size, height: size }]}
        {...panResponder.panHandlers}
      >
        <Svg width={size} height={size}>
          {/* Background Arc */}
          <Path
            d={bgArc}
            stroke="#201C30"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
          />

          {/* Active Level Arc */}
          {activeArc ? (
            <Path
              d={activeArc}
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              fill="none"
            />
          ) : null}

          {/* Center Dial Face */}
          <Circle
            cx={radius}
            cy={radius}
            r={arcRadius - 7}
            fill="#12101D"
            stroke="#292438"
            strokeWidth={1.5}
          />

          {/* Inner Highlight Ring */}
          <Circle
            cx={radius}
            cy={radius}
            r={arcRadius - 14}
            fill="#090810"
            stroke="rgba(168, 85, 247, 0.15)"
            strokeWidth={1}
          />

          {/* Dial Pointer Notch */}
          <Line
            x1={pointerStart.x}
            y1={pointerStart.y}
            x2={pointerEnd.x}
            y2={pointerEnd.y}
            stroke={colors.textPrimary}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        </Svg>
      </View>

      {/* Label and Value */}
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color }]}>
        {value > 0 ? `+${value.toFixed(1)}` : value.toFixed(1)} {unit}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginHorizontal: 4,
    marginVertical: 6,
  },
  dialWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.xs - 1,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: typography.letterSpacing.wider,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    marginTop: 1,
  },
});
