import type { AreaId } from '@/constants/areas';
import type { SensorKind } from '@/context/alerts-context';

export type SensorSeed = { id: string; kind: SensorKind; areaId: AreaId | null };

export const SENSOR_REGISTRY: SensorSeed[] = [
  { id: 'SMOKE_1', kind: 'smoke', areaId: 'WC_MASC' },
  { id: 'SMOKE_3', kind: 'smoke', areaId: 'WC_MASC' },
  { id: 'MOTION_2', kind: 'motion', areaId: null },
];
