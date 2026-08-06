import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { timeNow } from '@/utils/date';

export type SensorKind = 'smoke' | 'motion';

export type SensorAlert = {
  active: boolean;
  startedAt: string | null;
  endedAt: string | null;
};

export type SensorRecord = {
  id: string;
  kind: SensorKind;
  location: string;
  startedAt: string;
};

const LOCATIONS: Record<SensorKind, string> = {
  smoke: 'Banheiro',
  motion: 'Corredor Principal',
};

const STORAGE_KEY = '@schoolsafe/history';

type AlertsContextType = {
  smoke: SensorAlert;
  motion: SensorAlert;
  history: SensorRecord[];
  startAlert: (kind: SensorKind) => void;
  endAlert: (kind: SensorKind) => void;
  removeRecord: (id: string) => void;
};

const AlertsContext = createContext<AlertsContextType | undefined>(undefined);

const emptyAlert: SensorAlert = { active: false, startedAt: null, endedAt: null };

export function AlertsProvider({ children }: { children: React.ReactNode }) {
  const [smoke, setSmoke] = useState<SensorAlert>(emptyAlert);
  const [motion, setMotion] = useState<SensorAlert>(emptyAlert);
  const clearTimers = useRef<{ [k in SensorKind]?: ReturnType<typeof setTimeout> }>({});
  const [history, setHistory] = useState<SensorRecord[]>([]);

  // Carrega o histórico salvo ao montar o app
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw && active) {
          const parsed = JSON.parse(raw) as SensorRecord[];
          if (Array.isArray(parsed)) setHistory(parsed);
        }
      } catch {
        // ignora erros de leitura
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Salva o histórico sempre que ele mudar
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(history)).catch(() => {});
  }, [history]);

  const startAlert = useCallback((kind: SensorKind) => {
    if (clearTimers.current[kind]) clearTimeout(clearTimers.current[kind]!);
    const startedAt = timeNow();
    if (kind === 'smoke') {
      setSmoke({ active: true, startedAt, endedAt: null });
    } else {
      setMotion({ active: true, startedAt, endedAt: null });
    }
    setHistory((prev) => [
      {
        id: `${Date.now()}-${kind}`,
        kind,
        location: LOCATIONS[kind],
        startedAt,
      },
      ...prev,
    ]);
  }, []);

  const endAlert = useCallback((kind: SensorKind) => {
    const endedAt = timeNow();
    const setter = kind === 'smoke' ? setSmoke : setMotion;
    setter((s) => ({ active: false, startedAt: s.startedAt, endedAt }));
    clearTimers.current[kind] = setTimeout(() => {
      setter((s) => (s.endedAt === endedAt ? emptyAlert : s));
    }, 6000);
  }, []);

  const removeRecord = useCallback((id: string) => {
    setHistory((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const value = useMemo<AlertsContextType>(
    () => ({ smoke, motion, history, startAlert, endAlert, removeRecord }),
    [smoke, motion, history, startAlert, endAlert, removeRecord],
  );

  return <AlertsContext.Provider value={value}>{children}</AlertsContext.Provider>;
}

export function useAlerts(): AlertsContextType {
  const ctx = useContext(AlertsContext);
  if (!ctx) {
    throw new Error('useAlerts must be used within an AlertsProvider');
  }
  return ctx;
}
