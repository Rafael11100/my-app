import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ADMIN_CREDENTIALS } from '@/constants/admins';
import { sha256Hex } from '@/utils/sha256';

const STORAGE_KEY = '@schoolsafe/session';
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

function isLocalhostWeb(): boolean {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return false;
  const hostname = window.location.hostname.toLowerCase();
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1' || hostname === '[::1]';
}
export type Session = { token: string; username: string; role: 'admin'; issuedAt: number; expiresAt: number };
type AuthContextType = { session: Session | null; loading: boolean; isAuthenticated: boolean; signIn: (username: string, password: string) => Promise<void>; signOut: () => Promise<void>; backendConfigured: boolean };
const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function safeGet(key: string): Promise<string | null> {
  try { if (Platform.OS === 'web') return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null; return await SecureStore.getItemAsync(key); } catch { return null; }
}
async function safeSet(key: string, value: string): Promise<void> {
  try { if (Platform.OS === 'web') { if (typeof localStorage !== 'undefined') localStorage.setItem(key, value); return; } await SecureStore.setItemAsync(key, value); } catch {}
}
async function safeDelete(key: string): Promise<void> {
  try { if (Platform.OS === 'web') { if (typeof localStorage !== 'undefined') localStorage.removeItem(key); return; } await SecureStore.deleteItemAsync(key); } catch {}
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const backendUrl = process.env.EXPO_PUBLIC_AUTH_URL ?? '';
  const backendConfigured = backendUrl.length > 0;
  const localBypassEnabled = isLocalhostWeb();
  useEffect(() => {
    (async () => {
      try {
        if (localBypassEnabled) {
          const now = Date.now();
          setSession({
            token: 'local-development-bypass',
            username: 'local-dev',
            role: 'admin',
            issuedAt: now,
            expiresAt: now + SESSION_TTL_MS,
          });
          return;
        }
        const raw = await safeGet(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Session;
          if (parsed.expiresAt > Date.now() && parsed.role === 'admin') setSession(parsed);
          else await safeDelete(STORAGE_KEY);
        }
      } catch { await safeDelete(STORAGE_KEY); } finally { setLoading(false); }
    })();
  }, [localBypassEnabled]);

  const signIn = useCallback(async (username: string, password: string) => {
    const normalized = username.trim().toLowerCase();
    if (!normalized || !password) throw new Error('Usuário ou senha inválidos.');
    if (backendConfigured) {
      const response = await fetch(`${backendUrl.replace(/\/$/, '')}/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: normalized, password }),
      });
      if (!response.ok) throw new Error('Usuário ou senha inválidos.');
      const data = await response.json() as { token?: string; expiresAt?: number; username?: string; role?: string };
      if (!data.token || (data.role !== undefined && data.role !== 'admin')) throw new Error('Usuário ou senha inválidos.');
      const next: Session = { token: data.token, username: data.username ?? normalized, role: 'admin', issuedAt: Date.now(), expiresAt: data.expiresAt ?? Date.now() + SESSION_TTL_MS };
      await safeSet(STORAGE_KEY, JSON.stringify(next)); setSession(next); return;
    }
    // Hash SHA-256 com sal por usuário; isto é provisório porque o cliente continua inspecionável.
    const candidate = ADMIN_CREDENTIALS.find((admin) => admin.username === normalized);
    const hash = candidate ? await sha256Hex(candidate.salt + password) : '';
    if (!candidate || hash !== candidate.passwordHash) throw new Error('Usuário ou senha inválidos.');
    const token = await sha256Hex(`${candidate.username}:${Date.now()}:${Math.random().toString(36).slice(2)}`);
    const next: Session = { token, username: candidate.username, role: candidate.role, issuedAt: Date.now(), expiresAt: Date.now() + SESSION_TTL_MS };
    await safeSet(STORAGE_KEY, JSON.stringify(next)); setSession(next);
  }, [backendConfigured, backendUrl]);

  const signOut = useCallback(async () => { await safeDelete(STORAGE_KEY); setSession(null); }, []);
  const value = useMemo<AuthContextType>(() => ({
    session, loading, isAuthenticated: localBypassEnabled || (!!session && session.expiresAt > Date.now() && session.role === 'admin'),
    signIn, signOut, backendConfigured,
  }), [session, loading, signIn, signOut, backendConfigured, localBypassEnabled]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
