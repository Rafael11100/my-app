import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, useReducedMotion, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { Glass } from '@/components/schoolsafe/glass';
import { useAuth } from '@/context/auth-context';
import { Typography } from '@/constants/theme';

const LOCK_MS = 30_000;
const MAX_ATTEMPTS = 5;

export default function LoginScreen() {
  const { signIn } = useAuth();
  const reduceMotion = useReducedMotion();
  const router = useRouter();
  const passwordRef = useRef<TextInput>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<'username' | 'password' | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(0);
  const [now, setNow] = useState(Date.now());
  const remainingSeconds = Math.max(0, Math.ceil((lockedUntil - now) / 1000));
  const shake = useSharedValue(0);
  const cardStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

  useEffect(() => {
    if (!lockedUntil) return;
    const timer = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(timer);
  }, [lockedUntil]);
  useEffect(() => { if (lockedUntil && remainingSeconds === 0) setLockedUntil(0); }, [lockedUntil, remainingSeconds]);

  const submit = async () => {
    if (loading || remainingSeconds > 0) return;
    Keyboard.dismiss();
    setError(null);
    setLoading(true);
    try {
      await signIn(username, password);
      setFailedAttempts(0);
      router.replace('/' as any);
    } catch {
      const next = failedAttempts + 1;
      if (next >= MAX_ATTEMPTS) {
        setFailedAttempts(0);
        setLockedUntil(Date.now() + LOCK_MS);
        setNow(Date.now());
        setError('Muitas tentativas. Aguarde 30 segundos para tentar novamente.');
      } else {
        setFailedAttempts(next);
        setError('Usuário ou senha inválidos.');
      }
      if (reduceMotion) shake.value = withTiming(0, { duration: 150 });
      else shake.value = withSequence(withTiming(-8, { duration: 45 }), withTiming(8, { duration: 45 }), withTiming(-5, { duration: 40 }), withTiming(0, { duration: 40 }));
    } finally { setLoading(false); }
  };

  return <View style={styles.screen}>
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" bounces={false}>
          <Animated.View entering={reduceMotion ? FadeIn.duration(150) : FadeInDown.duration(420)} style={styles.brand}>
            <View style={styles.brandGlow}><Ionicons name="shield-checkmark-outline" size={30} color="#F2F2F2" /></View>
            <Text style={styles.brandTitle}>SchoolSafe</Text>
            <Text style={styles.eyebrow}>ACESSO ADMINISTRATIVO</Text>
          </Animated.View>
          <Animated.View entering={reduceMotion ? FadeIn.duration(150) : FadeInDown.delay(100).duration(420)} style={[styles.cardWrap, cardStyle]}>
            <Glass elevated intensity={58} borderRadius={28} style={styles.card}>
              <Text style={styles.title}>Entrar</Text>
              <Text style={styles.subtitle}>Acesse o painel de segurança escolar.</Text>
              <View style={styles.field}>
                <Text style={styles.label}>Usuário</Text>
                <View style={[styles.inputWrap, focusedField === 'username' && styles.inputFocused]}>
                  <Ionicons name="person-outline" size={17} color="#a0a0a0" />
                  <TextInput value={username} onChangeText={setUsername} placeholder="Seu usuário" placeholderTextColor="#6b6b6b" autoCapitalize="none" autoCorrect={false} autoComplete="username" textContentType="username" returnKeyType="next" onFocus={() => setFocusedField('username')} onBlur={() => setFocusedField(null)} onSubmitEditing={() => passwordRef.current?.focus()} style={styles.input} accessibilityLabel="Usuário" />
                </View>
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Senha</Text>
                <View style={[styles.inputWrap, focusedField === 'password' && styles.inputFocused]}>
                  <Ionicons name="lock-closed-outline" size={17} color="#a0a0a0" />
                  <TextInput ref={passwordRef} value={password} onChangeText={setPassword} placeholder="Sua senha" placeholderTextColor="#6b6b6b" secureTextEntry={!showPassword} autoComplete="current-password" textContentType="password" returnKeyType="done" onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)} onSubmitEditing={() => void submit()} style={styles.input} accessibilityLabel="Senha" />
                  <Pressable onPress={() => setShowPassword((value) => !value)} hitSlop={10} accessibilityRole="button" accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}>
                    <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color="#a0a0a0" />
                  </Pressable>
                </View>
              </View>
              {error && <View style={styles.error} accessibilityLiveRegion="polite"><Ionicons name="alert-circle-outline" size={16} color="#EF4444" /><Text style={styles.errorText}>{error}</Text></View>}
              {remainingSeconds > 0 && <Text style={styles.lockText}>Tente novamente em {remainingSeconds}s.</Text>}
              <Pressable onPress={() => void submit()} disabled={loading || remainingSeconds > 0} style={({ pressed }) => [styles.button, pressed && styles.pressed, (loading || remainingSeconds > 0) && styles.disabled]} accessibilityRole="button" accessibilityLabel="Entrar no sistema">
                {loading ? <ActivityIndicator color="#1f1f1f" /> : <><Text style={styles.buttonText}>{remainingSeconds ? `Aguarde ${remainingSeconds}s` : 'Entrar'}</Text><Ionicons name="arrow-forward-outline" size={18} color="#1f1f1f" /></>}
              </Pressable>
              <Text style={styles.foot}>Sessão válida por 24 horas.</Text>
            </Glass>
          </Animated.View>
          <Text style={styles.bottom}>SCHOOLSAFE · MONITORAMENTO ESCOLAR</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  </View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: 'transparent' }, safe: { flex: 1 }, flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 32, gap: 28 },
  brand: { alignItems: 'center', gap: 8 },
  brandGlow: { width: 68, height: 68, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', marginBottom: 4 },
  brandTitle: { color: '#F2F2F2', fontSize: 28, fontWeight: '700', fontFamily: Typography.bold, letterSpacing: -0.7 },
  eyebrow: { color: '#a0a0a0', fontFamily: 'monospace', fontSize: 9, letterSpacing: 1.7, fontWeight: '600' },
  cardWrap: { width: '100%', maxWidth: 430 },
  card: { width: '100%', padding: 22, gap: 16 },
  title: { color: '#F2F2F2', fontSize: 22, fontWeight: '700', fontFamily: Typography.bold },
  subtitle: { color: '#a0a0a0', fontSize: 13, fontFamily: Typography.regular, marginTop: -10, lineHeight: 19 },
  field: { gap: 7 }, label: { color: '#a0a0a0', fontSize: 10, fontWeight: '700', fontFamily: Typography.semibold, letterSpacing: 1.1, textTransform: 'uppercase' },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: 11, height: 52, paddingHorizontal: 14, borderRadius: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', backgroundColor: 'rgba(255,255,255,0.045)' },
  inputFocused: { borderColor: 'rgba(242,242,242,0.42)', backgroundColor: 'rgba(255,255,255,0.07)' },
  input: { flex: 1, color: '#F2F2F2', fontSize: 15, fontFamily: Typography.regular, paddingVertical: 0 },
  error: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 11, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(239,68,68,0.22)', backgroundColor: 'rgba(239,68,68,0.09)' },
  errorText: { color: '#FCA5A5', flex: 1, fontSize: 12, lineHeight: 17 }, lockText: { color: '#a0a0a0', fontSize: 11, textAlign: 'center' },
  button: { height: 52, borderRadius: 999, backgroundColor: '#F2F2F2', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, marginTop: 2 },
  buttonText: { color: '#1f1f1f', fontSize: 14, fontWeight: '800', fontFamily: Typography.bold }, pressed: { transform: [{ scale: 0.985 }], opacity: 0.92 }, disabled: { opacity: 0.55 },
  foot: { color: '#777', textAlign: 'center', fontSize: 10, marginTop: 2 }, bottom: { color: '#555', letterSpacing: 1.5, fontSize: 8 },
});
