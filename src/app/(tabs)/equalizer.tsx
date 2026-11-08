import React from 'react';
import { StyleSheet, View, Text, Switch } from 'react-native';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import { useAudioStore } from '@/store/useAudioStore';

export default function EqualizerScreen() {
  const {
    activeIEM,
    activeProfile,
    filters,
    preampDb,
    isBypassed,
    isAutoPreampEnabled,
    toggleBypass,
    toggleFilter,
    setAutoPreamp,
    setPreamp,
    resetToFlat,
  } = useAudioStore();

  return (
    <ScreenContainer>
      <Header
        title="PARAMETRIC EQ"
        subtitle={`Calibrated for ${activeIEM.manufacturerName} ${activeIEM.name}`}
      />

      {/* Profile & Master Headroom Bar */}
      <Card variant="elevated" style={styles.topCard}>
        <View style={styles.rowBetween}>
          <View>
            <Text style={styles.profileTitle}>{activeProfile.name}</Text>
            <Text style={styles.profileTarget}>
              Target: {activeProfile.targetCurve || 'Custom Flat'}
            </Text>
          </View>
          <Badge
            label={isBypassed ? 'BYPASSED' : 'EQ ACTIVE'}
            variant={isBypassed ? 'warning' : 'success'}
          />
        </View>

        <View style={styles.headroomRow}>
          <View>
            <Text style={styles.headroomLabel}>PREAMP ATTENUATION</Text>
            <Text style={styles.headroomValue}>
              {preampDb > 0 ? `+${preampDb.toFixed(1)}` : preampDb.toFixed(1)} dB
            </Text>
          </View>
          <View style={styles.controlsRow}>
            <Button
              label="-0.5"
              size="sm"
              variant="secondary"
              onPress={() => setPreamp(preampDb - 0.5)}
            />
            <Button
              label="+0.5"
              size="sm"
              variant="secondary"
              onPress={() => setPreamp(preampDb + 0.5)}
            />
          </View>
        </View>

        <View style={styles.toggleRow}>
          <Text style={styles.toggleText}>Auto-Preamp Clipping Prevention</Text>
          <Switch
            value={isAutoPreampEnabled}
            onValueChange={setAutoPreamp}
            thumbColor={isAutoPreampEnabled ? colors.primary : colors.textMuted}
            trackColor={{ false: colors.border, true: 'rgba(168, 85, 247, 0.4)' }}
          />
        </View>
      </Card>

      {/* Frequency Response Graph Preview Placeholder */}
      <Card style={styles.graphCard}>
        <View style={styles.graphHeader}>
          <Text style={styles.graphTitle}>FREQUENCY RESPONSE (20 Hz - 20 kHz)</Text>
          <Badge label="SKIA DSP ACCELERATED" variant="primary" size="sm" />
        </View>

        <View style={styles.graphCanvasPlaceholder}>
          <View style={styles.centerBox}>
            <Text style={styles.graphPlaceholderText}>
              Interactive Spline Curve Graph
            </Text>
            <Text style={styles.graphPlaceholderSubtext}>
              {filters.filter((f) => f.enabled).length} Active Biquad IIR Nodes Ready
            </Text>
          </View>
        </View>
      </Card>

      {/* Filter Band List */}
      <View style={styles.bandSection}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>PARAMETRIC FILTER BANDS</Text>
          <Button
            label="RESET TO FLAT"
            variant="ghost"
            size="sm"
            onPress={resetToFlat}
          />
        </View>

        {filters.map((band, index) => (
          <Card key={band.id} style={styles.bandCard}>
            <View style={styles.bandHeader}>
              <View style={styles.bandIndexRow}>
                <View style={styles.bandIndexBadge}>
                  <Text style={styles.bandIndexText}>{index + 1}</Text>
                </View>
                <Text style={styles.bandType}>
                  {band.type.toUpperCase().replace('_', ' ')}
                </Text>
              </View>

              <Switch
                value={band.enabled}
                onValueChange={() => toggleFilter(band.id)}
                thumbColor={band.enabled ? colors.primary : colors.textMuted}
                trackColor={{ false: colors.border, true: 'rgba(168, 85, 247, 0.4)' }}
              />
            </View>

            <View style={styles.bandSpecsRow}>
              <View style={styles.specColumn}>
                <Text style={styles.specLabel}>FREQUENCY</Text>
                <Text style={styles.specValue}>
                  {band.frequency >= 1000
                    ? `${(band.frequency / 1000).toFixed(1)} kHz`
                    : `${band.frequency} Hz`}
                </Text>
              </View>

              <View style={styles.specColumn}>
                <Text style={styles.specLabel}>GAIN</Text>
                <Text
                  style={[
                    styles.specValue,
                    band.gain > 0 && styles.gainPositive,
                    band.gain < 0 && styles.gainNegative,
                  ]}
                >
                  {band.gain > 0 ? `+${band.gain.toFixed(1)}` : band.gain.toFixed(1)} dB
                </Text>
              </View>

              <View style={styles.specColumn}>
                <Text style={styles.specLabel}>Q FACTOR</Text>
                <Text style={styles.specValue}>{band.q.toFixed(2)}</Text>
              </View>
            </View>
          </Card>
        ))}
      </View>

      <View style={styles.footerActions}>
        <Button
          label={isBypassed ? 'ENABLE EQUALIZER' : 'BYPASS EQUALIZER'}
          variant={isBypassed ? 'primary' : 'outline'}
          size="lg"
          onPress={toggleBypass}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  topCard: {
    marginBottom: spacing.md,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  profileTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
  },
  profileTarget: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.xs,
    marginTop: 2,
  },
  headroomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.xs,
  },
  headroomLabel: {
    color: colors.textMuted,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: typography.letterSpacing.wider,
  },
  headroomValue: {
    color: colors.primaryLight,
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.bold,
    marginTop: 2,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
  },
  toggleText: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.xs,
  },
  graphCard: {
    marginBottom: spacing.md,
    backgroundColor: '#07060D',
  },
  graphHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  graphTitle: {
    color: colors.textMuted,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: typography.letterSpacing.widest,
  },
  graphCanvasPlaceholder: {
    height: 140,
    backgroundColor: '#0C0A15',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerBox: {
    alignItems: 'center',
  },
  graphPlaceholderText: {
    color: colors.primaryLight,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
  },
  graphPlaceholderSubtext: {
    color: colors.textMuted,
    fontSize: typography.fontSizes.xs,
    marginTop: 4,
  },
  bandSection: {
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: typography.letterSpacing.wider,
  },
  bandCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  bandHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  bandIndexRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bandIndexBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    borderWidth: 1,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  bandIndexText: {
    color: colors.primaryLight,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
  },
  bandType: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
  },
  bandSpecsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#090810',
    borderRadius: 8,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  specColumn: {
    alignItems: 'center',
  },
  specLabel: {
    color: colors.textMuted,
    fontSize: typography.fontSizes.xs - 2,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: typography.letterSpacing.wide,
    marginBottom: 2,
  },
  specValue: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
  },
  gainPositive: {
    color: colors.success,
  },
  gainNegative: {
    color: colors.accentLavender,
  },
  footerActions: {
    marginBottom: spacing.xxl,
  },
});
