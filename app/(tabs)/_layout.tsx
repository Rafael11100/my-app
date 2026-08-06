import { Stack } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Stack>
<Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="smoke" options={{ headerShown: false }} />
      <Stack.Screen name="motion" options={{ headerShown: false }} />
      <Stack.Screen name="registro" options={{ headerShown: false }} />
    </Stack>
  );
}

