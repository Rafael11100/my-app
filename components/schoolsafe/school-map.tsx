import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useRef } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View, useWindowDimensions, type PressableInstance } from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import { AREAS, type AreaId } from '@/constants/areas';
import { useSensorSheet, type SensorOriginRect } from '@/components/schoolsafe/sensor-sheet';
import { MapSensorChip } from '@/components/schoolsafe/map-sensor-chip';
import type { Sensor, SensorKind, SensorStatus } from '@/context/alerts-context';

type Props = { sensors: Sensor[]; focused?: boolean };
type SensorGroup = { kind: SensorKind; sensors: Sensor[] };
const MAP_VIEW = { x: 60, y: 22, width: 324, height: 382 };
const SENSOR_KINDS: SensorKind[] = ['smoke', 'motion'];

function groupByKind(sensors: Sensor[]): SensorGroup[] {
  return SENSOR_KINDS.flatMap((kind) => {
    const members = sensors.filter((sensor) => sensor.kind === kind);
    return members.length > 0 ? [{ kind, sensors: members }] : [];
  });
}

/** Produz o estado agregado do marcador sem alterar os sensores originais da tela de sensores. */
function getGroupMarkerSensor(group: SensorGroup): Sensor {
  const activeSensor = group.sensors.find((sensor) => sensor.active);
  const allOffline = group.sensors.every((sensor) => sensor.status === 'offline');
  const hasStaleSensor = group.sensors.some((sensor) => sensor.status === 'stale');
  const status: SensorStatus = activeSensor
    ? 'alert'
    : allOffline
      ? 'offline'
      : hasStaleSensor
        ? 'stale'
        : 'normal';

  return {
    ...(activeSensor ?? group.sensors[0]),
    active: Boolean(activeSensor),
    status,
  };
}

