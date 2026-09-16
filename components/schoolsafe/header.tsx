import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/context/auth-context';
import { useSchoolColors } from '@/hooks/use-school-colors';
import { formatDate, formatTime } from '@/utils/date';

type HeaderProps = { compact?: boolean };

export default function Header({ compact = true }: HeaderProps) {
  const colors = useSchoolColors();
  const { session, signOut } = useAuth();
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const styles = createStyles(colors);

  const content = (
    <View style={styles.row}>
      <View style={styles.brand}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoEmoji}>🏫</Text>
        </View>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>SchoolSafe</Text>
          <Text style={styles.subtitle}>Sistema de Segurança Escolar</Text>
        </View>
      </View>

      <View style={styles.right}>
        <View style={styles.onlinePill}>
          <View style={styles.dot} />
          <Text style={styles.onlineText}>Online</Text>
        </View>
        <Text style={styles.clock}>{formatTime(now)}</Text>
        {session && (
          <TouchableOpacity
            onPress={signOut}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Sair da conta"
            style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={16} color={colors.textMuted} />
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // Glass header compacto — secundário ao conteúdo
  if (Platform.OS === 'web') {
    return (
      <SafeAreaView edges={['top']} style={styles.safe}>
        <View style={styles.headerWeb}>{content}</View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.headerWrap}>
        <BlurView intensity={26} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.headerGlassInner}>{content}</View>
      </View>
    </SafeAreaView>
  );
}

function createStyles(colors: ReturnType<typeof useSchoolColors>) {
  return StyleSheet.create({
    safe: {
      backgroundColor: 'transparent',
    },
    headerWrap: {
      marginHorizontal: 12,
      marginTop: 8,
      borderRadius: 18,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: 'rgba(160,160,160,0.14)',
    },
    headerGlassInner: {
      backgroundColor: 'rgba(40,40,40,0.72)',
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    headerWeb: {
      marginHorizontal: 12,
      marginTop: 8,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: 'rgba(160,160,160,0.14)',
      backgroundColor: 'rgba(40,40,40,0.92)',
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    brand: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      flex: 1,
      minWidth: 0,
    },
    logoBadge: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: '#2e2e2e',
      borderWidth: 1,
      borderColor: 'rgba(160,160,160,0.14)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoEmoji: { fontSize: 18 },
    titleBlock: { flex: 1, minWidth: 0 },
    title: { fontSize: 16, fontWeight: '800', color: '#F2F2F2', letterSpacing: 0.3 },
    subtitle: { fontSize: 11, color: '#a0a0a0', marginTop: 1 },
    right: { flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 0 },
    onlinePill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: 'rgba(34,197,94,0.14)',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: 'rgba(34,197,94,0.22)',
    },
    dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#22C55E' },
    onlineText: { color: '#22C55E', fontWeight: '700', fontSize: 11 },
    clock: { fontSize: 12, fontWeight: '700', color: '#a0a0a0', fontVariant: ['tabular-nums'] as any },
    logoutBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: 'rgba(160,160,160,0.14)',
      backgroundColor: 'rgba(255,255,255,0.06)',
    },
    logoutText: { fontSize: 12, fontWeight: '700', color: '#a0a0a0' },
    dateText: { fontSize: 11, color: '#7a7a7a' },
  });
}
