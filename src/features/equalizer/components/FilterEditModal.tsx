import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  ScrollView,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing, borderRadius } from '@/theme/spacing';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import type { BiquadFilterConfig, FilterType } from '@/core/types/audio';

interface FilterEditModalProps {
  visible: boolean;
  filter: BiquadFilterConfig | null;
  bandIndex: number;
  onClose: () => void;
  onUpdate: (updates: Partial<BiquadFilterConfig>) => void;
  onDelete?: () => void;
}

const FILTER_TYPES: { type: FilterType; label: string; desc: string }[] = [
  { type: 'peak', label: 'Peak / Bell', desc: 'Surgical parametric boost or cut around center frequency' },
  { type: 'low_shelf', label: 'Low Shelf', desc: 'Boosts or attenuates all frequencies below cutoff' },
  { type: 'high_shelf', label: 'High Shelf', desc: 'Boosts or attenuates all frequencies above cutoff' },
  { type: 'low_pass', label: 'Low Pass', desc: 'Attenuates high frequencies above cutoff' },
  { type: 'high_pass', label: 'High Pass', desc: 'Removes sub-bass rumble below cutoff' },
  { type: 'notch', label: 'Notch', desc: 'Narrowband elimination of resonant coupler peaks' },
];

export const FilterEditModal: React.FC<FilterEditModalProps> = ({
  visible,
  filter,
  bandIndex,
  onClose,
  onUpdate,
  onDelete,
}) => {
  if (!filter) return null;

  const stepFreq = (delta: number) => {
    const next = Math.max(20, Math.min(20000, Math.round(filter.frequency + delta)));
    onUpdate({ frequency: next });
  };

  const stepGain = (delta: number) => {
    const next = Math.max(-24, Math.min(24, Math.round((filter.gain + delta) * 10) / 10));
    onUpdate({ gain: next });
  };

  const stepQ = (delta: number) => {
    const next = Math.max(0.1, Math.min(20, Math.round((filter.q + delta) * 10) / 10));
    onUpdate({ q: next });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.titleGroup}>
              <Badge label={`BAND ${bandIndex + 1}`} variant="primary" size="sm" />
              <Text style={styles.modalTitle}>FILTER CONFIGURATION</Text>
            </View>
            <Switch
              value={filter.enabled}
              onValueChange={(enabled) => onUpdate({ enabled })}
              thumbColor={filter.enabled ? colors.primary : colors.textMuted}
              trackColor={{ false: colors.border, true: 'rgba(168, 85, 247, 0.4)' }}
            />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollArea}>
            {/* Filter Type Selector */}
            <Text style={styles.sectionLabel}>FILTER TOPOLOGY</Text>
            <View style={styles.typeGrid}>
              {FILTER_TYPES.map((t) => {
                const isSelected = filter.type === t.type;
                return (
                  <TouchableOpacity
                    key={t.type}
                    style={[styles.typeButton, isSelected && styles.typeButtonSelected]}
                    onPress={() => onUpdate({ type: t.type })}
                  >
                    <Text
                      style={[styles.typeButtonText, isSelected && styles.typeButtonTextSelected]}
                    >
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Frequency Control */}
            <View style={styles.paramBox}>
              <View style={styles.paramHeader}>
                <Text style={styles.paramLabel}>CENTER FREQUENCY</Text>
                <Text style={styles.paramValue}>
                  {filter.frequency >= 1000
                    ? `${(filter.frequency / 1000).toFixed(2)} kHz`
                    : `${filter.frequency} Hz`}
                </Text>
              </View>

              <View style={styles.stepperRow}>
                <Button label="-100" size="sm" variant="secondary" onPress={() => stepFreq(-100)} />
                <Button label="-10" size="sm" variant="secondary" onPress={() => stepFreq(-10)} />
                <Button label="+10" size="sm" variant="secondary" onPress={() => stepFreq(10)} />
                <Button label="+100" size="sm" variant="secondary" onPress={() => stepFreq(100)} />
              </View>
            </View>

            {/* Gain Control */}
            {filter.type !== 'low_pass' && filter.type !== 'high_pass' && filter.type !== 'notch' && (
              <View style={styles.paramBox}>
                <View style={styles.paramHeader}>
                  <Text style={styles.paramLabel}>GAIN AMPLITUDE</Text>
                  <Text
                    style={[
                      styles.paramValue,
                      filter.gain > 0 && styles.gainPositive,
                      filter.gain < 0 && styles.gainNegative,
                    ]}
                  >
                    {filter.gain > 0 ? `+${filter.gain.toFixed(1)}` : filter.gain.toFixed(1)} dB
                  </Text>
                </View>

                <View style={styles.stepperRow}>
                  <Button label="-1.0" size="sm" variant="secondary" onPress={() => stepGain(-1.0)} />
                  <Button label="-0.1" size="sm" variant="secondary" onPress={() => stepGain(-0.1)} />
                  <Button label="+0.1" size="sm" variant="secondary" onPress={() => stepGain(0.1)} />
                  <Button label="+1.0" size="sm" variant="secondary" onPress={() => stepGain(1.0)} />
                </View>
              </View>
            )}

            {/* Quality Factor (Q) */}
            <View style={styles.paramBox}>
              <View style={styles.paramHeader}>
                <View>
                  <Text style={styles.paramLabel}>QUALITY FACTOR (Q)</Text>
                  <Text style={styles.paramHint}>
                    {filter.q <= 0.7
                      ? 'Broad gentle curve'
                      : filter.q >= 3.0
                      ? 'Narrow surgical notch'
                      : 'Balanced acoustic filter'}
                  </Text>
                </View>
                <Text style={styles.paramValue}>{filter.q.toFixed(2)}</Text>
              </View>

              <View style={styles.stepperRow}>
                <Button label="-0.5" size="sm" variant="secondary" onPress={() => stepQ(-0.5)} />
                <Button label="-0.1" size="sm" variant="secondary" onPress={() => stepQ(-0.1)} />
                <Button label="+0.1" size="sm" variant="secondary" onPress={() => stepQ(0.1)} />
                <Button label="+0.5" size="sm" variant="secondary" onPress={() => stepQ(0.5)} />
              </View>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footerRow}>
            {onDelete && (
              <Button
                label="DELETE BAND"
                variant="danger"
                size="md"
                style={styles.flexOne}
                onPress={onDelete}
              />
            )}
            <Button
              label="APPLY & CLOSE"
              variant="primary"
              size="md"
              style={styles.flexOne}
              onPress={onClose}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#12101D',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: colors.borderActive,
    padding: spacing.base,
    maxHeight: '85%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.md,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: typography.letterSpacing.wider,
  },
  scrollArea: {
    marginBottom: spacing.md,
  },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: typography.fontSizes.xs - 1,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: typography.letterSpacing.widest,
    marginBottom: spacing.xs,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  typeButton: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.sm,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeButtonSelected: {
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    borderColor: colors.primary,
  },
  typeButtonText: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
  },
  typeButtonTextSelected: {
    color: colors.primaryLight,
    fontWeight: typography.fontWeights.bold,
  },
  paramBox: {
    backgroundColor: '#090810',
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  paramHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  paramLabel: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: typography.letterSpacing.wider,
  },
  paramHint: {
    color: colors.textMuted,
    fontSize: typography.fontSizes.xs - 2,
    marginTop: 1,
  },
  paramValue: {
    color: colors.primaryLight,
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
  },
  gainPositive: {
    color: colors.success,
  },
  gainNegative: {
    color: colors.accentLavender,
  },
  stepperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  footerRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.xs,
  },
  flexOne: {
    flex: 1,
  },
});

