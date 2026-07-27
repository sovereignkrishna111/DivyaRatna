import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { setAccessToken } from '../services/api';
import { supabasePasswordLogin, supabaseGetUser, supabaseSignOut } from '../services/supabaseAuth';
import { supabase } from '../../lib/supabase';

type Role = 'superadmin' | 'admin' | 'editor';

type AdminUser = {
  id: string;
  name: string;
  role: Role;
};

type AuthContextType = {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: Role[]) => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('admin_token'));
  const [refreshToken, setRefreshToken] = useState<string | null>(() => localStorage.getItem('admin_refresh_token'));
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(() => {
    const raw = localStorage.getItem('admin_user');
    return raw ? JSON.parse(raw) : null;
  });

  const isAuthenticated = Boolean(token && refreshToken);

  useEffect(() => {
    // keep http client in sync
    setAccessToken(token || null);
    if (token) localStorage.setItem('admin_token', token); else localStorage.removeItem('admin_token');
    if (refreshToken) localStorage.setItem('admin_refresh_token', refreshToken); else localStorage.removeItem('admin_refresh_token');

    // Ensure supabase-js has an authenticated session for RLS-protected tables.
    // This is async; while it's running, we should consider auth "not ready".
    setReady(false);
    const applySession = async () => {
      try {
        // Treat partial auth state as logged out; prevents stale access tokens from granting entry.
        if ((token && !refreshToken) || (!token && refreshToken)) {
          setToken(null);
          setRefreshToken(null);
          setUser(null);
          await supabase.auth.signOut();
          return;
        }

        if (token && refreshToken) {
          const { error } = await supabase.auth.setSession({ access_token: token, refresh_token: refreshToken });
          if (error) throw error;
        } else {
          await supabase.auth.signOut();
        }
      } catch (e) {
        void e;
        try {
          await supabase.auth.signOut();
        } catch (e2) {
          void e2;
        }
        setToken(null);
        setRefreshToken(null);
        setUser(null);
      } finally {
        setReady(true);
      }
    };
    applySession();
  }, [token, refreshToken]);

  useEffect(() => {
    if (user) localStorage.setItem('admin_user', JSON.stringify(user));
    else localStorage.removeItem('admin_user');
  }, [user]);

  const login = async (email: string, password: string) => {
    if (!email || !password) throw new Error('Email and password required');
    try {
      const res = await supabasePasswordLogin(email, password);
      // Apply the session immediately so subsequent admin page loads / storage ops don't hit
      // "Auth session missing!" before the effect runs.
      const { error: sessErr } = await supabase.auth.setSession({
        access_token: res.access_token,
        refresh_token: res.refresh_token,
      });
      if (sessErr) throw sessErr;
      setToken(res.access_token);
      setRefreshToken(res.refresh_token);
      // Fetch latest user to access metadata
      const sUser = await supabaseGetUser(res.access_token);
      const role = (sUser.user_metadata?.role as Role) || 'editor';
      const name = (sUser.user_metadata?.name as string) || (sUser.email || 'Admin');
      setUser({ id: sUser.id, name, role });
      // record login activity
      try {
        const key = 'admin_login_activities';
        const raw = localStorage.getItem(key);
        const list = raw ? (JSON.parse(raw) as unknown[]) : [];
        list.unshift({
          id: `${Date.now()}`,
          time: new Date().toISOString(),
          email: sUser.email,
          userId: sUser.id,
          name,
        });
        // keep only last 50
        localStorage.setItem(key, JSON.stringify(list.slice(0, 50)));
      } catch (e) {
        void e;
      }
    } catch (e) {
      // enforce real auth: surface backend error
      const err = e as { message?: string };
      throw new Error(err?.message || 'Login failed');
    }
  };

  const logout = async () => {
    try {
      if (token) await supabaseSignOut(token);
    } catch (e) {
      void e;
    }
    setToken(null);
    setRefreshToken(null);
    setUser(null);
  };

  const hasRole = (...roles: Role[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const value = useMemo(() => ({ user, token, isAuthenticated, ready, login, logout, hasRole }), [user, token, isAuthenticated, ready, login, logout, hasRole]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAdminAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
};
