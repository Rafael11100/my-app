import React from 'react';
import { Platform, StyleSheet, View, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

type GlassProps = {
  children?: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  intensity?: number;
  tint?: 'dark' | 'light' | 'default';
  borderRadius?: number;
  noBlurFallback?: boolean;
  elevated?: boolean;
  accent?: string;
};

/** Superfície de vidro compartilhada, com blur nativo e fallback por CSS no web. */
export function Glass({
  children,
  style,
  intensity = 50,
  tint = 'dark',
  borderRadius = 20,
  noBlurFallback = false,
  elevated = false,
  accent,
}: GlassProps) {
  const flattened = StyleSheet.flatten(style) as ViewStyle | undefined;
  const fill = noBlurFallback
    ? 'rgba(34,34,36,0.88)'
    : elevated
      ? 'rgba(255,255,255,0.08)'
      : 'rgba(255,255,255,0.05)';
  const border = accent ?? 'rgba(255,255,255,0.10)';
  const webStyle = Platform.OS === 'web'
    ? ({ backdropFilter: 'blur(24px) saturate(140%)', WebkitBackdropFilter: 'blur(24px) saturate(140%)' } as ViewStyle)
    : null;

  return (
    <View style={[styles.frame, { borderRadius, borderColor: border, backgroundColor: fill }, webStyle, flattened]}>
      {Platform.OS !== 'web' && !noBlurFallback ? (
        <BlurView intensity={intensity} tint={tint} experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined} style={StyleSheet.absoluteFill} />
      ) : null}
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.00)']}
        locations={[0, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[styles.topHighlight, { borderTopLeftRadius: borderRadius, borderTopRightRadius: borderRadius }]}
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

export function GlassCard(props: GlassProps) {
  const suppliedStyle = StyleSheet.flatten(props.style) ?? {};
  return <Glass {...props} elevated style={[styles.cardShadow, suppliedStyle]} />;
}

const styles = StyleSheet.create({
  frame: { overflow: 'hidden', borderWidth: 1 },
  topHighlight: { position: 'absolute', top: 0, left: 0, right: 0, height: '40%', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.22)' },
  content: { flex: 1 },
  cardShadow: { shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.35, shadowRadius: 32, elevation: 8 },
});
