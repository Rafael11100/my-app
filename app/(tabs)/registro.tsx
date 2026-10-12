import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useRef } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import Header from '@/components/schoolsafe/header';
import { Glass } from '@/components/schoolsafe/glass';
import { useSensorSheet, type SensorOriginRect } from '@/components/schoolsafe/sensor-sheet';
import { useAlerts, type SensorRecord } from '@/context/alerts-context';
import type { Sensor } from '@/context/alerts-context';

export default function RegistroScreen() {
  const { history, clearHistory, removeRecord, sensors } = useAlerts();
  const { openSensor } = useSensorSheet();
  const targets = useRef<Record<string, View | null>>({});
  const active = sensors.filter((sensor) => sensor.active).sort((a, b) => (a.kind === b.kind ? (a.startedAt ?? '').localeCompare(b.startedAt ?? '') : a.kind === 'smoke' ? -1 : 1));

  const showSensor = useCallback((sensor: Sensor, target: View | null) => {
    const fallback: SensorOriginRect = { x: 24, y: 160, width: 48, height: 48 };
    if (!target) { openSensor(sensor.id, fallback); return; }
    target.measureInWindow((x, y, width, height) => openSensor(sensor.id, { x, y, width, height }));
  }, [openSensor]);

  const renderItem = useCallback(({ item }: { item: SensorRecord }) => (
    <HistoryRow record={item} sensor={sensors.find((sensor) => sensor.id === item.sensorId) ?? null} onDelete={() => removeRecord(item.id)} />
  ), [removeRecord, sensors]);

  return <View style={styles.screen}>
    <Header />
    <FlatList
      data={history}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={<View style={styles.headerContent}>
        <View style={styles.intro}>
          <Text style={styles.eyebrow}>ATIVIDADE DO SISTEMA</Text>
          <Text style={styles.title}>Registro</Text>
          <Text style={styles.subtitle}>Alertas e eventos recentes dos sensores monitorados.</Text>
        </View>
        {active.length > 0 && <View style={styles.activeSection}>
          <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>Alerta ativo agora</Text><View style={styles.live}><View style={styles.liveDot} /><Text style={styles.liveLabel}>AO VIVO</Text></View></View>
          <View style={styles.rows}>{active.map((sensor) => {
            const smoke = sensor.kind === 'smoke';
            const accent = smoke ? '#EF4444' : '#3B82F6';
            return <Pressable key={sensor.id} ref={(node) => { targets.current[sensor.id] = node; }} onPress={() => showSensor(sensor, targets.current[sensor.id] ?? null)} style={[styles.activeRow, { borderColor: accent + '35' }]} accessibilityRole="button" accessibilityLabel={`Abrir detalhes de ${sensor.location.trim() || 'Área sem nome'}, ${sensor.label}`}>
              <View style={[styles.activeIcon, { backgroundColor: accent + '18' }]}><Ionicons name={smoke ? 'flame-outline' : 'walk-outline'} size={17} color={accent} /></View>
              <View style={styles.rowText}><Text style={styles.rowTitle} numberOfLines={1}>{sensor.location.trim() || 'Área sem nome'}</Text><Text style={styles.rowSub} numberOfLines={1}>{sensor.label} · {smoke ? 'Fumaça' : 'Movimento'} · desde {sensor.startedAt ?? '—'}</Text></View>
              <View style={[styles.stateBadge, { backgroundColor: accent + '18' }]}><Text style={[styles.stateText, { color: accent }]}>{smoke ? 'ALERTA' : 'DETECTADO'}</Text></View>
            </Pressable>;
          })}</View>
        </View>}
        <View style={styles.historyHeading}>
          <View><Text style={styles.sectionTitle}>Histórico de eventos</Text><Text style={styles.sectionSub}>{history.length} registros salvos neste dispositivo</Text></View>
          {history.length > 0 && <Pressable onPress={clearHistory} style={styles.clearButton} accessibilityRole="button" accessibilityLabel="Limpar histórico"><Ionicons name="trash-outline" size={14} color="#a0a0a0" /><Text style={styles.clearText}>Limpar</Text></Pressable>}
        </View>
      </View>}
      ListEmptyComponent={<Glass intensity={42} borderRadius={20} style={styles.empty}>
        <View style={styles.emptyIcon}><Ionicons name="document-text-outline" size={24} color="#a0a0a0" /></View>
        <Text style={styles.emptyTitle}>Nenhum evento registrado</Text>
        <Text style={styles.emptySub}>Quando um sensor for ativado, o evento aparecerá aqui.</Text>
      </Glass>}
      ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      ListFooterComponent={<Text style={styles.footer}>O registro é mantido localmente neste dispositivo.</Text>}
    />
  </View>;
}

