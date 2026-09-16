import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = '@schoolsafe/session';
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

export type Session = {
  token: string;
  username: string;
  issuedAt: number;
  expiresAt: number;
};

type AuthContextType = {
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  backendConfigured: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function safeGet(key: string): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
    }
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
  } catch {}
}
async function safeDelete(key: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  } catch {}
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const backendUrl = process.env.EXPO_PUBLIC_AUTH_URL ?? '';
  const backendConfigured = backendUrl.length > 0;

  useEffect(() => {
    (async () => {
      try {
        const raw = await safeGet(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Session;
          if (parsed.expiresAt && parsed.expiresAt > Date.now()) {
            setSession(parsed);
          } else {
            await safeDelete(STORAGE_KEY);
          }
        }
      } catch {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const signIn = useCallback(
    async (username: string, password: string) => {
      const u = username.trim();
      const p = password.trim();
      if (!u || !p) throw new Error('Informe usuário e senha.');
      if (u.length < 3 || p.length < 4) throw new Error('Credenciais inválidas.');

      if (backendConfigured) {
        const res = await fetch(`${backendUrl.replace(/\/$/, '')}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: u, password: p }),
        });
        if (!res.ok) {
          const msg = await res.text().catch(() => '');
          throw new Error(msg || 'Falha na autenticação. Verifique suas credenciais.');
        }
        const data = (await res.json()) as { token: string; expiresAt?: number; username?: string };
        if (!data.token) throw new Error('Resposta de autenticação inválida.');
        const sess: Session = {
          token: data.token,
          username: data.username ?? u,
          issuedAt: Date.now(),
          expiresAt: data.expiresAt ?? Date.now() + SESSION_TTL_MS,
        };
        await safeSet(STORAGE_KEY, JSON.stringify(sess));
        setSession(sess);
        return;
      }

      const tokenPayload = `${u}:${Date.now()}:${Math.random().toString(36).slice(2)}`;
      const token = typeof btoa !== 'undefined' ? btoa(tokenPayload) : tokenPayload;
      const sess: Session = {
        token,
        username: u,
        issuedAt: Date.now(),
        expiresAt: Date.now() + SESSION_TTL_MS,
      };
      await safeSet(STORAGE_KEY, JSON.stringify(sess));
      setSession(sess);
    },
    [backendConfigured, backendUrl],
  );

  const signOut = useCallback(async () => {
    await safeDelete(STORAGE_KEY);
    setSession(null);
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      session,
      loading,
      isAuthenticated: !!session && session.expiresAt > Date.now(),
      signIn,
      signOut,
      backendConfigured,
    }),
    [session, loading, signIn, signOut, backendConfigured],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
