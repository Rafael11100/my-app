import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

import { AlertsProvider } from '@/context/alerts-context';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { ThemeProvider as SchoolThemeProvider } from '@/context/theme-context';

const schoolTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#a0a0a0',
    background: '#1f1f1f',
    card: 'rgba(40,40,40,0.92)',
    text: '#F2F2F2',
    border: 'rgba(160,160,160,0.14)',
  },
};

export const unstable_settings = { anchor: '(tabs)' };

function RootStack() {
  const { loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === 'login';
    const inTabs = segments[0] === '(tabs)';
    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/login' as any);
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/' as any);
    }
    // quando autenticado e em (tabs) ou raiz, fica onde está
    void inTabs;
  }, [isAuthenticated, loading, segments, router]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1f1f1f' }}>
        <ActivityIndicator color="#a0a0a0" />
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#1f1f1f' } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="login" options={{ gestureEnabled: false, animation: 'fade' }} />
        <Stack.Screen
          name="modal"
          options={{
            presentation: 'modal',
            title: 'Detalhes',
            headerShown: true,
            headerStyle: { backgroundColor: '#1f1f1f' } as any,
            headerTintColor: '#F2F2F2',
          }}
        />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}

export default function RootLayout() {
  return (
    <SchoolThemeProvider>
      <AuthProvider>
        <AlertsProvider>
          <ThemeProvider value={schoolTheme}>
            <RootStack />
          </ThemeProvider>
        </AlertsProvider>
      </AuthProvider>
    </SchoolThemeProvider>
  );
}
