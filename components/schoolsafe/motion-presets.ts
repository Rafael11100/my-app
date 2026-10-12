import { Easing, ReduceMotion, type WithSpringConfig } from 'react-native-reanimated';

export const SPRING_SOFT: WithSpringConfig = { damping: 18, stiffness: 160, mass: 1, reduceMotion: ReduceMotion.System };
export const SPRING_SNAPPY: WithSpringConfig = { damping: 20, stiffness: 260, mass: 0.9, reduceMotion: ReduceMotion.System };
export const MOTION_DURATION = { entrance: 420, exit: 240, micro: 120, sheet: 380 } as const;
export const MOTION_EASING = Easing.bezier(0.22, 1, 0.36, 1);
