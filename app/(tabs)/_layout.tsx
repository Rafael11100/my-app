import { Stack, useRouter, useSegments } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '@/context/auth-context';
import Dock from '@/components/schoolsafe/dock';
import { SensorSheetProvider } from '@/components/schoolsafe/sensor-sheet';

export default function TabLayout() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  // Development/demo access is limited to local Expo development builds.
  const developmentDemoMode = __DEV__;

  useEffect(() => {
    if (loading && !developmentDemoMode) return;
    if (!isAuthenticated && !developmentDemoMode) {
      router.replace('/login' as any);
    }
  }, [isAuthenticated, loading, segments, router, developmentDemoMode]);

  if (loading && !developmentDemoMode) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1f1f1f' }}>
        <ActivityIndicator color="#a0a0a0" />
      </View>
    );
  }

  if (!isAuthenticated && !developmentDemoMode) {
    return (
      <View style={{ flex: 1, backgroundColor: '#1f1f1f', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#a0a0a0" />
      </View>
    );
  }

  return (
    <SensorSheetProvider>
      <View style={{ flex: 1, backgroundColor: 'transparent' }}>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="smoke" />
          <Stack.Screen name="motion" />
          <Stack.Screen name="registro" />
        </Stack>
        <Dock />
      </View>
    </SensorSheetProvider>
  );
}
