import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useSchoolColors } from '@/hooks/use-school-colors';

type Props = {
  kind: 'smoke' | 'motion';
  title: string;
  location: string;
  alert: boolean;
  startedAt: string | null;
  blink?: boolean;
  onDetails: () => void;
};

export default function DetectorCard({
  kind,
  title,
  location,
  alert,
  startedAt,
  blink = true,
  onDetails,
}: Props) {
  const colors = useSchoolColors();
  const isSmoke = kind === 'smoke';
  const accent = isSmoke ? colors.red : colors.blue;
  const pulse = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (alert && blink) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1,
            duration: 700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulse, {
            toValue: 0,
            duration: 700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start();
      Animated.timing(glow, {
        toValue: 1,
        duration: 500,
        useNativeDriver: false,
      }).start();
    } else {
      pulse.setValue(0);
      Animated.timing(glow, { toValue: 0, duration: 400, useNativeDriver: false }).start();
    }
    return () => {
      pulse.stopAnimation();
      glow.stopAnimation();
    };
  }, [alert, blink, pulse, glow]);

  const pulseScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] });
const glowColor = glow.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(226,232,240,0)', `rgba(${isSmoke ? '220,38,38' : '37,99,235'},0.28)`],
  });
  const bgColor = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.white, isSmoke ? '#FEE2E2' : '#EFF6FF'],
  });
  const borderColor = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.cardBorder, accent],
  });

  const statusText = alert
    ? isSmoke
      ? '🔴 FUMAÇA NO LOCAL'
      : '🔵 MOVIMENTO NESSE LOCAL'
    : '🟢 ' + (isSmoke ? 'Nenhuma fumaça detectada' : 'Nenhum movimento detectado');
  const statusColor = alert ? accent : colors.green;

  const styles = createStyles(colors);

  return (
    <Animated.View
      style={[
        styles.card,
        { backgroundColor: bgColor, borderColor, shadowColor: accent },
        alert && styles.cardShadowOn,
      ]}>
      {/* Brilho suave interno quando há alerta */}
      {alert && blink && (
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFillObject, styles.cardGlow, { backgroundColor: glowColor }]}
        />
      )}
      <View style={styles.iconWrap}>
        <Animated.View
          style={[
            styles.iconCircle,
            { backgroundColor: alert ? accent : colors.background },
            alert && blink && { transform: [{ scale: pulseScale }] },
          ]}>
          <Ionicons
            name={isSmoke ? 'flame' : 'walk'}
            size={44}
            color={alert ? colors.white : accent}
          />
        </Animated.View>
      </View>

      <Text style={styles.cardTitle}>{title}</Text>

      <View style={[styles.statusBadge, { backgroundColor: statusColor + '1A' }]}>
        <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
      </View>

      {alert && startedAt && (
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Iniciado às</Text>
            <Text style={styles.metaValue}>{startedAt}</Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Local</Text>
            <Text style={styles.metaValue}>{location}</Text>
          </View>
        </View>
      )}

      <TouchableOpacity
        onPress={onDetails}
        style={[styles.detailsBtn, { backgroundColor: accent }]}
        activeOpacity={0.85}>
        <Text style={styles.detailsText}>Ver detalhes</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.white} />
      </TouchableOpacity>
    </Animated.View>
  );
}

function createStyles(colors: ReturnType<typeof useSchoolColors>) {
  return StyleSheet.create({
    card: {
      width: '100%',
      maxWidth: 420,
      borderRadius: 24,
      borderWidth: 1.5,
      padding: 22,
      alignItems: 'center',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
      elevation: 4,
    },
    cardShadowOn: {
      shadowOpacity: 0.35,
      shadowRadius: 24,
    },
    cardGlow: {
      borderRadius: 24,
    },
    iconWrap: {
      marginBottom: 12,
    },
    iconCircle: {
      width: 92,
      height: 92,
      borderRadius: 46,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.navy,
      marginBottom: 10,
    },
    statusBadge: {
      borderRadius: 999,
      paddingHorizontal: 16,
      paddingVertical: 8,
      marginBottom: 4,
    },
    statusText: {
      fontSize: 15,
      fontWeight: '700',
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 18,
      marginTop: 16,
      marginBottom: 18,
    },
    metaItem: {
      alignItems: 'center',
    },
    metaLabel: {
      fontSize: 11,
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    metaValue: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.navy,
      marginTop: 2,
      fontVariant: ['tabular-nums'],
    },
    metaDivider: {
      width: 1,
      height: 32,
      backgroundColor: colors.gray,
    },
    detailsBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 22,
      paddingVertical: 10,
      borderRadius: 999,
    },
    detailsText: {
      color: colors.white,
      fontWeight: '700',
      fontSize: 14,
    },
  });
}

