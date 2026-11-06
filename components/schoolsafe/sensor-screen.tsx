import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Header from '@/components/schoolsafe/header';
import { SensorCard } from '@/components/schoolsafe/sensor-card';
import { Typography } from '@/constants/theme';
import { useAlerts, type SensorKind } from '@/context/alerts-context';

type Props = { kind: SensorKind; title: string };

export default function SensorScreen({ kind, title }: Props) {
  const router = useRouter();
  const { smokeSensors, motionSensors, telemetryStatus, telemetryError } = useAlerts();
  const sensors = kind === 'smoke' ? smokeSensors : motionSensors;
  const activeCount = sensors.filter((sensor) => sensor.active).length;
  const registered = sensors.filter((sensor) => sensor.areaId !== null);
  const unregistered = sensors.filter((sensor) => sensor.areaId === null);
  const smoke = kind === 'smoke';
  const accent = smoke ? '#EF4444' : '#3B82F6';
  const connectionLabel = telemetryStatus === 'online' ? 'API conectada' : telemetryStatus === 'connecting' ? 'conectando' : telemetryStatus === 'unconfigured' ? 'API não configurada' : 'sem conexão';

  return <View style={styles.screen}>
    <Header />
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Pressable onPress={() => router.replace('/' as any)} style={styles.back} accessibilityRole="button" accessibilityLabel="Voltar para a central"><Ionicons name="arrow-back-outline" size={16} color="#F2F2F2" /><Text style={styles.backText}>Central</Text></Pressable>
      <View style={styles.intro}>
        <View style={[styles.titleIcon, { backgroundColor: accent + '18', borderColor: accent + '35' }]}><Ionicons name={smoke ? 'flame-outline' : 'walk-outline'} size={22} color={accent} /></View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.caption}>{sensors.length} sensores · {activeCount} em alerta · {connectionLabel}</Text>
      </View>
      {telemetryError && <View style={styles.connectionNotice}><Ionicons name="cloud-offline-outline" size={16} color="#a0a0a0" /><Text style={styles.connectionNoticeText}>{telemetryError}</Text></View>}
      {activeCount > 0 && <View style={[styles.alertBanner, { borderColor: accent + '40', backgroundColor: accent + '12' }]}><Ionicons name={smoke ? 'warning-outline' : 'walk-outline'} size={17} color={accent} /><Text style={styles.alertText}>{smoke ? 'Alerta de fumaça ativo. Verifique o local.' : 'Movimento detectado nas áreas monitoradas.'}</Text></View>}
      <View style={styles.list}>{registered.map((sensor, index) => <SensorCard key={sensor.id} sensor={sensor} index={index} />)}</View>
      {unregistered.length > 0 && <View style={styles.unregistered}><Text style={styles.sectionTitle}>Não cadastrados</Text><Text style={styles.caption}>Aguardando o id real da área.</Text><View style={styles.list}>{unregistered.map((sensor, index) => <SensorCard key={sensor.id} sensor={sensor} index={registered.length + index} />)}</View></View>}
      {sensors.length === 0 && <View style={styles.empty}><Ionicons name="radio-outline" size={28} color="#777" /><Text style={styles.emptyTitle}>Nenhum sensor cadastrado</Text><Text style={styles.caption}>Os sensores aparecerão aqui quando forem registrados.</Text></View>}
      <Text style={styles.footer}>Leituras reais recebidas do ESP via JazzSecurity. A tela atualiza automaticamente a cada 10 segundos.</Text>
    </ScrollView>
  </View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: 'transparent' },
  content: { alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 112, gap: 16 },
  back: { width: '100%', maxWidth: 520, flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 36 },
  backText: { color: '#a0a0a0', fontSize: 12, fontWeight: '600' },
  intro: { width: '100%', maxWidth: 520, gap: 6 },
  titleIcon: { width: 48, height: 48, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  title: { color: '#F2F2F2', fontSize: 28, fontWeight: '700', fontFamily: Typography.bold, letterSpacing: -0.7 },
  caption: { color: '#a0a0a0', fontSize: 11, lineHeight: 16 },
  alertBanner: { width: '100%', maxWidth: 520, borderWidth: 1, borderRadius: 14, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 9 },
  alertText: { flex: 1, color: '#F2F2F2', fontSize: 12, fontFamily: Typography.medium, lineHeight: 17 },
  connectionNotice: { width: '100%', maxWidth: 520, flexDirection: 'row', alignItems: 'flex-start', gap: 9, padding: 12, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.035)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)' },
  connectionNoticeText: { flex: 1, color: '#a0a0a0', fontSize: 11, lineHeight: 16 },
  list: { width: '100%', maxWidth: 520, gap: 12 },
  unregistered: { width: '100%', maxWidth: 520, gap: 10, marginTop: 4 },
  sectionTitle: { color: '#F2F2F2', fontSize: 16, fontWeight: '700' },
  empty: { width: '100%', alignItems: 'center', padding: 30, gap: 10, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.03)' },
  emptyTitle: { color: '#F2F2F2', fontSize: 14, fontWeight: '700' },
  footer: { width: '100%', maxWidth: 520, color: '#666', fontSize: 10, textAlign: 'center', lineHeight: 16, marginTop: 6 },
});
