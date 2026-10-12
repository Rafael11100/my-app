import type { ImageSourcePropType } from 'react-native';
import type { AreaId } from '@/constants/areas';

// Adicione fotos estáticas com require() para que o Metro consiga incluí-las no bundle.
export const AREA_PHOTOS: Partial<Record<AreaId, ImageSourcePropType>> = {
  // MAKER: require('@/assets/areas/maker.jpg'),
  // CORREDOR: require('@/assets/areas/corredor.jpg'),
  // GREMIO: require('@/assets/areas/gremio.jpg'),
  // ELEVADOR: require('@/assets/areas/elevador.jpg'),
  // WC_FEM: require('@/assets/areas/wc_fem.jpg'),
  // SALA_01: require('@/assets/areas/sala_01.jpg'),
  // ESCADAS: require('@/assets/areas/escadas.jpg'),
  // WC_MASC: require('@/assets/areas/wc_masc.jpg'),
  // LIMPEZA: require('@/assets/areas/limpeza.jpg'),
};
