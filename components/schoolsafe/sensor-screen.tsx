import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Alert, Animated, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';

import Header from '@/components/schoolsafe/header';
import { useAlerts, type Sensor } from '@/context/alerts-context';
import { useSchoolColors } from '@/hooks/use-school-colors';

type Props = {
  kind: 'smoke' | 'motion';
  title: string;
  subtitle: string;
  cardTitle: string;
  route: string;
  accent: string;
  blinkFrom: string;
  blinkTo: string;
  duration: number;
};

function SensorDetailCard({ sensor, onToggle }: { sensor: Sensor; onToggle: () => void }) {
  const isSmoke = sensor.kind === 'smoke';
  const accent = isSmoke ? '#EF4444' : '#3B82F6';
  const pulse = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (sensor.active) {
      const dur = isSmoke ? 680 : 920;
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1, duration: dur, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 0, duration: dur, useNativeDriver: true }),
        ]),
      ).start();
      Animated.timing(glow, { toValue: 1, duration: 420, useNativeDriver: false }).start();
    } else {
      pulse.setValue(0);
      pulse.stopAnimation();
      Animated.timing(glow, { toValue: 0, duration: 300, useNativeDriver: false }).start();
    }
    return () => {
      pulse.stopAnimation();
      glow.stopAnimation();
    };
  }, [sensor.active, isSmoke, pulse, glow]);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, isSmoke ? 1.14 : 1.06] });
  const glowOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0, isSmoke ? 0.18 : 0.12] });

  const statusLabel = sensor.active ? (isSmoke ? 'ALERTA DE FUMAÇA' : 'MOVIMENTO DETECTADO') : 'Normal';
  const statusIcon = sensor.active ? (isSmoke ? 'warning' : 'walk') : 'checkmark-circle';
  const statusColor = sensor.active ? accent : '#22C55E';

  const cardStyle: any = {
    borderColor: sensor.active ? accent + '55' : 'rgba(160,160,160,0.14)',
    backgroundColor: 'rgba(40,40,40,0.92)',
  };

  return (
    <View
      accessible
      accessibilityLabel={`${sensor.label} ${isSmoke ? 'fumaça' : 'movimento'} ${sensor.location} status ${statusLabel}`}
      style={[styles.card, cardStyle]}>
      {sensor.active && (
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFillObject, styles.cardGlow, { backgroundColor: isSmoke ? 'rgba(239,68,68,0.10)' : 'rgba(59,130,246,0.08)', opacity: glowOpacity }]} />
      )}
      <View style={styles.cardTop}>
        <Animated.View style={[styles.iconCircle, { backgroundColor: sensor.active ? accent : 'rgba(255,255,255,0.07)', borderColor: sensor.active ? accent + '40' : 'rgba(160,160,160,0.12)', transform: sensor.active ? [{ scale }] : undefined }]}>
          <Ionicons name={isSmoke ? 'flame' : 'walk'} size={24} color={sensor.active ? '#fff' : '#a0a0a0'} />
        </Animated.View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.cardLabel}>{sensor.label}</Text>
          <Text style={styles.cardLocation}>{sensor.location}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: statusColor + '18', borderColor: statusColor + '2A' }]}>
          <Ionicons name={statusIcon as any} size={12} color={statusColor} />
          <Text style={[styles.badgeText, { color: statusColor }]}>{statusLabel}</Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Estado</Text>
          <Text style={[styles.metaValue, { color: statusColor }]}>{statusLabel}</Text>
        </View>
        <View style={styles.metaDivider} />
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Último evento</Text>
          <Text style={styles.metaValue}>{sensor.lastEventAt ?? '—'}</Text>
        </View>
        <View style={styles.metaDivider} />
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Conexão</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <View style={[styles.dot, { backgroundColor: '#22C55E' }]} />
            <Text style={[styles.metaValue, { fontSize: 12 }]}>Online</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardActions}>
        <Pressable
          onPress={onToggle}
          style={({ pressed }) => [styles.toggleBtn, { backgroundColor: sensor.active ? '#3a3a3a' : accent, borderColor: sensor.active ? 'rgba(160,160,160,0.14)' : 'transparent', opacity: pressed ? 0.9 : 1 }]}
          accessibilityRole="button"
          accessibilityLabel={sensor.active ? `Desativar ${sensor.label}` : `Ativar ${sensor.label}`}
          accessibilityHint={isSmoke ? 'Simula detecção de fumaça' : 'Simula detecção de movimento'}
          hitSlop={6}>
          <Ionicons name={sensor.active ? 'close-circle' : 'power'} size={16} color="#fff" />
          <Text style={styles.toggleText}>{sensor.active ? 'Desativar' : 'Ativar'}</Text>
        </Pressable>
        <Pressable
          onPress={() => Alert.alert(sensor.label, `Local: ${sensor.location}\nTipo: ${isSmoke ? 'Fumaça' : 'Movimento'}\nEstado: ${statusLabel}\nÚltimo evento: ${sensor.lastEventAt ?? 'nenhum'}\n\nMonitoramento em tempo real.`)}
          style={({ pressed }) => [styles.detailsBtn, { opacity: pressed ? 0.85 : 1 }]}
          accessibilityRole="button"
          hitSlop={6}>
          <Text style={styles.detailsText}>Detalhes</Text>
          <Ionicons name="chevron-forward" size={12} color="#a0a0a0" />
        </Pressable>
      </View>
    </View>
  );
}

