import { DefaultTheme, ThemeProvider } from 'expo-router/react-navigation';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AlertsProvider } from '@/context/alerts-context';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { ThemeProvider as SchoolThemeProvider } from '@/context/theme-context';
import AmbientBackground from '@/components/schoolsafe/ambient-background';

const schoolTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#a0a0a0',
    background: '#1f1f1f',
    card: 'rgba(40,40,40,0.92)',
    text: '#F2F2F2',
    border: 'rgba(160,160,160,0.14)',
  },
};

export const unstable_settings = { anchor: '(tabs)' };

type AppErrorBoundaryState = { error: Error | null };

/**
 * Evita uma tela escura sem explicação quando algum componente falha durante
 * a renderização. A mensagem também ajuda a identificar erros no Expo Web.
 */
class AppErrorBoundary extends React.Component<React.PropsWithChildren, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[Segurança Escolar] Falha ao renderizar a aplicação:', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#1f1f1f', gap: 16 }}>
        <Text style={{ color: '#F2F2F2', fontSize: 20, fontWeight: '700', textAlign: 'center' }}>
          Não foi possível abrir o Segurança Escolar
        </Text>
        <Text selectable style={{ color: '#FCA5A5', fontSize: 13, lineHeight: 20, textAlign: 'center', maxWidth: 640 }}>
          {this.state.error.message || 'Ocorreu um erro inesperado durante a inicialização.'}
        </Text>
        <Pressable
          onPress={() => this.setState({ error: null })}
          accessibilityRole="button"
          style={{ borderRadius: 999, paddingHorizontal: 22, paddingVertical: 12, backgroundColor: '#F2F2F2' }}
        >
          <Text style={{ color: '#1f1f1f', fontWeight: '700' }}>Tentar novamente</Text>
        </Pressable>
      </View>
    );
  }
}

function RootStack() {
  const { loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === 'login';
    const inTabs = segments[0] === '(tabs)';
    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/login' as any);
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/' as any);
    }
    void inTabs;
  }, [isAuthenticated, loading, segments, router]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1f1f1f' }}>
        <ActivityIndicator color="#a0a0a0" />
      </View>
    );
  }

  return (
    <>
      <AmbientBackground />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="login" options={{ gestureEnabled: false, animation: 'fade' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Detalhes', headerShown: true, headerStyle: { backgroundColor: '#1f1f1f' } as any, headerTintColor: '#F2F2F2' }} />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}

export default function RootLayout() {
  // A aplicação pode renderizar com a fonte padrão enquanto as fontes são carregadas.
  // Eventuais falhas ficam registradas no Console para facilitar o diagnóstico.
  const [, fontError] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });

  useEffect(() => {
    if (fontError) console.warn('[Segurança Escolar] Não foi possível carregar as fontes Inter:', fontError);
  }, [fontError]);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#1f1f1f' }}>
      <AppErrorBoundary>
        <SchoolThemeProvider>
          <AuthProvider>
            <AlertsProvider>
              <ThemeProvider value={schoolTheme}>
                <RootStack />
              </ThemeProvider>
            </AlertsProvider>
          </AuthProvider>
        </SchoolThemeProvider>
      </AppErrorBoundary>
    </GestureHandlerRootView>
  );
}
