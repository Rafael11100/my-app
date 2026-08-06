import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Reanimated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import DetectorCard from '@/components/schoolsafe/detector-card';
import Footer from '@/components/schoolsafe/footer';
import Header from '@/components/schoolsafe/header';
import { createControlStyles, createScreenStyles } from '@/components/schoolsafe/screen-styles';
import { useAlerts } from '@/context/alerts-context';
import { useSchoolColors } from '@/hooks/use-school-colors';
import { timeNow } from '@/utils/date';

type Props = {
  /** Tipo do sensor: 'smoke' ou 'motion' */
  kind: 'smoke' | 'motion';
  /** Título da tela de monitoramento */
  title: string;
  /** Subtítulo (localização) */
  subtitle: string;
  /** Título do card do detector */
  cardTitle: string;
  /** Nome de rota para detalhes (não usado diretamente) */
  route: string;
  /** Cor de destaque do sensor */
  accent: string;
  /** Cor do piscar de fundo (rgba) ex.: 'rgba(239,68,68,0)' */
  blinkFrom: string;
  /** Cor do piscar de fundo ativo (rgba) ex.: 'rgba(239,68,68,0.55)' */
  blinkTo: string;
  /** Duração do alerta automático em ms */
  duration: number;
};

/**
 * Tela unificada de monitoramento de sensor.
 * Centraliza a lógica de Fumaça e Presença (antes duplicada em smoke.tsx/motion.tsx):
 * estado do alerta, timer, ativar/desativar, animação de piscar e layout.
 */
export default function SensorScreen({
  kind,
  title,
  subtitle,
  cardTitle,
  accent,
  blinkFrom,
  blinkTo,
  duration,
}: Props) {
  const router = useRouter();
  const colors = useSchoolColors();
  const screen = createScreenStyles(colors);
  const controls = createControlStyles(colors);
  const { startAlert, endAlert } = useAlerts();

  const [sensor, setSensor] = useState({ alert: false, startedAt: null as string | null });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Animação da página inteira piscando
  const blink = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (sensor.alert) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(blink, { toValue: 1, duration: 500, useNativeDriver: false }),
          Animated.timing(blink, { toValue: 0, duration: 500, useNativeDriver: false }),
        ]),
      ).start();
    } else {
      blink.setValue(0);
    }
    return () => blink.stopAnimation();
  }, [sensor.alert, blink]);

  const blinkBg = blink.interpolate({
    inputRange: [0, 1],
    outputRange: [blinkFrom, blinkTo],
  });

  const activate = () => {
    if (sensor.alert) return;
    setSensor({ alert: true, startedAt: timeNow() });
    startAlert(kind);
    // desativa automaticamente após duration
    timer.current = setTimeout(() => {
      setSensor({ alert: false, startedAt: null });
      endAlert(kind);
    }, duration);
  };

  const deactivate = () => {
    if (!sensor.alert) return;
    if (timer.current) clearTimeout(timer.current);
    setSensor({ alert: false, startedAt: null });
    endAlert(kind);
  };

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const showDetails = (sensorName: string) => {
    Alert.alert(
      sensorName,
      `Detalhes do sensor.\n\nAtualmente: sem ocorrências ativas.\nLocal monitorado em tempo real.`,
);
  };

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
    <View style={screen.screen}>
      <Reanimated.View style={headerStyle}>
        <Header />
      </Reanimated.View>

      <Reanimated.ScrollView
        contentContainerStyle={screen.content}
        onScroll={onScroll}
        scrollEventThrottle={16}>
        <View style={screen.cardsArea}>
          <TouchableOpacity
            style={controls.backRow}
            onPress={() => router.back()}
            activeOpacity={0.7}>
            <View style={controls.backBadge}>
              <Ionicons name="arrow-back" size={18} color={colors.navy} />
            </View>
            <Text style={controls.backText}>Voltar para a central</Text>
          </TouchableOpacity>

          <View style={screen.sectionHeader}>
            <Text style={screen.sectionTitle}>{title}</Text>
            <Text style={screen.sectionSubtitle}>{subtitle}</Text>
          </View>

          <DetectorCard
            kind={kind}
            title={cardTitle}
            location={subtitle}
            alert={sensor.alert}
            startedAt={sensor.startedAt}
            blink={false}
            onDetails={() => showDetails(cardTitle)}
          />

          <View style={controls.controls}>
            {sensor.alert ? (
              <TouchableOpacity
                style={[controls.controlBtn, { backgroundColor: colors.gray }]}
                onPress={deactivate}
                activeOpacity={0.85}>
                <Ionicons name="close-circle" size={20} color={colors.white} />
                <Text style={controls.controlText}>Desativar Detector</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[controls.controlBtn, { backgroundColor: accent }]}
                onPress={activate}
                activeOpacity={0.85}>
                <Ionicons name="power" size={20} color={colors.white} />
                <Text style={controls.controlText}>Ativar Detector</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
</Reanimated.ScrollView>

      <Reanimated.View style={footerStyle}>
        <Footer />
      </Reanimated.View>

      {/* Página inteira piscando */}
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFillObject, screen.overlay, { backgroundColor: blinkBg }]}
      />
    </View>
  );
}
