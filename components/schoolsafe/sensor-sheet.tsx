import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { BackHandler, Dimensions, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useReducedMotion, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { MOTION_DURATION, SPRING_SNAPPY } from '@/components/schoolsafe/motion-presets';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Glass } from '@/components/schoolsafe/glass';
import { AREA_PHOTOS } from '@/constants/area-photos';
import { useAlerts, type Sensor } from '@/context/alerts-context';

export type SensorOriginRect = { x: number; y: number; width: number; height: number };
type SheetState = { sensorId: string; originRect: SensorOriginRect };
type SheetContextValue = { openSensor: (sensorId: string, originRect: SensorOriginRect) => void };
const SheetContext = createContext<SheetContextValue | undefined>(undefined);

export function useSensorSheet() {
  const value = useContext(SheetContext);
  if (!value) throw new Error('useSensorSheet must be used within SensorSheetProvider');
  return value;
}

export function SensorSheetProvider({ children }: { children: React.ReactNode }) {
  const [sheet, setSheet] = useState<SheetState | null>(null);
  const openSensor = useCallback((sensorId: string, originRect: SensorOriginRect) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setSheet({ sensorId, originRect });
  }, []);
  const closeSensor = useCallback(() => setSheet(null), []);
  const value = useMemo(() => ({ openSensor }), [openSensor]);
  return <SheetContext.Provider value={value}>
    <View style={{ flex: 1 }}>{children}</View>
    <SensorSheet state={sheet} onClose={closeSensor} />
  </SheetContext.Provider>;
}