export default function SchoolMap({ sensors, focused = true }: Props) {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const { openSensor } = useSensorSheet();
  const targets = useRef<Record<string, PressableInstance | null>>({});
  const mapWidth = Math.min(screenWidth - 56, 360);
  const scale = mapWidth / MAP_VIEW.width;
  const mapHeight = MAP_VIEW.height * scale;
  const registered = sensors.filter((sensor) => sensor.areaId !== null);
  const unregistered = sensors.filter((sensor) => sensor.areaId === null);
  const areaIds = Object.keys(AREAS) as AreaId[];

  const showSensor = useCallback((sensor: Sensor, targetKey = sensor.id) => {
    const target = targets.current[targetKey];
    const screen = Dimensions.get('window');
    const fallback: SensorOriginRect = { x: screen.width / 2 - 20, y: screen.height / 2 - 20, width: 40, height: 40 };
    if (!target) { openSensor(sensor.id, fallback); return; }
    target.measureInWindow((x, y, width, height) => openSensor(sensor.id, { x, y, width, height }));
  }, [openSensor]);

  const openSensorGroup = useCallback((group: SensorGroup) => {
    // Grupos com mais de um dispositivo abrem a tela do tipo, que mantém
    // cada sensor em seu próprio cartão, sem mostrar contagem no mapa.
    if (group.sensors.length > 1) {
      router.push(group.kind === 'smoke' ? '/smoke' : '/motion');
      return;
    }
    const sensor = group.sensors[0];
    showSensor(sensor, `${sensor.areaId}:${group.kind}`);
  }, [router, showSensor]);

  return <View style={styles.wrapper}>
    <View style={styles.mapHeading}>
      <View><Text style={styles.eyebrow}>PLANTA BAIXA</Text><Text style={styles.title}>Térreo da escola</Text></View>
      <Text style={styles.legend}>{areaIds.length} ÁREAS</Text>
    </View>
    <View style={[styles.map, { width: mapWidth, height: mapHeight }]}>
      <Svg width={mapWidth} height={mapHeight} viewBox={`${MAP_VIEW.x} ${MAP_VIEW.y} ${MAP_VIEW.width} ${MAP_VIEW.height}`} preserveAspectRatio="xMidYMid meet">
        {areaIds.map((id) => {
          const area = AREAS[id];
          const centerX = area.x + area.w / 2;
          const centerY = area.y + area.h / 2;
          const labelLines = area.name.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
          const longestLine = Math.max(1, ...labelLines.map((line) => line.length));
          const labelFontSize = Math.max(6, Math.min(9 * scale, (area.w - 8) / (longestLine * 0.62)));
          const labelLineHeight = labelFontSize * 1.12;
          return <React.Fragment key={id}>
            <Rect x={area.x} y={area.y} width={area.w} height={area.h} rx={6} fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.14)" strokeWidth={0.8} />
            {area.name && !area.verticalLabel && area.w >= 48 && area.h >= 35 && labelLines.map((line, index) => <SvgText key={`${id}-label-${index}`} x={centerX} y={area.y + 14 + index * labelLineHeight} fill="#858585" fontFamily="monospace" fontSize={labelFontSize} fontWeight="600" textAnchor="middle">{line.toUpperCase()}</SvgText>)}
            {area.name && area.verticalLabel && <SvgText x={centerX} y={centerY} transform={`rotate(-90 ${centerX} ${centerY})`} fill="#777777" fontFamily="monospace" fontSize={Math.max(7, 8 * scale)} textAnchor="middle">{labelLines.join(' ').toUpperCase()}</SvgText>}
          </React.Fragment>;
        })}
      </Svg>
      <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
        {areaIds.map((id) => {
          const area = AREAS[id];
          const areaSensors = registered.filter((sensor) => sensor.areaId === id);
          if (areaSensors.length === 0) return null;
          const groups = groupByKind(areaSensors);
          const vertical = area.h > area.w;
          const chipSize = groups.length > 1
            ? (vertical ? { width: 40, height: 28 } : { width: 28, height: 40 })
            : { width: 40, height: 40 };

          return <View key={id} pointerEvents="box-none" style={[styles.areaSensors, { left: (area.x - MAP_VIEW.x) * scale, top: (area.y - MAP_VIEW.y) * scale, width: area.w * scale, height: area.h * scale }]}>
            <View style={[styles.chips, { flexDirection: vertical ? 'column' : 'row' }]}>
              {groups.map((group) => {
                const markerSensor = getGroupMarkerSensor(group);
                const targetKey = `${id}:${group.kind}`;
                return <MapSensorChip
                  key={targetKey}
                  sensor={markerSensor}
                  size={chipSize}
                  focused={focused}
                  onPress={() => openSensorGroup(group)}
                  onRef={(node) => { targets.current[targetKey] = node; }}
                />;
              })}
            </View>
          </View>;
        })}
      </View>
    </View>
    {unregistered.length > 0 && <View style={styles.unregistered}>
      <Text style={styles.eyebrow}>NÃO CADASTRADOS · {unregistered.length}</Text>
      <View style={styles.unregisteredChips}>{unregistered.map((sensor) => {
        const smoke = sensor.kind === 'smoke';
        return <Pressable key={sensor.id} ref={(node) => { targets.current[sensor.id] = node; }} onPress={() => showSensor(sensor)} style={styles.unregisteredChip} accessibilityRole="button" accessibilityLabel={`${sensor.label}, sensor não cadastrado`}>
          <Ionicons name={smoke ? 'flame-outline' : 'walk-outline'} size={14} color="#a0a0a0" /><Text style={styles.unregisteredText}>{sensor.label}</Text>
        </Pressable>;
      })}</View>
    </View>}
  </View>;
}

const styles = StyleSheet.create({
  wrapper: { width: '100%', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.035)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)', padding: 16, gap: 14 },
  mapHeading: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { color: '#a0a0a0', fontSize: 9, fontWeight: '700', letterSpacing: 1.4 },
  title: { color: '#F2F2F2', fontSize: 17, fontWeight: '700', marginTop: 5, fontFamily: 'Inter_600SemiBold' },
  legend: { color: '#7a7a7a', fontSize: 9, letterSpacing: 1.2, fontWeight: '600' },
  map: { position: 'relative', alignSelf: 'center' },
  areaSensors: { position: 'absolute', alignItems: 'center', justifyContent: 'center', overflow: 'visible' },
  chips: { alignItems: 'center', justifyContent: 'center', gap: 2, overflow: 'visible' },
  unregistered: { width: '100%', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)', paddingTop: 12, gap: 8 },
  unregisteredChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  unregisteredChip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderStyle: 'dashed', borderColor: '#6b6b6b', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, backgroundColor: 'rgba(107,107,107,0.10)' },
  unregisteredText: { color: '#a0a0a0', fontSize: 11 },
});
