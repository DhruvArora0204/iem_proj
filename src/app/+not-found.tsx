import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Link, Stack } from 'expo-router';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Route Not Found' }} />
      <View style={styles.container}>
        <Text style={styles.codeText}>404</Text>
        <Text style={styles.title}>AUDIO ROUTE NOT FOUND</Text>
        <Text style={styles.description}>
          This screen destination does not exist in the Audiophile lab matrix.
        </Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>RETURN TO LAB HOME</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  codeText: {
    color: colors.primary,
    fontSize: 48,
    fontWeight: typography.fontWeights.heavy,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    marginTop: spacing.sm,
    letterSpacing: typography.letterSpacing.wider,
  },
  description: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.sm,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  link: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  linkText: {
    color: colors.primaryLight,
    fontWeight: typography.fontWeights.bold,
    fontSize: typography.fontSizes.xs,
    letterSpacing: typography.letterSpacing.wide,
  },
});
