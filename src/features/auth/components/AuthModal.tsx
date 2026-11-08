import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing, borderRadius } from '@/theme/spacing';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { useUserStore } from '@/store/useUserStore';

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ visible, onClose }) => {
  const { user, isAuthenticated, isLoading, authError, signIn, signUp, signOut, clearError } =
    useUserStore();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const handleSubmit = async () => {
    if (!email || !password) return;

    if (mode === 'signup') {
      const ok = await signUp(email, password, displayName);
      if (ok) onClose();
    } else {
      const ok = await signIn(email, password);
      if (ok) onClose();
    }
  };

  const handleClose = () => {
    clearError();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>AUDIOPHILE VAULT AUTH</Text>
              <Text style={styles.subtitle}>
                {isAuthenticated
                  ? 'Manage your cloud synchronization identity'
                  : 'Sign in to sync your custom profiles & IEM collection'}
              </Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {isAuthenticated ? (
            /* Logged in state */
            <View style={styles.loggedInBox}>
              <View style={styles.userCard}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>
                    {user.displayName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.displayName}</Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                  <Badge label="CLOUD SYNC ENABLED" variant="success" size="sm" style={styles.mt4} />
                </View>
              </View>

              <View style={styles.logoutRow}>
                <Button
                  label="SIGN OUT OF VAULT"
                  variant="danger"
                  size="md"
                  isLoading={isLoading}
                  onPress={async () => {
                    await signOut();
                    onClose();
                  }}
                />
              </View>
            </View>
          ) : (
            /* Unauthenticated: Sign In / Sign Up Form */
            <View>
              {/* Tab Switcher */}
              <View style={styles.tabsRow}>
                <TouchableOpacity
                  style={[styles.tab, mode === 'signin' && styles.tabActive]}
                  onPress={() => {
                    setMode('signin');
                    clearError();
                  }}
                >
                  <Text style={[styles.tabText, mode === 'signin' && styles.tabTextActive]}>
                    SIGN IN
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.tab, mode === 'signup' && styles.tabActive]}
                  onPress={() => {
                    setMode('signup');
                    clearError();
                  }}
                >
                  <Text style={[styles.tabText, mode === 'signup' && styles.tabTextActive]}>
                    CREATE ACCOUNT
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Error Alert */}
              {authError && (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorText}>{authError}</Text>
                </View>
              )}

              {/* Display Name (Sign Up only) */}
              {mode === 'signup' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>DISPLAY NAME / HANDLE</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. AcousticMaster"
                    placeholderTextColor={colors.textMuted}
                    value={displayName}
                    onChangeText={setDisplayName}
                    autoCapitalize="words"
                  />
                </View>
              )}

              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="name@audiophile.com"
                  placeholderTextColor={colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              {/* Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>PASSWORD</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="••••••••••••"
                  placeholderTextColor={colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              {/* Submit Button */}
              <Button
                label={mode === 'signup' ? 'CREATE VAULT ACCOUNT' : 'SIGN IN TO VAULT'}
                variant="primary"
                size="lg"
                isLoading={isLoading}
                onPress={handleSubmit}
                style={styles.submitBtn}
              />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  container: {
    backgroundColor: '#12101D',
    borderRadius: borderRadius.xl,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.borderActive,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.sm,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: typography.letterSpacing.wider,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.xs - 1,
    marginTop: 2,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  closeText: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.bold,
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#090810',
    borderRadius: borderRadius.md,
    padding: 3,
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  tabActive: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  tabText: {
    color: colors.textMuted,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
  },
  tabTextActive: {
    color: colors.primaryLight,
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.danger,
    marginBottom: spacing.sm,
  },
  errorText: {
    color: colors.danger,
    fontSize: typography.fontSizes.xs,
  },
  inputGroup: {
    marginBottom: spacing.sm,
  },
  inputLabel: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.xs - 2,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: typography.letterSpacing.wider,
    marginBottom: 4,
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
  },
  submitBtn: {
    marginTop: spacing.sm,
  },
  loggedInBox: {
    paddingVertical: spacing.sm,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#090810',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(168, 85, 247, 0.25)',
    borderWidth: 1,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    color: colors.primaryLight,
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.bold,
  },
  userEmail: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.xs,
    marginTop: 2,
  },
  mt4: {
    marginTop: 4,
  },
  logoutRow: {
    alignItems: 'stretch',
  },
});

