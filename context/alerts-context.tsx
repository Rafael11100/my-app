import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { AREAS, type AreaId } from '@/constants/areas';
import { SENSOR_REGISTRY } from '@/constants/sensor-registry';
import { useAuth } from '@/context/auth-context';
import { formatTime } from '@/utils/date';

const JAZZSECURITY_URL = (process.env.EXPO_PUBLIC_JAZZSECURITY_URL ?? '').trim().replace(/\/+$/, '');
const REFRESH_INTERVAL_MS = 10_000;
const REQUEST_TIMEOUT_MS = 8_000;
const HISTORY_LIMIT = 100;

export type SensorKind = 'smoke' | 'motion';
export type SensorStatus = 'normal' | 'alert' | 'offline' | 'stale';
export type TelemetryStatus = 'connecting' | 'online' | 'offline' | 'unconfigured';

export type Sensor = {
  id: string;
  kind: SensorKind;
  index: number;
  label: string;
  location: string;
  areaId: AreaId | null;
  status: SensorStatus;
  active: boolean;
  startedAt: string | null;
  endedAt: string | null;
  lastEventAt: string | null;
  lastSeenAt?: string | null;
  value?: number | null;
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
  eventType?: string;
  description?: string;
};

type ApiSensor = {
  id: number;
  nome: string;
  tipo: 'PIR' | 'MQ-2';
  estado_ativo: boolean;
  valor: number | null;
  movimento: boolean | null;
  data_hora: string | null;
  status: 'online' | 'desatualizado' | 'indisponivel';
};

type ApiEvent = {
  id: number;
  sensor_id: number;
  tipo_evento: 'MOVIMENTO' | 'FUMACA_GAS' | 'NORMALIZACAO';
  descricao: string;
  data_hora: string;
};

type AlertsContextType = {
  sensors: Sensor[];
  smokeSensors: Sensor[];
  motionSensors: Sensor[];
  smoke: SensorAlert;
  motion: SensorAlert;
  history: SensorRecord[];
  telemetryStatus: TelemetryStatus;
  telemetryError: string | null;
  lastSyncAt: string | null;
  refreshTelemetry: () => Promise<void>;
  /** Mantidos para compatibilidade com componentes antigos; a telemetria real é somente leitura. */
  activateSensor: (sensorId: string) => void;
  deactivateSensor: (sensorId: string) => void;
  registerSensor: (sensorId: string, areaId: AreaId) => void;
  unregisterSensor: (sensorId: string) => void;
  triggerRandom: (kind: SensorKind) => void;
  startAlert: (kind: SensorKind) => void;
  endAlert: (kind: SensorKind) => void;
  removeRecord: (id: string) => void;
  clearHistory: () => void;
};

const AlertsContext = createContext<AlertsContextType | undefined>(undefined);

function makeSensors(status: SensorStatus = 'offline'): Sensor[] {
  const counters: Record<SensorKind, number> = { smoke: 0, motion: 0 };
  return SENSOR_REGISTRY.map((seed) => {
    counters[seed.kind] += 1;
    const area = seed.areaId ? AREAS[seed.areaId] : null;
    return {
      id: seed.id,
      kind: seed.kind,
      index: counters[seed.kind],
      label: seed.kind === 'smoke' ? 'MQ-2 01' : 'PIR 01',
      areaId: seed.areaId,
      location: area ? area.name.replace(/\s*\n\s*/g, ' ').trim() : 'Não cadastrado',
      status,
      active: false,
      startedAt: null,
      endedAt: null,
      lastEventAt: null,
      lastSeenAt: null,
      value: null,
    };
  });
}

class TelemetryRequestError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = 'TelemetryRequestError';
  }
}

function parseTimestamp(value: unknown): Date | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function displayTimestamp(value: unknown): string | null {
  const date = parseTimestamp(value);
  return date ? formatTime(date) : null;
}

async function fetchJson<T>(path: string, token: string): Promise<T> {
  if (!JAZZSECURITY_URL) {
    throw new TelemetryRequestError('Defina EXPO_PUBLIC_JAZZSECURITY_URL para conectar ao JazzSecurity.');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(JAZZSECURITY_URL + path, {
      method: 'GET',
      headers: { Accept: 'application/json', Authorization: 'Bearer ' + token },
      signal: controller.signal,
    });

    if (!response.ok) {
      if (response.status === 401) throw new TelemetryRequestError('Sua sessão expirou. Entre novamente.', 401);
      if (response.status === 429) throw new TelemetryRequestError('Muitas consultas ao JazzSecurity. Aguarde um instante.', 429);
      throw new TelemetryRequestError('JazzSecurity retornou HTTP ' + response.status + ' em ' + path + '.', response.status);
    }

    return await response.json() as T;
  } catch (error) {
    if (error instanceof TelemetryRequestError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      throw new TelemetryRequestError('A consulta ao JazzSecurity excedeu 8 segundos.');
    }
    throw new TelemetryRequestError('Não foi possível conectar ao JazzSecurity. Verifique a rede e a URL da API.');
  } finally {
    clearTimeout(timeoutId);
  }
}

