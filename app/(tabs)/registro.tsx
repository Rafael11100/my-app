import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";

import Header from "@/components/schoolsafe/header";
import { useAlerts, type SensorRecord } from "@/context/alerts-context";
import { useSchoolColors } from "@/hooks/use-school-colors";

export default function RegistroScreen() {
  const router = useRouter();
  const colors = useSchoolColors();
  const { history, removeRecord, smokeSensors, motionSensors } = useAlerts();

  const activeSmoke = useMemo(
    () => smokeSensors.filter((s) => s.active),
    [smokeSensors],
  );
  const activeMotion = useMemo(
    () => motionSensors.filter((s) => s.active),
    [motionSensors],
  );
  const hasActive = activeSmoke.length > 0 || activeMotion.length > 0;
  const activeList = [...activeSmoke, ...activeMotion];

  return (
    <View style={styles.screen}>
      <Header compact />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backRow, pressed && { opacity: 0.7 }]}
          accessibilityRole="button"
          accessibilityLabel="Voltar para a central"
          hitSlop={8}
        >
          <View style={styles.backBadge}>
            <Ionicons name="arrow-back-outline" size={16} color="#F2F2F2" />
          </View>
          <Text style={styles.backText}>Voltar para a central</Text>
        </Pressable>

        {hasActive && (
          <View style={styles.activeBlock}>
            <Text style={styles.activeTitle}>Alerta ativo agora</Text>
            <Text style={styles.activeSub}>
              Estes sensores estão em alerta neste momento. O alerta encerra
              automaticamente.
            </Text>
            <View style={styles.activeList}>
              {activeList.map((s) => {
                const accent = s.kind === "smoke" ? "#EF4444" : "#3B82F6";
                return (
                  <View
                    key={s.id}
                    style={[
                      styles.activeCard,
                      {
                        borderColor: accent + "40",
                        backgroundColor:
                          s.kind === "smoke"
                            ? "rgba(239,68,68,0.10)"
                            : "rgba(59,130,246,0.10)",
                      },
                    ]}
                  >
                    <View
                      style={[styles.activeIcon, { backgroundColor: accent }]}
                    >
                      <Ionicons
                        name={
                          s.kind === "smoke" ? "flame-outline" : "walk-outline"
                        }
                        size={14}
                        color="#fff"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.activeCardLabel}>
                        {s.label} · {s.location}
                      </Text>
                      <Text style={styles.activeCardMeta}>
                        Início {s.startedAt} ·{" "}
                        {s.kind === "smoke" ? "10s" : "2s"}
                      </Text>
                    </View>
                    <View
                      style={[styles.liveDot, { backgroundColor: accent }]}
                    />
                  </View>
                );
              })}
            </View>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Registro de eventos</Text>
          <Text style={styles.sectionSubtitle}>
            Histórico de ativações — hora e local. O alerta e a mensagem
            compartilham o mesmo ciclo de vida.
          </Text>
        </View>

        {history.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="document-text-outline" size={28} color="#a0a0a0" />
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
      </ScrollView>
    </View>
  );
}

function RecordItem({
  record,
  onDelete,
}: {
  record: SensorRecord;
  onDelete: () => void;
}) {
  const isSmoke = record.kind === "smoke";
  const accent = isSmoke ? "#EF4444" : "#3B82F6";
  const kindLabel = isSmoke ? "Fumaça" : "Movimento";
  return (
    <View
      style={[styles.recordCard, { borderColor: accent + "2A" }]}
      accessibilityLabel={`${kindLabel} ${record.location} às ${record.startedAt}`}
    >
      <View
        style={[
          styles.recordIcon,
          { backgroundColor: accent + "18", borderColor: accent + "22" },
        ]}
      >
        <Ionicons
          name={isSmoke ? "flame-outline" : "walk-outline"}
          size={16}
          color={accent}
        />
      </View>
      <View style={styles.recordBody}>
        <Text style={styles.recordKind}>
          {kindLabel} · {record.location}
        </Text>
        <Text style={styles.recordMeta}>{record.startedAt}</Text>
      </View>
      <Pressable
        onPress={onDelete}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel={`Remover registro ${record.id}`}
        style={({ pressed }) => [styles.deleteBtn, pressed && { opacity: 0.7 }]}
      >
        <Ionicons name="close-outline" size={14} color="#a0a0a0" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#1f1f1f" },
  content: {
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 28,
    gap: 16,
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    alignSelf: "flex-start",
  },
  backBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(40,40,40,0.92)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(160,160,160,0.14)",
  },
  backText: { fontSize: 13, fontWeight: "600", color: "#F2F2F2" },
  activeBlock: {
    width: "100%",
    maxWidth: 520,
    backgroundColor: "rgba(40,40,40,0.92)",
    borderWidth: 1,
    borderColor: "rgba(160,160,160,0.14)",
    borderRadius: 18,
    padding: 14,
    gap: 10,
  },
  activeTitle: { fontSize: 13, fontWeight: "800", color: "#F2F2F2" },
  activeSub: { fontSize: 12, color: "#a0a0a0", lineHeight: 16 },
  activeList: { gap: 8 },
  activeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  activeIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  activeCardLabel: { fontSize: 13, fontWeight: "700", color: "#F2F2F2" },
  activeCardMeta: { fontSize: 11, color: "#a0a0a0", marginTop: 1 },
  liveDot: { width: 8, height: 8, borderRadius: 4 },
  sectionHeader: { width: "100%", maxWidth: 520, gap: 4 },
  sectionTitle: { fontSize: 14, fontWeight: "800", color: "#F2F2F2" },
  sectionSubtitle: { fontSize: 12, color: "#7a7a7a", lineHeight: 16 },
  emptyCard: {
    width: "100%",
    maxWidth: 520,
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(40,40,40,0.92)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(160,160,160,0.14)",
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  emptyTitle: { fontSize: 14, fontWeight: "800", color: "#F2F2F2" },
  emptySubtitle: { fontSize: 12, color: "#7a7a7a", textAlign: "center" },
  list: { width: "100%", maxWidth: 520, gap: 10 },
  recordCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(40,40,40,0.92)",
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  recordIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  recordBody: { flex: 1, gap: 2 },
  recordKind: { fontSize: 13, fontWeight: "700", color: "#F2F2F2" },
  recordMeta: {
    fontSize: 11,
    color: "#7a7a7a",
    fontVariant: ["tabular-nums"] as any,
  },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(160,160,160,0.10)",
  },
});
