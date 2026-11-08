import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Modal,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing, borderRadius } from '@/theme/spacing';
import { useAudioStore } from '@/store/useAudioStore';
import type { EQProfile } from '@/core/types/audio';

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
      { id: '4', type: 'peak', frequency: 2800, gain: -1.5, q: 2.0, enabled: true },
      { id: '5', type: 'peak', frequency: 5800, gain: -2.2, q: 2.5, enabled: true },
      { id: '6', type: 'high_shelf', frequency: 10500, gain: 1.0, q: 0.71, enabled: true },
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
      { id: '2', type: 'peak', frequency: 250, gain: -0.8, q: 1.0, enabled: true },
      { id: '3', type: 'peak', frequency: 3200, gain: -2.0, q: 1.8, enabled: true },
      { id: '4', type: 'high_shelf', frequency: 9500, gain: 1.5, q: 0.71, enabled: true },
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
      { id: '1', type: 'high_pass', frequency: 45, gain: 0.0, q: 0.71, enabled: true },
      { id: '2', type: 'peak', frequency: 2800, gain: 3.5, q: 2.2, enabled: true },
      { id: '3', type: 'peak', frequency: 4500, gain: 2.2, q: 2.0, enabled: true },
      { id: '4', type: 'peak', frequency: 7200, gain: -3.0, q: 3.0, enabled: true },
    ],
    createdAt: '2026-03-01T08:15:00Z',
    updatedAt: '2026-03-01T08:15:00Z',
  },
  {
    id: 'disc-4',
    iemId: 'iem-2',
    iemName: 'Truthear Zero: RED',
    name: 'Harman 2019v2 Bass Contour',
    description: 'Calibrated compensation for Truthear Zero: RED with 10-ohm impedance adapter installed.',
    profileType: 'curated',
    scenario: 'music_balanced',
    targetCurve: 'Harman In-Ear 2019v2',
    sourceAttribution: 'Crinacle 711 Database',
    preampDb: -2.0,
    isPublic: true,
    isVerified: true,
    upvotesCount: 567,
    filters: [
      { id: '1', type: 'low_shelf', frequency: 105, gain: 2.0, q: 0.71, enabled: true },
      { id: '2', type: 'peak', frequency: 6200, gain: -2.5, q: 3.0, enabled: true },
    ],
    createdAt: '2026-02-20T14:00:00Z',
    updatedAt: '2026-02-20T14:00:00Z',
  },
];

