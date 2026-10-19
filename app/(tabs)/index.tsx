import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useIsFocused } from 'expo-router';
import React, { useCallback } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Header from '@/components/schoolsafe/header';
import MonitorCard from '@/components/schoolsafe/monitor-card';
import SchoolMap from '@/components/schoolsafe/school-map';
import { useAlerts, type Sensor } from '@/context/alerts-context';
import { Typography } from '@/constants/theme';
import { useSensorSheet, type SensorOriginRect } from '@/components/schoolsafe/sensor-sheet';

export default function HomeScreen() {
  const router = useRouter();
  const focused = useIsFocused();
  const { sensors } = useAlerts();
  const { openSensor: openSheet } = useSensorSheet();
  const openSensor = useCallback((sensor: Sensor, originRect?: SensorOriginRect) => {
    const screen = Dimensions.get('window');
    openSheet(sensor.id, originRect ?? { x: screen.width / 2 - 28, y: screen.height / 2 - 28, width: 56, height: 56 });
  }, [openSheet]);
  return <View style={styles.screen}>
    <Header />
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.intro}>
        <Text style={styles.eyebrow}>PAINEL DE CONTROLE</Text>
        <Text style={styles.title}>Visão geral</Text>
        <Text style={styles.subtitle}>Acompanhe os sensores e a localização dos dispositivos no térreo.</Text>
      </View>
      <MonitorCard sensors={sensors} onSelect={openSensor} />
      <SchoolMap sensors={sensors} focused={focused} />
      <Pressable onPress={() => router.push('/registro')} style={styles.history} accessibilityRole="button">
        <View style={styles.historyIcon}><Ionicons name="time-outline" size={19} color="#a0a0a0" /></View>
        <View style={{ flex: 1 }}><Text style={styles.historyTitle}>Registro de eventos</Text><Text style={styles.historySub}>Consulte o histórico de ativações</Text></View>
        <Ionicons name="chevron-forward-outline" size={18} color="#777" />
      </Pressable>
      <Text style={styles.footer}>SCHOOLSAFE · SEGURANÇA ESCOLAR</Text>
    </ScrollView>
  </View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: 'transparent' },
  content: { alignItems: 'center', paddingHorizontal: 16, paddingTop: 18, paddingBottom: 112, gap: 16 },
  intro: { width: '100%', maxWidth: 520, gap: 5 },
  eyebrow: { color: '#a0a0a0', fontSize: 9, fontWeight: '700', letterSpacing: 1.4 },
  title: { color: '#F2F2F2', fontSize: 28, fontWeight: '700', fontFamily: Typography.bold, letterSpacing: -0.8 },
  subtitle: { color: '#a0a0a0', fontSize: 13, fontFamily: Typography.regular, lineHeight: 19, maxWidth: 420 },
  sectionHead: { width: '100%', maxWidth: 520, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  sectionTitle: { color: '#F2F2F2', fontSize: 17, fontWeight: '700', fontFamily: Typography.semibold },
  systems: { width: '100%', maxWidth: 520, gap: 10 },
  systemCard: { width: '100%', flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)', backgroundColor: 'rgba(255,255,255,0.045)', minHeight: 82 },
  systemIcon: { width: 44, height: 44, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  systemText: { flex: 1, gap: 3 },
  systemTitle: { color: '#F2F2F2', fontSize: 14, fontWeight: '700', fontFamily: Typography.semibold },
  systemDescription: { color: '#a0a0a0', fontSize: 11, fontFamily: Typography.regular },
  systemCount: { color: '#777', fontSize: 10, marginTop: 2 },
  history: { width: '100%', maxWidth: 520, flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)', backgroundColor: 'rgba(255,255,255,0.035)', padding: 13 },
  historyIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.06)' },
  historyTitle: { color: '#F2F2F2', fontSize: 13, fontWeight: '700' },
  historySub: { color: '#888', fontSize: 11, marginTop: 3 },
  footer: { color: '#555', fontSize: 8, letterSpacing: 1.6, marginTop: 8 },
});
