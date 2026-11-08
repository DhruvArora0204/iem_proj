import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Alert, Modal, TextInput, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { IEMPickerModal } from '@/features/iem/components/IEMPickerModal';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing, borderRadius } from '@/theme/spacing';
import { useAudioStore } from '@/store/useAudioStore';
import { getLocalIEMs } from '@/services/local-db/sqlite';
import { isSupabaseConfigured } from '@/services/supabase/client';
import type { IEMModel, EQProfile } from '@/core/types/audio';

export default function MyAudioScreen() {
  const router = useRouter();
  const {
    activeIEM,
    activeProfile,
    filters,
    preampDb,
    setActiveIEM,
    setActiveProfile,
  } = useAudioStore();

  const [iems, setIems] = useState<IEMModel[]>([]);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportJson, setExportJson] = useState('');

  // Local custom profiles list
  const [savedProfiles, setSavedProfiles] = useState<EQProfile[]>([
    {
      id: 'custom-1',
      iemId: 'iem-1',
      iemName: 'Moondrop Blessing 3',
      name: 'Personal Vocal & Air Boost',
      description: 'Clean +2dB lift at 2.5 kHz and 12 kHz air extension.',
      profileType: 'user_custom',
      scenario: 'music_vocal',
      preampDb: -2.0,
      isPublic: false,
      isVerified: false,
      upvotesCount: 0,
      filters: [
        { id: '1', type: 'low_shelf', frequency: 105, gain: 2.0, q: 0.71, enabled: true },
        { id: '2', type: 'peak', frequency: 2500, gain: 2.2, q: 1.4, enabled: true },
        { id: '3', type: 'high_shelf', frequency: 12000, gain: 1.8, q: 0.71, enabled: true },
      ],
      createdAt: '2026-03-01T12:00:00Z',
      updatedAt: '2026-03-01T12:00:00Z',
    },
  ]);

  useEffect(() => {
    async function loadIEMs() {
      try {
        const localList = await getLocalIEMs();
        setIems(localList);
      } catch (err) {
        console.warn('Failed to load local IEMs:', err);
      }
    }
    loadIEMs();
  }, [activeIEM]);

  const handleOpenExport = () => {
    const config = {
      device: `${activeIEM.manufacturerName} ${activeIEM.name}`,
      profile: activeProfile.name,
      preampDb,
      filters: filters.map((f) => ({
        type: f.type,
        frequency: f.frequency,
        gain: f.gain,
        q: f.q,
        enabled: f.enabled,
      })),
      exportedAt: new Date().toISOString(),
      format: 'Audiophile-PEQ-v1',
    };
    setExportJson(JSON.stringify(config, null, 2));
    setIsExportModalOpen(true);
  };

  const handleLoadCustomProfile = (p: EQProfile) => {
    setActiveProfile(p);
    router.push('/(tabs)/equalizer');
  };

  const handleDeleteProfile = (id: string) => {
    Alert.alert('Delete Profile', 'Are you sure you want to remove this profile from your vault?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setSavedProfiles((prev) => prev.filter((p) => p.id !== id));
        },
      },
    ]);
  };

  return (
    <ScreenContainer>
      <Header
        title="MY AUDIO"
        subtitle="Hardware Collection & Custom Tuning Vault"
      />

      {/* Cloud & Local DB Sync Status */}
      <Card variant="elevated" style={styles.syncCard}>
        <View style={styles.rowBetween}>
          <Text style={styles.syncTitle}>LOCAL & CLOUD STORAGE</Text>
          <Badge
            label={isSupabaseConfigured ? 'CLOUD SYNC ACTIVE' : 'OFFLINE SQLITE'}
            variant={isSupabaseConfigured ? 'success' : 'neutral'}
            size="sm"
          />
        </View>
        <Text style={styles.syncDescription}>
          {isSupabaseConfigured
            ? 'Synced to Supabase PostgreSQL cloud backup.'
            : '100% offline mode via SQLite. All custom profiles and IEM settings persist locally.'}
        </Text>
      </Card>

      {/* Registered IEM Collection */}
      <View style={styles.section}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>MY IEM COLLECTION</Text>
          <Button
            label="+ ADD IEM"
            variant="outline"
            size="sm"
            onPress={() => setIsPickerOpen(true)}
          />
        </View>

        {iems.map((iem) => {
          const isActive = activeIEM.id === iem.id;
          return (
            <Card
              key={iem.id}
              variant={isActive ? 'glow' : 'default'}
              style={styles.iemCard}
              onPress={() => setActiveIEM(iem)}
            >
              <View style={styles.rowBetween}>
                <View>
                  <Text style={styles.iemManufacturer}>{iem.manufacturerName}</Text>
                  <Text style={styles.iemName}>{iem.name}</Text>
                </View>
                {isActive ? (
                  <Badge label="ACTIVE BENCH" variant="primary" size="sm" />
                ) : (
                  <Button
                    label="ACTIVATE"
                    variant="secondary"
                    size="sm"
                    onPress={() => setActiveIEM(iem)}
                  />
                )}
              </View>

              <View style={styles.specsRow}>
                <Badge label={iem.driverType} variant="neutral" size="sm" />
                <Badge label={`${iem.impedanceOhms} Ω`} variant="neutral" size="sm" />
                <Badge label={`${iem.sensitivityDbMw} dB/mW`} variant="neutral" size="sm" />
              </View>

              <Text style={styles.iemDescription}>{iem.description}</Text>
            </Card>
          );
        })}
      </View>

      {/* Custom Profiles Vault */}
      <View style={styles.section}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>CUSTOM PROFILES VAULT</Text>
          <Button
            label="EXPORT CONFIG"
            variant="secondary"
            size="sm"
            onPress={handleOpenExport}
          />
        </View>

        {savedProfiles.map((p) => {
          const isCurrent = activeProfile.id === p.id;
          return (
            <Card key={p.id} variant={isCurrent ? 'glow' : 'default'} style={styles.profileCard}>
              <View style={styles.rowBetween}>
                <View>
                  <Text style={styles.profileName}>{p.name}</Text>
                  <Text style={styles.profileTarget}>Tuned for: {p.iemName}</Text>
                </View>
                <Badge
                  label={p.scenario.toUpperCase().replace('_', ' ')}
                  variant="info"
                  size="sm"
                />
              </View>

              <Text style={styles.profileDesc}>{p.description}</Text>

              <View style={styles.profileMetaRow}>
                <Text style={styles.profileMetaText}>Preamp: {p.preampDb} dB</Text>
                <Text style={styles.profileMetaText}>{p.filters.length} Bands</Text>
                <Text style={styles.profileMetaText}>
                  {new Date(p.updatedAt).toLocaleDateString()}
                </Text>
              </View>

              <View style={styles.cardActions}>
                <Button
                  label="DELETE"
                  variant="danger"
                  size="sm"
                  onPress={() => handleDeleteProfile(p.id)}
                />
                <Button
                  label={isCurrent ? 'ACTIVE' : 'LOAD PROFILE'}
                  variant={isCurrent ? 'primary' : 'outline'}
                  size="sm"
                  disabled={isCurrent}
                  onPress={() => handleLoadCustomProfile(p)}
                />
              </View>
            </Card>
          );
        })}
      </View>

      {/* IEM Picker Modal */}
      <IEMPickerModal
        visible={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelectIEM={(selected) => setActiveIEM(selected)}
      />

      {/* Export JSON Modal */}
      <Modal visible={isExportModalOpen} transparent animationType="slide" onRequestClose={() => setIsExportModalOpen(false)}>
        <View style={styles.exportOverlay}>
          <View style={styles.exportContainer}>
            <View style={styles.rowBetween}>
              <Text style={styles.exportTitle}>EXPORT PEQ CONFIGURATION</Text>
              <Button
                label="CLOSE"
                variant="ghost"
                size="sm"
                onPress={() => setIsExportModalOpen(false)}
              />
            </View>

            <Text style={styles.exportSubtitle}>
              Standard JSON format compatible with parametric equalizers and cloud sync.
            </Text>

            <ScrollView style={styles.exportBox}>
              <TextInput
                style={styles.exportText}
                value={exportJson}
                multiline
                editable={false}
              />
            </ScrollView>

            <Button
              label="DONE"
              variant="primary"
              size="md"
              onPress={() => setIsExportModalOpen(false)}
            />
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  syncCard: {
    marginBottom: spacing.md,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  syncTitle: {
    color: colors.textMuted,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: typography.letterSpacing.widest,
  },
  syncDescription: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.xs,
    lineHeight: typography.lineHeights.sm,
    marginTop: 2,
  },
  section: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: typography.letterSpacing.widest,
  },
  iemCard: {
    marginTop: spacing.sm,
    padding: spacing.md,
  },
  iemManufacturer: {
    color: colors.primaryLight,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
    letterSpacing: typography.letterSpacing.wider,
  },
  iemName: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    marginTop: 2,
  },
  specsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  iemDescription: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.xs,
    lineHeight: typography.lineHeights.sm,
  },
  profileCard: {
    marginTop: spacing.sm,
    padding: spacing.md,
  },
  profileName: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.bold,
  },
  profileTarget: {
    color: colors.accentCyan,
    fontSize: typography.fontSizes.xs,
    marginTop: 2,
  },
  profileDesc: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.xs,
    lineHeight: typography.lineHeights.xs,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  profileMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginBottom: spacing.xs,
  },
  profileMetaText: {
    color: colors.textMuted,
    fontSize: typography.fontSizes.xs - 2,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.xs,
  },
  exportOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  exportContainer: {
    backgroundColor: '#12101D',
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.borderActive,
    maxHeight: '80%',
  },
  exportTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: typography.letterSpacing.wider,
  },
  exportSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.xs,
    marginTop: 4,
    marginBottom: spacing.sm,
  },
  exportBox: {
    backgroundColor: '#090810',
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    maxHeight: 260,
    marginBottom: spacing.md,
  },
  exportText: {
    color: colors.accentLavender,
    fontSize: typography.fontSizes.xs - 1,
    fontFamily: 'monospace',
  },
});
