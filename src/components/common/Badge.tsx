import React from 'react';
import { StyleSheet, Text, View, ViewStyle, TextStyle } from 'react-native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { borderRadius, spacing } from '@/theme/spacing';

export type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'glow';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
  textStyle?: TextStyle;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  style,
  textStyle,
  size = 'md',
}) => {
  const getContainerStyle = () => {
    switch (variant) {
      case 'success':
        return styles.successContainer;
      case 'warning':
        return styles.warningContainer;
      case 'danger':
        return styles.dangerContainer;
      case 'info':
        return styles.infoContainer;
      case 'neutral':
        return styles.neutralContainer;
      case 'glow':
        return styles.glowContainer;
      default:
        return styles.primaryContainer;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'success':
        return styles.successText;
      case 'warning':
        return styles.warningText;
      case 'danger':
        return styles.dangerText;
      case 'info':
        return styles.infoText;
      case 'neutral':
        return styles.neutralText;
      default:
        return styles.primaryText;
    }
  };

  return (
    <View
      style={[
        styles.baseContainer,
        styles[size],
        getContainerStyle(),
        style,
      ]}
    >
      <Text style={[styles.baseText, styles[`text_${size}`], getTextStyle(), textStyle]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sm: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  md: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  primaryContainer: {
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.4)',
  },
  glowContainer: {
    backgroundColor: 'rgba(168, 85, 247, 0.25)',
    borderWidth: 1,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
  },
  successContainer: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  warningContainer: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  dangerContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  infoContainer: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.4)',
  },
  neutralContainer: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  baseText: {
    fontWeight: typography.fontWeights.semibold,
    letterSpacing: typography.letterSpacing.wide,
  },
  text_sm: {
    fontSize: typography.fontSizes.xs - 1,
  },
  text_md: {
    fontSize: typography.fontSizes.xs,
  },
  primaryText: {
    color: colors.primaryLight,
  },
  successText: {
    color: colors.success,
  },
  warningText: {
    color: colors.warning,
  },
  dangerText: {
    color: colors.danger,
  },
  infoText: {
    color: colors.accentCyan,
  },
  neutralText: {
    color: colors.textSecondary,
  },
});
