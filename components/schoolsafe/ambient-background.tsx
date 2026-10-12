import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  useReducedMotion,
} from 'react-native-reanimated';
import { useAlerts } from '@/context/alerts-context';

const GLOW_SIZE = 460;
const GRADIENT_SIZE = 420;

function RadialGlow({ id, color, stopOpacity = 0.16 }: { id: string; color: string; stopOpacity?: number }) {
  return <Svg width="100%" height="100%" viewBox={`0 0 ${GRADIENT_SIZE} ${GRADIENT_SIZE}`}>
    <Defs>
      <RadialGradient id={id} cx="50%" cy="50%" r="50%">
        <Stop offset="0%" stopColor={color} stopOpacity={stopOpacity} />
        <Stop offset="100%" stopColor={color} stopOpacity={0} />
      </RadialGradient>
    </Defs>
    <Circle cx={GRADIENT_SIZE / 2} cy={GRADIENT_SIZE / 2} r={GRADIENT_SIZE / 2} fill={`url(#${id})`} />
  </Svg>;
}

export default function AmbientBackground() {
  const { smokeSensors, motionSensors } = useAlerts();
  const reducedMotion = useReducedMotion();
  const smoke = smokeSensors.some((sensor) => sensor.active);
  const motion = motionSensors.some((sensor) => sensor.active);
  const glowA = useSharedValue(0);
  const glowB = useSharedValue(0);
  const alertPulse = useSharedValue(0);

  useEffect(() => {
    if (reducedMotion) {
      glowA.value = withTiming(0, { duration: 150 });
      glowB.value = withTiming(0, { duration: 150 });
      return () => { cancelAnimation(glowA); cancelAnimation(glowB); };
    }
    glowA.value = withRepeat(withSequence(
      withTiming(1, { duration: 18000, easing: Easing.inOut(Easing.sin) }),
      withTiming(0, { duration: 22000, easing: Easing.inOut(Easing.sin) }),
    ), -1);
    glowB.value = withRepeat(withSequence(
      withTiming(1, { duration: 26000, easing: Easing.inOut(Easing.sin) }),
      withTiming(0, { duration: 24000, easing: Easing.inOut(Easing.sin) }),
    ), -1);
    return () => {
      cancelAnimation(glowA);
      cancelAnimation(glowB);
      cancelAnimation(alertPulse);
    };
  }, [glowA, glowB, alertPulse, reducedMotion]);

  useEffect(() => {
    cancelAnimation(alertPulse);
    alertPulse.value = (smoke || motion) && !reducedMotion
      ? withRepeat(withSequence(
          withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
        ), -1)
      : withTiming(0, { duration: 350 });
    return () => cancelAnimation(alertPulse);
  }, [smoke, motion, alertPulse, reducedMotion]);

  const aStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: glowA.value * 28 - 14 }, { translateY: glowA.value * 18 - 9 }, { scale: 1 + glowA.value * 0.08 }],
  }));
  const bStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: glowB.value * -24 + 12 }, { translateY: glowB.value * 22 - 11 }, { scale: 1 + glowB.value * 0.07 }],
  }));
  const alertStyle = useAnimatedStyle(() => ({ opacity: 0.02 + alertPulse.value * 0.12 }));

  return <View pointerEvents="none" style={StyleSheet.absoluteFill}>
    <View style={styles.base} />
    <Animated.View style={[styles.glow, styles.glowA, aStyle]}><RadialGlow id="ambient-glow-a" color="#506E91" /></Animated.View>
    <Animated.View style={[styles.glow, styles.glowB, bStyle]}><RadialGlow id="ambient-glow-b" color="#A0A0A0" stopOpacity={0.12} /></Animated.View>
    <View style={styles.glowC}><Svg width={GLOW_SIZE} height={GLOW_SIZE} viewBox={`0 0 ${GLOW_SIZE} ${GLOW_SIZE}`}>
      <Defs><RadialGradient id="ambient-glow-c" cx="50%" cy="50%" r="50%"><Stop offset="0%" stopColor="#5A6478" stopOpacity={0.12} /><Stop offset="100%" stopColor="#5A6478" stopOpacity={0} /></RadialGradient></Defs>
      <Circle cx={GLOW_SIZE / 2} cy={GLOW_SIZE / 2} r={GLOW_SIZE / 2} fill="url(#ambient-glow-c)" />
    </Svg></View>
    {(smoke || motion) && <Animated.View style={[styles.alertGlow, alertStyle]}><Svg width={GRADIENT_SIZE} height={GRADIENT_SIZE} viewBox={`0 0 ${GRADIENT_SIZE} ${GRADIENT_SIZE}`}>
      <Defs><RadialGradient id="ambient-alert-glow" cx="50%" cy="50%" r="50%"><Stop offset="0%" stopColor={smoke ? '#EF4444' : '#3B82F6'} stopOpacity={1} /><Stop offset="100%" stopColor={smoke ? '#EF4444' : '#3B82F6'} stopOpacity={0} /></RadialGradient></Defs>
      <Circle cx={GRADIENT_SIZE / 2} cy={GRADIENT_SIZE / 2} r={GRADIENT_SIZE / 2} fill="url(#ambient-alert-glow)" />
    </Svg></Animated.View>}
    <View style={styles.vignetteTop} />
    <View style={styles.vignetteBottom} />
  </View>;
}

const styles = StyleSheet.create({
  base: { ...StyleSheet.absoluteFillObject, backgroundColor: '#1f1f1f' },
  glow: { position: 'absolute', width: 420, height: 420, borderRadius: 210 },
  glowA: { top: -190, right: -130 },
  glowB: { top: '28%', left: -240 },
  glowC: { position: 'absolute', width: GLOW_SIZE, height: GLOW_SIZE, borderRadius: GLOW_SIZE / 2, bottom: -270, right: -170 },
  alertGlow: { position: 'absolute', top: -180, left: '25%', width: GRADIENT_SIZE, height: GRADIENT_SIZE },
  vignetteTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 80, backgroundColor: 'rgba(20,20,20,0.12)' },
  vignetteBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 100, backgroundColor: 'rgba(20,20,20,0.22)' },
});
