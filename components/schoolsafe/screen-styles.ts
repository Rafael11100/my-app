import { StyleSheet } from 'react-native';

import { useSchoolColors } from '@/hooks/use-school-colors';

type Colors = ReturnType<typeof useSchoolColors>;

/**
 * Estilos compartilhados de tela (shell) usados pelas telas do SchoolSafe.
 * Centraliza estilos repetidos entre index, smoke e motion.
 */
export function createScreenStyles(colors: Colors) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    overlay: {
      backgroundColor: 'transparent',
    },
    content: {
      flexGrow: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingBottom: 8,
    },
    cardsArea: {
      width: '100%',
      maxWidth: 460,
      alignItems: 'center',
      gap: 28,
      paddingHorizontal: 20,
      paddingVertical: 32,
    },
    sectionHeader: {
      width: '100%',
      alignItems: 'center',
      gap: 6,
      marginBottom: 4,
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.navy,
    },
    sectionSubtitle: {
      fontSize: 14,
      color: colors.textMuted,
      textAlign: 'center',
    },
  });
}

/**
 * Estilos compartilhados dos controles de sensor (voltar + ativar/desativar).
 * Usados pelas telas de monitoramento smoke e motion.
 */
export function createControlStyles(colors: Colors) {
  return StyleSheet.create({
    backRow: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: 10,
    },
    backBadge: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.white,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    backText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.navy,
    },
    controls: {
      width: '100%',
      maxWidth: 420,
      alignItems: 'center',
    },
    controlBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      width: '100%',
      paddingVertical: 14,
      borderRadius: 999,
    },
    controlText: {
      color: colors.white,
      fontWeight: '800',
      fontSize: 16,
    },
  });
}
