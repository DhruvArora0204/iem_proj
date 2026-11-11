import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing, borderRadius } from '@/theme/spacing';
import { Button } from '@/components/common/Button';
import { useUserStore } from '@/store/useUserStore';
import { communityService } from '@/services/community/communityService';
import type { EQProfile, ProfileReportReason } from '@/core/types/audio';

interface ReportProfileModalProps {
  visible: boolean;
  onClose: () => void;
  profile: EQProfile;
}

const REPORT_REASONS: { id: ProfileReportReason; label: string; desc: string }[] = [
  {
    id: 'distortion_clipping',
    label: 'Audio Distortion / Clipping Risk',
    desc: 'Excessive digital boost without adequate negative preamp, leading to severe output distortion.',
  },
  {
    id: 'spam_inaccurate',
    label: 'Inaccurate IEM Association / Spam',
    desc: 'Profile does not match the tagged IEM or contains irrelevant promotional spam.',
  },
  {
    id: 'inappropriate',
    label: 'Inappropriate Content',
    desc: 'Offensive language, harassment, or abusive profile notes.',
  },
  {
    id: 'copyright_duplicate',
    label: 'Plagiarized / Duplicate Preset',
    desc: 'Exact replica of another creator or official laboratory preset without attribution.',
  },
  {
    id: 'other',
    label: 'Other Quality Issue',
    desc: 'Other technical or community standard violations.',
  },
];

export function ReportProfileModal({ visible, onClose, profile }: ReportProfileModalProps) {
  const { user } = useUserStore();
  const [selectedReason, setSelectedReason] = useState<ProfileReportReason>('distortion_clipping');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await communityService.reportProfile({
        profileId: profile.id,
        reporterId: user.id,
        reporterName: user.displayName || user.email || 'Community Member',
        reason: selectedReason,
        details,
      });

      if (res.success) {
        setSubmitted(true);
      } else {
        setErrorMessage(res.error || 'Failed to submit report.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error submitting report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    setDetails('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleResetAndClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>REPORT PROFILE</Text>
              <Text style={styles.subtitle}>Flag for audio safety or guideline review</Text>
            </View>
            <TouchableOpacity onPress={handleResetAndClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {submitted ? (
            <View style={styles.successContainer}>
              <View style={styles.successIcon}>
                <Text style={styles.successCheck}>✓</Text>
              </View>
              <Text style={styles.successTitle}>Report Received</Text>
              <Text style={styles.successMessage}>
                Thank you for helping keep the Audiophile tuning catalog safe and accurate.
                Our moderation pipeline will review <Text style={styles.bold}>{profile.name}</Text> for audio clipping and guideline compliance.
              </Text>
              <Button
                label="DONE"
                variant="primary"
                size="md"
                onPress={handleResetAndClose}
                style={styles.fullWidthBtn}
              />
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
              <View style={styles.targetInfo}>
                <Text style={styles.targetLabel}>REPORTING TARGET:</Text>
                <Text style={styles.targetName}>{profile.name}</Text>
                <Text style={styles.targetSub}>Tuned for {profile.iemName || 'Universal IEM'}</Text>
              </View>

              {errorMessage && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              )}

              <Text style={styles.sectionHeading}>SELECT VIOLATION REASON</Text>
              {REPORT_REASONS.map((item) => {
                const isSelected = selectedReason === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.reasonItem, isSelected && styles.reasonItemActive]}
                    onPress={() => setSelectedReason(item.id)}
                  >
                    <View style={styles.radioCircle}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                    <View style={styles.reasonTextGroup}>
                      <Text style={[styles.reasonTitle, isSelected && styles.reasonTitleActive]}>
                        {item.label}
                      </Text>
                      <Text style={styles.reasonDesc}>{item.desc}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}

              <Text style={styles.sectionHeading}>ADDITIONAL DETAILS (OPTIONAL)</Text>
              <TextInput
                style={styles.detailsInput}
                placeholder="Provide specific details (e.g. tracks that clipped, coupler mismatch)..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={3}
                value={details}
                onChangeText={setDetails}
              />

              <View style={styles.footerRow}>
                <Button
                  label="CANCEL"
                  variant="ghost"
                  size="md"
                  onPress={handleResetAndClose}
                  style={styles.actionBtn}
                />
                <Button
                  label={isSubmitting ? 'SUBMITTING...' : 'SUBMIT REPORT'}
                  variant="primary"
                  size="md"
                  disabled={isSubmitting}
                  onPress={handleSubmit}
                  style={styles.actionBtn}
                />
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(9, 8, 16, 0.88)',
    justifyContent: 'center',
    padding: spacing.md,
  },
  container: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    maxHeight: '85%',
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
  },
  subtitle: {
    color: colors.textMuted,
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
  scroll: {
    marginVertical: spacing.xs,
  },
  targetInfo: {
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  targetLabel: {
    color: colors.textMuted,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
  },
  targetName: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    marginTop: 2,
  },
  targetSub: {
    color: colors.primaryLight,
    fontSize: typography.fontSizes.xs,
  },
  sectionHeading: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    marginBottom: spacing.xs,
    letterSpacing: 0.5,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xs,
  },
  reasonItemActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(168, 85, 247, 0.12)',
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    marginRight: spacing.sm,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  reasonTextGroup: {
    flex: 1,
  },
  reasonTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
  },
  reasonTitleActive: {
    color: colors.primaryLight,
  },
  reasonDesc: {
    color: colors.textMuted,
    fontSize: typography.fontSizes.xs - 1,
    marginTop: 2,
    lineHeight: 14,
  },
  detailsInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    color: colors.textPrimary,
    fontSize: typography.fontSizes.sm,
    padding: spacing.sm,
    minHeight: 60,
    textAlignVertical: 'top',
    marginBottom: spacing.md,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.fontSizes.xs,
  },
  footerRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  actionBtn: {
    flex: 1,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  successIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  successCheck: {
    color: colors.success,
    fontSize: 24,
    fontWeight: 'bold',
  },
  successTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    marginBottom: spacing.xs,
  },
  successMessage: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.xs,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: spacing.lg,
  },
  bold: {
    fontWeight: typography.fontWeights.bold,
    color: colors.textPrimary,
  },
  fullWidthBtn: {
    width: '100%',
  },
});

