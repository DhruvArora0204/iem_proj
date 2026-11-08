import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing, borderRadius } from '@/theme/spacing';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { getLocalIEMs } from '@/services/local-db/sqlite';
import { useAudioStore } from '@/store/useAudioStore';
import type { IEMModel } from '@/core/types/audio';

interface IEMPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectIEM?: (iem: IEMModel) => void;
}

export const IEMPickerModal: React.FC<IEMPickerModalProps> = ({
  visible,
  onClose,
  onSelectIEM,
}) => {
  const { activeIEM, setActiveIEM } = useAudioStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDriverTab, setSelectedDriverTab] = useState<string>('All');
  const [catalog, setCatalog] = useState<IEMModel[]>([]);

  useEffect(() => {
    async function loadCatalog() {
      const list = await getLocalIEMs();
      setCatalog(list);
    }
    if (visible) {
      loadCatalog();
    }
  }, [visible]);

  const filteredIEMs = catalog.filter((iem) => {
    const matchesSearch =
      iem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      iem.manufacturerName.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedDriverTab === 'All') return matchesSearch;
    if (selectedDriverTab === 'Hybrid') return matchesSearch && iem.driverType.includes('Hybrid');
    if (selectedDriverTab === 'Planar') return matchesSearch && iem.driverType.includes('Planar');
    if (selectedDriverTab === 'Dynamic') return matchesSearch && iem.driverType.includes('Dynamic');
    return matchesSearch;
  });

  const handleSelect = (iem: IEMModel) => {
    setActiveIEM(iem);
    onSelectIEM?.(iem);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>IEM CATALOG & SELECTION</Text>
              <Text style={styles.subtitle}>
                Select your In-Ear Monitor model to load calibrated curves
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchWrapper}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by brand or model (e.g. Blessing 3, Truthear)..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Driver Filter Tabs */}
          <View style={styles.tabsRow}>
            {['All', 'Dynamic', 'Hybrid', 'Planar'].map((tab) => {
              const isSelected = selectedDriverTab === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  style={[styles.tabButton, isSelected && styles.tabButtonActive]}
                  onPress={() => setSelectedDriverTab(tab)}
                >
                  <Text
                    style={[styles.tabButtonText, isSelected && styles.tabButtonTextActive]}
                  >
                    {tab}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Catalog List */}
          <ScrollView showsVerticalScrollIndicator={false} style={styles.listArea}>
            {filteredIEMs.map((iem) => {
              const isCurrent = activeIEM.id === iem.id;
              return (
                <Card
                  key={iem.id}
                  variant={isCurrent ? 'glow' : 'default'}
                  style={styles.iemCard}
                  onPress={() => handleSelect(iem)}
                >
                  <View style={styles.cardHeader}>
                    <View>
                      <Text style={styles.manufacturer}>{iem.manufacturerName}</Text>
                      <Text style={styles.modelName}>{iem.name}</Text>
                    </View>
                    {isCurrent && (
                      <Badge label="ACTIVE" variant="primary" size="sm" />
                    )}
                  </View>

                  <View style={styles.specsRow}>
                    <Badge label={iem.driverType} variant="neutral" size="sm" />
                    <Badge label={`${iem.impedanceOhms} Ω`} variant="neutral" size="sm" />
                    <Badge label={`${iem.sensitivityDbMw} dB/mW`} variant="neutral" size="sm" />
                  </View>

                  <Text style={styles.description}>{iem.description}</Text>

                  <View style={styles.actionRow}>
                    <Button
                      label={isCurrent ? 'SELECTED' : 'SELECT TRANSDUCER'}
                      variant={isCurrent ? 'primary' : 'outline'}
                      size="sm"
                      onPress={() => handleSelect(iem)}
                    />
                  </View>
                </Card>
              );
            })}
          </ScrollView>
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
  searchWrapper: {
    backgroundColor: '#090810',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  searchInput: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  tabButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabButtonActive: {
    backgroundColor: 'rgba(168, 85, 247, 0.25)',
    borderColor: colors.primary,
  },
  tabButtonText: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
  },
  tabButtonTextActive: {
    color: colors.primaryLight,
    fontWeight: typography.fontWeights.bold,
  },
  listArea: {
    marginBottom: spacing.lg,
  },
  iemCard: {
    marginBottom: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  manufacturer: {
    color: colors.primaryLight,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: typography.letterSpacing.wider,
  },
  modelName: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
  },
  specsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: 4,
    marginBottom: spacing.xs,
  },
  description: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.xs,
    lineHeight: typography.lineHeights.xs,
    marginBottom: spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});
