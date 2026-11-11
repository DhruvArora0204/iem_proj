import { FrequencyResponseGraph } from '@/components/audio/FrequencyResponseGraph';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Header } from '@/components/layout/Header';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import type { BiquadFilterConfig } from '@/core/types/audio';
import { AudioTestBench } from '@/features/audio-player/components/AudioTestBench';
import { PublishProfileModal } from '@/features/community/components/PublishProfileModal';
import { FilterEditModal } from '@/features/equalizer/components/FilterEditModal';
import { MacroKnobsGrid } from '@/features/equalizer/components/MacroKnobsGrid';
import { SaveProfileModal } from '@/features/presets/components/SaveProfileModal';
import { useAudioStore } from '@/store/useAudioStore';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { useState } from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

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
    updateFilter,
    addFilter,
    removeFilter,
    setAutoPreamp,
    setPreamp,
    resetToFlat,
  } = useAudioStore();

  const [selectedFilter, setSelectedFilter] = useState<BiquadFilterConfig | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  // Calculate if maximum positive peak exceeds available headroom
  const maxGainBoost = Math.max(0, ...filters.filter((f) => f.enabled).map((f) => f.gain));
  const effectivePeak = maxGainBoost + preampDb;
  const isClippingRisk = effectivePeak > 0.05 && !isBypassed;

  const handleOpenFilterEdit = (filterId: string) => {
    const target = filters.find((f) => f.id === filterId);
    if (target) {
      setSelectedFilter(target);
      setIsEditModalOpen(true);
    }
  };

  const handleAddNewBand = () => {
    const newBandId = `filter-${Date.now()}`;
    const newBand: BiquadFilterConfig = {
      id: newBandId,
      type: 'peak',
      frequency: 2500,
      gain: 2.0,
      q: 1.4,
      enabled: true,
    };
    addFilter(newBand);
    setSelectedFilter(newBand);
    setIsEditModalOpen(true);
  };

  const selectedBandIndex = selectedFilter
    ? filters.findIndex((f) => f.id === selectedFilter.id)
    : 0;

  return (
    <ScreenContainer>
      <Header
        title="PARAMETRIC EQ"
        subtitle={`Calibrated Studio Tuning for ${activeIEM.manufacturerName} ${activeIEM.name}`}
        showLabBadge
      />

      {/* Profile & Master Headroom Console */}
      <Card variant="elevated" style={styles.consoleCard}>
        <View style={styles.rowBetween}>
          <View style={styles.profileMetaColumn}>
            <Text style={styles.profileTitle}>{activeProfile.name}</Text>
            <Text style={styles.profileTarget}>
              Reference Curve: {activeProfile.targetCurve || 'Custom Flat'}
            </Text>
          </View>
          <View style={styles.headerRightActions}>
            <Button
              label={isBypassed ? 'EQ BYPASS' : 'EQ ACTIVE'}
              variant={isBypassed ? 'danger' : 'primary'}
              size="sm"
              onPress={toggleBypass}
            />
          </View>
        </View>

        {/* Headroom / Preamp Stage */}
        <View style={styles.headroomConsole}>
          <View>
            <View style={styles.headroomLabelRow}>
              <Text style={styles.headroomLabel}>PREAMP GAIN</Text>
              {isClippingRisk && (
                <Badge label="CLIPPING RISK (>0 dBFS)" variant="danger" size="sm" />
              )}
            </View>
            <Text
              style={[
                styles.headroomValue,
                isClippingRisk && styles.headroomValueDanger,
              ]}
            >
              {preampDb > 0 ? `+${preampDb.toFixed(1)}` : preampDb.toFixed(1)} dB
            </Text>
          </View>

          <View style={styles.preampButtonRow}>
            <Button
              label="-1.0"
              size="sm"
              variant="secondary"
              onPress={() => setPreamp(preampDb - 1.0)}
            />
            <Button
              label="-0.2"
              size="sm"
              variant="secondary"
              onPress={() => setPreamp(preampDb - 0.2)}
            />
            <Button
              label="+0.2"
              size="sm"
              variant="secondary"
              onPress={() => setPreamp(preampDb + 0.2)}
            />
            <Button
              label="+1.0"
              size="sm"
              variant="secondary"
              onPress={() => setPreamp(preampDb + 1.0)}
            />
          </View>
        </View>

        {/* Auto-Preamp Switch */}
        <View style={styles.autoPreampRow}>
          <View>
            <Text style={styles.autoPreampTitle}>Auto-Preamp Clipping Guard</Text>
            <Text style={styles.autoPreampSubtitle}>
              Automatically offsets gain to prevent digital overs
            </Text>
          </View>
          <Switch
            value={isAutoPreampEnabled}
            onValueChange={setAutoPreamp}
            thumbColor={isAutoPreampEnabled ? colors.primary : colors.textMuted}
            trackColor={{ false: colors.border, true: 'rgba(168, 85, 247, 0.4)' }}
          />
        </View>
      </Card>

      {/* Interactive Frequency Response Graph */}
      <FrequencyResponseGraph
        filters={filters}
        preampDb={preampDb}
        isBypassed={isBypassed}
        selectedFilterId={selectedFilter?.id}
        onFilterChange={(id, updates) => updateFilter(id, updates)}
        onSelectFilter={handleOpenFilterEdit}
        showHarmanTarget
      />

      {/* Tactile Macro Dials */}
      <MacroKnobsGrid />

      {/* In-App Acoustic DSP Test Bench */}
      <AudioTestBench />

      {/* Parametric Bands Manager */}
      <View style={styles.bandsSection}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>PARAMETRIC FILTER CASCADE</Text>
          <View style={styles.bandActionGroup}>
            <Button
              label="+ ADD BAND"
              variant="outline"
              size="sm"
              onPress={handleAddNewBand}
            />
            <Button
              label="RESET"
              variant="ghost"
              size="sm"
              onPress={resetToFlat}
            />
          </View>
        </View>

        {filters.map((band, index) => (
          <Card key={band.id} style={styles.bandCard}>
            <View style={styles.bandHeader}>
              <TouchableOpacity
                style={styles.bandSelectableArea}
                onPress={() => handleOpenFilterEdit(band.id)}
              >
                <View style={styles.bandBadge}>
                  <Text style={styles.bandBadgeText}>{index + 1}</Text>
                </View>
                <View>
                  <Text style={styles.bandType}>
                    {band.type.toUpperCase().replace('_', ' ')}
                  </Text>
                  <Text style={styles.bandQuickReadout}>
                    {band.frequency >= 1000
                      ? `${(band.frequency / 1000).toFixed(2)} kHz`
                      : `${band.frequency} Hz`}{' '}
                    | {band.gain > 0 ? `+${band.gain.toFixed(1)}` : band.gain.toFixed(1)} dB | Q {band.q.toFixed(2)}
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={styles.bandRightControls}>
                <Button
                  label="EDIT"
                  size="sm"
                  variant="secondary"
                  onPress={() => handleOpenFilterEdit(band.id)}
                />
                <Switch
                  value={band.enabled}
                  onValueChange={() => toggleFilter(band.id)}
                  thumbColor={band.enabled ? colors.primary : colors.textMuted}
                  trackColor={{ false: colors.border, true: 'rgba(168, 85, 247, 0.4)' }}
                />
              </View>
            </View>
          </Card>
        ))}
      </View>

      {/* Floating Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <Button
          label="SAVE PROFILE"
          variant="secondary"
          size="md"
          style={styles.flexOne}
          onPress={() => setIsSaveModalOpen(true)}
        />
        <Button
          label="SHARE TO COMMUNITY"
          variant="primary"
          size="md"
          style={styles.flexOne}
          onPress={() => setIsPublishModalOpen(true)}
        />
      </View>

      {/* Filter Editor Modal */}
      <FilterEditModal
        visible={isEditModalOpen}
        filter={selectedFilter}
        bandIndex={selectedBandIndex}
        onClose={() => setIsEditModalOpen(false)}
        onUpdate={(updates) => {
          if (selectedFilter) {
            updateFilter(selectedFilter.id, updates);
            setSelectedFilter({ ...selectedFilter, ...updates });
          }
        }}
        onDelete={() => {
          if (selectedFilter && filters.length > 1) {
            removeFilter(selectedFilter.id);
            setIsEditModalOpen(false);
          }
        }}
      />

      {/* Save Profile Modal */}
      <SaveProfileModal
        visible={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
      />

      {/* Community Publish Modal */}
      <PublishProfileModal
        visible={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        initialProfile={{
          ...activeProfile,
          iemId: activeIEM.id,
          iemName: `${activeIEM.manufacturerName} ${activeIEM.name}`,
          filters,
          preampDb,
        }}
        onSuccess={() => {
          setIsPublishModalOpen(false);
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  consoleCard: {
    marginBottom: spacing.md,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  profileMetaColumn: {
    flex: 1,
    marginRight: spacing.sm,
  },
  profileTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
  },
  profileTarget: {
    color: colors.accentCyan,
    fontSize: typography.fontSizes.xs,
    marginTop: 2,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headroomConsole: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.sm,
  },
  headroomLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headroomLabel: {
    color: colors.textMuted,
    fontSize: typography.fontSizes.xs - 2,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: typography.letterSpacing.wider,
  },
  headroomValue: {
    color: colors.primaryLight,
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    marginTop: 1,
  },
  headroomValueDanger: {
    color: colors.danger,
  },
  preampButtonRow: {
    flexDirection: 'row',
    gap: 4,
  },
  autoPreampRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.xs,
  },
  autoPreampTitle: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
  },
  autoPreampSubtitle: {
    color: colors.textMuted,
    fontSize: typography.fontSizes.xs - 2,
    marginTop: 1,
  },
  bandsSection: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: typography.letterSpacing.widest,
  },
  bandActionGroup: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  bandCard: {
    marginTop: spacing.sm,
    padding: spacing.md,
  },
  bandHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bandSelectableArea: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bandBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    borderWidth: 1,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  bandBadgeText: {
    color: colors.primaryLight,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
  },
  bandType: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
  },
  bandQuickReadout: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.xs,
    marginTop: 2,
  },
  bandRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  bottomBar: {
    marginBottom: spacing.xxl,
  },
  flexOne: {
    flex: 1,
  },
});
