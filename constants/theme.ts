/**
 * SchoolSafe — Tema moderno dark profissional.
 * Paleta base exigida:
 *  #1f1f1f                — fundo geral profundo
 *  rgba(40,40,40,0.92)    — superfícies / cards / glass
 *  #a0a0a0                — destaque neutro / texto secundário / bordas
 *
 * Semânticas só quando comunicam significado (emergência, alerta, atenção, normal).
 */
import { Platform } from 'react-native';

export const BasePalette = {
  bg: '#1f1f1f',
  surface: 'rgba(40,40,40,0.92)',
  surfaceSolid: '#282828',
  surfaceElevated: '#2e2e2e',
  muted: '#a0a0a0',
  border: 'rgba(160,160,160,0.14)',
  borderStrong: 'rgba(160,160,160,0.22)',
} as const;

// Cores semânticas — só para estados
export const Semantic = {
  red: '#EF4444',
  redSoft: 'rgba(239,68,68,0.16)',
  blue: '#3B82F6',
  blueSoft: 'rgba(59,130,246,0.16)',
  green: '#22C55E',
  greenSoft: 'rgba(34,197,94,0.14)',
  orange: '#F59E0B',
  orangeSoft: 'rgba(245,158,11,0.14)',
} as const;

export const Colors = {
  light: {
    text: '#ECEDEE',
    background: BasePalette.bg,
    tint: BasePalette.muted,
    icon: '#a0a0a0',
    tabIconDefault: '#a0a0a0',
    tabIconSelected: '#ffffff',
  },
  dark: {
    text: '#ECEDEE',
    background: BasePalette.bg,
    tint: '#a0a0a0',
    icon: '#a0a0a0',
    tabIconDefault: '#a0a0a0',
    tabIconSelected: '#ffffff',
  },
};

/** Paleta principal — dark glass (única, independe de light/dark OS) */
export const SchoolColors = {
  // base escura
  background: BasePalette.bg, // #1f1f1f
  surface: BasePalette.surface, // rgba(40,40,40,0.92)
  surfaceSolid: BasePalette.surfaceSolid,
  surfaceElevated: BasePalette.surfaceElevated,
  navBg: 'rgba(28,28,28,0.82)',
  // texto
  white: '#FFFFFF',
  navy: '#F2F2F2', // texto principal claro sobre fundo dark (mantém nome p/ compat)
  textPrimary: '#F2F2F2',
  textSecondary: '#a0a0a0',
  textMuted: '#a0a0a0',
  textFaint: '#7a7a7a',
  // bordas
  cardBorder: 'rgba(160,160,160,0.14)',
  cardBorderStrong: 'rgba(160,160,160,0.22)',
  divider: 'rgba(160,160,160,0.10)',
  // neutros
  gray: 'rgba(160,160,160,0.14)',
  muted: '#a0a0a0',
  // semânticas
  green: Semantic.green,
  red: Semantic.red,
  blue: Semantic.blue,
  orange: Semantic.orange,
  greenSoft: Semantic.greenSoft,
  redSoft: Semantic.redSoft,
  blueSoft: Semantic.blueSoft,
  orangeSoft: Semantic.orangeSoft,
  // legacy aliases
  cardBg: 'rgba(40,40,40,0.92)',
};

/** Alias escuro — idêntico (app é sempre dark) */
export const SchoolDarkColors = SchoolColors;

export const Fonts = Platform.select({
  ios: {
    sans: 'System',
    serif: 'Georgia',
    rounded: 'System',
    mono: 'Menlo',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

// Tokens de espaçamento / radius / sombra para consistência
export const Spacing = { xs: 6, sm: 10, md: 14, lg: 20, xl: 28, xxl: 36 } as const;
export const Radius = { sm: 12, md: 16, lg: 20, xl: 24, pill: 999 } as const;
export const Shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 6,
  },
} as const;
