import { Ionicons } from '@expo/vector-icons';
import React, { memo, useEffect } from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, { cancelAnimation, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import type { Sensor } from '@/context/alerts-context';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  sensor: Sensor;
  size: { width: number; height: number };
  focused: boolean;
  onPress: () => void;
  onRef: (node: View | null) => void;
};

function MapSensorChipComponent({ sensor, size, focused, onPress, onRef }: Props) {
  const reducedMotion = useReducedMotion();
  const pulse = useSharedValue(0);
  const smoke = sensor.kind === 'smoke';
  const accent = smoke ? '#EF4444' : '#3B82F6';
  const duration = smoke ? 600 : 900;

  useEffect(() => {
    cancelAnimation(pulse);
    if (sensor.active && focused && !reducedMotion) {
      pulse.value = withRepeat(withSequence(
        withTiming(1, { duration }),
        withTiming(0, { duration }),
      ), -1, false);
    } else {
      pulse.value = withTiming(0, { duration: reducedMotion ? 150 : 180 });
    }
    return () => cancelAnimation(pulse);
  }, [sensor.active, focused, reducedMotion, duration, pulse]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: sensor.active && !reducedMotion ? 0.62 + pulse.value * 0.38 : 1,
    transform: [{ scale: sensor.active && !reducedMotion ? 1 + pulse.value * 0.075 : 1 }],
  }));
  const rippleStyle = useAnimatedStyle(() => ({
    opacity: sensor.active && focused && !reducedMotion ? 0.5 * (1 - pulse.value) : 0,
    transform: [{ scale: sensor.active && focused && !reducedMotion ? 1 + pulse.value * 0.65 : 1 }],
  }));

  return <View style={[styles.wrapper, size as ViewStyle]}>
    {sensor.active && focused && !reducedMotion && <Animated.View pointerEvents="none" style={[styles.ripple, { borderColor: accent }, rippleStyle]} />}
    <AnimatedPressable
    ref={(node: unknown) => onRef(node as View | null)}
    onPress={onPress}
    style={[
      styles.chip,
      size as ViewStyle,
      { borderColor: sensor.active ? accent : accent + '8C', backgroundColor: sensor.active ? (smoke ? 'rgba(239,68,68,0.22)' : 'rgba(59,130,246,0.22)') : 'rgba(31,31,31,0.96)' },
      animatedStyle,
    ]}
    accessibilityRole="button"
    accessibilityLabel={`${smoke ? 'Fumaça' : 'Movimento'}, ${sensor.location.trim() || 'Área sem nome'}, ${sensor.active ? (smoke ? 'em alerta' : 'presença detectada') : 'normal'}`}
    hitSlop={4}
    >
      <Ionicons name={smoke ? 'flame' : 'walk'} size={16} color={sensor.active ? accent : '#a0a0a0'} />
    </AnimatedPressable>
  </View>;
}

export const MapSensorChip = memo(MapSensorChipComponent);

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', justifyContent: 'center', overflow: 'visible' },
  ripple: { position: 'absolute', width: '100%', height: '100%', borderRadius: 12, borderWidth: 1.5 },
  chip: {
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 28,
    minHeight: 28,
  },
});
