import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = '@seguranca-escolar/jazzsecurity-session.v1';
const JAZZSECURITY_URL = (process.env.EXPO_PUBLIC_JAZZSECURITY_URL ?? '').trim().replace(/\/+$/, '');
const AUTH_TIMEOUT_MS = 12_000;

export type Session = {
  token: string;
  username: string;
  name: string;
  email: string;
  role: 'admin';
  issuedAt: number;
  expiresAt: number;
};

type AuthContextType = {
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (login: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  backendConfigured: boolean;
};

type LoginResponse = {
  token?: unknown;
  expiresAt?: unknown;
  user?: {
    id?: unknown;
    username?: unknown;
    name?: unknown;
    email?: unknown;
    role?: unknown;
  };
  error?: string | { message?: unknown };
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function safeGet(key: string): Promise<string | null> {
  try {
    if (Platform.OS === 'web') return typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(key) : null;
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

async function safeSet(key: string, value: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      if (typeof sessionStorage !== 'undefined') sessionStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  } catch {
    // A sessão continua ativa na memória mesmo se o armazenamento não estiver disponível.
  }
}

async function safeDelete(key: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  } catch {
    // Não bloquear logout ou limpeza da sessão se o armazenamento falhar.
  }
}

function parseErrorMessage(payload: LoginResponse, status: number): string {
  if (typeof payload.error === 'string' && payload.error.trim()) return payload.error;
  if (typeof payload.error === 'object' && payload.error !== null && typeof payload.error.message === 'string') {
    return payload.error.message;
  }
  if (status === 401) return 'Usuário ou senha incorretos.';
  if (status === 429) return 'Muitas tentativas de login. Aguarde antes de tentar novamente.';
  return 'Não foi possível concluir a autenticação. Tente novamente.';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const backendConfigured = JAZZSECURITY_URL.length > 0;

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const raw = await safeGet(STORAGE_KEY);
        if (!raw) return;

        const stored = JSON.parse(raw) as Partial<Session>;
        const valid =
          backendConfigured &&
          typeof stored.token === 'string' &&
          stored.token.length > 20 &&
          typeof stored.username === 'string' &&
          typeof stored.name === 'string' &&
          typeof stored.email === 'string' &&
          stored.role === 'admin' &&
          typeof stored.expiresAt === 'number' &&
          Number.isFinite(stored.expiresAt) &&
          stored.expiresAt > Date.now();

        if (!valid) {
          await safeDelete(STORAGE_KEY);
          return;
        }

        if (mounted) setSession(stored as Session);
      } catch {
        await safeDelete(STORAGE_KEY);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [backendConfigured]);

  const signIn = useCallback(async (login: string, password: string) => {
    const normalizedLogin = login.trim();
    if (!normalizedLogin || !password) throw new Error('Informe o usuário ou e-mail e a senha.');
    if (normalizedLogin.length > 100 || password.length > 128) throw new Error('Confira o tamanho dos campos informados.');
    if (!backendConfigured) {
      throw new Error('O endereço do JazzSecurity não está configurado. Defina EXPO_PUBLIC_JAZZSECURITY_URL.');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AUTH_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(JAZZSECURITY_URL + '/auth/login', {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: normalizedLogin, password }),
        signal: controller.signal,
      });
    } catch (cause) {
      if (cause instanceof Error && cause.name === 'AbortError') {
        throw new Error('A autenticação excedeu o limite de 12 segundos.');
      }
      throw new Error('Não foi possível conectar ao JazzSecurity. Confira a URL e a conexão.');
    } finally {
      clearTimeout(timeoutId);
    }

    const payload = await response.json().catch(() => ({})) as LoginResponse;
    if (!response.ok) throw new Error(parseErrorMessage(payload, response.status));

    const user = payload.user;
    const expiresAt = typeof payload.expiresAt === 'string' ? Date.parse(payload.expiresAt) : Number.NaN;
    if (
      typeof payload.token !== 'string' ||
      payload.token.length < 20 ||
      !user ||
      (user.id !== 1 && user.id !== 2) ||
      typeof user.username !== 'string' ||
      typeof user.name !== 'string' ||
      typeof user.email !== 'string' ||
      user.role !== 'admin' ||
      !Number.isFinite(expiresAt) ||
      expiresAt <= Date.now()
    ) {
      throw new Error('O JazzSecurity retornou uma sessão administrativa inválida.');
    }

    const now = Date.now();
    const next: Session = {
      token: payload.token,
      username: user.username,
      name: user.name,
      email: user.email,
      role: 'admin',
      issuedAt: now,
      expiresAt,
    };

    await safeSet(STORAGE_KEY, JSON.stringify(next));
    setSession(next);
  }, [backendConfigured]);

  useEffect(() => {
    if (!session) return;
    const delay = Math.max(0, session.expiresAt - Date.now());
    const timer = setTimeout(() => {
      void safeDelete(STORAGE_KEY).finally(() => setSession(null));
    }, delay);
    return () => clearTimeout(timer);
  }, [session]);

  const signOut = useCallback(async () => {
    await safeDelete(STORAGE_KEY);
    setSession(null);
  }, []);

  const value = useMemo<AuthContextType>(() => ({
    session,
    loading,
    isAuthenticated: !!session && session.role === 'admin',
    signIn,
    signOut,
    backendConfigured,
  }), [session, loading, signIn, signOut, backendConfigured]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
