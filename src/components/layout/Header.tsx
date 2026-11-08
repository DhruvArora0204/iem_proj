import React, { ReactNode } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';

interface HeaderProps {
  title: string;
  subtitle?: string;
  rightElement?: ReactNode;
  showLabBadge?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  rightElement,
  showLabBadge = false,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.titleColumn}>
        {showLabBadge && (
          <View style={styles.labBadgeRow}>
            <View style={styles.liveIndicatorDot} />
            <Text style={styles.labBadgeText}>DSP LAB ENGINE ACTIVE</Text>
          </View>
        )}
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {rightElement && <View style={styles.rightContainer}>{rightElement}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  titleColumn: {
    flex: 1,
  },
  labBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  liveIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
    marginRight: 6,
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  labBadgeText: {
    color: colors.primaryLight,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: typography.letterSpacing.widest,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: typography.letterSpacing.wide,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.sm,
    marginTop: 2,
  },
  rightContainer: {
    marginLeft: spacing.md,
  },
});
