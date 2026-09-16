import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';

import Header from '@/components/schoolsafe/header';
import { useAlerts } from '@/context/alerts-context';
import { useSchoolColors } from '@/hooks/use-school-colors';

function SensorMiniRow({ sensor }: { sensor: import('@/context/alerts-context').Sensor }) {
  const colors = useSchoolColors();
  const isSmoke = sensor.kind === 'smoke';
  const accent = isSmoke ? '#EF4444' : '#3B82F6';
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (sensor.active) {
      const dur = isSmoke ? 620 : 900;
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1, duration: dur, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 0, duration: dur, useNativeDriver: true }),
        ]),
      ).start();
    } else {
      pulse.setValue(0);
      pulse.stopAnimation();
    }
    return () => pulse.stopAnimation();
  }, [sensor.active, isSmoke, pulse]);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, isSmoke ? 1.12 : 1.06] });
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, isSmoke ? 0.85 : 0.92] });

  const statusLabel = sensor.active ? (isSmoke ? 'ALERTA' : 'DETECTADO') : 'Normal';
  const statusColor = sensor.active ? accent : '#22C55E';

  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={`${sensor.label} ${isSmoke ? 'fumaça' : 'movimento'} status ${statusLabel} ${sensor.location}`}
      style={[
        styles.miniRow,
        { borderColor: sensor.active ? accent + '55' : 'rgba(160,160,160,0.12)', backgroundColor: sensor.active ? (isSmoke ? 'rgba(239,68,68,0.12)' : 'rgba(59,130,246,0.10)') : 'rgba(255,255,255,0.04)' },
      ]}>
      <Animated.View style={[styles.miniIcon, { backgroundColor: sensor.active ? accent : 'rgba(255,255,255,0.08)', transform: sensor.active ? [{ scale }] : undefined, opacity: sensor.active ? opacity : 1 }]}>
        <Ionicons name={isSmoke ? 'flame' : 'walk'} size={14} color={sensor.active ? '#fff' : '#a0a0a0'} />
      </Animated.View>
      <View style={styles.miniMain}>
        <Text style={styles.miniLabel}>{sensor.label}</Text>
        <Text style={styles.miniLocation} numberOfLines={1}>{sensor.location}</Text>
      </View>
      <View style={[styles.statusChip, { backgroundColor: statusColor + '18', borderColor: statusColor + '30' }]}>
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        <Text style={[styles.statusChipText, { color: statusColor }]}>{statusLabel}</Text>
        {isSmoke && sensor.active && <Ionicons name="warning" size={10} color={statusColor} style={{ marginLeft: 2 }} />}
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const colors = useSchoolColors();
  const { smokeSensors, motionSensors } = useAlerts();

  const activeSmoke = useMemo(() => smokeSensors.filter((s) => s.active), [smokeSensors]);
  const activeMotion = useMemo(() => motionSensors.filter((s) => s.active), [motionSensors]);
  const hasActive = activeSmoke.length > 0 || activeMotion.length > 0;
  const smokeActive = activeSmoke.length > 0;
  const motionActive = activeMotion.length > 0;

  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (hasActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glow, { toValue: 1, duration: 500, useNativeDriver: false }),
          Animated.timing(glow, { toValue: 0, duration: 500, useNativeDriver: false }),
        ]),
      ).start();
    } else {
      glow.setValue(0);
      glow.stopAnimation();
    }
    return () => glow.stopAnimation();
  }, [hasActive, glow]);

  const glowColor = glow.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(0,0,0,0)', smokeActive ? 'rgba(239,68,68,0.10)' : motionActive ? 'rgba(59,130,246,0.10)' : 'rgba(0,0,0,0)'],
  });

  const totalOk = smokeSensors.filter((s) => !s.active).length + motionSensors.filter((s) => !s.active).length;
  const overviewTitle = hasActive ? (smokeActive ? 'Alerta de fumaça' : 'Movimento detectado') : 'Sistema normal';
  const overviewDesc = hasActive
    ? smokeActive
      ? `${activeSmoke.length} sensor${activeSmoke.length > 1 ? 'es' : ''} de fumaça em alerta`
      : `${activeMotion.length} sensor${activeMotion.length > 1 ? 'es' : ''} com presença detectada`
    : `10 sensores monitorando · ${totalOk}/10 normais`;

  return (
    <View style={[styles.screen, { backgroundColor: '#1f1f1f' }]}>
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFillObject, { backgroundColor: glowColor }]} />

      <Header compact />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Visão geral */}
        <View style={styles.overviewWrap}>
          {Platform.OS === 'web' ? (
            <View style={[styles.overviewCard, styles.cardWeb]} accessibilityRole="header">
              <View style={[styles.overviewIcon, { backgroundColor: hasActive ? (smokeActive ? 'rgba(239,68,68,0.18)' : 'rgba(59,130,246,0.18)') : 'rgba(34,197,94,0.14)' }]}>
                <Ionicons name={hasActive ? (smokeActive ? 'flame' : 'walk') : 'shield-checkmark'} size={20} color={hasActive ? (smokeActive ? '#EF4444' : '#3B82F6') : '#22C55E'} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.overviewTitle}>{overviewTitle}</Text>
                <Text style={styles.overviewDesc}>{overviewDesc}</Text>
              </View>
              <View style={styles.overviewMeta}>
                <Text style={styles.overviewMetaLabel}>Sensores</Text>
                <Text style={styles.overviewMetaValue}>10</Text>
              </View>
            </View>
          ) : (
            <View style={styles.overviewWrapInner}>
              <BlurView intensity={22} tint="dark" style={StyleSheet.absoluteFill} />
              <View style={styles.overviewGlass}>
                <View style={[styles.overviewIcon, { backgroundColor: hasActive ? (smokeActive ? 'rgba(239,68,68,0.18)' : 'rgba(59,130,246,0.18)') : 'rgba(34,197,94,0.14)' }]}>
                  <Ionicons name={hasActive ? (smokeActive ? 'flame' : 'walk') : 'shield-checkmark'} size={20} color={hasActive ? (smokeActive ? '#EF4444' : '#3B82F6') : '#22C55E'} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.overviewTitle}>{overviewTitle}</Text>
                  <Text style={styles.overviewDesc}>{overviewDesc}</Text>
                </View>
                <View style={styles.overviewMeta}>
                  <Text style={styles.overviewMetaLabel}>Sensores</Text>
                  <Text style={styles.overviewMetaValue}>10</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Grupo fumaça */}
        <View style={styles.group}>
          <View style={styles.groupHeader}>
            <View style={[styles.groupIcon, { backgroundColor: 'rgba(239,68,68,0.14)', borderColor: 'rgba(239,68,68,0.18)' }]}>
              <Ionicons name="flame" size={14} color="#EF4444" />
            </View>
            <Text style={styles.groupTitle}>Fumaça</Text>
            <Text style={styles.groupCount}>5 sensores</Text>
            {activeSmoke.length > 0 && (
              <View style={styles.groupBadgeAlert}>
                <Text style={styles.groupBadgeAlertText}>{activeSmoke.length} alerta</Text>
              </View>
            )}
          </View>
          <View style={styles.miniList}>
            {smokeSensors.map((s) => (
              <SensorMiniRow key={s.id} sensor={s} />
            ))}
          </View>
        </View>

        {/* Grupo movimento */}
        <View style={styles.group}>
          <View style={styles.groupHeader}>
            <View style={[styles.groupIcon, { backgroundColor: 'rgba(59,130,246,0.14)', borderColor: 'rgba(59,130,246,0.18)' }]}>
              <Ionicons name="walk" size={14} color="#3B82F6" />
            </View>
            <Text style={styles.groupTitle}>Movimento</Text>
            <Text style={styles.groupCount}>5 sensores</Text>
            {activeMotion.length > 0 && (
              <View style={[styles.groupBadgeAlert, { backgroundColor: 'rgba(59,130,246,0.16)', borderColor: 'rgba(59,130,246,0.22)' }]}>
                <Text style={[styles.groupBadgeAlertText, { color: '#60A5FA' }]}>{activeMotion.length} detectado</Text>
              </View>
            )}
          </View>
          <View style={styles.miniList}>
            {motionSensors.map((s) => (
              <SensorMiniRow key={s.id} sensor={s} />
            ))}
          </View>
        </View>

        {/* Ações principais — antes ocupava footer, agora vem após sensores */}
        <View style={styles.actions}>
          <Text style={styles.actionsLabel}>Ações</Text>
          <View style={styles.actionsGrid}>
            <Pressable
              onPress={() => router.push('/smoke')}
              style={({ pressed }) => [styles.actionCard, styles.actionCardGlass, pressed && { opacity: 0.92, transform: [{ scale: 0.98 }] }]}
              accessibilityRole="button"
              accessibilityLabel="Abrir sensores de fumaça"
              accessibilityHint="Mostra os 5 sensores de fumaça"
              hitSlop={6}>
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(239,68,68,0.14)' }]}>
                <Ionicons name="flame" size={20} color="#EF4444" />
              </View>
              <Text style={styles.actionTitle}>Sensores de fumaça</Text>
              <Text style={styles.actionSub}>5 sensores · Banheiros e áreas técnicas</Text>
              <View style={[styles.actionChevron, { backgroundColor: 'rgba(239,68,68,0.18)' }]}>
                <Ionicons name="arrow-forward" size={14} color="#F87171" />
              </View>
            </Pressable>

            <Pressable
              onPress={() => router.push('/motion')}
              style={({ pressed }) => [styles.actionCard, styles.actionCardGlass, pressed && { opacity: 0.92, transform: [{ scale: 0.98 }] }]}
              accessibilityRole="button"
              accessibilityLabel="Abrir sensores de movimento"
              accessibilityHint="Mostra os 5 sensores de movimento"
              hitSlop={6}>
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(59,130,246,0.14)' }]}>
                <Ionicons name="walk" size={20} color="#3B82F6" />
              </View>
              <Text style={styles.actionTitle}>Sensores de movimento</Text>
              <Text style={styles.actionSub}>5 sensores · Corredores e acessos</Text>
              <View style={[styles.actionChevron, { backgroundColor: 'rgba(59,130,246,0.18)' }]}>
                <Ionicons name="arrow-forward" size={14} color="#60A5FA" />
              </View>
            </Pressable>

            <Pressable
              onPress={() => router.push('/registro')}
              style={({ pressed }) => [styles.actionCard, styles.actionCardSmall, pressed && { opacity: 0.92, transform: [{ scale: 0.98 }] }]}
              accessibilityRole="button"
              accessibilityLabel="Abrir registro de eventos"
              accessibilityHint="Histórico de detecções"
              hitSlop={6}>
              <View style={[styles.actionIconSmall, { backgroundColor: 'rgba(160,160,160,0.12)' }]}>
                <Ionicons name="document-text" size={16} color="#a0a0a0" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.actionTitleSmall}>Registro / Log</Text>
                <Text style={styles.actionSubSmall}>Histórico de eventos</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#a0a0a0" />
            </Pressable>
          </View>
        </View>

        <Text style={styles.version}>SchoolSafe · v1.0.0 · 10 sensores</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { alignItems: 'center', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 24, gap: 16 },
  overviewWrap: { width: '100%', maxWidth: 520 },
  overviewWrapInner: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(160,160,160,0.14)',
  },
  overviewGlass: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(40,40,40,0.72)',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  overviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  cardWeb: { backgroundColor: 'rgba(40,40,40,0.92)', borderWidth: 1, borderColor: 'rgba(160,160,160,0.14)' },
  overviewIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(160,160,160,0.10)' },
  overviewTitle: { fontSize: 14, fontWeight: '800', color: '#F2F2F2' },
  overviewDesc: { fontSize: 12, color: '#a0a0a0', marginTop: 2 },
  overviewMeta: { alignItems: 'center', minWidth: 48 },
  overviewMetaLabel: { fontSize: 10, color: '#7a7a7a', textTransform: 'uppercase', letterSpacing: 0.8 },
  overviewMetaValue: { fontSize: 16, fontWeight: '800', color: '#F2F2F2' },
  group: { width: '100%', maxWidth: 520, gap: 10 },
  groupHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  groupIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  groupTitle: { fontSize: 14, fontWeight: '800', color: '#F2F2F2' },
  groupCount: { fontSize: 12, color: '#7a7a7a' },
  groupBadgeAlert: { marginLeft: 'auto', backgroundColor: 'rgba(239,68,68,0.16)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.22)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  groupBadgeAlertText: { fontSize: 11, fontWeight: '700', color: '#F87171' },
  miniList: { gap: 8 },
  miniRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  miniIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  miniMain: { flex: 1, minWidth: 0 },
  miniLabel: { fontSize: 13, fontWeight: '700', color: '#F2F2F2' },
  miniLocation: { fontSize: 11, color: '#7a7a7a', marginTop: 1 },
  statusChip: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusChipText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.2 },
  actions: { width: '100%', maxWidth: 520, gap: 10, marginTop: 4 },
  actionsLabel: { fontSize: 11, fontWeight: '700', color: '#7a7a7a', letterSpacing: 0.8, textTransform: 'uppercase' },
  actionsGrid: { gap: 10 },
  actionCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 18, padding: 14, borderWidth: 1, minHeight: 64 },
  actionCardGlass: { backgroundColor: 'rgba(40,40,40,0.92)', borderColor: 'rgba(160,160,160,0.14)' },
  actionCardSmall: { backgroundColor: 'rgba(40,40,40,0.72)', borderColor: 'rgba(160,160,160,0.12)', minHeight: 56 },
  actionIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  actionIconSmall: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  actionTitle: { flex: 1, fontSize: 13, fontWeight: '800', color: '#F2F2F2' },
  actionSub: { position: 'absolute', left: 66, top: 34, fontSize: 11, color: '#7a7a7a' },
  actionTitleSmall: { fontSize: 13, fontWeight: '700', color: '#F2F2F2' },
  actionSubSmall: { fontSize: 11, color: '#7a7a7a' },
  actionChevron: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  version: { fontSize: 11, color: '#5a5a5a', marginTop: 4 },
});
