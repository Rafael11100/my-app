/**
 * SchoolSafe – Paleta oficial profissional e cores do tema.
 * Cores de referência:
 *  Azul Escuro (navy):      #0F172A
 *  Azul Técnico (blue):     #2563EB
 *  Verde Operacional:       #16A34A
 *  Laranja (atenção):       #F59E0B
 *  Vermelho (emergência):   #DC2626
 *  Fundo cinza claro:       #F8FAFC
 */

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#0F172A',
    background: '#F8FAFC',
    tint: '#2563EB',
    icon: '#64748B',
    tabIconDefault: '#64748B',
    tabIconSelected: '#2563EB',
  },
  dark: {
    text: '#ECEDEE',
    background: '#0F172A',
    tint: '#2563EB',
    icon: '#94A3B8',
    tabIconDefault: '#94A3B8',
    tabIconSelected: '#2563EB',
  },
};

/** Paleta oficial SchoolSafe – modo claro */
export const SchoolColors = {
  navy: '#0F172A',
  white: '#FFFFFF',
  green: '#16A34A',
  red: '#DC2626',
  blue: '#2563EB',
  orange: '#F59E0B',
  gray: '#E5E7EB',
  background: '#F8FAFC',
  textMuted: '#64748B',
  cardBorder: '#E2E8F0',
};

/** Paleta oficial SchoolSafe – modo noturno */
export const SchoolDarkColors = {
  navy: '#ECEDEE',
  white: '#0B1220',
  green: '#22C55E',
  red: '#F87171',
  blue: '#60A5FA',
  orange: '#FBBF24',
  gray: '#334155',
  background: '#0F172A',
  textMuted: '#94A3B8',
  cardBorder: '#1E293B',
};

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
    sans: "'Inter', 'Poppins', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'Poppins', 'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
