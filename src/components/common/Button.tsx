import React, { ReactNode } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
  StyleProp,
} from 'react-native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { borderRadius, spacing } from '@/theme/spacing';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  isLoading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const getContainerStyle = (): StyleProp<ViewStyle>[] => {
    const list: StyleProp<ViewStyle>[] = [styles.button, styles[size]];
    switch (variant) {
      case 'secondary':
        list.push(styles.secondary);
        break;
      case 'outline':
        list.push(styles.outline);
        break;
      case 'ghost':
        list.push(styles.ghost);
        break;
      case 'danger':
        list.push(styles.danger);
        break;
      default:
        list.push(styles.primary);
        break;
    }
    if (disabled) list.push(styles.disabled);
    return list;
  };

  const getTextStyle = (): StyleProp<TextStyle>[] => {
    const list: StyleProp<TextStyle>[] = [styles.text, styles[`text_${size}` as keyof typeof styles] as StyleProp<TextStyle>];
    switch (variant) {
      case 'outline':
      case 'secondary':
        list.push(styles.secondaryText);
        break;
      case 'ghost':
        list.push(styles.ghostText);
        break;
      case 'danger':
        list.push(styles.dangerText);
        break;
      default:
        list.push(styles.primaryText);
        break;
    }
    if (disabled) list.push(styles.disabledText);
    return list;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      style={[...getContainerStyle(), style]}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? colors.background : colors.primaryLight}
        />
      ) : (
        <View style={styles.contentRow}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={[...getTextStyle(), textStyle]}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: spacing.xs,
  },
  sm: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  md: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  lg: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  primary: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 4,
  },
  secondary: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: colors.danger,
  },
  disabled: {
    opacity: 0.45,
  },
  text: {
    fontWeight: typography.fontWeights.semibold,
    letterSpacing: typography.letterSpacing.wide,
  },
  text_sm: {
    fontSize: typography.fontSizes.xs,
  },
  text_md: {
    fontSize: typography.fontSizes.sm,
  },
  text_lg: {
    fontSize: typography.fontSizes.md,
  },
  primaryText: {
    color: '#090810',
    fontWeight: typography.fontWeights.bold,
  },
  secondaryText: {
    color: colors.textPrimary,
  },
  ghostText: {
    color: colors.primaryLight,
  },
  dangerText: {
    color: colors.danger,
  },
  disabledText: {
    color: colors.textMuted,
  },
});
