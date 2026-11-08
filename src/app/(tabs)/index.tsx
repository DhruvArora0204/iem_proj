import React, { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { IEMPickerModal } from '@/features/iem/components/IEMPickerModal';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import { useAudioStore } from '@/store/useAudioStore';
import { useDeviceStore } from '@/store/useDeviceStore';
import type { ScenarioType } from '@/core/types/audio';

const SCENARIOS: { id: ScenarioType; label: string; icon: string }[] = [
  { id: 'music_balanced', label: 'Balanced', icon: '🎵' },
  { id: 'music_bass', label: 'Basshead', icon: '🔊' },
  { id: 'music_vocal', label: 'Vocal Warmth', icon: '🎙️' },
  { id: 'gaming_fps', label: 'Gaming FPS', icon: '🎯' },
  { id: 'movie_cinema', label: 'Cinema', icon: '🎬' },
  { id: 'podcast_speech', label: 'Podcast', icon: '🗣️' },
];

export default function HomeScreen() {
  const router = useRouter();
  const {
    activeIEM,
    activeProfile,
    filters,
    preampDb,
    isBypassed,
    activeScenario,
    macroKnobs,
    toggleBypass,
    setScenario,
  } = useAudioStore();

  const { currentDevice } = useDeviceStore();
  const [isIEMPickerOpen, setIsIEMPickerOpen] = useState(false);

  const activeFiltersCount = filters.filter((f) => f.enabled).length;

  return (
    <ScreenContainer>
      <Header
        title="AUDIOPHILE"
        subtitle="Acoustic Optimization & DSP Studio"
        showLabBadge
      />

      {/* Audio Hardware & Output Route */}
      <Card variant="elevated" style={styles.sectionCard}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.sectionLabel}>AUDIO TRANSPORT ROUTE</Text>
          <Badge
            label={currentDevice.routeType.toUpperCase().replace('_', ' ')}
            variant="info"
            size="sm"
          />
        </View>
        <Text style={styles.deviceName}>{currentDevice.deviceName}</Text>
        <Text style={styles.deviceCodec}>{currentDevice.codec}</Text>
        <Text style={styles.disclaimerNote}>
          Hardware DAC detected. Audio transport route identified via Android UAC2.
        </Text>
      </Card>

      {/* Active IEM Card with Live Model Picker */}
      <Card variant="glow" style={styles.sectionCard}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.sectionLabel}>ACTIVE TRANSDUCER (IEM)</Text>
          <Badge label="CALIBRATED" variant="primary" size="sm" />
        </View>

        <Text style={styles.iemManufacturer}>{activeIEM.manufacturerName}</Text>
        <Text style={styles.iemName}>{activeIEM.name}</Text>

        <View style={styles.badgeRow}>
          <Badge label={activeIEM.driverType} variant="neutral" size="sm" />
          <Badge label={`${activeIEM.impedanceOhms} Ω`} variant="neutral" size="sm" />
          <Badge label={`${activeIEM.sensitivityDbMw} dB/mW`} variant="neutral" size="sm" />
          {activeIEM.releaseYear && (
            <Badge label={`Year ${activeIEM.releaseYear}`} variant="neutral" size="sm" />
          )}
        </View>

        <Text style={styles.iemDescription}>{activeIEM.description}</Text>

        <View style={styles.cardActionRow}>
          <Button
            label="SWITCH TRANSDUCER"
            variant="outline"
            size="sm"
            onPress={() => setIsIEMPickerOpen(true)}
          />
        </View>
      </Card>

      {/* Active EQ Profile & Headroom Status */}
      <Card style={styles.sectionCard}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.sectionLabel}>ACTIVE PEQ PROFILE</Text>
          <Badge
            label={isBypassed ? 'BYPASSED' : 'PROCESSING'}
            variant={isBypassed ? 'warning' : 'success'}
            size="sm"
          />
        </View>

        <Text style={styles.profileName}>{activeProfile.name}</Text>
        <Text style={styles.profileCurve}>
          Target Curve: {activeProfile.targetCurve || 'Custom Flat'}
        </Text>

        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{activeFiltersCount}</Text>
            <Text style={styles.statLabel}>Active Bands</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{preampDb > 0 ? `+${preampDb}` : preampDb} dB</Text>
            <Text style={styles.statLabel}>Preamp Gain</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{isBypassed ? 'FLAT' : 'ACTIVE'}</Text>
            <Text style={styles.statLabel}>A/B Mode</Text>
          </View>
        </View>

        {/* Live Macro Dials Quick Status */}
        <View style={styles.knobPillsRow}>
          <Badge
            label={`Bass: ${macroKnobs.bass > 0 ? `+${macroKnobs.bass}` : macroKnobs.bass} dB`}
            variant="primary"
            size="sm"
          />
          <Badge
            label={`Clarity: ${macroKnobs.clarity > 0 ? `+${macroKnobs.clarity}` : macroKnobs.clarity} dB`}
            variant="info"
            size="sm"
          />
          <Badge
            label={`Treble: ${macroKnobs.treble > 0 ? `+${macroKnobs.treble}` : macroKnobs.treble} dB`}
            variant="neutral"
            size="sm"
          />
        </View>

        <View style={styles.buttonRow}>
          <Button
            label={isBypassed ? 'ENGAGE EQ' : 'BYPASS EQ'}
            variant={isBypassed ? 'primary' : 'secondary'}
            size="md"
            style={styles.flexButton}
            onPress={toggleBypass}
          />
          <Button
            label="EQUALIZER STUDIO"
            variant="primary"
            size="md"
            style={styles.flexButton}
            onPress={() => router.push('/(tabs)/equalizer')}
          />
        </View>
      </Card>

      {/* Scenario-Specific Quick Switcher */}
      <View style={styles.scenarioSection}>
        <Text style={styles.scenarioTitle}>SCENARIO-SPECIFIC ACOUSTICS</Text>
        <Text style={styles.scenarioSubtitle}>
          Select instant calibrated tuning contours for your listening context
        </Text>

        <View style={styles.chipsContainer}>
          {SCENARIOS.map((sc) => {
            const isSelected = activeScenario === sc.id;
            return (
              <Button
                key={sc.id}
                label={`${sc.icon} ${sc.label}`}
                variant={isSelected ? 'primary' : 'secondary'}
                size="sm"
                style={styles.chipButton}
                onPress={() => setScenario(sc.id)}
              />
            );
          })}
        </View>
      </View>

      {/* IEM Picker Modal */}
      <IEMPickerModal
        visible={isIEMPickerOpen}
        onClose={() => setIsIEMPickerOpen(false)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    marginBottom: spacing.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: typography.letterSpacing.widest,
  },
  deviceName: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    marginTop: 2,
  },
  deviceCodec: {
    color: colors.accentCyan,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    marginTop: 2,
  },
  disclaimerNote: {
    color: colors.textMuted,
    fontSize: typography.fontSizes.xs,
    marginTop: spacing.sm,
    lineHeight: typography.lineHeights.sm,
  },
  iemManufacturer: {
    color: colors.primaryLight,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
    letterSpacing: typography.letterSpacing.wider,
    marginTop: spacing.xs,
  },
  iemName: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
    marginBottom: spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  iemDescription: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.sm,
    lineHeight: typography.lineHeights.sm,
    marginBottom: spacing.md,
  },
  cardActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  profileName: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    marginTop: 2,
  },
  profileCurve: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.xs,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    backgroundColor: '#090810',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: colors.primaryLight,
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: typography.fontSizes.xs,
    marginTop: 2,
  },
  knobPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  flexButton: {
    flex: 1,
  },
  scenarioSection: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  scenarioTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: typography.letterSpacing.widest,
    marginBottom: 2,
  },
  scenarioSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.xs,
    marginBottom: spacing.md,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chipButton: {
    marginBottom: 4,
  },
});
