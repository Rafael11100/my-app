import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Glass } from '@/components/schoolsafe/glass';
import type { Sensor } from '@/context/alerts-context';
import type { SensorOriginRect } from '@/components/schoolsafe/sensor-sheet';
import { formatTime } from '@/utils/date';
import { Typography } from '@/constants/theme';

type Props = { sensors: Sensor[]; onSelect: (sensor: Sensor, originRect?: SensorOriginRect) => void };

export default function MonitorCard({ sensors, onSelect }: Props) {
  const [now, setNow] = useState(new Date());
  const alertRefs = useRef<Record<string, View | null>>({});
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const active = sensors.filter((sensor) => sensor.active).sort((a, b) => (a.kind === b.kind ? (a.startedAt ?? '').localeCompare(b.startedAt ?? '') : a.kind === 'smoke' ? -1 : 1));
  const smoke = active.some((sensor) => sensor.kind === 'smoke');
  const motion = active.some((sensor) => sensor.kind === 'motion');
  const registered = sensors.filter((sensor) => sensor.areaId !== null).length;
  const unregistered = sensors.length - registered;
  const accent = smoke ? '#EF4444' : motion ? '#3B82F6' : '#a0a0a0';
  const headline = smoke ? 'ALERTA DE FUMAÇA' : motion ? 'MOVIMENTO DETECTADO' : 'Tudo normal';
  const latestActivity = [...sensors].filter((sensor) => sensor.lastEventAt).sort((a, b) => (b.lastEventAt ?? '').localeCompare(a.lastEventAt ?? ''))[0];
  const selectSensor = (sensor: Sensor) => {
    const node = alertRefs.current[sensor.id];
    if (!node) { onSelect(sensor); return; }
    node.measureInWindow((x, y, width, height) => onSelect(sensor, { x, y, width, height }));
  };

  return <Glass intensity={52} elevated style={[styles.card, { borderColor: active.length ? accent + '66' : 'rgba(255,255,255,0.10)' }]}>
    <View style={styles.content}>
    <View style={styles.top}>
      <View style={[styles.icon, { backgroundColor: active.length ? accent + '20' : 'rgba(160,160,160,0.12)' }]}><Ionicons name={smoke ? 'flame-outline' : motion ? 'walk-outline' : 'shield-checkmark-outline'} size={23} color={accent} /></View>
      <View style={styles.heading}><Text accessibilityLiveRegion={smoke ? 'assertive' : 'polite'} style={[styles.headline, { color: smoke ? '#EF4444' : motion ? '#60A5FA' : '#a0a0a0' }]}>{headline}</Text><Text style={styles.caption}>{active.length ? 'Acompanhe os eventos ativos abaixo' : 'Todos os sensores estão em estado normal'}</Text></View>
      <View style={[styles.online, { borderColor: 'rgba(255,255,255,0.12)' }]}><View style={styles.dot} /><Text style={styles.onlineText}>ONLINE</Text></View>
    </View>
    <View style={styles.stats}>
      <Stat label="Em alerta" value={active.length} accent={active.length ? accent : '#a0a0a0'} />
      <Stat label="Monitorados" value={registered} />
      <Stat label="Não cadastrados" value={unregistered} />
    </View>
    {active.length > 0 && <View style={styles.alertList}>{active.slice(0, 3).map((sensor) => {
      const locationLabel = sensor.location.trim() || 'Área sem nome';
      return <Pressable key={sensor.id} ref={(node) => { alertRefs.current[sensor.id] = node; }} onPress={() => selectSensor(sensor)} style={[styles.alertRow, { borderLeftColor: sensor.kind === 'smoke' ? '#EF4444' : '#3B82F6' }]} accessibilityRole="button" accessibilityLabel={`Abrir detalhes de ${locationLabel}, ${sensor.label}`}><Text numberOfLines={1} style={styles.alertRowText}>{locationLabel} · {sensor.label} · {sensor.kind === 'smoke' ? 'Fumaça' : 'Movimento'} · {elapsedFor(sensor.startedAt, now)}</Text></Pressable>;
    })}{active.length > 3 && <Text style={styles.caption}>+{active.length - 3} alertas</Text>}</View>}
    <View style={styles.footer}><Text style={styles.caption}>Última atividade: {latestActivity ? `${latestActivity.location.trim() || 'Área sem nome'} · ${latestActivity.lastEventAt ?? '—'}` : '—'}</Text><Text style={styles.clock}>Atualizado {formatTime(now)}</Text></View>
    </View>
  </Glass>;
}

function elapsedFor(startedAt: string | null, now: Date) {
  if (!startedAt) return 'há —';
  const [hours, minutes, seconds] = startedAt.split(':').map(Number);
  if (![hours, minutes, seconds].every(Number.isFinite)) return 'há —';
  const start = new Date(now);
  start.setHours(hours, minutes, seconds, 0);
  let elapsed = now.getTime() - start.getTime();
  if (elapsed < 0) elapsed += 24 * 60 * 60 * 1000;
  return `há ${Math.floor(elapsed / 1000)}s`;
}

function Stat({ label, value, accent = '#F2F2F2' }: { label: string; value: number; accent?: string }) {
  return <View style={styles.stat}><Text style={[styles.value, { color: accent }]}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  content: { flex: 1, gap: 18, justifyContent: 'space-between' },
  card: { width: '100%', minHeight: 264, padding: 20, gap: 18, borderRadius: 24, justifyContent: 'space-between' },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  heading: { flex: 1, gap: 4 },
  headline: { fontSize: 20, lineHeight: 25, fontWeight: '700', fontFamily: Typography.bold, letterSpacing: -0.35 },
  caption: { fontSize: 11, fontFamily: Typography.regular, color: '#a0a0a0', lineHeight: 16 },
  online: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#a0a0a0' },
  onlineText: { color: '#a0a0a0', fontSize: 8, fontWeight: '700', letterSpacing: 1 },
  stats: { flexDirection: 'row', gap: 8 },
  value: { fontSize: 29, fontWeight: '700', fontFamily: Typography.bold, fontVariant: ['tabular-nums'] },
  stat: { flex: 1, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.035)', padding: 12, gap: 5, minWidth: 0, minHeight: 70 },
  statLabel: { color: '#a0a0a0', fontSize: 9, lineHeight: 12 },
  alertList: { gap: 7 },
  alertRow: { paddingLeft: 10, borderLeftWidth: 2, paddingVertical: 4 },
  alertRowText: { color: '#F2F2F2', fontSize: 11, fontFamily: Typography.medium },
  footer: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)', paddingTop: 10, gap: 5 },
  clock: { color: '#777', fontSize: 9, fontFamily: 'monospace' },
});
