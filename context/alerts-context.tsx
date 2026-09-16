import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Platform } from 'react-native';

import { timeNow } from '@/utils/date';

export type SensorKind = 'smoke' | 'motion';
export type SensorStatus = 'normal' | 'alert' | 'offline';

export type Sensor = {
  id: string;
  kind: SensorKind;
  index: number; // 1..5
  label: string; // Sensor 01
  location: string;
  status: SensorStatus;
  active: boolean;
  startedAt: string | null;
  endedAt: string | null;
  lastEventAt: string | null;
};

export type SensorAlert = {
  active: boolean;
  startedAt: string | null;
  endedAt: string | null;
};

export type SensorRecord = {
  id: string;
  kind: SensorKind;
  sensorId: string;
  location: string;
  startedAt: string;
};

const STORAGE_KEY = '@schoolsafe/history';

const LOCATIONS_SMOKE = ['Banheiro Térreo', 'Banheiro 1º Andar', 'Cozinha', 'Laboratório', 'Biblioteca'];
const LOCATIONS_MOTION = [
  'Corredor Principal',
  'Entrada',
  'Pátio',
  'Corredor Fundos',
  'Estacionamento',
];

function makeSensors(): Sensor[] {
  const out: Sensor[] = [];
  for (let i = 1; i <= 5; i++) {
    out.push({
      id: `SMOKE_${i}`,
      kind: 'smoke',
      index: i,
      label: `Sensor ${String(i).padStart(2, '0')}`,
      location: LOCATIONS_SMOKE[i - 1],
      status: 'normal',
      active: false,
      startedAt: null,
      endedAt: null,
      lastEventAt: null,
    });
  }
  for (let i = 1; i <= 5; i++) {
    out.push({
      id: `MOTION_${i}`,
      kind: 'motion',
      index: i,
      label: `Sensor ${String(i).padStart(2, '0')}`,
      location: LOCATIONS_MOTION[i - 1],
      status: 'normal',
      active: false,
      startedAt: null,
      endedAt: null,
      lastEventAt: null,
    });
  }
  return out;
}

const DURATIONS: Record<SensorKind, number> = { smoke: 10000, motion: 2000 };

type AlertsContextType = {
  sensors: Sensor[];
  smokeSensors: Sensor[];
  motionSensors: Sensor[];
  // legado agregado (para compatibilidade com telas antigas)
  smoke: SensorAlert;
  motion: SensorAlert;
  history: SensorRecord[];
  /** Ativa um sensor específico; duração automática unifica visual+mensagem */
  activateSensor: (sensorId: string) => void;
  deactivateSensor: (sensorId: string) => void;
  triggerRandom: (kind: SensorKind) => void;
  // compat legado
  startAlert: (kind: SensorKind) => void;
  endAlert: (kind: SensorKind) => void;
  removeRecord: (id: string) => void;
  clearHistory: () => void;
};

const AlertsContext = createContext<AlertsContextType | undefined>(undefined);