function kindForSensorId(sensorId: number): SensorKind {
  return sensorId === 2 ? 'smoke' : 'motion';
}

function mapSensors(records: ApiSensor[], events: ApiEvent[]): Sensor[] {
  const eventBySensor = new Map<number, ApiEvent>();
  for (const event of [...events].sort((a, b) => Date.parse(b.data_hora) - Date.parse(a.data_hora))) {
    if (!eventBySensor.has(event.sensor_id)) eventBySensor.set(event.sensor_id, event);
  }

  return SENSOR_REGISTRY.map((seed) => {
    const remoteId = seed.kind === 'smoke' ? 2 : 1;
    const record = records.find((item) => item.id === remoteId);
    const lastEvent = eventBySensor.get(remoteId);
    const area = seed.areaId ? AREAS[seed.areaId] : null;
    const active = record?.estado_ativo === true;
    const lastEventAt = displayTimestamp(lastEvent?.data_hora);
    const serverStale = record?.status === 'desatualizado';
    const relevantAlert = active
      ? events
          .filter((event) => event.sensor_id === remoteId && event.tipo_evento !== 'NORMALIZACAO')
          .sort((a, b) => Date.parse(b.data_hora) - Date.parse(a.data_hora))[0]
      : undefined;

    return {
      id: seed.id,
      kind: seed.kind,
      index: seed.kind === 'smoke' ? 1 : 1,
      label: record?.nome ?? (seed.kind === 'smoke' ? 'MQ-2 01' : 'PIR 01'),
      location: area ? area.name.replace(/\s*\n\s*/g, ' ').trim() : 'Não cadastrado',
      areaId: seed.areaId,
      status: !record || record.status === 'indisponivel' ? 'offline' : serverStale ? 'stale' : active ? 'alert' : 'normal',
      active,
      startedAt: active
        ? displayTimestamp(relevantAlert?.data_hora) ?? displayTimestamp(record?.data_hora)
        : null,
      endedAt: !active && lastEvent?.tipo_evento === 'NORMALIZACAO' ? lastEventAt : null,
      lastEventAt,
      lastSeenAt: record?.data_hora ?? null,
      value: typeof record?.valor === 'number' ? record.valor : null,
    };
  });
}

function mapHistory(events: ApiEvent[]): SensorRecord[] {
  return [...events]
    .sort((a, b) => Date.parse(b.data_hora) - Date.parse(a.data_hora))
    .map((event) => {
      const kind = kindForSensorId(event.sensor_id);
      const seed = SENSOR_REGISTRY.find((item) => item.kind === kind);
      const area = seed?.areaId ? AREAS[seed.areaId] : null;
      return {
        id: 'jazz-' + event.id,
        kind,
        sensorId: seed?.id ?? String(event.sensor_id),
        location: area ? area.name.replace(/\s*\n\s*/g, ' ').trim() : 'Não cadastrado',
        startedAt: displayTimestamp(event.data_hora) ?? '—',
        eventType: event.tipo_evento,
        description: event.descricao,
      };
    });
}

