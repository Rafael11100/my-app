import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useSchoolColors } from '@/hooks/use-school-colors';
import { formatTime } from '@/utils/date';

type FooterProps = {
  showTime?: boolean;
};

export default function Footer({ showTime = true }: FooterProps) {
  const colors = useSchoolColors();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const styles = createStyles(colors);

  return (
    <SafeAreaView edges={['bottom']} style={styles.safe}>
      <View style={styles.footer}>
        <View style={styles.dividerOuter}>
          <View style={styles.divider} />
        </View>

        <View style={styles.statusHeader}>
          <Ionicons name="radio" size={16} color={colors.navy} />
          <Text style={styles.statusTitle}>Status do Sistema</Text>
        </View>

        <View style={styles.row}>
          <View style={styles.item}>
            <Text style={styles.itemLabel}>📡 Status do Sistema</Text>
            <Text style={[styles.itemValue, { color: colors.green }]}>Online</Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.itemLabel}>🌐 Conexão</Text>
            <Text style={[styles.itemValue, { color: colors.green }]}>Estável</Text>
          </View>
          {showTime && (
            <View style={styles.item}>
              <Text style={styles.itemLabel}>🕒 Última atualização</Text>
              <Text style={styles.itemValue}>{formatTime(now)}</Text>
            </View>
          )}
        </View>

        <Text style={styles.version}>Versão 1.0.0</Text>
      </View>
    </SafeAreaView>
  );
}

function createStyles(colors: ReturnType<typeof useSchoolColors>) {
  return StyleSheet.create({
    safe: {
      backgroundColor: colors.white,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -6 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 6,
    },
footer: {
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 12,
    },
    dividerOuter: {
      width: '100%',
      alignItems: 'center',
      marginBottom: 16,
    },
    divider: {
      width: 48,
      height: 5,
      borderRadius: 3,
      backgroundColor: colors.gray,
    },
    statusHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 12,
    },
    statusTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.navy,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'flex-start',
      gap: 24,
      flexWrap: 'wrap',
    },
    item: {
      alignItems: 'center',
      gap: 3,
    },
    itemLabel: {
      fontSize: 11,
      color: colors.textMuted,
    },
    itemValue: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.navy,
      fontVariant: ['tabular-nums'],
    },
version: {
      marginTop: 16,
      fontSize: 12,
      color: colors.textMuted,
    },
  });
}
