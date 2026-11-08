import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing, borderRadius } from '@/theme/spacing';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { AudioEngine, TEST_TRACKS } from '@/core/audio-engine/AudioEngine';
import type { AudioTestTrack, EngineMetrics } from '@/core/audio-engine/types';
import { useAudioStore } from '@/store/useAudioStore';

export const AudioTestBench: React.FC = () => {
  const { filters, preampDb, isBypassed, toggleBypass } = useAudioStore();
  const [metrics, setMetrics] = useState<EngineMetrics>({
    playbackStatus: 'idle',
    currentPositionSec: 0,
    durationSec: 15,
    peakOutputL: 0,
    peakOutputR: 0,
    isClipping: false,
    preampDb: 0,
    isBypassed: false,
    sampleRate: 48000,
  });

  const [selectedTrack, setSelectedTrack] = useState<AudioTestTrack>(TEST_TRACKS[0]);
  const audioEngine = AudioEngine.getInstance();

  useEffect(() => {
    audioEngine.initialize();
    const unsubscribe = audioEngine.subscribeMetrics((m) => {
      setMetrics(m);
    });
    return () => unsubscribe();
  }, []);

  // Synchronize filters and preamp to audio engine
  useEffect(() => {
    audioEngine.updateFilters(filters);
    audioEngine.setPreamp(preampDb);
    audioEngine.setBypass(isBypassed);
  }, [filters, preampDb, isBypassed]);

  const handleSelectTrack = async (track: AudioTestTrack) => {
    setSelectedTrack(track);
    await audioEngine.loadTestTrack(track);
  };

  const handleTogglePlay = async () => {
    if (metrics.playbackStatus === 'playing') {
      await audioEngine.pause();
    } else {
      await audioEngine.play();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = metrics.durationSec > 0
    ? (metrics.currentPositionSec / metrics.durationSec) * 100
    : 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <View style={styles.dotIndicator} />
          <Text style={styles.title}>IN-APP ACOUSTIC TEST BENCH</Text>
        </View>
        <Badge
          label={metrics.playbackStatus.toUpperCase()}
          variant={metrics.playbackStatus === 'playing' ? 'success' : 'neutral'}
          size="sm"
        />
      </View>

      <Text style={styles.subtitle}>
        Real-time audio processing test harness for IEM auditioning & A/B verification
      </Text>

      {/* Test Track Selector Chips */}
      <View style={styles.tracksRow}>
        {TEST_TRACKS.map((t) => {
          const isSelected = selectedTrack.id === t.id;
          return (
            <TouchableOpacity
              key={t.id}
              style={[styles.trackChip, isSelected && styles.trackChipSelected]}
              onPress={() => handleSelectTrack(t)}
            >
              <Text style={[styles.trackChipText, isSelected && styles.trackChipTextSelected]}>
                {t.category === 'pink_noise'
                  ? 'Pink Noise 1/f'
                  : t.category === 'sine_sweep'
                  ? 'Log Sweep 20-20k'
                  : '1 kHz Tone'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Progress Bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
      </View>

      <View style={styles.timeRow}>
        <Text style={styles.timeText}>{formatTime(metrics.currentPositionSec)}</Text>
        <Text style={styles.timeText}>{formatTime(metrics.durationSec)}</Text>
      </View>

      {/* Stereo Peak Output Meters & Clipping Guard */}
      <View style={styles.metersContainer}>
        {/* Left Channel */}
        <View style={styles.channelRow}>
          <Text style={styles.channelLabel}>L</Text>
          <View style={styles.meterTrack}>
            <View
              style={[
                styles.meterBar,
                { width: `${Math.min(100, metrics.peakOutputL * 100)}%` },
                metrics.peakOutputL >= 0.95 && styles.meterBarDanger,
              ]}
            />
          </View>
        </View>

        {/* Right Channel */}
        <View style={styles.channelRow}>
          <Text style={styles.channelLabel}>R</Text>
          <View style={styles.meterTrack}>
            <View
              style={[
                styles.meterBar,
                { width: `${Math.min(100, metrics.peakOutputR * 100)}%` },
                metrics.peakOutputR >= 0.95 && styles.meterBarDanger,
              ]}
            />
          </View>
        </View>

        {/* Clipping LED Indicator */}
        <View style={styles.clippingRow}>
          <View
            style={[
              styles.clipLed,
              metrics.isClipping && styles.clipLedActive,
            ]}
          />
          <Text style={styles.clipText}>
            {metrics.isClipping ? 'LIMITER ACTIVE: CLIPPING PROTECTED' : '0 dBFS HEADROOM SAFE'}
          </Text>
        </View>
      </View>

      {/* Playback Controls & A/B Switcher */}
      <View style={styles.controlsRow}>
        <Button
          label={metrics.playbackStatus === 'playing' ? 'PAUSE TEST' : 'PLAY TEST TONE'}
          variant="primary"
          size="md"
          style={styles.flexOne}
          onPress={handleTogglePlay}
        />
        <Button
          label={isBypassed ? 'A/B: FLAT (A)' : 'A/B: PEQ (B)'}
          variant={isBypassed ? 'danger' : 'outline'}
          size="md"
          onPress={toggleBypass}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0C0A16',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.4)',
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dotIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
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
    marginBottom: spacing.sm,
  },
  tracksRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  trackChip: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.sm,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  trackChipSelected: {
    backgroundColor: 'rgba(168, 85, 247, 0.25)',
    borderColor: colors.primary,
  },
  trackChipText: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.xs - 1,
    fontWeight: typography.fontWeights.semibold,
  },
  trackChipTextSelected: {
    color: colors.primaryLight,
    fontWeight: typography.fontWeights.bold,
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#1B1829',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 3,
    marginBottom: spacing.sm,
  },
  timeText: {
    color: colors.textMuted,
    fontSize: typography.fontSizes.xs - 2,
  },
  metersContainer: {
    backgroundColor: '#07060E',
    borderRadius: 8,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  channelLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: 'bold',
    width: 14,
  },
  meterTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#171424',
    borderRadius: 3,
    overflow: 'hidden',
  },
  meterBar: {
    height: '100%',
    backgroundColor: colors.accentCyan,
    borderRadius: 3,
  },
  meterBarDanger: {
    backgroundColor: colors.danger,
  },
  clippingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  clipLed: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#292438',
  },
  clipLedActive: {
    backgroundColor: colors.danger,
    shadowColor: colors.danger,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
  },
  clipText: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: typography.letterSpacing.wide,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  flexOne: {
    flex: 1,
  },
});
