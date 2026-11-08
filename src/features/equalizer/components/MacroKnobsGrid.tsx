import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { RotaryKnob } from '@/components/audio/RotaryKnob';
import { Button } from '@/components/common/Button';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import { useAudioStore } from '@/store/useAudioStore';

export const MacroKnobsGrid: React.FC = () => {
  const { macroKnobs, setMacroKnob, resetMacroKnobs } = useAudioStore();

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>ACOUSTIC MACRO DIALS</Text>
          <Text style={styles.subtitle}>
            Calibrated multi-band contour adjustments
          </Text>
        </View>
        <Button
          label="ZERO ALL"
          variant="ghost"
          size="sm"
          onPress={resetMacroKnobs}
        />
      </View>

      <View style={styles.grid}>
        <RotaryKnob
          label="Bass"
          value={macroKnobs.bass}
          min={-10}
          max={10}
          step={0.5}
          unit="dB"
          color="#A855F7"
          onChange={(val) => setMacroKnob('bass', val)}
          onReset={() => setMacroKnob('bass', 0)}
        />
        <RotaryKnob
          label="Midrange"
          value={macroKnobs.midrange}
          min={-10}
          max={10}
          step={0.5}
          unit="dB"
          color="#C084FC"
          onChange={(val) => setMacroKnob('midrange', val)}
          onReset={() => setMacroKnob('midrange', 0)}
        />
        <RotaryKnob
          label="Treble"
          value={macroKnobs.treble}
          min={-10}
          max={10}
          step={0.5}
          unit="dB"
          color="#38BDF8"
          onChange={(val) => setMacroKnob('treble', val)}
          onReset={() => setMacroKnob('treble', 0)}
        />
        <RotaryKnob
          label="Clarity"
          value={macroKnobs.clarity}
          min={-10}
          max={10}
          step={0.5}
          unit="dB"
          color="#06B6D4"
          onChange={(val) => setMacroKnob('clarity', val)}
          onReset={() => setMacroKnob('clarity', 0)}
        />
        <RotaryKnob
          label="Warmth"
          value={macroKnobs.warmth}
          min={-10}
          max={10}
          step={0.5}
          unit="dB"
          color="#F59E0B"
          onChange={(val) => setMacroKnob('warmth', val)}
          onReset={() => setMacroKnob('warmth', 0)}
        />
        <RotaryKnob
          label="Vocal"
          value={macroKnobs.vocalPresence}
          min={-10}
          max={10}
          step={0.5}
          unit="dB"
          color="#EC4899"
          onChange={(val) => setMacroKnob('vocalPresence', val)}
          onReset={() => setMacroKnob('vocalPresence', 0)}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0E0C18',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: typography.letterSpacing.widest,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: typography.fontSizes.xs - 2,
    marginTop: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginTop: spacing.xs,
  },
});
