import React, { useState, useEffect } from 'react';
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
import type { EQProfile, ProfileReview } from '@/core/types/audio';

interface ProfileReviewsModalProps {
  visible: boolean;
  onClose: () => void;
  profile: EQProfile;
  onReviewSubmitted?: (updatedProfile: EQProfile) => void;
}

export function ProfileReviewsModal({
  visible,
  onClose,
  profile,
  onReviewSubmitted,
}: ProfileReviewsModalProps) {
  const { user } = useUserStore();
  const [reviews, setReviews] = useState<ProfileReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRating, setSelectedRating] = useState<number>(profile.userRating || 5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      loadReviews();
    }
  }, [visible, profile.id]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const list = await communityService.getReviews(profile.id);
      setReviews(list);
      const existingUserReview = list.find((r) => r.userId === user.id);
      if (existingUserReview) {
        setSelectedRating(existingUserReview.rating);
        setComment(existingUserReview.comment);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async () => {
    setErrorMessage(null);
    if (!comment || comment.trim().length < 3) {
      setErrorMessage('Please write at least 3 characters in your review.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await communityService.submitReview(
        profile.id,
        selectedRating,
        comment,
        {
          id: user.id,
          name: user.displayName || user.email?.split('@')[0] || 'Community Listener',
          avatarUrl: user.avatarUrl,
        }
      );

      if (res.success) {
        await loadReviews();
        const profiles = await communityService.getProfiles();
        const updated = profiles.find((p) => p.id === profile.id);
        if (updated && onReviewSubmitted) {
          onReviewSubmitted(updated);
        }
      } else {
        setErrorMessage(res.error || 'Failed to submit review.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error submitting review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (count: number, interactive = false, onSelect?: (val: number) => void) => {
    return (
      <View style={styles.starRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            disabled={!interactive}
            onPress={() => onSelect && onSelect(star)}
            style={styles.starTouch}
          >
            <Text
              style={[
                styles.starIcon,
                star <= count ? styles.starFilled : styles.starEmpty,
                interactive && styles.starInteractive,
              ]}
            >
              ★
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>RATINGS & REVIEWS</Text>
              <Text style={styles.subtitle}>{profile.name}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Overall Rating Score Banner */}
          <View style={styles.ratingScoreBanner}>
            <View style={styles.scoreLeft}>
              <Text style={styles.ratingBigNumber}>
                {profile.ratingAverage ? profile.ratingAverage.toFixed(1) : 'New'}
              </Text>
              <Text style={styles.ratingOutOf}>/ 5.0</Text>
            </View>
            <View style={styles.scoreRight}>
              {renderStars(Math.round(profile.ratingAverage || 0))}
              <Text style={styles.reviewCountText}>
                Based on {reviews.length} community {reviews.length === 1 ? 'review' : 'reviews'}
              </Text>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
            {/* Interactive User Review Form */}
            <View style={styles.inputCard}>
              <Text style={styles.sectionTitle}>
                {profile.userRating ? 'EDIT YOUR REVIEW' : 'RATE THIS PRESET'}
              </Text>
              <View style={styles.starPickerRow}>
                {renderStars(selectedRating, true, setSelectedRating)}
                <Text style={styles.ratingLabel}>{selectedRating} Stars</Text>
              </View>

              {errorMessage && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              )}

              <TextInput
                style={styles.commentInput}
                placeholder="Share your listening impressions (tonal balance, staging, comfort)..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={3}
                value={comment}
                onChangeText={setComment}
              />

              <Button
                label={isSubmitting ? 'SUBMITTING...' : profile.userRating ? 'UPDATE REVIEW' : 'POST REVIEW'}
                variant="primary"
                size="sm"
                disabled={isSubmitting}
                onPress={handleReviewSubmit}
              />
            </View>

            {/* Reviews Thread List */}
            <Text style={styles.reviewsListHeader}>COMMUNITY FEEDBACK ({reviews.length})</Text>

            {loading ? (
              <ActivityIndicator color={colors.primary} style={styles.loader} />
            ) : reviews.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>No reviews yet. Be the first audiophile to review this preset!</Text>
              </View>
            ) : (
              reviews.map((r) => (
                <View key={r.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewerInfo}>
                      <View style={styles.avatarMini}>
                        <Text style={styles.avatarMiniText}>
                          {r.userName.substring(0, 2).toUpperCase()}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.reviewerName}>@{r.userName}</Text>
                        <Text style={styles.reviewDate}>
                          {new Date(r.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                    {renderStars(r.rating)}
                  </View>
                  <Text style={styles.reviewComment}>{r.comment}</Text>
                </View>
              ))
            )}
          </ScrollView>
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
    padding: spacing.lg,
    maxHeight: '90%',
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
  ratingScoreBanner: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    alignItems: 'center',
    gap: spacing.md,
  },
  scoreLeft: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  ratingBigNumber: {
    color: colors.primaryLight,
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
  },
  ratingOutOf: {
    color: colors.textMuted,
    fontSize: typography.fontSizes.xs,
    marginLeft: 4,
  },
  scoreRight: {
    flex: 1,
  },
  reviewCountText: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.xs,
    marginTop: 2,
  },
  scroll: {
    marginBottom: spacing.sm,
  },
  inputCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    marginBottom: spacing.xs,
    letterSpacing: 0.5,
  },
  starPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  ratingLabel: {
    color: colors.primaryLight,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
  },
  starRow: {
    flexDirection: 'row',
    gap: 4,
  },
  starTouch: {
    padding: 2,
  },
  starIcon: {
    fontSize: 18,
  },
  starInteractive: {
    fontSize: 24,
  },
  starFilled: {
    color: '#FACC15', // Vibrant amber yellow
  },
  starEmpty: {
    color: colors.border,
  },
  commentInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    color: colors.textPrimary,
    fontSize: typography.fontSizes.sm,
    padding: spacing.sm,
    minHeight: 65,
    textAlignVertical: 'top',
    marginBottom: spacing.sm,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    padding: spacing.xs,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.fontSizes.xs,
  },
  reviewsListHeader: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    marginBottom: spacing.sm,
    letterSpacing: 0.5,
  },
  loader: {
    marginVertical: spacing.md,
  },
  emptyBox: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: typography.fontSizes.xs,
    textAlign: 'center',
  },
  reviewCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  avatarMini: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarMiniText: {
    color: colors.textPrimary,
    fontSize: 9,
    fontWeight: 'bold',
  },
  reviewerName: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
  },
  reviewDate: {
    color: colors.textMuted,
    fontSize: typography.fontSizes.xs - 2,
  },
  reviewComment: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.xs,
    lineHeight: 16,
    marginTop: 4,
  },
});

