import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import Footer from '@/components/schoolsafe/footer';
import Header from '@/components/schoolsafe/header';
import { createScreenStyles } from '@/components/schoolsafe/screen-styles';
import { useAlerts, type SensorRecord } from '@/context/alerts-context';
import { useSchoolColors } from '@/hooks/use-school-colors';

export default function RegistroScreen() {
  const router = useRouter();
  const colors = useSchoolColors();
  const styles = createStyles(colors);
  const { history, removeRecord } = useAlerts();

  return (
    <View style={styles.screen}>
      <Header showClock={false} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.cardsArea}>
          <TouchableOpacity
            style={styles.backRow}
            onPress={() => router.back()}
            activeOpacity={0.7}>
            <View style={styles.backBadge}>
              <Ionicons name="arrow-back" size={18} color={colors.navy} />
            </View>
            <Text style={styles.backText}>Voltar para a central</Text>
          </TouchableOpacity>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📋 Registro de Detecções</Text>
            <Text style={styles.sectionSubtitle}>
              Histórico de ativações dos detectores com hora e local
            </Text>
          </View>

          {history.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="document-text-outline" size={44} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>Nenhum registro ainda</Text>
              <Text style={styles.emptySubtitle}>
                Quando um detector for ativado, a hora e o local aparecerão aqui.
              </Text>
            </View>
          ) : (
            <View style={styles.list}>
              {history.map((record) => (
                <RecordItem
                  key={record.id}
                  record={record}
                  onDelete={() => removeRecord(record.id)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <Footer showTime={false} />
    </View>
  );
}

function RecordItem({ record, onDelete }: { record: SensorRecord; onDelete: () => void }) {
  const colors = useSchoolColors();
  const styles = createStyles(colors);
  const isSmoke = record.kind === 'smoke';
  const accent = isSmoke ? colors.red : colors.blue;
  const kindLabel = isSmoke ? 'Detector de Fumaça' : 'Detector de Presença';

  return (
    <View style={[styles.recordCard, { borderColor: accent }]}>
      <View style={[styles.recordIcon, { backgroundColor: accent }]}>
        <Ionicons name={isSmoke ? 'flame' : 'walk'} size={22} color={colors.white} />
      </View>
      <View style={styles.recordBody}>
        <View style={styles.recordHeader}>
          <Text style={styles.recordKind}>{kindLabel}</Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={onDelete}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
        <View style={styles.recordRow}>
          <Ionicons name="time" size={16} color={accent} />
          <Text style={styles.recordLabel}>Hora da ativação</Text>
          <Text style={[styles.recordValue, { color: accent }]}>{record.startedAt}</Text>
        </View>
        <View style={styles.recordRow}>
          <Ionicons name="location" size={16} color={accent} />
          <Text style={styles.recordLabel}>Local</Text>
          <Text style={styles.recordValue}>{record.location}</Text>
        </View>
      </View>
    </View>
  );
}

function createStyles(colors: ReturnType<typeof useSchoolColors>) {
  const shared = createScreenStyles(colors);
  return StyleSheet.create({
    ...shared,
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
    emptyCard: {
      width: '100%',
      alignItems: 'center',
      gap: 8,
      backgroundColor: colors.white,
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: colors.cardBorder,
      paddingVertical: 40,
      paddingHorizontal: 24,
    },
    emptyTitle: {
      fontSize: 17,
      fontWeight: '800',
      color: colors.navy,
    },
    emptySubtitle: {
      fontSize: 13,
      color: colors.textMuted,
      textAlign: 'center',
    },
    list: {
      width: '100%',
      maxWidth: 420,
      gap: 14,
    },
    recordCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      backgroundColor: colors.white,
      borderRadius: 18,
      borderWidth: 1.5,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    recordIcon: {
      width: 48,
      height: 48,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    recordBody: {
      flex: 1,
      gap: 8,
    },
    recordHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    deleteButton: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.gray,
      alignItems: 'center',
      justifyContent: 'center',
    },
    recordKind: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.navy,
    },
    recordRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    recordLabel: {
      flex: 1,
      fontSize: 12,
      color: colors.textMuted,
      fontWeight: '600',
    },
    recordValue: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.navy,
      fontVariant: ['tabular-nums'],
    },
  });
}
