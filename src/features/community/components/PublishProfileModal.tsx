import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing, borderRadius } from '@/theme/spacing';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { useUserStore } from '@/store/useUserStore';
import { communityService } from '@/services/community/communityService';
import type { EQProfile, ScenarioType } from '@/core/types/audio';

interface PublishProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (newProfile: EQProfile) => void;
  initialProfile: EQProfile;
}

const SCENARIOS: { id: ScenarioType; label: string }[] = [
  { id: 'music_balanced', label: 'Music (Balanced)' },
  { id: 'music_bass', label: 'Music (Bass Focus)' },
  { id: 'music_vocal', label: 'Music (Vocal Focus)' },
  { id: 'gaming_fps', label: 'Gaming (FPS Footsteps)' },
  { id: 'movie_cinema', label: 'Movie (Cinematic)' },
  { id: 'podcast_speech', label: 'Podcast (Speech)' },
];

export function PublishProfileModal({
  visible,
  onClose,
  onSuccess,
  initialProfile,
}: PublishProfileModalProps) {
  const { user } = useUserStore();
  const [name, setName] = useState(initialProfile.name || '');
  const [description, setDescription] = useState(initialProfile.description || '');
  const [scenario, setScenario] = useState<ScenarioType>(initialProfile.scenario || 'music_balanced');
  const [targetCurve, setTargetCurve] = useState(initialProfile.targetCurve || 'Custom Acoustic Curve');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filter bands validation
  const filterCount = initialProfile.filters.length;
  const isFilterCountSafe = filterCount <= 10;

  // Headroom check
  const maxGain = Math.max(0, ...initialProfile.filters.filter((f) => f.enabled).map((f) => f.gain));
  const isClippingRisk = maxGain > 0 && initialProfile.preampDb > -maxGain + 0.1;

  const handlePublish = async () => {
    setErrorMessage(null);

    if (name.trim().length < 3) {
      setErrorMessage('Profile name must be at least 3 characters.');
      return;
    }

    if (!isFilterCountSafe) {
      setErrorMessage('Community presets cannot exceed 10 filter bands.');
      return;
    }

    setIsSubmitting(true);

    try {
      const creatorName = user.displayName || user.email?.split('@')[0] || 'Audiophile Explorer';
      const result = await communityService.publishProfile({
        name,
        description,
        iemId: initialProfile.iemId,
        iemName: initialProfile.iemName,
        scenario,
        targetCurve,
        preampDb: initialProfile.preampDb,
        filters: initialProfile.filters,
        creatorId: user.id,
        creatorName,
      });

      if (result.success && result.profile) {
        onSuccess(result.profile);
        onClose();
      } else {
        setErrorMessage(result.error || 'Failed to publish profile.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>SHARE TO COMMUNITY</Text>
              <Text style={styles.subtitle}>Publish your custom IEM calibration</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.contentScroll}>
            {errorMessage && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}

            {/* Target IEM & Creator Tag */}
            <View style={styles.targetIEMCard}>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>TARGET IEM</Text>
                <Text style={styles.metaValue}>{initialProfile.iemName || 'Universal IEM'}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>CREATOR</Text>
                <Text style={styles.metaValueHighlight}>
                  @{user.displayName || user.email?.split('@')[0] || 'Audiophile Explorer'}
                </Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>BAND COUNT</Text>
                <Text style={[styles.metaValue, !isFilterCountSafe && styles.warningText]}>
                  {filterCount} / 10 Bands
                </Text>
              </View>
            </View>

            {/* Scientific Verification Lockdown Notice */}
            <View style={styles.verificationNotice}>
              <View style={styles.noticeIconCircle}>
                <Text style={styles.noticeIcon}>ℹ</Text>
              </View>
              <Text style={styles.noticeText}>
                Community presets are published as <Text style={styles.noticeBold}>Unverified Community Tunings</Text>.
                Laboratory Verified badges are strictly reserved for scientifically measured IEC 60318-4 coupler profiles.
              </Text>
            </View>

            {/* Clipping Risk Warning */}
            {isClippingRisk && (
              <View style={styles.clippingWarningBox}>
                <Text style={styles.warningTitle}>⚠️ POTENTIAL DIGITAL CLIPPING RISK</Text>
                <Text style={styles.warningMessage}>
                  Maximum filter boost is +{maxGain.toFixed(1)} dB with Preamp set to{' '}
                  {initialProfile.preampDb > 0 ? `+${initialProfile.preampDb}` : initialProfile.preampDb} dB.
                  We recommend setting Preamp to ≤ -{maxGain.toFixed(1)} dB to avoid 0 dBFS clipping.
                </Text>
              </View>
            )}

            {/* Preset Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>PRESET NAME *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Warm Vocal Intimacy Contour"
                placeholderTextColor={colors.textMuted}
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Reference Target Curve */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>REFERENCE TARGET CURVE / INSPIRATION</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Harman In-Ear 2019v2, IEF Neutral, Basshead"
                placeholderTextColor={colors.textMuted}
                value={targetCurve}
                onChangeText={setTargetCurve}
              />
            </View>

            {/* Scenario Category */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>LISTENING SCENARIO</Text>
              <View style={styles.scenarioGrid}>
                {SCENARIOS.map((sc) => {
                  const isSelected = scenario === sc.id;
                  return (
                    <TouchableOpacity
                      key={sc.id}
                      style={[styles.scenarioChip, isSelected && styles.scenarioChipActive]}
                      onPress={() => setScenario(sc.id)}
                    >
                      <Text
                        style={[
                          styles.scenarioChipText,
                          isSelected && styles.scenarioChipTextActive,
                        ]}
                      >
                        {sc.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Description & Tips */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>DESCRIPTION & LISTENING NOTES</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Describe your soundstage modifications, recommended genres, or tips for other listeners..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={3}
                value={description}
                onChangeText={setDescription}
              />
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={styles.footerActions}>
            <Button
              label="CANCEL"
              variant="ghost"
              size="md"
              onPress={onClose}
              style={styles.actionBtn}
            />
            <Button
              label={isSubmitting ? 'PUBLISHING...' : 'PUBLISH PRESET'}
              variant="primary"
              size="md"
              disabled={isSubmitting}
              onPress={handlePublish}
              style={styles.actionBtn}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(9, 8, 16, 0.88)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.card,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    borderTopWidth: 1,
    borderColor: colors.border,
    maxHeight: '90%',
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: 0.8,
  },
  subtitle: {
    color: colors.primaryLight,
    fontSize: typography.fontSizes.xs,
    marginTop: 2,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  closeBtnText: {
    color: colors.textMuted,
    fontSize: typography.fontSizes.lg,
  },
  contentScroll: {
    marginBottom: spacing.md,
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.fontSizes.xs,
  },
  targetIEMCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  metaLabel: {
    color: colors.textMuted,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
  },
  metaValue: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium,
  },
  metaValueHighlight: {
    color: colors.primaryLight,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
  },
  warningText: {
    color: colors.error,
  },
  verificationNotice: {
    flexDirection: 'row',
    backgroundColor: 'rgba(168, 85, 247, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.25)',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
  },
  noticeIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noticeIcon: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: typography.fontWeights.bold,
  },
  noticeText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: typography.fontSizes.xs,
    lineHeight: 16,
  },
  noticeBold: {
    color: colors.textPrimary,
    fontWeight: typography.fontWeights.bold,
  },
  clippingWarningBox: {
    backgroundColor: 'rgba(234, 179, 8, 0.12)',
    borderWidth: 1,
    borderColor: colors.warning,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  warningTitle: {
    color: colors.warning,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    marginBottom: 4,
  },
  warningMessage: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.xs,
    lineHeight: 15,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  textInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    color: colors.textPrimary,
    fontSize: typography.fontSizes.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  scenarioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  scenarioChip: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  scenarioChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryLight,
  },
  scenarioChipText: {
    color: colors.textMuted,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium,
  },
  scenarioChipTextActive: {
    color: colors.textPrimary,
    fontWeight: typography.fontWeights.bold,
  },
  footerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.xs,
  },
  actionBtn: {
    flex: 1,
  },
});