function SensorSheet({ state, onClose }: { state: SheetState | null; onClose: () => void }) {
  const { sensors, activateSensor, deactivateSensor } = useAlerts();
  const sensor = state ? sensors.find((item) => item.id === state.sensorId) ?? null : null;
  const reducedMotion = useReducedMotion();
  const screen = Dimensions.get('window');
  const insets = useSafeAreaInsets();
  const targetWidth = Math.max(240, Math.min(screen.width - 32, 568));
  const targetHeight = Math.max(280, Math.min(screen.height - insets.top - insets.bottom - 24, Math.round(screen.height * 0.84), 560));
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scaleX = useSharedValue(1);
  const scaleY = useSharedValue(1);
  const backdropOpacity = useSharedValue(0);
  const [closing, setClosing] = useState(false);
  const [elapsedNow, setElapsedNow] = useState(Date.now());

  useEffect(() => {
    if (!state) { setClosing(false); backdropOpacity.value = 0; return; }
    const { originRect } = state;
    translateX.value = originRect.x + originRect.width / 2 - screen.width / 2;
    translateY.value = originRect.y + originRect.height / 2 - screen.height / 2;
    scaleX.value = Math.max(0.08, originRect.width / targetWidth);
    scaleY.value = Math.max(0.08, originRect.height / targetHeight);
    backdropOpacity.value = 0;
    if (reducedMotion) {
      translateX.value = 0;
      translateY.value = 0;
      scaleX.value = 1;
      scaleY.value = 1;
      backdropOpacity.value = withTiming(1, { duration: 150 });
      return;
    }
    translateX.value = withSpring(0, SPRING_SNAPPY);
    translateY.value = withSpring(0, SPRING_SNAPPY);
    scaleX.value = withSpring(1, SPRING_SNAPPY);
    scaleY.value = withSpring(1, SPRING_SNAPPY);
    backdropOpacity.value = withTiming(1, { duration: 180 });
  }, [state, screen.width, screen.height, targetWidth, targetHeight, translateX, translateY, scaleX, scaleY, backdropOpacity, reducedMotion]);

  useEffect(() => {
    if (!sensor?.active) return;
    const timer = setInterval(() => setElapsedNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [sensor?.active]);

  useEffect(() => {
    if (!state || Platform.OS === 'web') return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => { close(); return true; });
    return () => subscription.remove();
  });

  const close = () => {
    if (!state || closing) return;
    setClosing(true);
    if (reducedMotion) {
      backdropOpacity.value = withTiming(0, { duration: 150 }, (finished) => { if (finished) runOnJS(onClose)(); });
      return;
    }
    translateX.value = withTiming(state.originRect.x + state.originRect.width / 2 - screen.width / 2, { duration: MOTION_DURATION.exit });
    translateY.value = withTiming(state.originRect.y + state.originRect.height / 2 - screen.height / 2, { duration: MOTION_DURATION.exit });
    scaleX.value = withTiming(Math.max(0.08, state.originRect.width / targetWidth), { duration: MOTION_DURATION.exit });
    scaleY.value = withTiming(Math.max(0.08, state.originRect.height / targetHeight), { duration: MOTION_DURATION.exit });
    backdropOpacity.value = withTiming(0, { duration: MOTION_DURATION.exit - 60 }, (finished) => { if (finished) runOnJS(onClose)(); });
  };

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: closing ? backdropOpacity.value : 1,
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }, { scaleX: scaleX.value }, { scaleY: scaleY.value }],
  }));
  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdropOpacity.value }));
  const drag = Gesture.Pan().onUpdate((event) => {
    if (event.translationY > 0) translateY.value = event.translationY;
  }).onEnd((event) => {
    if (event.translationY > 100 || event.velocityY > 800) runOnJS(close)();
    else if (reducedMotion) translateY.value = withTiming(0, { duration: 150 });
    else translateY.value = withSpring(0, SPRING_SNAPPY);
  });

  if (!state || !sensor) return null;
  const smoke = sensor.kind === 'smoke';
  const accent = smoke ? '#EF4444' : '#3B82F6';
  const areaPhoto = sensor.areaId ? AREA_PHOTOS[sensor.areaId] : undefined;
  const elapsed = sensor.active && sensor.startedAt ? elapsedSince(sensor.startedAt, elapsedNow) : 0;
  const elapsedLabel = sensor.active ? `${Math.floor(elapsed / 1000)}s` : sensor.endedAt ? 'Encerrado' : '—';
  const eventLabel = sensor.active ? (smoke ? 'ALERTA' : 'DETECTADO') : 'NORMAL';
  const locationLabel = sensor.location.trim() || 'Área sem nome';

  return <Modal visible transparent animationType="none" statusBarTranslucent onRequestClose={close}>
    <GestureHandlerRootView style={{ flex: 1 }}><View style={styles.overlay}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]} />
      <Pressable accessibilityLabel="Fechar detalhes" onPress={close} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.sheetPosition, { height: targetHeight }, cardAnimatedStyle]}>
          <Glass elevated intensity={58} borderRadius={28} style={styles.sheet}>
            <GestureDetector gesture={drag}>
              <View>
                <View style={styles.handle} />
                <View style={[styles.photo, { backgroundColor: sensor.areaId ? '#292b30' : '#252525' }]}>
              {areaPhoto ? <Image source={areaPhoto} contentFit="cover" transition={220} style={StyleSheet.absoluteFill} /> : <View style={styles.photoPlaceholder}><Ionicons name={sensor.areaId ? 'business-outline' : 'help-circle-outline'} size={34} color="#777" /><Text style={styles.photoArea}>{locationLabel}</Text></View>}
              <View style={styles.photoShade} />
              <Pressable onPress={close} style={styles.closeButton} accessibilityRole="button" accessibilityLabel="Fechar detalhes"><Ionicons name="close" size={20} color="#F2F2F2" /></Pressable>
                  <View style={styles.photoCaption}><Text style={styles.mono}>{sensor.id}</Text><Text style={styles.areaTitle}>{locationLabel}</Text></View>
                </View>
              </View>
            </GestureDetector>
            <View style={styles.sheetContent}>
              <ScrollView style={styles.bodyScroll} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>

              <View style={styles.chips}><View style={[styles.chip, { borderColor: accent + '55', backgroundColor: accent + '18' }]}><Ionicons name={smoke ? 'flame-outline' : 'walk-outline'} color={accent} size={13} /><Text style={[styles.chipText, { color: accent }]}>{smoke ? 'Fumaça' : 'Movimento'}</Text></View><View style={[styles.chip, { borderColor: sensor.active ? accent + '55' : 'rgba(255,255,255,0.12)' }]}><View style={[styles.statusDot, { backgroundColor: sensor.active ? accent : '#a0a0a0' }]} /><Text style={[styles.chipText, { color: sensor.active ? accent : '#a0a0a0' }]}>{eventLabel}</Text></View></View>
              <Text style={styles.title}>{locationLabel}</Text>
              <Text style={styles.sensorSubtitle}>{sensor.label}</Text>
              <View style={styles.details}>
                <Detail label="Estado" value={eventLabel} valueColor={sensor.active ? accent : '#a0a0a0'} />
                <Detail label="Início do alerta" value={sensor.startedAt ?? '—'} />
                <Detail label="Último evento" value={sensor.lastEventAt ?? '—'} />
                <Detail label="Duração" value={elapsedLabel} />
                <Detail label="Conexão" value="Online" />
              </View>
                {!sensor.areaId && <Text style={styles.note}>Este sensor ainda não foi associado a uma área do mapa.</Text>}
              </ScrollView>
              <View style={styles.actionContainer}>
                <Pressable onPress={() => sensor.active ? deactivateSensor(sensor.id) : activateSensor(sensor.id)} style={[styles.action, sensor.active && styles.actionMuted]} accessibilityRole="button"><Ionicons name={sensor.active ? 'power-outline' : 'flash-outline'} size={17} color={sensor.active ? '#F2F2F2' : '#1f1f1f'} /><Text style={[styles.actionText, sensor.active && styles.actionTextMuted]}>{sensor.active ? 'Desativar' : 'Ativar'}</Text></Pressable>
              </View>
            </View>
          </Glass>
        </Animated.View>
    </View></GestureHandlerRootView>
  </Modal>;
}

