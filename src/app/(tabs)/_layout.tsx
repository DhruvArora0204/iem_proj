import React from 'react';
import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import {
  HomeIcon,
  EqualizerIcon,
  DiscoverIcon,
  MyAudioIcon,
} from '@/components/audio/TabIcons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <HomeIcon color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="equalizer"
        options={{
          title: 'Equalizer',
          tabBarIcon: ({ color, size }) => <EqualizerIcon color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, size }) => <DiscoverIcon color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="my-audio"
        options={{
          title: 'My Audio',
          tabBarIcon: ({ color, size }) => <MyAudioIcon color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#0E0C17',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    height: 64,
    paddingTop: 6,
    paddingBottom: 10,
  },
  tabBarLabel: {
    fontSize: typography.fontSizes.xs - 1,
    fontWeight: typography.fontWeights.semibold,
    letterSpacing: typography.letterSpacing.wide,
  },
});

