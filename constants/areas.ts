export type AreaId =
  | 'MAKER' | 'CORREDOR' | 'GREMIO' | 'ELEVADOR' | 'WC_FEM'
  | 'SALA_01' | 'ESCADAS' | 'WC_MASC' | 'LIMPEZA';

/** `name` aceita `\n` para controlar a quebra do rótulo na planta. */
export type SchoolArea = { id: AreaId; name: string; x: number; y: number; w: number; h: number; verticalLabel?: boolean };

export const AREAS: Record<AreaId, SchoolArea> = {
  MAKER: { id: 'MAKER', name: 'Maker', x: 203, y: 42, w: 118, h: 91 },
  CORREDOR: { id: 'CORREDOR', name: 'Corredor', x: 203, y: 141, w: 24, h: 93, verticalLabel: true },
  GREMIO: { id: 'GREMIO', name: 'Grêmio', x: 232, y: 141, w: 88, h: 93 },
  ELEVADOR: { id: 'ELEVADOR', name: 'Elevador', x: 321, y: 255, w: 43, h: 14 },
  WC_FEM: { id: 'WC_FEM', name: 'Banheiro\nfeminino', x: 80, y: 273, w: 102, h: 52 },
  SALA_01: { id: 'SALA_01', name: '', x: 191, y: 273, w: 72, h: 52 },
  ESCADAS: { id: 'ESCADAS', name: 'Escadas', x: 270, y: 273, w: 51, h: 111, verticalLabel: true },
  WC_MASC: { id: 'WC_MASC', name: 'Banheiro\nmasculino', x: 102, y: 332, w: 102, h: 52 },
  LIMPEZA: { id: 'LIMPEZA', name: 'Sala de\nprodutos\nde limpeza', x: 211, y: 332, w: 52, h: 52 },
};