export default function DiscoverScreen() {
  const router = useRouter();
  const { activeProfile, setActiveProfile } = useAudioStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'curated' | 'community'>('all');
  const [inspectProfile, setInspectProfile] = useState<EQProfile | null>(null);

  const filteredList = DISCOVER_PROFILES.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.iemName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.targetCurve?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterTab === 'curated') {
      return p.profileType === 'curated' || p.profileType === 'measurement_derived';
    }
    if (filterTab === 'community') {
      return p.profileType === 'community';
    }
    return true;
  });

  const handleApplyProfile = (profile: EQProfile) => {
    setActiveProfile(profile);
    setInspectProfile(null);
    router.push('/(tabs)/equalizer');
  };

  return (
    <ScreenContainer>
      <Header
        title="DISCOVER"
        subtitle="Verified Reference Targets & Audiophile Presets"
      />

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search profiles by curve, IEM, or genre..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabFilterRow}>
        <Button
          label="ALL PRESETS"
          variant={filterTab === 'all' ? 'primary' : 'secondary'}
          size="sm"
          onPress={() => setFilterTab('all')}
        />
        <Button
          label="CURATED TARGETS"
          variant={filterTab === 'curated' ? 'primary' : 'secondary'}
          size="sm"
          onPress={() => setFilterTab('curated')}
        />
        <Button
          label="COMMUNITY TUNES"
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
            onPress={() => setInspectProfile(item)}
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
                Rig: {item.sourceAttribution || 'N/A'}
              </Text>
              <Text style={styles.metaText}>
                Preamp: {item.preampDb > 0 ? `+${item.preampDb}` : item.preampDb} dB
              </Text>
              <Text style={styles.metaText}>
                {item.filters.length} Filter Bands
              </Text>
            </View>

            <View style={styles.actionRow}>
              <Button
                label="INSPECT FILTERS"
                variant="ghost"
                size="sm"
                onPress={() => setInspectProfile(item)}
              />
              <Button
                label={isCurrent ? 'CURRENTLY ACTIVE' : 'LOAD TO EQ'}
                variant={isCurrent ? 'primary' : 'outline'}
                size="sm"
                disabled={isCurrent}
                onPress={() => handleApplyProfile(item)}
              />
            </View>
          </Card>
        );
      })}

      {/* Profile Detail Inspector Modal */}
      {inspectProfile && (
        <Modal visible transparent animationType="slide" onRequestClose={() => setInspectProfile(null)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={styles.flexOne}>
                  <Text style={styles.modalProfileName}>{inspectProfile.name}</Text>
                  <Text style={styles.modalProfileIEM}>Target: {inspectProfile.iemName}</Text>
                </View>
                <TouchableOpacity onPress={() => setInspectProfile(null)} style={styles.closeBtn}>
                  <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
                <Text style={styles.modalDescription}>{inspectProfile.description}</Text>

                <View style={styles.modalBadgeRow}>
                  <Badge label={`Preamp ${inspectProfile.preampDb} dB`} variant="neutral" size="sm" />
                  <Badge label={inspectProfile.targetCurve || 'Custom Curve'} variant="primary" size="sm" />
                  <Badge label={inspectProfile.sourceAttribution || 'Lab'} variant="info" size="sm" />
                </View>

                <Text style={styles.modalFilterHeading}>PARAMETRIC FILTER CASCADE</Text>
                {inspectProfile.filters.map((f, idx) => (
                  <View key={f.id || idx} style={styles.modalFilterRow}>
                    <Text style={styles.modalFilterIndex}>Band {idx + 1}</Text>
                    <Text style={styles.modalFilterType}>{f.type.toUpperCase()}</Text>
                    <Text style={styles.modalFilterFreq}>
                      {f.frequency >= 1000 ? `${(f.frequency / 1000).toFixed(1)}k Hz` : `${f.frequency} Hz`}
                    </Text>
                    <Text
                      style={[
                        styles.modalFilterGain,
                        f.gain > 0 && styles.gainPos,
                        f.gain < 0 && styles.gainNeg,
                      ]}
                    >
                      {f.gain > 0 ? `+${f.gain}` : f.gain} dB
                    </Text>
                    <Text style={styles.modalFilterQ}>Q {f.q}</Text>
                  </View>
                ))}
              </ScrollView>

              <View style={styles.modalActions}>
                <Button
                  label="LOAD THIS PRESET"
                  variant="primary"
                  size="md"
                  style={styles.flexOne}
                  onPress={() => handleApplyProfile(inspectProfile)}
                />
              </View>
            </View>
          </View>
        </Modal>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    backgroundColor: '#090810',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  searchInput: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  tabFilterRow: {
    flexDirection: 'row',
    gap: spacing.xs,
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
    gap: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#12101D',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: colors.borderActive,
    padding: spacing.base,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.sm,
  },
  modalProfileName: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
  },
  modalProfileIEM: {
    color: colors.primaryLight,
    fontSize: typography.fontSizes.xs,
    marginTop: 2,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  closeBtnText: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.bold,
  },
  modalScroll: {
    marginBottom: spacing.md,
  },
  modalDescription: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.sm,
    lineHeight: typography.lineHeights.sm,
    marginBottom: spacing.sm,
  },
  modalBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  modalFilterHeading: {
    color: colors.textMuted,
    fontSize: typography.fontSizes.xs - 1,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: typography.letterSpacing.widest,
    marginBottom: spacing.sm,
  },
  modalFilterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#090810',
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalFilterIndex: {
    color: colors.primaryLight,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
  },
  modalFilterType: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.xs,
  },
  modalFilterFreq: {
    color: colors.accentCyan,
    fontSize: typography.fontSizes.xs,
  },
  modalFilterGain: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
  },
  gainPos: {
    color: colors.success,
  },
  gainNeg: {
    color: colors.accentLavender,
  },
  modalFilterQ: {
    color: colors.textMuted,
    fontSize: typography.fontSizes.xs,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  flexOne: {
    flex: 1,
  },
});
