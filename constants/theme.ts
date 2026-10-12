import { Platform } from 'react-native';

export const BasePalette = {
  bg: '#1f1f1f',
  bgEdge: '#141414',
  surface: 'rgba(255,255,255,0.05)',
  surfaceElevated: 'rgba(255,255,255,0.08)',
  surfaceSolid: 'rgba(34,34,36,0.82)',
  muted: '#a0a0a0',
  border: 'rgba(255,255,255,0.10)',
  borderStrong: 'rgba(255,255,255,0.22)',
} as const;

export const Semantic = {
  red: '#EF4444',
  redSoft: 'rgba(239,68,68,0.16)',
  blue: '#3B82F6',
  blueSoft: 'rgba(59,130,246,0.16)',
  neutral: '#a0a0a0',
  neutralSoft: 'rgba(160,160,160,0.14)',
  unregistered: '#6b6b6b',
} as const;

export const Colors = {
  light: { text: '#F2F2F2', background: BasePalette.bg, tint: BasePalette.muted, icon: BasePalette.muted, tabIconDefault: BasePalette.muted, tabIconSelected: '#F2F2F2' },
  dark: { text: '#F2F2F2', background: BasePalette.bg, tint: BasePalette.muted, icon: BasePalette.muted, tabIconDefault: BasePalette.muted, tabIconSelected: '#F2F2F2' },
};

export const SchoolColors = {
  background: BasePalette.bg,
  surface: BasePalette.surface,
  surfaceSolid: BasePalette.surfaceSolid,
  surfaceElevated: BasePalette.surfaceElevated,
  navBg: 'rgba(28,28,28,0.82)',
  white: '#F2F2F2',
  navy: '#F2F2F2',
  textPrimary: '#F2F2F2',
  textSecondary: '#a0a0a0',
  textMuted: '#a0a0a0',
  textFaint: '#7a7a7a',
  cardBorder: BasePalette.border,
  cardBorderStrong: BasePalette.borderStrong,
  divider: 'rgba(255,255,255,0.08)',
  gray: Semantic.neutralSoft,
  muted: '#a0a0a0',
  green: Semantic.neutral,
  red: Semantic.red,
  blue: Semantic.blue,
  orange: Semantic.neutral,
  greenSoft: Semantic.neutralSoft,
  redSoft: Semantic.redSoft,
  blueSoft: Semantic.blueSoft,
  orangeSoft: Semantic.neutralSoft,
  cardBg: BasePalette.surfaceSolid,
} as const;

export const SchoolDarkColors = SchoolColors;

export const Fonts = Platform.select({
  ios: { sans: 'System', serif: 'Georgia', rounded: 'System', mono: 'Menlo' },
  default: { sans: 'normal', serif: 'serif', rounded: 'normal', mono: 'monospace' },
  web: { sans: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", serif: "Georgia, 'Times New Roman', serif", rounded: "system-ui, sans-serif", mono: "SFMono-Regular, Menlo, Monaco, Consolas, monospace" },
});

export const Spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const Radius = { sm: 12, md: 16, lg: 20, xl: 24, xxl: 28, pill: 999 } as const;
export const Shadow = {
  card: { shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.35, shadowRadius: 32, elevation: 8 },
} as const;

export const Typography = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;