function elapsedSince(time: string, now: number) {
  const parts = time.split(':').map(Number);
  if (parts.length !== 3 || parts.some((part) => !Number.isFinite(part))) return 0;
  const started = new Date(now);
  started.setHours(parts[0], parts[1], parts[2], 0);
  let elapsed = now - started.getTime();
  if (elapsed < 0) elapsed += 24 * 60 * 60 * 1000;
  return Math.max(0, elapsed);
}

function Detail({ label, value, valueColor = '#F2F2F2' }: { label: string; value: string; valueColor?: string }) {
  return <View style={styles.detailRow}><Text style={styles.detailLabel}>{label}</Text><Text style={[styles.detailValue, { color: valueColor }]} numberOfLines={1}>{value}</Text></View>;
}
const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backdrop: { backgroundColor: 'rgba(0,0,0,0.62)' },
  sheetPosition: { width: '100%', maxWidth: 600, paddingHorizontal: 16 },
  sheet: { width: '100%', height: '100%', borderRadius: 28 },
  handle: { width: 38, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.25)', alignSelf: 'center', marginTop: 10, marginBottom: 8 },
  photo: { marginHorizontal: 12, height: 132, borderRadius: 20, overflow: 'hidden', justifyContent: 'flex-end' },
  photoPlaceholder: { ...StyleSheet.absoluteFill, justifyContent: 'center', alignItems: 'center', gap: 8 },
  photoArea: { color: '#a0a0a0', fontSize: 18, fontWeight: '600' },
  photoShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.18)' },
  closeButton: { position: 'absolute', top: 12, right: 12, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(16,16,16,0.70)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  photoCaption: { padding: 12, gap: 4 },
  mono: { color: '#dedede', fontFamily: 'monospace', fontSize: 10, letterSpacing: 1.2 },
  areaTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  sheetContent: { flex: 1, minHeight: 0 },
  bodyScroll: { flex: 1 },
  body: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 12, gap: 10 },
  actionContainer: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 16 },
  chips: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  chipText: { fontSize: 10, fontWeight: '700' },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  title: { color: '#F2F2F2', fontSize: 24, fontWeight: '700' },
  sensorSubtitle: { color: '#a0a0a0', fontSize: 12, fontWeight: '500', marginTop: -6 },
  details: { backgroundColor: 'rgba(255,255,255,0.035)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 16, paddingHorizontal: 12 },
  detailRow: { minHeight: 34, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  detailLabel: { color: '#8b8b8b', fontSize: 11 },
  detailValue: { fontSize: 11, fontWeight: '600', flexShrink: 1, textAlign: 'right' },
  action: { borderRadius: 999, height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#F2F2F2' },
  actionMuted: { backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)' },
  actionText: { color: '#1f1f1f', fontSize: 13, fontWeight: '800' },
  actionTextMuted: { color: '#F2F2F2' },
  note: { textAlign: 'center', color: '#777', fontSize: 10 },
});
