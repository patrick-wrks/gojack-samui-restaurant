'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { UserRole } from '@/lib/roles';
import { DEFAULT_ROLE } from '@/lib/roles';

type AuthContextType = {
  isLoggedIn: boolean;
  authLoading: boolean;
  role: UserRole;
  roleLoading: boolean;
  login: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<{ id: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [role, setRole] = useState<UserRole>(DEFAULT_ROLE);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      setRoleLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s ? { id: s.user.id } : null);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s ? { id: s.user.id } : null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!supabase || !session) {
      setRole(DEFAULT_ROLE);
      setRoleLoading(false);
      return;
    }

    const client = supabase;
    setRoleLoading(true);
    const fetchRole = () =>
      Promise.all([
        client.rpc('get_my_role'),
        client.auth.getUser(),
      ]).then(async ([{ data: roleData, error }, { data: { user } }]) => {
        console.log('[AuthProvider] Role debug:', {
          userId: session.id,
          email: user?.email ?? 'unknown',
          rawRole: roleData,
          error: error?.message,
        });
        let resolvedRole: UserRole = DEFAULT_ROLE;
        if (error) {
          console.warn('[AuthProvider] Failed to fetch role:', error.message);
        } else if (roleData != null && roleData !== '') {
          const raw = String(roleData).toLowerCase();
          const valid: UserRole[] = ['admin', 'kitchen', 'cashier'];
          resolvedRole = valid.includes(raw as UserRole) ? (raw as UserRole) : DEFAULT_ROLE;
        }

        // If still cashier and email looks like admin, try one-click fix RPC
        if (resolvedRole === 'cashier' && user?.email) {
          const em = user.email.toLowerCase();
          if (em.includes('admin') && em.includes('gojack')) {
            try {
              const { data: rpcData } = await client.rpc('promote_admin_if_eligible');
              if (rpcData?.success) {
                const { data: refetch } = await client.rpc('get_my_role');
                if (refetch != null && refetch !== '') {
                  const raw = String(refetch).toLowerCase();
                  resolvedRole = (['admin', 'kitchen', 'cashier'] as const).includes(raw as UserRole)
                    ? (raw as UserRole)
                    : resolvedRole;
                }
              }
            } catch {
              // RPC may not exist or fail; keep cashier
            }
          }
        }

        setRole(resolvedRole);
        setRoleLoading(false);
      });

    fetchRole();
  }, [session]);

  const login = useCallback(() => {
    // No-op: LoginForm uses signInWithPassword; onAuthStateChange updates session.
  }, []);

  const logout = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    setSession(null);
    setRole(DEFAULT_ROLE);
  }, []);

  const isLoggedIn = session !== null;

  return (
    <AuthContext.Provider value={{ isLoggedIn, authLoading, role, roleLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