export default function SensorScreen({ kind, title, subtitle }: Props) {
  const router = useRouter();
  const colors = useSchoolColors();
  const { smokeSensors, motionSensors, activateSensor, deactivateSensor } = useAlerts();
  const sensors = kind === 'smoke' ? smokeSensors : motionSensors;
  const activeCount = sensors.filter((s) => s.active).length;
  const isSmoke = kind === 'smoke';
  const accent = isSmoke ? '#EF4444' : '#3B82F6';

  const glow = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (activeCount > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glow, { toValue: 1, duration: 520, useNativeDriver: false }),
          Animated.timing(glow, { toValue: 0, duration: 520, useNativeDriver: false }),
        ]),
      ).start();
    } else {
      glow.setValue(0);
      glow.stopAnimation();
    }
    return () => glow.stopAnimation();
  }, [activeCount, glow]);
  const overlayColor = glow.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(0,0,0,0)', isSmoke ? 'rgba(239,68,68,0.06)' : 'rgba(59,130,246,0.06)'],
  });

  return (
    <View style={[styles.screen, { backgroundColor: '#1f1f1f' }]}>
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFillObject, { backgroundColor: overlayColor }]} />
      <Header compact />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backRow, pressed && { opacity: 0.7 }]} accessibilityRole="button" accessibilityLabel="Voltar para a central" hitSlop={8}>
          <View style={styles.backBadge}>
            <Ionicons name="arrow-back" size={16} color="#F2F2F2" />
          </View>
          <Text style={styles.backText}>Voltar para a central</Text>
        </Pressable>

        <View style={styles.headerBlock}>
          <View style={[styles.headerIcon, { backgroundColor: isSmoke ? 'rgba(239,68,68,0.14)' : 'rgba(59,130,246,0.14)', borderColor: isSmoke ? 'rgba(239,68,68,0.18)' : 'rgba(59,130,246,0.18)' }]}>
            <Ionicons name={isSmoke ? 'flame' : 'walk'} size={18} color={accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>{title}</Text>
            <Text style={styles.headerSub}>{subtitle} · {sensors.length} sensores</Text>
          </View>
          <View style={[styles.countPill, { borderColor: activeCount ? accent + '30' : 'rgba(160,160,160,0.14)', backgroundColor: activeCount ? accent + '14' : 'rgba(255,255,255,0.05)' }]}>
            <Text style={[styles.countPillText, { color: activeCount ? accent : '#a0a0a0' }]}>{activeCount} ativo{activeCount !== 1 ? 's' : ''}</Text>
          </View>
        </View>

        {isSmoke && activeCount > 0 && (
          <View accessible accessibilityLiveRegion="polite" style={[styles.banner, { borderColor: 'rgba(239,68,68,0.28)', backgroundColor: 'rgba(239,68,68,0.12)' }]}>
            <Ionicons name="warning" size={16} color="#F87171" />
            <Text style={styles.bannerText}>Possível situação de fumaça — verifique o local imediatamente.</Text>
          </View>
        )}
        {!isSmoke && activeCount > 0 && (
          <View accessible accessibilityLiveRegion="polite" style={[styles.banner, { borderColor: 'rgba(59,130,246,0.24)', backgroundColor: 'rgba(59,130,246,0.10)' }]}>
            <Ionicons name="walk" size={16} color="#60A5FA" />
            <Text style={[styles.bannerText, { color: '#93C5FD' }]}>Movimento detectado — presença identificada.</Text>
          </View>
        )}

        <View style={styles.list}>
          {sensors.map((s) => (
            <SensorDetailCard key={s.id} sensor={s} onToggle={() => (s.active ? deactivateSensor(s.id) : activateSensor(s.id))} />
          ))}
        </View>

        <Text style={styles.hint}>{isSmoke ? 'Fumaça exige resposta imediata.' : 'Movimento é informativo — não indica emergência de fumaça.'} Toque em Ativar para simular detecção (10s fumaça · 2s presença).</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { alignItems: 'center', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 28, gap: 14 },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 10, alignSelf: 'flex-start' },
  backBadge: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(40,40,40,0.92)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(160,160,160,0.14)' },
  backText: { fontSize: 13, fontWeight: '600', color: '#F2F2F2' },
  headerBlock: { width: '100%', maxWidth: 520, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(40,40,40,0.72)', borderWidth: 1, borderColor: 'rgba(160,160,160,0.12)', borderRadius: 16, padding: 14 },
  headerIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  headerTitle: { fontSize: 15, fontWeight: '800', color: '#F2F2F2' },
  headerSub: { fontSize: 12, color: '#a0a0a0', marginTop: 2 },
  countPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
  countPillText: { fontSize: 11, fontWeight: '700' },
  banner: { width: '100%', maxWidth: 520, flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  bannerText: { flex: 1, fontSize: 13, fontWeight: '600', color: '#FCA5A5', lineHeight: 18 },
  list: { width: '100%', maxWidth: 520, gap: 12 },
  card: { borderWidth: 1, borderRadius: 18, padding: 14, gap: 12, overflow: 'hidden' },
  cardGlow: { borderRadius: 18 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconCircle: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  cardLabel: { fontSize: 14, fontWeight: '800', color: '#F2F2F2' },
  cardLocation: { fontSize: 11, color: '#7a7a7a', marginTop: 1 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4, marginLeft: 'auto' },
  badgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaItem: { flex: 1, alignItems: 'center', gap: 2 },
  metaLabel: { fontSize: 10, color: '#7a7a7a', textTransform: 'uppercase', letterSpacing: 0.6 },
  metaValue: { fontSize: 12, fontWeight: '700', color: '#F2F2F2', textAlign: 'center' },
  metaDivider: { width: 1, height: 28, backgroundColor: 'rgba(160,160,160,0.12)' },
  dot: { width: 6, height: 6, borderRadius: 3 },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 2 },
  toggleBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, borderWidth: 1, minHeight: 40 },
  toggleText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  detailsBtn: { marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(160,160,160,0.10)' },
  detailsText: { fontSize: 12, fontWeight: '600', color: '#a0a0a0' },
  hint: { width: '100%', maxWidth: 520, fontSize: 11, color: '#5a5a5a', textAlign: 'center', lineHeight: 16, paddingHorizontal: 8 },
});