export function AlertsProvider({ children }: { children: React.ReactNode }) {
  const { session, signOut } = useAuth();
  const [sensors, setSensors] = useState<Sensor[]>(() => makeSensors());
  const [history, setHistory] = useState<SensorRecord[]>([]);
  const [telemetryStatus, setTelemetryStatus] = useState<TelemetryStatus>(
    JAZZSECURITY_URL ? 'connecting' : 'unconfigured',
  );
  const [telemetryError, setTelemetryError] = useState<string | null>(
    JAZZSECURITY_URL ? null : 'JazzSecurity não está configurado.',
  );
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [loadedToken, setLoadedToken] = useState<string | null>(null);

  const refreshTelemetry = useCallback(async () => {
    if (!session) return;
    if (!JAZZSECURITY_URL) {
      setTelemetryStatus('unconfigured');
      setTelemetryError('Defina EXPO_PUBLIC_JAZZSECURITY_URL para consultar os sensores.');
      return;
    }

    setTelemetryStatus((current) => current === 'online' ? current : 'connecting');
    try {
      const [sensorRecords, eventRecords] = await Promise.all([
        fetchJson<ApiSensor[]>('/sensores', session.token),
        fetchJson<ApiEvent[]>('/eventos?limit=' + HISTORY_LIMIT, session.token),
      ]);

      if (!Array.isArray(sensorRecords) || !Array.isArray(eventRecords)) {
        throw new TelemetryRequestError('O JazzSecurity retornou dados de sensores em formato inesperado.');
      }

      setSensors(mapSensors(sensorRecords, eventRecords));
      setHistory(mapHistory(eventRecords));
      setLoadedToken(session.token);
      setTelemetryStatus('online');
      setTelemetryError(null);
      setLastSyncAt(new Date().toISOString());
    } catch (cause) {
      if (cause instanceof TelemetryRequestError && cause.status === 401) {
        setTelemetryStatus('offline');
        setTelemetryError('Sua sessão expirou. Entre novamente.');
        await signOut();
        return;
      }
      setTelemetryStatus('offline');
      setSensors((current) => current.map((sensor) => ({ ...sensor, status: 'offline' })));
      setTelemetryError(cause instanceof Error ? cause.message : 'Não foi possível carregar os sensores.');
    }
  }, [session, signOut]);

  useEffect(() => {
    if (!session) return;
    const initialFetch = setTimeout(() => { void refreshTelemetry(); }, 0);
    const intervalId = setInterval(() => { void refreshTelemetry(); }, REFRESH_INTERVAL_MS);
    return () => {
      clearTimeout(initialFetch);
      clearInterval(intervalId);
    };
  }, [session, refreshTelemetry]);

  const activateSensor = useCallback((_sensorId: string) => {
    // Telemetria real: sensores só mudam de estado quando o ESP reporta ao JazzSecurity.
  }, []);
  const deactivateSensor = useCallback((_sensorId: string) => {
    // Telemetria real é somente leitura no app.
  }, []);
  const registerSensor = useCallback((_sensorId: string, _areaId: AreaId) => {
    // A associação física de área permanece definida em constants/sensor-registry.ts.
  }, []);
  const unregisterSensor = useCallback((_sensorId: string) => {
    // A associação física de área permanece definida em constants/sensor-registry.ts.
  }, []);
  const triggerRandom = useCallback((_kind: SensorKind) => {
    // Não simular dados quando a fonte de verdade é o JazzSecurity.
  }, []);
  const startAlert = useCallback((_kind: SensorKind) => {}, []);
  const endAlert = useCallback((_kind: SensorKind) => {}, []);
  const removeRecord = useCallback((_id: string) => {
    // Eventos armazenados no backend não podem ser apagados localmente.
  }, []);
  const clearHistory = useCallback(() => {
    // O histórico persistente pertence ao SQLite do JazzSecurity.
  }, []);

  const hasSessionData = Boolean(session && loadedToken === session.token);
  const visibleSensors = useMemo(() => hasSessionData ? sensors : makeSensors('offline'), [hasSessionData, sensors]);
  const visibleHistory = useMemo(() => hasSessionData ? history : [], [hasSessionData, history]);
  const visibleTelemetryStatus: TelemetryStatus = !JAZZSECURITY_URL
    ? 'unconfigured'
    : !session
      ? 'offline'
      : hasSessionData
        ? telemetryStatus
        : 'connecting';
  const visibleTelemetryError = !JAZZSECURITY_URL
    ? 'Defina EXPO_PUBLIC_JAZZSECURITY_URL para consultar os sensores.'
    : session
      ? telemetryError
      : null;
  const visibleLastSyncAt = hasSessionData ? lastSyncAt : null;

  const smokeSensors = useMemo(() => visibleSensors.filter((sensor) => sensor.kind === 'smoke'), [visibleSensors]);
  const motionSensors = useMemo(() => visibleSensors.filter((sensor) => sensor.kind === 'motion'), [visibleSensors]);

  const smoke: SensorAlert = useMemo(() => {
    const active = smokeSensors.some((sensor) => sensor.active);
    return {
      active,
      startedAt: smokeSensors.find((sensor) => sensor.active)?.startedAt ?? null,
      endedAt: !active ? smokeSensors.find((sensor) => sensor.endedAt)?.endedAt ?? null : null,
    };
  }, [smokeSensors]);

  const motion: SensorAlert = useMemo(() => {
    const active = motionSensors.some((sensor) => sensor.active);
    return {
      active,
      startedAt: motionSensors.find((sensor) => sensor.active)?.startedAt ?? null,
      endedAt: !active ? motionSensors.find((sensor) => sensor.endedAt)?.endedAt ?? null : null,
    };
  }, [motionSensors]);

  const value = useMemo<AlertsContextType>(() => ({
    sensors: visibleSensors,
    smokeSensors,
    motionSensors,
    smoke,
    motion,
    history: visibleHistory,
    telemetryStatus: visibleTelemetryStatus,
    telemetryError: visibleTelemetryError,
    lastSyncAt: visibleLastSyncAt,
    refreshTelemetry,
    activateSensor,
    deactivateSensor,
    registerSensor,
    unregisterSensor,
    triggerRandom,
    startAlert,
    endAlert,
    removeRecord,
    clearHistory,
  }), [
    visibleSensors, smokeSensors, motionSensors, smoke, motion, visibleHistory, visibleTelemetryStatus, visibleTelemetryError,
    visibleLastSyncAt, refreshTelemetry, activateSensor, deactivateSensor, registerSensor, unregisterSensor,
    triggerRandom, startAlert, endAlert, removeRecord, clearHistory,
  ]);

  return <AlertsContext.Provider value={value}>{children}</AlertsContext.Provider>;
}

export function useAlerts(): AlertsContextType {
  const ctx = useContext(AlertsContext);
  if (!ctx) throw new Error('useAlerts must be used within an AlertsProvider');
  return ctx;
}
