import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Reanimated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import Footer from '@/components/schoolsafe/footer';
import Header from '@/components/schoolsafe/header';
import { createScreenStyles } from '@/components/schoolsafe/screen-styles';
import { useAlerts } from '@/context/alerts-context';
import { useSchoolColors } from '@/hooks/use-school-colors';

const BLINK_DURATION_SMOKE = 10000; // 10s
const BLINK_DURATION_MOTION = 2000; // 2s

export default function HomeScreen() {
  const router = useRouter();
  const colors = useSchoolColors();
  const styles = createStyles(colors);
  const { smoke, motion } = useAlerts();

  const glow = useRef(new Animated.Value(0)).current;
  const blinkEndTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const smokeActive = smoke.active;
  const motionActive = motion.active;
  const hasActive = smokeActive || motionActive;

  // A luz pisca por 10s (fumaça) ou 2s (presença) e para quando é desativada.
  const blinking = useRef(false);
  const [isBlinking, setIsBlinking] = useState(blinking.current);

  const stopBlinking = () => {
    if (blinkEndTimer.current) clearTimeout(blinkEndTimer.current);
    blinkEndTimer.current = null;
    blinking.current = false;
    setIsBlinking(false);
  };

  useEffect(() => {
    if (hasActive) {
      if (blinkEndTimer.current) clearTimeout(blinkEndTimer.current);
      blinking.current = true;
      setIsBlinking(true);
      const duration = smokeActive ? BLINK_DURATION_SMOKE : BLINK_DURATION_MOTION;
      blinkEndTimer.current = setTimeout(() => {
        blinking.current = false;
        setIsBlinking(false);
      }, duration);
    } else {
      stopBlinking();
    }
    return () => stopBlinking();
  }, [hasActive, smokeActive, motionActive]);

  useEffect(() => {
    if (isBlinking) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glow, { toValue: 1, duration: 500, useNativeDriver: false }),
          Animated.timing(glow, { toValue: 0, duration: 500, useNativeDriver: false }),
        ]),
      ).start();
    } else {
      glow.setValue(0);
    }
    return () => glow.stopAnimation();
  }, [isBlinking, glow]);

  const glowColor = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [
      'rgba(0,0,0,0)',
      smokeActive
        ? 'rgba(220,38,38,0.55)'
        : motionActive
          ? 'rgba(37,99,235,0.55)'
          : 'rgba(0,0,0,0)',
    ],
  });

  // O fundo da página inicial é sempre branco.
  // O piscar acontece apenas sobreposto quando há alerta.
  const alertColor = colors.white;

  // ==== Animação parallax de Header/Footer ao rolar ====
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  const headerStyle = useAnimatedStyle(() => {
    const translateY = interpolate(scrollY.value, [0, 120], [0, -60], Extrapolation.CLAMP);
    const opacity = interpolate(scrollY.value, [0, 100], [1, 0.4], Extrapolation.CLAMP);
    return { transform: [{ translateY }], opacity };
  });

  const footerStyle = useAnimatedStyle(() => {
    const translateY = interpolate(scrollY.value, [0, 120], [0, 80], Extrapolation.CLAMP);
    const opacity = interpolate(scrollY.value, [0, 100], [1, 0.4], Extrapolation.CLAMP);
    return { transform: [{ translateY }], opacity };
  });
  // =====================================================

  return (
    <View style={[styles.screen, { backgroundColor: alertColor }]}>
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFillObject, styles.overlay, { backgroundColor: glowColor }]}
      />

      <Reanimated.View style={headerStyle}>
        <Header showClock={false} />
      </Reanimated.View>

      <Reanimated.ScrollView
        contentContainerStyle={styles.content}
        onScroll={onScroll}
        scrollEventThrottle={16}>
        <View style={styles.cardsArea}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Central de Sensores</Text>
            <Text style={styles.sectionSubtitle}>
              {hasActive
                ? '⚠️ Alerta em andamento!'
                : 'Selecione um detector para abrir o monitoramento'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.registroBtn}
            onPress={() => router.push('/registro')}
            activeOpacity={0.8}>
            <Ionicons name="document-text" size={16} color={colors.navy} />
            <Text style={styles.registroBtnText}>Registro</Text>
          </TouchableOpacity>

          <View style={styles.row}>
            <TouchableOpacity
              style={styles.navCard}
              onPress={() => router.push('/smoke')}
              activeOpacity={0.85}>
              <View style={[styles.navIconWrap, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="flame" size={26} color={colors.red} />
              </View>
              <View style={styles.navTextBlock}>
                <Text style={styles.navTitle}>Detector de Fumaça</Text>
                <Text style={styles.navSubtitle}>Banheiro</Text>
              </View>
              <View style={[styles.chevronWrap, { backgroundColor: colors.red }]}>
                <Ionicons name="arrow-forward" size={15} color={colors.white} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navCard}
              onPress={() => router.push('/motion')}
              activeOpacity={0.85}>
              <View style={[styles.navIconWrap, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="walk" size={26} color={colors.blue} />
              </View>
              <View style={styles.navTextBlock}>
                <Text style={styles.navTitle}>Detector de Presença</Text>
                <Text style={styles.navSubtitle}>Corredor Principal</Text>
              </View>
              <View style={[styles.chevronWrap, { backgroundColor: colors.blue }]}>
                <Ionicons name="arrow-forward" size={15} color={colors.white} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Reanimated.ScrollView>

      <Reanimated.View style={footerStyle}>
        <Footer showTime={false} />
      </Reanimated.View>
    </View>
  );
}

function createStyles(colors: ReturnType<typeof useSchoolColors>) {
  const shared = createScreenStyles(colors);
  return StyleSheet.create({
    ...shared,
    row: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'stretch',
      gap: 14,
    },
    navCard: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: colors.white,
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: colors.cardBorder,
      padding: 14,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    navIconWrap: {
      width: 48,
      height: 48,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    navTextBlock: {
      flex: 1,
      gap: 3,
    },
    navTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.navy,
    },
    navSubtitle: {
      fontSize: 11,
      color: colors.textMuted,
    },
    chevronWrap: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    registroBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      alignSelf: 'flex-start',
      backgroundColor: colors.white,
      borderRadius: 999,
      borderWidth: 1.5,
      borderColor: colors.cardBorder,
      paddingHorizontal: 14,
      paddingVertical: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    registroBtnText: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.navy,
    },
  });
}

