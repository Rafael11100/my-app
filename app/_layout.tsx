import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Platform } from 'react-native';
import 'react-native-reanimated';

import { AlertsProvider } from '@/context/alerts-context';
import { ThemeProvider as SchoolThemeProvider } from '@/context/theme-context';
import { SchoolColors } from '@/constants/theme';

const schoolTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: SchoolColors.blue,
    background: SchoolColors.background,
    card: SchoolColors.white,
    text: SchoolColors.navy,
    border: SchoolColors.cardBorder,
  },
};

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
<SchoolThemeProvider>
      <AlertsProvider>
        <ThemeProvider value={schoolTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Detalhes' }} />
          </Stack>
          <StatusBar style={Platform.OS === 'ios' ? 'dark' : 'auto'} />
        </ThemeProvider>
      </AlertsProvider>
    </SchoolThemeProvider>
  );
}
