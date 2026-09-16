import React from 'react';
import { Platform, StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';

type GlassProps = {
  children?: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  intensity?: number;
  tint?: 'dark' | 'light' | 'default';
  borderRadius?: number;
  noBlurFallback?: boolean;
};

/**
 * Glass — superfície translúcida controlada.
 * Usa expo-blur nativamente; fallback opaco no web / quando blur indisponível.
 */
export function Glass({ children, style, intensity = 28, tint = 'dark', borderRadius = 20, noBlurFallback }: GlassProps) {
  const flattened = StyleSheet.flatten(style) as ViewStyle | undefined;
  const bg = noBlurFallback ? 'rgba(40,40,40,0.96)' : 'rgba(40,40,40,0.72)';

  if (Platform.OS === 'web') {
    return (
      <View style={[{ backgroundColor: 'rgba(40,40,40,0.92)', borderColor: 'rgba(160,160,160,0.14)', borderWidth: 1, borderRadius, overflow: 'hidden' }, flattened]}>
        {children}
      </View>
    );
  }

  return (
    <View style={[{ borderRadius, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(160,160,160,0.14)' }, flattened]}>
      <BlurView intensity={intensity} tint={tint} style={StyleSheet.absoluteFill} />
      <View style={{ backgroundColor: bg, flex: 1 }}>{children}</View>
    </View>
  );
}

export function GlassCard({ children, style, intensity = 24, tint = 'dark' }: GlassProps) {
  return (
    <Glass intensity={intensity} tint={tint} borderRadius={20} style={[{ shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.24, shadowRadius: 16, elevation: 8 } as ViewStyle, style as ViewStyle]}>
      {children}
    </Glass>
  );
}
