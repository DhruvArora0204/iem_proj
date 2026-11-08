import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing, borderRadius } from '@/theme/spacing';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { useAudioStore } from '@/store/useAudioStore';
import type { EQProfile, ScenarioType } from '@/core/types/audio';

interface SaveProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onSaved?: (profile: EQProfile) => void;
}

const SCENARIOS: { id: ScenarioType; label: string }[] = [
  { id: 'music_balanced', label: 'Music Balanced' },
  { id: 'music_bass', label: 'Bass Focused' },
  { id: 'music_vocal', label: 'Vocal Presence' },
  { id: 'gaming_fps', label: 'Gaming FPS' },
  { id: 'movie_cinema', label: 'Cinema Movie' },
  { id: 'podcast_speech', label: 'Speech Podcast' },
];

export const SaveProfileModal: React.FC<SaveProfileModalProps> = ({
  visible,
  onClose,
  onSaved,
}) => {
  const { activeIEM, filters, preampDb, setActiveProfile } = useAudioStore();
  const [profileName, setProfileName] = useState('My Custom Tune');
  const [description, setDescription] = useState('Personal PEQ contour optimized for Blessing 3');
  const [scenario, setScenario] = useState<ScenarioType>('music_balanced');

  const handleSave = () => {
    if (!profileName.trim()) {
      Alert.alert('Validation Error', 'Please specify a profile name.');
      return;
    }

    const newProfile: EQProfile = {
      id: `custom-profile-${Date.now()}`,
      iemId: activeIEM.id,
      iemName: `${activeIEM.manufacturerName} ${activeIEM.name}`,
      creatorName: 'You (Local Creator)',
      name: profileName.trim(),
      description: description.trim(),
      profileType: 'user_custom',
      scenario,
      preampDb,
      isPublic: false,
      isVerified: false,
      upvotesCount: 0,
      filters: [...filters],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setActiveProfile(newProfile);
    onSaved?.(newProfile);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>SAVE CUSTOM PROFILE</Text>
              <Text style={styles.subtitle}>
                Store current PEQ settings to your personal audio library
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollArea}>
            {/* Target IEM Notice */}
            <View style={styles.targetIEMBox}>
              <Text style={styles.targetIEMLabel}>TARGET TRANSDUCER</Text>
              <Text style={styles.targetIEMValue}>
                {activeIEM.manufacturerName} {activeIEM.name}
              </Text>
              <Text style={styles.targetIEMSpecs}>
                {activeIEM.driverType} | {activeIEM.impedanceOhms} Ω
              </Text>
            </View>

            {/* Profile Name Input */}
            <Text style={styles.inputLabel}>PROFILE NAME</Text>
            <TextInput
              style={styles.textInput}
              value={profileName}
              onChangeText={setProfileName}
              placeholder="e.g. Warm Harman Contour, FPS Footsteps..."
              placeholderTextColor={colors.textMuted}
            />

            {/* Description Input */}
            <Text style={styles.inputLabel}>DESCRIPTION / NOTES</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              placeholder="Notes on acoustic intent, soundstage, ear tips used..."
              placeholderTextColor={colors.textMuted}
            />

            {/* Scenario Picker */}
            <Text style={styles.inputLabel}>PRIMARY SCENARIO</Text>
            <View style={styles.scenariosRow}>
              {SCENARIOS.map((sc) => {
                const isSelected = scenario === sc.id;
                return (
                  <TouchableOpacity
                    key={sc.id}
                    style={[styles.scenarioChip, isSelected && styles.scenarioChipSelected]}
                    onPress={() => setScenario(sc.id)}
                  >
                    <Text
                      style={[styles.scenarioChipText, isSelected && styles.scenarioChipTextSelected]}
                    >
                      {sc.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Filter Summary */}
            <View style={styles.summaryBox}>
              <Text style={styles.summaryTitle}>INCLUDED PEQ BANDS</Text>
              <View style={styles.summaryGrid}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{filters.length}</Text>
                  <Text style={styles.summaryLabel}>Total Bands</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>
                    {preampDb > 0 ? `+${preampDb}` : preampDb} dB
                  </Text>
                  <Text style={styles.summaryLabel}>Preamp Gain</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>
                    {filters.filter((f) => f.enabled).length}
                  </Text>
                  <Text style={styles.summaryLabel}>Active Filters</Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footerRow}>
            <Button
              label="CANCEL"
              variant="secondary"
              size="md"
              style={styles.flexOne}
              onPress={onClose}
            />
            <Button
              label="SAVE TO LIBRARY"
              variant="primary"
              size="md"
              style={styles.flexOne}
              onPress={handleSave}
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
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#12101D',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: colors.borderActive,
    padding: spacing.base,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: typography.letterSpacing.wider,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.xs,
    marginTop: 2,
  },
  closeButton: {
    padding: spacing.xs,
  },
  closeText: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.bold,
  },
  scrollArea: {
    marginBottom: spacing.md,
  },
  targetIEMBox: {
    backgroundColor: '#090810',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  targetIEMLabel: {
    color: colors.textMuted,
    fontSize: typography.fontSizes.xs - 2,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: typography.letterSpacing.widest,
  },
  targetIEMValue: {
    color: colors.primaryLight,
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.bold,
    marginTop: 2,
  },
  targetIEMSpecs: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.xs,
    marginTop: 2,
  },
  inputLabel: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: typography.letterSpacing.wider,
    marginBottom: spacing.xs,
  },
  textInput: {
    backgroundColor: '#090810',
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
    fontSize: typography.fontSizes.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    marginBottom: spacing.md,
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  scenariosRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  scenarioChip: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.full,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  scenarioChipSelected: {
    backgroundColor: 'rgba(168, 85, 247, 0.25)',
    borderColor: colors.primary,
  },
  scenarioChipText: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
  },
  scenarioChipTextSelected: {
    color: colors.primaryLight,
    fontWeight: typography.fontWeights.bold,
  },
  summaryBox: {
    backgroundColor: '#090810',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  summaryTitle: {
    color: colors.textMuted,
    fontSize: typography.fontSizes.xs - 2,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: typography.letterSpacing.widest,
    marginBottom: spacing.xs,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.bold,
  },
  summaryLabel: {
    color: colors.textMuted,
    fontSize: typography.fontSizes.xs - 2,
    marginTop: 2,
  },
  footerRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  flexOne: {
    flex: 1,
  },
});
