import React, { useMemo, useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  PanResponder,
  LayoutChangeEvent,
} from 'react-native';
import Svg, {
  Path,
  Line,
  Text as SvgText,
  Circle,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import type { BiquadFilterConfig } from '@/core/types/audio';
import {
  freqToX,
  xToFreq,
  gainToY,
  yToGain,
  calculateCumulativeResponse,
  generateLogFrequencies,
  HARMAN_TARGET_POINTS,
  MIN_DB,
  MAX_DB,
} from '@/utils/audioMath';

interface FrequencyResponseGraphProps {
  filters: BiquadFilterConfig[];
  preampDb: number;
  isBypassed: boolean;
  selectedFilterId?: string | null;
  onFilterChange?: (id: string, updates: Partial<BiquadFilterConfig>) => void;
  onSelectFilter?: (id: string) => void;
  showHarmanTarget?: boolean;
}

const GRID_FREQUENCIES = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000];
const GRID_GAINS = [12, 6, 0, -6, -12];

export const FrequencyResponseGraph: React.FC<FrequencyResponseGraphProps> = ({
  filters,
  preampDb,
  isBypassed,
  selectedFilterId,
  onFilterChange,
  onSelectFilter,
  showHarmanTarget = true,
}) => {
  const [dimensions, setDimensions] = useState({ width: 340, height: 210 });
  const [activeDraggingId, setActiveDraggingId] = useState<string | null>(null);
  const [dragTooltip, setDragTooltip] = useState<{
    id: string;
    freq: number;
    gain: number;
    x: number;
    y: number;
  } | null>(null);

  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const onFilterChangeRef = useRef(onFilterChange);
  onFilterChangeRef.current = onFilterChange;

  const onSelectFilterRef = useRef(onSelectFilter);
  onSelectFilterRef.current = onSelectFilter;

  const handleLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 50 && height > 50) {
      setDimensions({ width, height });
    }
  };

  const { width, height } = dimensions;

  // Pre-calculate test frequencies
  const testFrequencies = useMemo(() => generateLogFrequencies(90), []);

  // Calculate cumulative frequency response points
  const responsePoints = useMemo(() => {
    return calculateCumulativeResponse(testFrequencies, filters, preampDb, isBypassed);
  }, [testFrequencies, filters, preampDb, isBypassed]);

  // Build SVG path for cumulative curve
  const curvePath = useMemo(() => {
    if (responsePoints.length === 0 || width <= 0) return '';
    let d = '';
    responsePoints.forEach((pt, index) => {
      const x = freqToX(pt.freq, width);
      const y = gainToY(pt.gainDb, height);
      if (index === 0) {
        d += `M ${x.toFixed(1)} ${y.toFixed(1)}`;
      } else {
        d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
      }
    });
    return d;
  }, [responsePoints, width, height]);

  // Build filled area under the curve
  const fillPath = useMemo(() => {
    if (!curvePath) return '';
    const zeroY = gainToY(0, height);
    return `${curvePath} L ${width} ${zeroY} L 0 ${zeroY} Z`;
  }, [curvePath, width, height]);

  // Build Harman Target reference curve path
  const harmanPath = useMemo(() => {
    if (!showHarmanTarget || width <= 0) return '';
    let d = '';
    HARMAN_TARGET_POINTS.forEach((pt, index) => {
      const x = freqToX(pt.freq, width);
      const y = gainToY(pt.gainDb, height);
      if (index === 0) {
        d += `M ${x.toFixed(1)} ${y.toFixed(1)}`;
      } else {
        d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
      }
    });
    return d;
  }, [showHarmanTarget, width, height]);

  // PanResponder to track interactive node dragging
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
          const { locationX, locationY } = evt.nativeEvent;
          // Find the nearest filter node within hit radius (32px)
          let nearestId: string | null = null;
          let minDistance = 32;

          for (const f of filtersRef.current) {
            const nodeX = freqToX(f.frequency, width);
            const nodeY = gainToY(f.gain, height);
            const dist = Math.hypot(locationX - nodeX, locationY - nodeY);
            if (dist < minDistance) {
              minDistance = dist;
              nearestId = f.id;
            }
          }

          if (nearestId) {
            setActiveDraggingId(nearestId);
            onSelectFilterRef.current?.(nearestId);
            const f = filtersRef.current.find((item) => item.id === nearestId);
            if (f) {
              setDragTooltip({
                id: f.id,
                freq: f.frequency,
                gain: f.gain,
                x: freqToX(f.frequency, width),
                y: gainToY(f.gain, height),
              });
            }
          }
        },
        onPanResponderMove: (evt) => {
          if (!activeDraggingId) return;
          const { locationX, locationY } = evt.nativeEvent;

          // Convert pixel coordinates to audio units
          const newFreq = xToFreq(locationX, width);
          const newGain = yToGain(locationY, height);

          onFilterChangeRef.current?.(activeDraggingId, {
            frequency: newFreq,
            gain: newGain,
          });

          setDragTooltip({
            id: activeDraggingId,
            freq: newFreq,
            gain: newGain,
            x: Math.max(20, Math.min(width - 20, locationX)),
            y: Math.max(20, Math.min(height - 20, locationY)),
          });
        },
        onPanResponderRelease: () => {
          setActiveDraggingId(null);
          setDragTooltip(null);
        },
        onPanResponderTerminate: () => {
          setActiveDraggingId(null);
          setDragTooltip(null);
        },
      }),
    [width, height, activeDraggingId]
  );

  return (
    <View style={styles.container}>
      {/* Graph Canvas */}
      <View
        style={styles.canvasWrapper}
        onLayout={handleLayout}
        {...panResponder.panHandlers}
      >
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={colors.primary} stopOpacity={0.35} />
              <Stop offset="100%" stopColor={colors.primary} stopOpacity={0.02} />
            </LinearGradient>
          </Defs>

          {/* Grid lines (horizontal gains) */}
          {GRID_GAINS.map((gain) => {
            const y = gainToY(gain, height);
            const isZero = gain === 0;
            return (
              <React.Fragment key={`gain-${gain}`}>
                <Line
                  x1={0}
                  y1={y}
                  x2={width}
                  y2={y}
                  stroke={isZero ? 'rgba(168, 85, 247, 0.4)' : colors.border}
                  strokeWidth={isZero ? 1.5 : 0.75}
                  strokeDasharray={isZero ? undefined : '2, 4'}
                />
                <SvgText
                  x={width - 24}
                  y={y - 3}
                  fill={isZero ? colors.primaryLight : colors.textMuted}
                  fontSize={9}
                  fontWeight={isZero ? 'bold' : 'normal'}
                >
                  {gain > 0 ? `+${gain}` : `${gain}`}
                </SvgText>
              </React.Fragment>
            );
          })}

          {/* Grid lines (vertical frequencies) */}
          {GRID_FREQUENCIES.map((freq) => {
            const x = freqToX(freq, width);
            const label = freq >= 1000 ? `${freq / 1000}k` : `${freq}`;
            return (
              <React.Fragment key={`freq-${freq}`}>
                <Line
                  x1={x}
                  y1={0}
                  x2={x}
                  y2={height}
                  stroke={colors.border}
                  strokeWidth={0.75}
                  strokeDasharray="2, 4"
                />
                <SvgText
                  x={x - (label.length > 2 ? 8 : 4)}
                  y={height - 5}
                  fill={colors.textMuted}
                  fontSize={9}
                >
                  {label}
                </SvgText>
              </React.Fragment>
            );
          })}

          {/* Reference Harman Target curve */}
          {showHarmanTarget && harmanPath ? (
            <Path
              d={harmanPath}
              stroke={colors.harmanTarget}
              strokeWidth={1.5}
              strokeDasharray="4, 4"
              fill="none"
              opacity={0.65}
            />
          ) : null}

          {/* Cumulative EQ Response Gradient Fill */}
          {fillPath ? <Path d={fillPath} fill="url(#curveGradient)" /> : null}

          {/* Cumulative EQ Response Curve */}
          {curvePath ? (
            <Path
              d={curvePath}
              stroke={isBypassed ? colors.textMuted : colors.activeEQCurve}
              strokeWidth={2.5}
              fill="none"
            />
          ) : null}

          {/* Draggable Filter Nodes */}
          {filters.map((filter, index) => {
            const x = freqToX(filter.frequency, width);
            const y = gainToY(filter.gain, height);
            const isSelected = filter.id === selectedFilterId || filter.id === activeDraggingId;

            return (
              <React.Fragment key={filter.id}>
                {/* Touch Halo for easy grabbing */}
                {isSelected && (
                  <Circle
                    cx={x}
                    cy={y}
                    r={16}
                    fill="rgba(168, 85, 247, 0.25)"
                    stroke={colors.primary}
                    strokeWidth={1}
                  />
                )}
                {/* Outer Ring */}
                <Circle
                  cx={x}
                  cy={y}
                  r={isSelected ? 9 : 7}
                  fill="#090810"
                  stroke={filter.enabled ? colors.primaryLight : colors.textMuted}
                  strokeWidth={2}
                />
                {/* Inner Core */}
                <Circle
                  cx={x}
                  cy={y}
                  r={isSelected ? 4 : 3}
                  fill={filter.enabled ? colors.primary : colors.textMuted}
                />
                {/* Node Index Number */}
                <SvgText
                  x={x - 3}
                  y={y - 10}
                  fill={isSelected ? colors.primaryLight : colors.textMuted}
                  fontSize={10}
                  fontWeight="bold"
                >
                  {index + 1}
                </SvgText>
              </React.Fragment>
            );
          })}
        </Svg>

        {/* Floating Tooltip during node drag */}
        {dragTooltip && (
          <View
            style={[
              styles.tooltip,
              {
                left: Math.max(10, Math.min(width - 110, dragTooltip.x - 50)),
                top: Math.max(10, dragTooltip.y - 48),
              },
            ]}
            pointerEvents="none"
          >
            <Text style={styles.tooltipText}>
              {dragTooltip.freq >= 1000
                ? `${(dragTooltip.freq / 1000).toFixed(2)} kHz`
                : `${dragTooltip.freq} Hz`}{' '}
              | {dragTooltip.gain > 0 ? `+${dragTooltip.gain.toFixed(1)}` : dragTooltip.gain.toFixed(1)} dB
            </Text>
          </View>
        )}
      </View>

      {/* Legend & Instructions */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendIndicator, { backgroundColor: colors.activeEQCurve }]} />
          <Text style={styles.legendText}>PEQ Curve</Text>
        </View>

        {showHarmanTarget && (
          <View style={styles.legendItem}>
            <View style={[styles.legendIndicatorDashed, { borderColor: colors.harmanTarget }]} />
            <Text style={styles.legendText}>Harman Target (2019v2)</Text>
          </View>
        )}

        <Text style={styles.instructionText}>Drag nodes to tune Hz & dB</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#090810',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    marginBottom: 12,
  },
  canvasWrapper: {
    height: 210,
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#07060D',
    borderRadius: 8,
  },
  tooltip: {
    position: 'absolute',
    backgroundColor: 'rgba(27, 24, 41, 0.95)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 6,
  },
  tooltipText: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendIndicator: {
    width: 14,
    height: 3,
    borderRadius: 1.5,
  },
  legendIndicatorDashed: {
    width: 14,
    height: 0,
    borderTopWidth: 1.5,
    borderStyle: 'dashed',
  },
  legendText: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.xs - 1,
  },
  instructionText: {
    color: colors.textMuted,
    fontSize: typography.fontSizes.xs - 2,
    fontStyle: 'italic',
  },
});
