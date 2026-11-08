import React, { useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Svg, { Path, Line, Text as SvgText, Circle } from 'react-native-svg';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing, borderRadius } from '@/theme/spacing';
import { getIEMById } from '@/services/local-db/iemCatalog';
import { RecommendationEngine } from '@/core/recommendation/engine';
import { HARMAN_IE_2019 } from '@/core/measurements/targetCurves';
import { freqToX, gainToY } from '@/utils/audioMath';
import { useAudioStore } from '@/store/useAudioStore';
import type { EQProfile } from '@/core/types/audio';

export default function IEMDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { activeIEM, setActiveIEM, setActiveProfile } = useAudioStore();

  const iem = useMemo(() => getIEMById(id || 'iem-1'), [id]);

  // Generate calibrated recommendations for this specific IEM
  const recommendedProfiles = useMemo(() => {
    if (!iem) return [];
    return RecommendationEngine.generateScenarioProfiles(iem);
  }, [iem]);

  if (!iem) {
    return (
      <ScreenContainer>
        <Header title="TRANSDUCER NOT FOUND" />
        <Card style={styles.notFoundCard}>
          <Text style={styles.notFoundText}>No acoustic data found for IEM ID: {id}</Text>
          <Button label="RETURN TO CATALOG" onPress={() => router.back()} />
        </Card>
      </ScreenContainer>
    );
  }

  const isCurrentActive = activeIEM.id === iem.id;

  const handleSelectTransducer = () => {
    setActiveIEM(iem);
  };

  const handleApplyProfile = (profile: EQProfile) => {
    setActiveIEM(iem);
    setActiveProfile(profile);
    router.push('/(tabs)/equalizer');
  };

  // Dimensions for raw measurement vs Harman curve visualization
  const graphWidth = 320;
  const graphHeight = 150;

  // Build Harman Target curve path
  const harmanPath = useMemo(() => {
    let d = '';
    HARMAN_IE_2019.points.forEach((pt, idx) => {
      const x = freqToX(pt.freq, graphWidth);
      const y = gainToY(pt.spl, graphHeight);
      d += idx === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
    });
    return d;
  }, []);

  // Build Measured Raw Response curve path
  const measuredPath = useMemo(() => {
    if (!iem.measurement) return '';
    let d = '';
    iem.measurement.points.forEach((pt, idx) => {
      const x = freqToX(pt.freq, graphWidth);
      const y = gainToY(pt.spl, graphHeight);
      d += idx === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
    });
    return d;
  }, [iem]);

  return (
    <ScreenContainer>
      <Header
        title={iem.name.toUpperCase()}
        subtitle={`${iem.manufacturerName} Acoustic Engineering Profile`}
      />

      {/* Primary Hardware Specs Card */}
      <Card variant={isCurrentActive ? 'glow' : 'elevated'} style={styles.card}>
        <View style={styles.rowBetween}>
          <View>
            <Text style={styles.manufacturer}>{iem.manufacturerName}</Text>
            <Text style={styles.iemTitle}>{iem.name}</Text>
          </View>
          {isCurrentActive ? (
            <Badge label="ACTIVE TRANSDUCER" variant="primary" />
          ) : (
            <Button
              label="SELECT ACTIVE"
              variant="secondary"
              size="sm"
              onPress={handleSelectTransducer}
            />
          )}
        </View>

        <View style={styles.badgeRow}>
          <Badge label={iem.driverType} variant="neutral" size="sm" />
          <Badge label={`${iem.impedanceOhms} Ω`} variant="neutral" size="sm" />
          <Badge label={`${iem.sensitivityDbMw} dB/mW`} variant="neutral" size="sm" />
          {iem.releaseYear && <Badge label={`Year ${iem.releaseYear}`} variant="neutral" size="sm" />}
        </View>

        <Text style={styles.descriptionText}>{iem.description}</Text>

        {/* Measurement Source Banner */}
        <View style={styles.sourceBanner}>
          <Text style={styles.sourceLabel}>MEASUREMENT RIG & SOURCE</Text>
          <Text style={styles.sourceValue}>
            {iem.measurement
              ? `${iem.measurement.sourceRig} • ${iem.measurement.measuredBy}`
              : 'Laboratory coupler measurement in progress'}
          </Text>
        </View>
      </Card>

      {/* Raw Frequency Response vs Harman Target Overlay */}
      {iem.measurement && (
        <Card style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionHeading}>RAW FREQUENCY RESPONSE VS TARGET</Text>
            <Badge label="IEC 60318-4" variant="info" size="sm" />
          </View>

          <View style={styles.graphContainer}>
            <Svg width={graphWidth} height={graphHeight}>
              {/* Zero dB reference line */}
              <Line
                x1={0}
                y1={gainToY(0, graphHeight)}
                x2={graphWidth}
                y2={gainToY(0, graphHeight)}
                stroke="rgba(168, 85, 247, 0.3)"
                strokeWidth={1}
                strokeDasharray="4, 4"
              />

              {/* Harman target reference curve */}
              <Path
                d={harmanPath}
                stroke={colors.harmanTarget}
                strokeWidth={1.5}
                strokeDasharray="3, 3"
                fill="none"
                opacity={0.7}
              />

              {/* Measured IEM response curve */}
              <Path
                d={measuredPath}
                stroke={colors.activeEQCurve}
                strokeWidth={2}
                fill="none"
              />

              {/* Measurement Sample Points */}
              {iem.measurement.points.map((pt) => {
                const cx = freqToX(pt.freq, graphWidth);
                const cy = gainToY(pt.spl, graphHeight);
                return (
                  <Circle
                    key={pt.freq}
                    cx={cx}
                    cy={cy}
                    r={3}
                    fill={colors.primary}
                    stroke="#090810"
                    strokeWidth={1}
                  />
                );
              })}
            </Svg>
          </View>

          <View style={styles.graphLegendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendIndicator, { backgroundColor: colors.activeEQCurve }]} />
              <Text style={styles.legendLabel}>Measured Response</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendIndicatorDashed, { borderColor: colors.harmanTarget }]} />
              <Text style={styles.legendLabel}>Harman Target (2019v2)</Text>
            </View>
          </View>
        </Card>
      )}

      {/* Calibrated Model Recommendations */}
      <View style={styles.recSection}>
        <Text style={styles.sectionHeading}>CALIBRATED ACOUSTIC TUNING PROFILES</Text>
        <Text style={styles.recSubtitle}>
          Mathematically compensated for {iem.name}'s acoustic transfer function
        </Text>

        {recommendedProfiles.map((p) => (
          <Card key={p.id} style={styles.recCard}>
            <View style={styles.rowBetween}>
              <Text style={styles.recTitle}>{p.name}</Text>
              <Badge
                label={p.scenario.toUpperCase().replace('_', ' ')}
                variant="primary"
                size="sm"
              />
            </View>

            <Text style={styles.recDesc}>{p.description}</Text>

            <View style={styles.recMetaRow}>
              <Text style={styles.recMetaText}>Preamp: {p.preampDb} dB</Text>
              <Text style={styles.recMetaText}>{p.filters.length} Filter Bands</Text>
              <Text style={styles.recMetaText}>Source: {p.sourceAttribution}</Text>
            </View>

            <View style={styles.recActionRow}>
              <Button
                label="LOAD TO EQUALIZER"
                variant="primary"
                size="sm"
                onPress={() => handleApplyProfile(p)}
              />
            </View>
          </Card>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  manufacturer: {
    color: colors.primaryLight,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: typography.letterSpacing.wider,
  },
  iemTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  descriptionText: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.xs,
    lineHeight: typography.lineHeights.sm,
    marginBottom: spacing.sm,
  },
  sourceBanner: {
    backgroundColor: '#090810',
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sourceLabel: {
    color: colors.textMuted,
    fontSize: typography.fontSizes.xs - 2,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: typography.letterSpacing.widest,
  },
  sourceValue: {
    color: colors.accentCyan,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
    marginTop: 2,
  },
  sectionHeading: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: typography.letterSpacing.widest,
  },
  graphContainer: {
    height: 150,
    backgroundColor: '#07060D',
    borderRadius: 8,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  graphLegendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
    marginTop: 4,
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
  legendLabel: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.xs - 2,
  },
  recSection: {
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  recSubtitle: {
    color: colors.textMuted,
    fontSize: typography.fontSizes.xs - 1,
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  recCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  recTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
  },
  recDesc: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.xs,
    lineHeight: typography.lineHeights.xs,
    marginTop: 4,
    marginBottom: spacing.xs,
  },
  recMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginBottom: spacing.xs,
  },
  recMetaText: {
    color: colors.textMuted,
    fontSize: typography.fontSizes.xs - 2,
  },
  recActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  notFoundCard: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  notFoundText: {
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
});
