import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = '@seguranca-escolar/session';

export type Session = {
  token: string;
  username: string;
  role: 'admin';
  issuedAt: number;
  expiresAt: number;
};

type AuthContextType = {
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
  backendConfigured: boolean;
};

type AuthResponse = {
  token?: string;
  expiresAt?: number;
  username?: string;
  role?: string;
  error?: string;
  valid?: boolean;
  issuedAt?: number;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function safeGet(key: string): Promise<string | null> {
  try {
    if (Platform.OS === 'web') return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

async function safeSet(key: string, value: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
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
      if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  } catch {
    // Não bloquear logout ou limpeza da sessão se o armazenamento falhar.
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const backendUrl = (process.env.EXPO_PUBLIC_AUTH_URL ?? '').trim().replace(/\/$/, '');
  const backendConfigured = backendUrl.length > 0;

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const raw = await safeGet(STORAGE_KEY);
        if (!raw) return;

        const stored = JSON.parse(raw) as Partial<Session>;
        if (!backendConfigured || typeof stored.token !== 'string' || !stored.token) {
          await safeDelete(STORAGE_KEY);
          return;
        }

        // Nunca confiar em dados de sessão gravados no dispositivo sem validar a assinatura no servidor.
        const response = await fetch(backendUrl + '/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: stored.token }),
        });
        if (!response.ok) {
          await safeDelete(STORAGE_KEY);
          return;
        }

        const data = await response.json() as AuthResponse;
        if (
          data.valid !== true ||
          data.role !== 'admin' ||
          typeof data.expiresAt !== 'number' ||
          data.expiresAt <= Date.now()
        ) {
          await safeDelete(STORAGE_KEY);
          return;
        }

        const verified: Session = {
          token: stored.token,
          username: data.username ?? 'administrador',
          role: 'admin',
          issuedAt: typeof data.issuedAt === 'number' ? data.issuedAt : Date.now(),
          expiresAt: data.expiresAt,
        };
        if (mounted) setSession(verified);
        await safeSet(STORAGE_KEY, JSON.stringify(verified));
      } catch {
        await safeDelete(STORAGE_KEY);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [backendConfigured, backendUrl]);

  const signIn = useCallback(async (token: string) => {
    const submittedToken = token.trim();
    if (!submittedToken) throw new Error('Informe um token de acesso.');
    if (!backendConfigured) {
      throw new Error('O servidor de autenticação não está configurado. Defina EXPO_PUBLIC_AUTH_URL.');
    }

    let response: Response;
    try {
      response = await fetch(backendUrl + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: submittedToken }),
      });
    } catch {
      throw new Error('Não foi possível conectar ao servidor. Confira a URL e a conexão.');
    }

    const data = await response.json().catch(() => ({})) as AuthResponse;
    if (response.status === 401) throw new Error('Token inválido.');
    if (!response.ok) throw new Error(data.error ?? 'Não foi possível concluir a autenticação.');
    if (!data.token || data.role !== 'admin' || typeof data.expiresAt !== 'number') {
      throw new Error('Resposta inválida do servidor de autenticação.');
    }

    const now = Date.now();
    const next: Session = {
      token: data.token,
      username: data.username ?? 'administrador',
      role: 'admin',
      issuedAt: now,
      expiresAt: data.expiresAt,
    };
    if (next.expiresAt <= now) throw new Error('O servidor retornou uma sessão expirada.');

    await safeSet(STORAGE_KEY, JSON.stringify(next));
    setSession(next);
  }, [backendConfigured, backendUrl]);

  const signOut = useCallback(async () => {
    await safeDelete(STORAGE_KEY);
    setSession(null);
  }, []);

  const value = useMemo<AuthContextType>(() => ({
    session,
    loading,
    isAuthenticated: !!session && session.expiresAt > Date.now() && session.role === 'admin',
    signIn,
    signOut,
    backendConfigured,
  }), [session, loading, signIn, signOut, backendConfigured]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
