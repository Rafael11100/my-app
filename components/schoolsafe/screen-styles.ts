import { StyleSheet } from 'react-native';
import { useSchoolColors } from '@/hooks/use-school-colors';

type Colors = ReturnType<typeof useSchoolColors>;

export function createScreenStyles(colors: Colors) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background, // #1f1f1f
    },
    overlay: {
      backgroundColor: 'transparent',
    },
    content: {
      flexGrow: 1,
      alignItems: 'center',
      paddingBottom: 24,
    },
    cardsArea: {
      width: '100%',
      maxWidth: 520,
      alignItems: 'center',
      gap: 18,
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 24,
    },
    sectionHeader: {
      width: '100%',
      alignItems: 'flex-start',
      gap: 4,
      marginBottom: 2,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.textPrimary,
      letterSpacing: 0.2,
    },
    sectionSubtitle: {
      fontSize: 13,
      color: colors.textMuted,
    },
  });
}

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
      backgroundColor: 'rgba(40,40,40,0.92)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    backText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    controls: {
      width: '100%',
      maxWidth: 520,
      alignItems: 'center',
      gap: 10,
    },
    controlBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      width: '100%',
      paddingVertical: 14,
      borderRadius: 999,
      minHeight: 48,
    },
    controlText: {
      color: colors.white,
      fontWeight: '800',
      fontSize: 15,
    },
  });
}
