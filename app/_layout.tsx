import { DefaultTheme, ThemeProvider } from 'expo-router/react-navigation';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AlertsProvider } from '@/context/alerts-context';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { ThemeProvider as SchoolThemeProvider } from '@/context/theme-context';
import AmbientBackground from '@/components/schoolsafe/ambient-background';

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
  // Login is skipped only during local Expo development; production still requires auth.
  const developmentDemoMode = __DEV__;

  useEffect(() => {
    if (loading && !developmentDemoMode) return;
    const inAuthGroup = segments[0] === 'login';
    const inTabs = segments[0] === '(tabs)';
    if (!isAuthenticated && !developmentDemoMode && !inAuthGroup) {
      router.replace('/login' as any);
    } else if ((isAuthenticated || developmentDemoMode) && inAuthGroup) {
      router.replace('/' as any);
    }
    void inTabs;
  }, [isAuthenticated, loading, segments, router, developmentDemoMode]);

  if (loading && !developmentDemoMode) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1f1f1f' }}>
        <ActivityIndicator color="#a0a0a0" />
      </View>
    );
  }

  return (
    <>
      <AmbientBackground />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="login" options={{ gestureEnabled: false, animation: 'fade' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Detalhes', headerShown: true, headerStyle: { backgroundColor: '#1f1f1f' } as any, headerTintColor: '#F2F2F2' }} />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });
  if (!fontsLoaded) return null;
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#1f1f1f' }}>
      <SchoolThemeProvider>
        <AuthProvider>
          <AlertsProvider>
            <ThemeProvider value={schoolTheme}>
              <RootStack />
            </ThemeProvider>
          </AlertsProvider>
        </AuthProvider>
      </SchoolThemeProvider>
    </GestureHandlerRootView>
  );
}
