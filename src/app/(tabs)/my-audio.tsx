import React, { useEffect, useState } from 'react';
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
import { getLocalIEMs } from '@/services/local-db/sqlite';
import { isSupabaseConfigured } from '@/services/supabase/client';
import { IEMModel } from '@/core/types/audio';

export default function MyAudioScreen() {
  const { activeIEM, setActiveIEM } = useAudioStore();
  const [iems, setIems] = useState<IEMModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchIEMs() {
      try {
        const localList = await getLocalIEMs();
        setIems(localList);
      } catch (err) {
        console.warn('Failed to load local IEMs:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchIEMs();
  }, []);

  return (
    <ScreenContainer>
      <Header
        title="MY AUDIO"
        subtitle="Hardware Collection & Custom Tuning Vault"
      />

      {/* Sync Status Banner */}
      <Card variant="elevated" style={styles.syncCard}>
        <View style={styles.rowBetween}>
          <Text style={styles.syncTitle}>LOCAL & CLOUD SYNC</Text>
          <Badge
            label={isSupabaseConfigured ? 'CLOUD SYNCED' : 'OFFLINE SQLITE'}
            variant={isSupabaseConfigured ? 'success' : 'neutral'}
            size="sm"
          />
        </View>
        <Text style={styles.syncDescription}>
          {isSupabaseConfigured
            ? 'Connected to Supabase PostgreSQL with real-time profile backup.'
            : 'Running in offline-first mode via local SQLite database.'}
        </Text>
      </Card>

      {/* Personal IEM Collection */}
      <View style={styles.section}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>REGISTERED IEMS</Text>
          <Badge label={`${iems.length} DETECTED`} variant="primary" size="sm" />
        </View>

        {iems.map((iem) => {
          const isActive = activeIEM.id === iem.id;
          return (
            <Card
              key={iem.id}
              variant={isActive ? 'glow' : 'default'}
              style={styles.iemCard}
            >
              <View style={styles.rowBetween}>
                <View>
                  <Text style={styles.iemManufacturer}>{iem.manufacturerName}</Text>
                  <Text style={styles.iemName}>{iem.name}</Text>
                </View>
                {isActive && (
                  <Badge label="ACTIVE BENCH" variant="primary" size="sm" />
                )}
              </View>

              <View style={styles.specsRow}>
                <Badge label={iem.driverType} variant="neutral" size="sm" />
                <Badge label={`${iem.impedanceOhms} Ω`} variant="neutral" size="sm" />
                <Badge label={`${iem.sensitivityDbMw} dB/mW`} variant="neutral" size="sm" />
              </View>

              <Text style={styles.iemDescription}>{iem.description}</Text>

              <View style={styles.actionRow}>
                <Button
                  label={isActive ? 'CURRENTLY SELECTED' : 'SELECT THIS IEM'}
                  variant={isActive ? 'primary' : 'outline'}
                  size="sm"
                  disabled={isActive}
                  onPress={() => setActiveIEM(iem)}
                />
              </View>
            </Card>
          );
        })}
      </View>
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
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: typography.letterSpacing.wider,
  },
  iemCard: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  iemManufacturer: {
    color: colors.primaryLight,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
    letterSpacing: typography.letterSpacing.wider,
  },
  iemName: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    marginTop: 2,
  },
  specsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  iemDescription: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.xs,
    lineHeight: typography.lineHeights.sm,
    marginBottom: spacing.md,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});
