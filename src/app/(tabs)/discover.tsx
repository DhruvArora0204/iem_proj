import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Modal,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
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
import { useUserStore } from '@/store/useUserStore';
import { communityService } from '@/services/community/communityService';
import { PublishProfileModal } from '@/features/community/components/PublishProfileModal';
import { ReportProfileModal } from '@/features/community/components/ReportProfileModal';
import { ProfileReviewsModal } from '@/features/community/components/ProfileReviewsModal';
import type { EQProfile } from '@/core/types/audio';

export default function DiscoverScreen() {
  const router = useRouter();
  const { activeProfile, setActiveProfile } = useAudioStore();
  const { user } = useUserStore();

  const [profiles, setProfiles] = useState<EQProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'curated' | 'community'>('all');

  // Modals state
  const [inspectProfile, setInspectProfile] = useState<EQProfile | null>(null);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [reportProfileTarget, setReportProfileTarget] = useState<EQProfile | null>(null);
  const [reviewsProfileTarget, setReviewsProfileTarget] = useState<EQProfile | null>(null);

    useEffect(() => {
      fetchProfiles();
    }, []);

    const fetchProfiles = async () => {
      setLoading(true);
      try {
        const data = await communityService.getProfiles();
        setProfiles(data);
      } finally {
        setLoading(false);
      }
    };

    const handleUpvoteToggle = async (profileId: string) => {
      try {
        const res = await communityService.toggleUpvote(profileId);
        setProfiles((prev) =>
          prev.map((p) =>
            p.id === profileId
              ? { ...p, upvotesCount: res.upvotesCount, userUpvoted: res.upvoted }
              : p
          )
        );
        if (inspectProfile && inspectProfile.id === profileId) {
          setInspectProfile((prev) =>
            prev ? { ...prev, upvotesCount: res.upvotesCount, userUpvoted: res.upvoted } : null
          );
        }
      } catch (e) {
        console.warn('Failed to toggle upvote:', e);
      }
    };

    const filteredList = profiles.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.iemName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.targetCurve?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.creatorName?.toLowerCase().includes(searchQuery.toLowerCase());

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

        {/* Community Callout & Share Action */}
        <Card variant="elevated" style={styles.communityBanner}>
          <View style={styles.bannerRow}>
            <View style={styles.bannerTextCol}>
              <Text style={styles.bannerTitle}>AUDIOPHILE COMMUNITY EXCHANGE</Text>
              <Text style={styles.bannerSubtitle}>
                Explore verified laboratory targets or share your own personal IEM calibration.
              </Text>
            </View>
            <Button
              label="+ SHARE PRESET"
              variant="primary"
              size="sm"
              onPress={() => setPublishModalOpen(true)}
            />
          </View>
        </Card>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search profiles by curve, IEM, creator, or genre..."
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

                  {loading ? (
                    <ActivityIndicator color={colors.primary} style={styles.loader} />
                  ) : (
                    /* Profiles List */
                    filteredList.map((item) => {
                      const isCurrent = activeProfile.id === item.id;
                      const isCommunity = item.profileType === 'community';

                      return (
            <Card
              key={item.id}
              variant={isCurrent ? 'glow' : 'default'}
              style={styles.profileCard}
              onPress={() => setInspectProfile(item)}
            >
              <View style={styles.cardHeaderRow}>
                <View style={styles.badgeGroup}>
                  {item.isVerified ? (
                    <Badge label="LAB VERIFIED" variant="success" size="sm" />
                  ) : isCommunity ? (
                    <Badge label="COMMUNITY TUNE" variant="info" size="sm" />
                  ) : (
                    <Badge label="CURATED TARGET" variant="primary" size="sm" />
                  )}
                  <Badge
                    label={item.scenario.toUpperCase().replace('_', ' ')}
                    variant="neutral"
                    size="sm"
                  />
                </View>

                {/* Upvote Toggle */}
                <TouchableOpacity
                  style={[styles.upvoteBtn, item.userUpvoted && styles.upvoteBtnActive]}
                  onPress={() => handleUpvoteToggle(item.id)}
                >
                  <Text style={[styles.upvoteArrow, item.userUpvoted && styles.upvoteArrowActive]}>
                    ▲
                  </Text>
                  <Text style={[styles.upvotesText, item.userUpvoted && styles.upvotesTextActive]}>
                    {item.upvotesCount}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.profileTitle}>{item.name}</Text>
              <View style={styles.targetIEMRow}>
                <Text style={styles.iemTargetModel}>Tuned for: {item.iemName}</Text>
                <Text style={styles.creatorAttribution}>
                  By @{item.creatorName || 'Anonymous'}
                </Text>
              </View>

              <Text style={styles.profileDescription} numberOfLines={2}>
                {item.description}
              </Text>

                {/* Rating & Review summary pill */}
                <View style={styles.ratingRow}>
                  <TouchableOpacity
                    style={styles.ratingBadge}
                    onPress={() => setReviewsProfileTarget(item)}
                  >
                    <Text style={styles.starText}>★</Text>
                    <Text style={styles.ratingAvgText}>
                      {item.ratingAverage ? item.ratingAverage.toFixed(1) : 'New'}
                    </Text>
                    <Text style={styles.ratingCountText}>
                      ({item.ratingCount || 0} reviews)
                    </Text>
                  </TouchableOpacity>

                  <Text style={styles.metaPreamp}>
                    Preamp: {item.preampDb > 0 ? `+${item.preampDb}` : item.preampDb} dB
                  </Text>
                  <Text style={styles.metaBands}>{item.filters.length} Bands</Text>
                </View>

                <View style={styles.actionRow}>
                  <Button
                    label="REVIEWS"
                    variant="ghost"
                    size="sm"
                    onPress={() => setReviewsProfileTarget(item)}
                  />
                  <Button
                    label="INSPECT"
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
        })
      )}

        {/* Profile Detail Inspector Modal */}
        {inspectProfile && (
          <Modal visible transparent animationType="slide" onRequestClose={() => setInspectProfile(null)}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <View style={styles.flexOne}>
                    <Text style={styles.modalProfileName}>{inspectProfile.name}</Text>
                    <Text style={styles.modalProfileIEM}>Target: {inspectProfile.iemName}</Text>
                    <Text style={styles.modalCreatorName}>
                      Creator: @{inspectProfile.creatorName || 'Acoustics Lab'}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setInspectProfile(null)} style={styles.closeBtn}>
                    <Text style={styles.closeBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
                  {/* Scientific Disclaimer for Community Presets */}
                  {!inspectProfile.isVerified && (
                    <View style={styles.disclaimerBox}>
                      <Text style={styles.disclaimerIcon}>⚠️</Text>
                      <Text style={styles.disclaimerText}>
                        <Text style={styles.disclaimerBold}>Scientific Notice:</Text> This is a user-submitted community profile.
                        It has not been verified on an IEC 60318-4 acoustic coupler rig. Listen at comfortable gain levels.
                      </Text>
                    </View>
                  )}

                  <Text style={styles.modalDescription}>{inspectProfile.description}</Text>

                  <View style={styles.modalBadgeRow}>
                    <Badge label={`Preamp ${inspectProfile.preampDb} dB`} variant="neutral" size="sm" />
                    <Badge label={inspectProfile.targetCurve || 'Custom Curve'} variant="primary" size="sm" />
                    <Badge label={inspectProfile.sourceAttribution || 'Lab'} variant="info" size="sm" />
                  </View>

                  {/* Ratings & Upvotes Bar inside Modal */}
                  <View style={styles.modalSocialBar}>
                    <TouchableOpacity
                      style={styles.modalRatingLink}
                      onPress={() => {
                        setReviewsProfileTarget(inspectProfile);
                      }}
                    >
                      <Text style={styles.starText}>★</Text>
                      <Text style={styles.modalRatingText}>
                        {inspectProfile.ratingAverage ? inspectProfile.ratingAverage.toFixed(1) : 'New'} (
                        {inspectProfile.ratingCount || 0} reviews) →
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.reportLink}
                      onPress={() => {
                        setReportProfileTarget(inspectProfile);
                      }}
                    >
                      <Text style={styles.reportLinkText}>⚑ Report Profile</Text>
                    </TouchableOpacity>
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

        {/* Publish Profile Modal */}
        <PublishProfileModal
          visible={publishModalOpen}
          onClose={() => setPublishModalOpen(false)}
          initialProfile={activeProfile}
          onSuccess={(newProfile) => {
            setProfiles((prev) => [newProfile, ...prev]);
          }}
        />

        {/* Report Profile Modal */}
        {reportProfileTarget && (
          <ReportProfileModal
            visible={Boolean(reportProfileTarget)}
            onClose={() => setReportProfileTarget(null)}
            profile={reportProfileTarget}
          />
        )}

        {/* Reviews & Feedback Modal */}
        {reviewsProfileTarget && (
          <ProfileReviewsModal
            visible={Boolean(reviewsProfileTarget)}
            onClose={() => setReviewsProfileTarget(null)}
            profile={reviewsProfileTarget}
            onReviewSubmitted={(updated) => {
              setProfiles((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
              if (inspectProfile && inspectProfile.id === updated.id) {
                setInspectProfile(updated);
              }
            }}
          />
        )}
      </ScreenContainer>
    );
  }

const styles = StyleSheet.create({
    communityBanner: {
      marginBottom: spacing.md,
    },
    bannerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: spacing.sm,
    },
    bannerTextCol: {
      flex: 1,
    },
    bannerTitle: {
      color: colors.primaryLight,
      fontSize: typography.fontSizes.xs,
      fontWeight: typography.fontWeights.bold,
      letterSpacing: 0.5,
    },
    bannerSubtitle: {
      color: colors.textSecondary,
      fontSize: typography.fontSizes.xs - 1,
      marginTop: 2,
      lineHeight: 14,
    },
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
    loader: {
      marginVertical: spacing.xl,
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
    upvoteBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: borderRadius.sm,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 4,
    },
    upvoteBtnActive: {
      backgroundColor: 'rgba(168, 85, 247, 0.2)',
      borderColor: colors.primary,
    },
    upvoteArrow: {
      color: colors.textMuted,
      fontSize: 10,
    },
    upvoteArrowActive: {
      color: colors.primary,
    },
    upvotesText: {
      color: colors.textSecondary,
      fontSize: typography.fontSizes.xs,
      fontWeight: typography.fontWeights.bold,
    },
    upvotesTextActive: {
      color: colors.primaryLight,
    },
    profileTitle: {
      color: colors.textPrimary,
      fontSize: typography.fontSizes.lg,
      fontWeight: typography.fontWeights.bold,
      marginTop: spacing.xs,
    },
    targetIEMRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 2,
      marginBottom: spacing.xs,
    },
    iemTargetModel: {
      color: colors.accentCyan,
      fontSize: typography.fontSizes.xs,
      fontWeight: typography.fontWeights.medium,
    },
    creatorAttribution: {
      color: colors.primaryLight,
      fontSize: typography.fontSizes.xs - 1,
      fontWeight: typography.fontWeights.medium,
    },
    profileDescription: {
      color: colors.textSecondary,
      fontSize: typography.fontSizes.sm,
      lineHeight: typography.lineHeights.sm,
      marginBottom: spacing.sm,
    },
      ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.xs,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        marginBottom: spacing.sm,
      },
        ratingBadge: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
        },
        starText: {
          color: '#FACC15',
          fontSize: 14,
        },
        ratingAvgText: {
          color: colors.textPrimary,
          fontSize: typography.fontSizes.xs,
          fontWeight: typography.fontWeights.bold,
        },
        ratingCountText: {
          color: colors.textMuted,
          fontSize: typography.fontSizes.xs - 1,
        },
        metaPreamp: {
          color: colors.textMuted,
          fontSize: typography.fontSizes.xs - 1,
        },
        metaBands: {
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
          alignItems: 'flex-start',
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
          color: colors.accentCyan,
          fontSize: typography.fontSizes.xs,
          marginTop: 2,
        },
        modalCreatorName: {
          color: colors.primaryLight,
          fontSize: typography.fontSizes.xs,
          marginTop: 1,
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
        disclaimerBox: {
          flexDirection: 'row',
          backgroundColor: 'rgba(234, 179, 8, 0.1)',
          borderWidth: 1,
          borderColor: 'rgba(234, 179, 8, 0.3)',
          borderRadius: borderRadius.md,
          padding: spacing.sm,
          marginBottom: spacing.md,
          gap: spacing.xs,
          alignItems: 'center',
        },
        disclaimerIcon: {
          fontSize: 16,
        },
        disclaimerText: {
          flex: 1,
          color: colors.textSecondary,
          fontSize: typography.fontSizes.xs - 1,
          lineHeight: 15,
        },
        disclaimerBold: {
          color: colors.warning,
          fontWeight: typography.fontWeights.bold,
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
        modalSocialBar: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: colors.surface,
          padding: spacing.sm,
          borderRadius: borderRadius.md,
          borderWidth: 1,
          borderColor: colors.border,
          marginBottom: spacing.md,
        },
        modalRatingLink: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
        },
        modalRatingText: {
          color: colors.primaryLight,
          fontSize: typography.fontSizes.xs,
          fontWeight: typography.fontWeights.semibold,
        },
        reportLink: {
          paddingVertical: 2,
        },
        reportLinkText: {
          color: colors.textMuted,
          fontSize: typography.fontSizes.xs,
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
