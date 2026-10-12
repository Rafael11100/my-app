import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Glass } from '@/components/schoolsafe/glass';
import { Typography } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';

type HeaderProps = { compact?: boolean };

export default function Header({ compact: _compact = true }: HeaderProps) {
  const { session, signOut } = useAuth();
  const router = useRouter();

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <Glass style={styles.header} borderRadius={22} intensity={52}>
        <View style={styles.row}>
          <Pressable onPress={() => router.replace('/' as any)} style={styles.brand} accessibilityRole="button" accessibilityLabel="Voltar à central">
            <View style={styles.logoBadge}><Ionicons name="shield-checkmark-outline" size={21} color="#F2F2F2" /></View>
            <View style={styles.titleBlock}>
              <Text style={styles.title}>SchoolSafe</Text>
              <Text style={styles.subtitle}>SEGURANÇA ESCOLAR</Text>
            </View>
          </Pressable>
          <View style={styles.right}>
            <View style={styles.onlinePill}><View style={styles.dot} /><Text style={styles.onlineText}>ONLINE</Text></View>
            {session && <Pressable onPress={() => { void signOut(); }} hitSlop={10} accessibilityRole="button" accessibilityLabel="Sair da conta" style={styles.logoutBtn}>
              <Ionicons name="log-out-outline" size={18} color="#a0a0a0" />
            </Pressable>}
          </View>
        </View>
      </Glass>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: 'transparent' },
  header: { marginHorizontal: 12, marginTop: 8, paddingHorizontal: 14, paddingVertical: 12 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 },
  logoBadge: { width: 40, height: 40, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  titleBlock: { flex: 1, minWidth: 0 },
  title: { fontSize: 18, fontWeight: '700', fontFamily: Typography.bold, color: '#F2F2F2', letterSpacing: -0.3 },
  subtitle: { fontSize: 9, color: '#a0a0a0', marginTop: 3, letterSpacing: 1.4, fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }) },
  right: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 0 },
  onlinePill: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: 'rgba(160,160,160,0.10)', paddingHorizontal: 10, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#a0a0a0' },
  onlineText: { color: '#a0a0a0', fontWeight: '700', fontFamily: Typography.semibold, fontSize: 9, letterSpacing: 1 },
  logoutBtn: { width: 38, height: 38, borderRadius: 19, borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)', backgroundColor: 'rgba(255,255,255,0.04)', alignItems: 'center', justifyContent: 'center' },
});
