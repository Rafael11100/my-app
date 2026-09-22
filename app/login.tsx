import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/context/auth-context";
import { useSchoolColors } from "@/hooks/use-school-colors";

export default function LoginScreen() {
  const colors = useSchoolColors();
  const { signIn, backendConfigured } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const onSubmit = async () => {
    setError(null);
    if (!username.trim() || !password.trim()) {
      setError("Informe usuário e senha.");
      return;
    }
    setLoading(true);
    try {
      await signIn(username, password);
      router.replace("/" as any);
    } catch (e: any) {
      const msg = e?.message || "Falha na autenticação. Tente novamente.";
      // OWASP: não revelar enumeração
      setError(
        msg.includes("Failed to fetch") || msg.includes("Network")
          ? "Não foi possível conectar ao servidor."
          : msg,
      );
    } finally {
      setLoading(false);
    }
  };

  const styles = createStyles(colors);

  const cardInner = (
    <View style={styles.cardInner}>
      <View style={styles.brandRow}>
        <View style={styles.logoBadge}>
          <Ionicons name="code-slash-outline" size={24} color={colors.white} />
        </View>
        <View>
          <Text style={styles.brandTitle}>SchoolSafe</Text>
          <Text style={styles.brandSub}>Acesso administrativo</Text>
        </View>
      </View>

      <Text style={styles.title}>Entrar</Text>
      <Text style={styles.subtitle}>
        {backendConfigured
          ? "Autenticação segura via servidor."
          : "Modo demonstração — nenhuma credencial hardcoded. Conecte um backend para segurança real."}
      </Text>

      {!backendConfigured && (
        <View style={styles.infoBox}>
          <Ionicons name="shield-checkmark-outline" size={14} color="#a0a0a0" />
          <Text style={styles.infoText}>
            Qualquer usuário/senha não vazios liberam o acesso neste modo.
            Configure EXPO_PUBLIC_AUTH_URL.
          </Text>
        </View>
      )}

      <View style={styles.field}>
        <Text style={styles.label}>Usuário</Text>
        <View style={styles.inputWrap}>
          <Ionicons name="person-outline" size={16} color="#a0a0a0" />
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="seu usuário"
            placeholderTextColor="#6b6b6b"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
            accessibilityLabel="Usuário"
            returnKeyType="next"
          />
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Senha</Text>
        <View style={styles.inputWrap}>
          <Ionicons name="lock-closed-outline" size={16} color="#a0a0a0" />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor="#6b6b6b"
            secureTextEntry={!showPass}
            style={styles.input}
            accessibilityLabel="Senha"
            returnKeyType="done"
            onSubmitEditing={onSubmit}
          />
          <Pressable
            onPress={() => setShowPass((v) => !v)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={showPass ? "Ocultar senha" : "Mostrar senha"}
          >
            <Ionicons
              name={showPass ? "eye-off-outline" : "eye-outline"}
              size={18}
              color="#a0a0a0"
            />
          </Pressable>
        </View>
      </View>

      {error && (
        <View style={styles.errorBox} accessibilityLiveRegion="polite">
          <Ionicons name="alert-circle" size={14} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <Pressable
        onPress={onSubmit}
        disabled={loading}
        style={({ pressed }) => [
          styles.btn,
          pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
          loading && { opacity: 0.7 },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Entrar no sistema"
        accessibilityHint="Autentica e leva para a central"
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Entrar</Text>
        )}
        {!loading && (
          <Ionicons name="arrow-forward-outline" size={16} color="#fff" />
        )}
      </Pressable>

      <Text style={styles.foot}>
        Sessão válida por 24 horas. Toque em Sair no cabeçalho para encerrar.
      </Text>
    </View>
  );

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.center}>
          {Platform.OS === "web" ? (
            <View style={styles.cardWeb}>{cardInner}</View>
          ) : (
            <View style={styles.cardWrap}>
              <BlurView
                intensity={26}
                tint="dark"
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.cardGlass}>{cardInner}</View>
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

function createStyles(colors: ReturnType<typeof useSchoolColors>) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: "#1f1f1f" },
    safe: { flex: 1 },
    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    },
    cardWrap: {
      width: "100%",
      maxWidth: 420,
      borderRadius: 24,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: "rgba(160,160,160,0.14)",
    },
    cardGlass: { backgroundColor: "rgba(40,40,40,0.72)", padding: 0 },
    cardWeb: {
      width: "100%",
      maxWidth: 420,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: "rgba(160,160,160,0.14)",
      backgroundColor: "rgba(40,40,40,0.92)",
      overflow: "hidden",
    },
    cardInner: { padding: 22, gap: 14 },
    brandRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 4,
    },
    logoBadge: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: "#2e2e2e",
      borderWidth: 1,
      borderColor: "rgba(160,160,160,0.14)",
      alignItems: "center",
      justifyContent: "center",
    },
    brandTitle: { fontSize: 18, fontWeight: "800", color: "#F2F2F2" },
    brandSub: { fontSize: 12, color: "#a0a0a0" },
    title: { fontSize: 22, fontWeight: "800", color: "#F2F2F2", marginTop: 4 },
    subtitle: { fontSize: 13, color: "#a0a0a0", lineHeight: 18 },
    infoBox: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: "rgba(160,160,160,0.08)",
      borderWidth: 1,
      borderColor: "rgba(160,160,160,0.14)",
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    infoText: { flex: 1, fontSize: 11, color: "#a0a0a0", lineHeight: 15 },
    field: { gap: 6 },
    label: {
      fontSize: 12,
      fontWeight: "700",
      color: "#a0a0a0",
      letterSpacing: 0.3,
      textTransform: "uppercase",
    },
    inputWrap: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: "rgba(255,255,255,0.06)",
      borderWidth: 1,
      borderColor: "rgba(160,160,160,0.14)",
      borderRadius: 14,
      paddingHorizontal: 14,
      height: 48,
    },
    input: { flex: 1, color: "#F2F2F2", fontSize: 15, paddingVertical: 0 },
    errorBox: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: "rgba(239,68,68,0.12)",
      borderWidth: 1,
      borderColor: "rgba(239,68,68,0.22)",
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    errorText: { flex: 1, fontSize: 13, color: "#FCA5A5", fontWeight: "600" },
    btn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: "#3a3a3a",
      borderWidth: 1,
      borderColor: "rgba(160,160,160,0.18)",
      borderRadius: 999,
      height: 48,
      marginTop: 4,
    },
    btnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
    foot: { fontSize: 11, color: "#7a7a7a", textAlign: "center", marginTop: 2 },
  });
}