function HistoryRow({ record, sensor, onDelete }: { record: SensorRecord; sensor: Sensor | null; onDelete: () => void }) {
  const { openSensor } = useSensorSheet();
  const viewRef = useRef<View>(null);
  const smoke = record.kind === 'smoke';
  const accent = smoke ? '#EF4444' : '#3B82F6';
  const open = () => {
    if (!sensor) return;
    const fallback: SensorOriginRect = { x: 24, y: 180, width: 48, height: 48 };
    const node = viewRef.current;
    if (!node) { openSensor(sensor.id, fallback); return; }
    node.measureInWindow((x, y, width, height) => openSensor(sensor.id, { x, y, width, height }));
  };
  return <Glass elevated intensity={38} borderRadius={17} style={styles.historyRow}>
    <Pressable ref={viewRef} onPress={open} style={styles.historyMain} accessibilityRole="button" accessibilityLabel={`${smoke ? 'Fumaça' : 'Movimento'} em ${record.location.trim() || 'Área sem nome'} às ${record.startedAt}`}>
      <View style={[styles.historyIcon, { backgroundColor: accent + '18' }]}><Ionicons name={smoke ? 'flame-outline' : 'walk-outline'} size={17} color={accent} /></View>
      <View style={styles.rowText}><Text style={styles.rowTitle} numberOfLines={1}>{record.location.trim() || 'Área sem nome'}</Text><Text style={styles.rowSub} numberOfLines={1}>{sensor?.label ?? record.sensorId} · {smoke ? 'Fumaça' : 'Movimento'}</Text></View>
      <Text style={styles.time}>{record.startedAt}</Text>
    </Pressable>
    <Pressable onPress={onDelete} hitSlop={8} style={styles.deleteButton} accessibilityRole="button" accessibilityLabel={`Remover evento ${record.id}`}><Ionicons name="close-outline" size={16} color="#888" /></Pressable>
  </Glass>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: 'transparent' },
  content: { alignItems: 'center', paddingHorizontal: 16, paddingTop: 18, paddingBottom: 112, gap: 10 },
  headerContent: { width: '100%', maxWidth: 520, gap: 20, marginBottom: 8 },
  intro: { gap: 5 },
  eyebrow: { color: '#a0a0a0', fontSize: 9, fontWeight: '700', letterSpacing: 1.4 },
  title: { color: '#F2F2F2', fontSize: 28, fontWeight: '700', letterSpacing: -0.7 },
  subtitle: { color: '#a0a0a0', fontSize: 12, lineHeight: 18, maxWidth: 440 },
  activeSection: { gap: 10, padding: 14, borderRadius: 22, borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)', backgroundColor: 'rgba(255,255,255,0.035)' },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: '#F2F2F2', fontSize: 15, fontWeight: '700' },
  live: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 5, backgroundColor: 'rgba(160,160,160,0.10)' },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#a0a0a0' }, liveLabel: { color: '#a0a0a0', fontSize: 8, fontWeight: '800', letterSpacing: 1 },
  rows: { gap: 8 },
  activeRow: { height: 68, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 14, padding: 10, backgroundColor: 'rgba(255,255,255,0.025)' },
  activeIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1, minWidth: 0, gap: 3 },
  rowTitle: { color: '#F2F2F2', fontSize: 12, fontWeight: '700' }, rowSub: { color: '#888', fontSize: 10, lineHeight: 14 },
  stateBadge: { borderRadius: 999, paddingHorizontal: 7, paddingVertical: 5 }, stateText: { fontSize: 8, fontWeight: '800', letterSpacing: 0.4 },
  historyHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 2 },
  sectionSub: { color: '#777', fontSize: 10, marginTop: 4 },
  clearButton: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7 },
  clearText: { color: '#a0a0a0', fontSize: 10, fontWeight: '600' },
  historyRow: { width: '100%', maxWidth: 520, height: 68, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  historyMain: { height: 44, flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  historyIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  time: { color: '#777', fontSize: 10, fontFamily: 'monospace' },
  deleteButton: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.04)' },
  empty: { width: '100%', maxWidth: 520, alignItems: 'center', padding: 28, gap: 10 },
  emptyIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)' },
  emptyTitle: { color: '#F2F2F2', fontSize: 14, fontWeight: '700' }, emptySub: { color: '#888', fontSize: 11, lineHeight: 16, textAlign: 'center' },
  footer: { width: '100%', maxWidth: 520, paddingTop: 18, color: '#5f5f5f', fontSize: 9, textAlign: 'center' },
});
