import React, { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import { useAudioStore } from '@/store/useAudioStore';
import { EQProfile } from '@/core/types/audio';

const DISCOVER_PROFILES: EQProfile[] = [
  {
    id: 'disc-1',
    iemId: 'iem-1',
    iemName: 'Moondrop Blessing 3',
    name: 'Harman 2019v2 Target Alignment',
    description: 'Precision compensation for standard 711 coupler measurements aligning Blessing 3 to the Harman 2019 IE acoustic curve.',
    profileType: 'measurement_derived',
    scenario: 'music_balanced',
    targetCurve: 'Harman In-Ear 2019v2',
    sourceAttribution: 'Standard IEC 60318-4 Rig',
    preampDb: -2.5,
    isPublic: true,
    isVerified: true,
    upvotesCount: 428,
    filters: [
      { id: '1', type: 'low_shelf', frequency: 105, gain: 3.5, q: 0.71, enabled: true },
      { id: '2', type: 'peak', frequency: 220, gain: -1.2, q: 1.2, enabled: true },
      { id: '3', type: 'peak', frequency: 1250, gain: 0.8, q: 1.5, enabled: true },
    ],
    createdAt: '2026-01-10T12:00:00Z',
    updatedAt: '2026-01-10T12:00:00Z',
  },
  {
    id: 'disc-2',
    iemId: 'iem-1',
    iemName: 'Moondrop Blessing 3',
    name: 'IEF Neutral 2023 with Sub-Bass Boost',
    description: 'Flat studio-neutral midrange target curve with a clean +4dB sub-bass shelf below 80 Hz.',
    profileType: 'curated',
    scenario: 'music_bass',
    targetCurve: 'IEF Neutral 2023',
    sourceAttribution: 'Acoustics Lab Curated',
    preampDb: -3.8,
    isPublic: true,
    isVerified: true,
    upvotesCount: 312,
    filters: [
      { id: '1', type: 'low_shelf', frequency: 80, gain: 4.0, q: 0.8, enabled: true },
      { id: '2', type: 'peak', frequency: 3200, gain: -2.0, q: 1.8, enabled: true },
    ],
    createdAt: '2026-02-14T10:30:00Z',
    updatedAt: '2026-02-14T10:30:00Z',
  },
  {
    id: 'disc-3',
    iemId: 'iem-1',
    iemName: 'Moondrop Blessing 3',
    name: 'FPS Spatial Footstep Cue Extractor',
    description: 'Boosts 2-4 kHz pinna directional cues while attenuating resonant sub-bass clutter for competitive gaming.',
    profileType: 'community',
    creatorName: 'AcousticPhantom',
    scenario: 'gaming_fps',
    targetCurve: 'Custom Tactical FPS',
    sourceAttribution: 'Community Verified',
    preampDb: -1.8,
    isPublic: true,
    isVerified: false,
    upvotesCount: 189,
    filters: [
      { id: '1', type: 'high_pass', frequency: 40, gain: 0.0, q: 0.71, enabled: true },
      { id: '2', type: 'peak', frequency: 2800, gain: 3.5, q: 2.2, enabled: true },
    ],
    createdAt: '2026-03-01T08:15:00Z',
    updatedAt: '2026-03-01T08:15:00Z',
  },
];

export default function DiscoverScreen() {
  const { activeProfile, setActiveProfile } = useAudioStore();
  const [filterTab, setFilterTab] = useState<'all' | 'curated' | 'community'>('all');

  const filteredList = DISCOVER_PROFILES.filter((p) => {
    if (filterTab === 'curated') return p.profileType === 'curated' || p.profileType === 'measurement_derived';
    if (filterTab === 'community') return p.profileType === 'community';
    return true;
  });

  return (
    <ScreenContainer>
      <Header
        title="DISCOVER"
        subtitle="Verified Reference Targets & Audiophile Presets"
      />

      {/* Filter Tabs */}
      <View style={styles.tabFilterRow}>
        <Button
          label="ALL PRESETS"
          variant={filterTab === 'all' ? 'primary' : 'secondary'}
          size="sm"
          onPress={() => setFilterTab('all')}
        />
        <Button
          label="CURATED & TARGETS"
          variant={filterTab === 'curated' ? 'primary' : 'secondary'}
          size="sm"
          onPress={() => setFilterTab('curated')}
        />
        <Button
          label="COMMUNITY"
          variant={filterTab === 'community' ? 'primary' : 'secondary'}
          size="sm"
          onPress={() => setFilterTab('community')}
        />
      </View>

      {/* Profiles List */}
      {filteredList.map((item) => {
        const isCurrent = activeProfile.id === item.id;
        return (
          <Card
            key={item.id}
            variant={isCurrent ? 'glow' : 'default'}
            style={styles.profileCard}
          >
            <View style={styles.cardHeaderRow}>
              <View style={styles.badgeGroup}>
                <Badge
                  label={item.profileType.toUpperCase().replace('_', ' ')}
                  variant={item.profileType === 'community' ? 'info' : 'primary'}
                  size="sm"
                />
                {item.isVerified && (
                  <Badge label="LAB VERIFIED" variant="success" size="sm" />
                )}
              </View>
              <Text style={styles.upvotesText}>▲ {item.upvotesCount}</Text>
            </View>

            <Text style={styles.profileTitle}>{item.name}</Text>
            <Text style={styles.iemTargetModel}>Tuned for: {item.iemName}</Text>
            <Text style={styles.profileDescription}>{item.description}</Text>

            <View style={styles.metaRow}>
              <Text style={styles.metaText}>
                Source: {item.sourceAttribution || 'N/A'}
              </Text>
              <Text style={styles.metaText}>
                Preamp: {item.preampDb > 0 ? `+${item.preampDb}` : item.preampDb} dB
              </Text>
            </View>

            <View style={styles.actionRow}>
              <Button
                label={isCurrent ? 'ACTIVE PROFILE' : 'LOAD PROFILE'}
                variant={isCurrent ? 'primary' : 'outline'}
                size="sm"
                disabled={isCurrent}
                onPress={() => setActiveProfile(item)}
              />
            </View>
          </Card>
        );
      })}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  tabFilterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  profileCard: {
    marginBottom: spacing.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  badgeGroup: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  upvotesText: {
    color: colors.primaryLight,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
  },
  profileTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    marginTop: spacing.xs,
  },
  iemTargetModel: {
    color: colors.accentCyan,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium,
    marginTop: 2,
    marginBottom: spacing.xs,
  },
  profileDescription: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.sm,
    lineHeight: typography.lineHeights.sm,
    marginBottom: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginBottom: spacing.sm,
  },
  metaText: {
    color: colors.textMuted,
    fontSize: typography.fontSizes.xs - 1,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});
