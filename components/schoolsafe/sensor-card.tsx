import { Ionicons } from '@expo/vector-icons';
import React, { memo, useCallback, useRef } from 'react';
import Animated, { FadeIn, FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Glass } from '@/components/schoolsafe/glass';
import { useSensorSheet, type SensorOriginRect } from '@/components/schoolsafe/sensor-sheet';
import { AREA_PHOTOS } from '@/constants/area-photos';
import { Typography } from '@/constants/theme';
import { useAlerts, type Sensor } from '@/context/alerts-context';

function SensorCardComponent({ sensor, index = 0 }: { sensor: Sensor; index?: number }) {
  const reducedMotion = useReducedMotion();
  const entering = reducedMotion ? FadeIn.duration(150) : FadeInDown.delay(Math.min(index, 8) * 45).duration(420);
  const viewRef = useRef<View>(null);
  const { openSensor } = useSensorSheet();
  const { activateSensor, deactivateSensor } = useAlerts();
  const smoke = sensor.kind === 'smoke';
  const accent = smoke ? '#EF4444' : '#3B82F6';
  const photo = sensor.areaId ? AREA_PHOTOS[sensor.areaId] : undefined;
  const locationLabel = sensor.location.trim() || 'Área sem nome';

  const open = useCallback(() => {
    const fallback: SensorOriginRect = { x: 16, y: 160, width: 64, height: 64 };
    const node = viewRef.current;
    if (!node) { openSensor(sensor.id, fallback); return; }
    node.measureInWindow((x, y, width, height) => openSensor(sensor.id, { x, y, width, height }));
  }, [openSensor, sensor.id]);

  return <Animated.View ref={viewRef} entering={entering} collapsable={false} style={styles.outer}>
    <Glass elevated intensity={46} borderRadius={20} accent={sensor.active ? accent + '80' : undefined} style={styles.card}>
      <Pressable onPress={open} style={styles.main} accessibilityRole="button" accessibilityLabel={`${smoke ? 'Fumaça' : 'Movimento'}, ${locationLabel}, ${sensor.active ? 'em alerta' : 'normal'}`}>
        <View style={[styles.thumbnail, !photo && styles.thumbnailPlaceholder, { borderColor: photo ? 'transparent' : sensor.areaId ? 'rgba(255,255,255,0.12)' : '#6b6b6b' }]}>
          {photo ? <Image source={photo} style={StyleSheet.absoluteFill} contentFit="cover" transition={180} /> : <Ionicons name={sensor.areaId ? 'business-outline' : 'help-circle-outline'} size={23} color="#777" />}
          <View style={[styles.kindIcon, { backgroundColor: accent + '24' }]}><Ionicons name={smoke ? 'flame-outline' : 'walk-outline'} size={13} color={accent} /></View>
        </View>
        <View style={styles.info}>
          <Text style={styles.kicker} numberOfLines={1}>{smoke ? 'SENSOR DE FUMAÇA' : 'SENSOR DE MOVIMENTO'}</Text>
          <Text style={styles.name} numberOfLines={1}>{locationLabel}</Text>
          <Text style={styles.location} numberOfLines={1}>{sensor.label}</Text>
          <View style={[styles.status, { backgroundColor: sensor.active ? accent + '18' : 'rgba(160,160,160,0.10)', borderColor: sensor.active ? accent + '55' : 'rgba(255,255,255,0.10)' }]}>
            <View style={[styles.dot, { backgroundColor: sensor.active ? accent : '#a0a0a0' }]} />
            <Text style={[styles.statusText, { color: sensor.active ? accent : '#a0a0a0' }]}>{sensor.active ? (smoke ? 'ALERTA' : 'DETECTADO') : 'NORMAL'}</Text>
          </View>
          <Text style={styles.event} numberOfLines={1}>Último evento · {sensor.lastEventAt ?? '—'}</Text>
        </View>
        <Ionicons name="chevron-forward-outline" size={16} color="#777" />
      </Pressable>
      <View style={styles.actions}>
        <Text style={styles.areaId}>{sensor.areaId ? (sensor.location.trim() ? 'ÁREA CADASTRADA' : 'ÁREA SEM NOME') : 'ÁREA NÃO CADASTRADA'}</Text>
        <Pressable onPress={() => sensor.active ? deactivateSensor(sensor.id) : activateSensor(sensor.id)} style={[styles.toggle, sensor.active && styles.toggleActive]} accessibilityRole="button" accessibilityLabel={sensor.active ? `Desativar ${sensor.label}` : `Ativar ${sensor.label}`}><Ionicons name={sensor.active ? 'power-outline' : 'flash-outline'} size={13} color={sensor.active ? '#F2F2F2' : '#1f1f1f'} /><Text style={[styles.toggleText, sensor.active && styles.toggleTextActive]}>{sensor.active ? 'Desativar' : 'Ativar'}</Text></Pressable>
      </View>
    </Glass>
  </Animated.View>;
}

export const SensorCard = memo(SensorCardComponent);

const styles = StyleSheet.create({
  outer: { width: '100%' },
  card: { width: '100%', height: 172, padding: 12, gap: 0, borderRadius: 20, justifyContent: 'space-between' },
  main: { height: 92, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12 },
  thumbnail: { width: 72, height: 72, borderRadius: 16, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: '#262626' },
  thumbnailPlaceholder: { borderWidth: 1, borderStyle: 'dashed' },
  kindIcon: { position: 'absolute', left: 5, bottom: 5, height: 25, width: 25, borderRadius: 9, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)' },
  info: { flex: 1, minWidth: 0, gap: 3 },
  kicker: { color: '#777', fontSize: 8, letterSpacing: 1.1, fontWeight: '700' },
  name: { color: '#F2F2F2', fontSize: 15, fontWeight: '700', fontFamily: Typography.semibold },
  location: { color: '#a0a0a0', fontSize: 11, fontFamily: Typography.regular },
  status: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 5, borderRadius: 999, borderWidth: 1, paddingHorizontal: 7, paddingVertical: 4, marginTop: 3 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  statusText: { fontSize: 8, fontWeight: '800', letterSpacing: 0.8 },
  event: { color: '#777', fontSize: 9, marginTop: 2 },
  actions: { height: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.07)', paddingTop: 10, gap: 10 },
  areaId: { color: '#666', fontFamily: 'monospace', fontSize: 8, letterSpacing: 0.5, flex: 1 },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 999, backgroundColor: '#F2F2F2', paddingHorizontal: 12, height: 34 },
  toggleActive: { backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  toggleText: { color: '#1f1f1f', fontSize: 10, fontWeight: '800', fontFamily: Typography.bold },
  toggleTextActive: { color: '#F2F2F2' },
});