export function AlertsProvider({ children }: { children: React.ReactNode }) {
  const [sensors, setSensors] = useState<Sensor[]>(() => makeSensors());
  const [history, setHistory] = useState<SensorRecord[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // carregar historico
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw && active) {
          const parsed = JSON.parse(raw) as SensorRecord[];
          if (Array.isArray(parsed)) setHistory(parsed);
        }
      } catch {}
    })();
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(history)).catch(() => {});
  }, [history]);

  // cleanup timers ao desmontar
  useEffect(() => {
    return () => {
      timers.current.forEach((t) => clearTimeout(t));
      timers.current.clear();
    };
  }, []);

  const activateSensor = useCallback(
    (sensorId: string) => {
      const sensor = sensors.find((s) => s.id === sensorId);
      if (!sensor || sensor.active) return;
      const startedAt = timeNow();
      setSensors((prev) =>
        prev.map((s) =>
          s.id === sensorId ? { ...s, active: true, status: 'alert', startedAt, endedAt: null, lastEventAt: startedAt } : s,
        ),
      );
      setHistory((prev) => [{ id: `${Date.now()}-${sensorId}`, kind: sensor.kind, sensorId, location: sensor.location, startedAt }, ...prev]);

      // haptic diferenciado
      if (Platform.OS !== 'web') {
        if (sensor.kind === 'smoke') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
        else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      }

      // timer único que é fonte de verdade — quando encerra, desativa visual + mensagem juntos
      const existing = timers.current.get(sensorId);
      if (existing) clearTimeout(existing);
      const t = setTimeout(() => {
        setSensors((prev) => prev.map((s) => (s.id === sensorId ? { ...s, active: false, status: 'normal', endedAt: timeNow() } : s)));
        timers.current.delete(sensorId);
      }, DURATIONS[sensor.kind]);
      timers.current.set(sensorId, t);
    },
    [sensors],
  );

  const deactivateSensor = useCallback((sensorId: string) => {
    const t = timers.current.get(sensorId);
    if (t) {
      clearTimeout(t);
      timers.current.delete(sensorId);
    }
    setSensors((prev) => prev.map((s) => (s.id === sensorId ? { ...s, active: false, status: 'normal', endedAt: timeNow() } : s)));
  }, []);

  const triggerRandom = useCallback(
    (kind: SensorKind) => {
      const pool = sensors.filter((s) => s.kind === kind && !s.active);
      const target = pool.length ? pool[Math.floor(Math.random() * pool.length)] : sensors.filter((s) => s.kind === kind)[0];
      if (target) activateSensor(target.id);
    },
    [sensors, activateSensor],
  );

  // compat legado
  const startAlert = useCallback(
    (kind: SensorKind) => {
      triggerRandom(kind);
    },
    [triggerRandom],
  );
  const endAlert = useCallback(
    (kind: SensorKind) => {
      // desativa todos daquele kind
      sensors
        .filter((s) => s.kind === kind && s.active)
        .forEach((s) => deactivateSensor(s.id));
    },
    [sensors, deactivateSensor],
  );

  const removeRecord = useCallback((id: string) => setHistory((prev) => prev.filter((r) => r.id !== id)), []);
  const clearHistory = useCallback(() => setHistory([]), []);

  const smokeSensors = useMemo(() => sensors.filter((s) => s.kind === 'smoke'), [sensors]);
  const motionSensors = useMemo(() => sensors.filter((s) => s.kind === 'motion'), [sensors]);

  const smoke: SensorAlert = useMemo(() => {
    const active = smokeSensors.some((s) => s.active);
    const startedAt = smokeSensors.find((s) => s.active)?.startedAt ?? null;
    const endedAt = !active ? smokeSensors.find((s) => s.endedAt)?.endedAt ?? null : null;
    return { active, startedAt, endedAt };
  }, [smokeSensors]);
  const motion: SensorAlert = useMemo(() => {
    const active = motionSensors.some((s) => s.active);
    const startedAt = motionSensors.find((s) => s.active)?.startedAt ?? null;
    const endedAt = !active ? motionSensors.find((s) => s.endedAt)?.endedAt ?? null : null;
    return { active, startedAt, endedAt };
  }, [motionSensors]);

  const value = useMemo<AlertsContextType>(
    () => ({
      sensors,
      smokeSensors,
      motionSensors,
      smoke,
      motion,
      history,
      activateSensor,
      deactivateSensor,
      triggerRandom,
      startAlert,
      endAlert,
      removeRecord,
      clearHistory,
    }),
    [sensors, smokeSensors, motionSensors, smoke, motion, history, activateSensor, deactivateSensor, triggerRandom, startAlert, endAlert, removeRecord, clearHistory],
  );

  return <AlertsContext.Provider value={value}>{children}</AlertsContext.Provider>;
}

export function useAlerts(): AlertsContextType {
  const ctx = useContext(AlertsContext);
  if (!ctx) throw new Error('useAlerts must be used within an AlertsProvider');
  return ctx;
}
