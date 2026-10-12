import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { Glass } from '@/components/schoolsafe/glass';
import { SPRING_SOFT } from '@/components/schoolsafe/motion-presets';
import { useAlerts } from '@/context/alerts-context';

const ITEMS = [
  { route: '/smoke', label: 'Fumaça', icon: 'flame-outline' as const, kind: 'smoke' as const, color: '#EF4444' },
  { route: '/motion', label: 'Movimento', icon: 'walk-outline' as const, kind: 'motion' as const, color: '#3B82F6' },
  { route: '/registro', label: 'Registro', icon: 'document-text-outline' as const, kind: null, color: '#a0a0a0' },
];

export default function Dock() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const { sensors } = useAlerts();
  const reducedMotion = useReducedMotion();
  const activeRoute = pathname === '/smoke' || pathname === '/motion' || pathname === '/registro' ? pathname : null;
  const selectedIndex = activeRoute ? ITEMS.findIndex((item) => item.route === activeRoute) : -1;
  const dockWidth = Math.min(screenWidth - 32, 420);
  const itemWidth = Math.max(0, (dockWidth - 10) / ITEMS.length);
  const indicatorX = useSharedValue(0);

  useEffect(() => {
    const destination = selectedIndex < 0 ? 0 : selectedIndex * itemWidth;
    indicatorX.value = reducedMotion
      ? withTiming(destination, { duration: 150 })
      : withSpring(destination, SPRING_SOFT);
  }, [selectedIndex, itemWidth, reducedMotion, indicatorX]);

  const indicatorStyle = useAnimatedStyle(() => ({
    opacity: selectedIndex < 0 ? 0 : 1,
    transform: [{ translateX: indicatorX.value }],
  }));

  const navigate = (route: string) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    router.replace((activeRoute === route ? '/' : route) as any);
  };

  return <View pointerEvents="box-none" style={[styles.position, { paddingBottom: Math.max(insets.bottom, 8) }]}>
    <Glass elevated intensity={55} borderRadius={32} style={styles.dock}>
      <View style={styles.dockContent}>
        <Animated.View pointerEvents="none" style={[styles.indicator, { width: itemWidth }, indicatorStyle]} />
        {ITEMS.map((item) => {
          const selected = activeRoute === item.route;
          const count = item.kind ? sensors.filter((sensor) => sensor.kind === item.kind && sensor.active).length : 0;
          return <Pressable key={item.route} onPress={() => navigate(item.route)} style={({ pressed }) => [styles.item, pressed && { transform: [{ scale: 0.96 }] }]} accessibilityRole="button" accessibilityState={{ selected }} accessibilityLabel={item.label}>
            <View style={styles.iconWrap}><Ionicons name={item.icon} size={20} color={selected ? '#F2F2F2' : '#a0a0a0'} />
              {count > 0 && <View style={[styles.badge, { backgroundColor: item.color }]}><Text style={styles.badgeText}>{count > 9 ? '9+' : count}</Text></View>}
            </View>
            <Text style={[styles.label, selected && styles.selectedLabel]}>{item.label}</Text>
          </Pressable>;
        })}
      </View>
    </Glass>
  </View>;
}

const styles = StyleSheet.create({
  position: { position: 'absolute', left: 16, right: 16, bottom: 0, alignItems: 'center' },
  dock: { width: '100%', maxWidth: 420, height: 64, borderRadius: 32 },
  dockContent: { flex: 1, flexDirection: 'row', padding: 5, position: 'relative' },
  indicator: { position: 'absolute', top: 5, bottom: 5, left: 5, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.10)' },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, borderRadius: 26, zIndex: 1 },
  iconWrap: { position: 'relative' },
  label: { fontSize: 10, color: '#a0a0a0', fontWeight: '600' },
  selectedLabel: { color: '#F2F2F2' },
  badge: { position: 'absolute', top: -5, right: -9, minWidth: 14, height: 14, borderRadius: 7, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3, borderWidth: 1, borderColor: '#242424' },
  badgeText: { color: '#fff', fontSize: 8, fontWeight: '800' },
});
