import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/context/theme-context';
import { useSchoolColors } from '@/hooks/use-school-colors';
import { formatDate, formatTime } from '@/utils/date';

type HeaderProps = {
  showClock?: boolean;
};

export default function Header({ showClock = true }: HeaderProps) {
  const colors = useSchoolColors();
  const { isDark, toggleTheme } = useTheme();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const styles = createStyles(colors);

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.topRow}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoEmoji}>🏫</Text>
          </View>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>SchoolSafe</Text>
            <Text style={styles.subtitle}>Sistema Inteligente de Segurança Escolar</Text>
          </View>

          <TouchableOpacity
            onPress={toggleTheme}
            style={styles.themeBtn}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={
              isDark ? 'Alternar para o modo claro' : 'Alternar para o modo noturno'
            }>
            <Ionicons name={isDark ? 'sunny' : 'moon'} size={20} color={colors.navy} />
          </TouchableOpacity>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.statusRow}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Sistema Online</Text>
          </View>

          {showClock && (
            <View style={styles.clockRow}>
              <View style={styles.clockItem}>
                <Text style={styles.clockLabel}>Data</Text>
                <Text style={styles.clockValue}>{formatDate(now)}</Text>
              </View>
              <View style={styles.clockDivider} />
              <View style={styles.clockItem}>
                <Text style={styles.clockLabel}>Hora</Text>
                <Text style={styles.clockValue}>{formatTime(now)}</Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

function createStyles(colors: ReturnType<typeof useSchoolColors>) {
  return StyleSheet.create({
    safe: {
      backgroundColor: colors.white,
      borderBottomLeftRadius: 28,
      borderBottomRightRadius: 28,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 6,
    },
header: {
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingBottom: 24,
      paddingTop: 12,
    },
    topRow: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
    },
    logoBadge: {
      width: 56,
      height: 56,
      borderRadius: 16,
      backgroundColor: colors.navy,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoEmoji: {
      fontSize: 30,
    },
    titleBlock: {
      flex: 1,
      alignItems: 'flex-start',
    },
    title: {
      fontSize: 24,
      fontWeight: '800',
      color: colors.navy,
      letterSpacing: 0.5,
    },
    subtitle: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 2,
    },
    themeBtn: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
infoRow: {
      width: '100%',
      marginTop: 20,
      gap: 14,
      alignItems: 'center',
    },
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'center',
      gap: 8,
      backgroundColor: colors.green + '1A',
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 999,
    },
    onlineDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.green,
    },
    onlineText: {
      color: colors.green,
      fontWeight: '700',
      fontSize: 13,
    },
clockRow: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'center',
      gap: 24,
    },
    clockItem: {
      alignItems: 'center',
    },
    clockLabel: {
      fontSize: 11,
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    clockValue: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.navy,
      marginTop: 2,
      fontVariant: ['tabular-nums'],
    },
    clockDivider: {
      width: 1,
      height: 30,
      backgroundColor: colors.gray,
    },
  });
}
