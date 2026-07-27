import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabasePasswordLogin, supabaseGetUser, supabaseGetUserLogin, supabaseUpsertUserLogin } from '../admin/services/supabaseAuth';
import { supabase } from '../lib/supabase';

type PublicUser = {
  id: string;
  email: string | null;
  name: string;
  firstName?: string;
  lastName?: string;
};

type Ctx = {
  user: PublicUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const UserAuthContext = createContext<Ctx | undefined>(undefined);

export const UserAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('user_token'));
  const [refreshToken, setRefreshToken] = useState<string | null>(() => localStorage.getItem('user_refresh_token'));
  const [user, setUser] = useState<PublicUser | null>(() => {
    const raw = localStorage.getItem('user_profile');
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (token) localStorage.setItem('user_token', token); else localStorage.removeItem('user_token');
    if (refreshToken) localStorage.setItem('user_refresh_token', refreshToken); else localStorage.removeItem('user_refresh_token');
  }, [token]);

  useEffect(() => {
    // Keep supabase-js session in sync when we have both tokens
    if (token && refreshToken) {
      try { void supabase.auth.setSession({ access_token: token, refresh_token: refreshToken }); } catch {}
    }
  }, [token, refreshToken]);

  useEffect(() => {
    if (user) localStorage.setItem('user_profile', JSON.stringify(user)); else localStorage.removeItem('user_profile');
  }, [user]);

  const login = async (email: string, password: string) => {
    const res = await supabasePasswordLogin(email, password);
    setToken(res.access_token);
    setRefreshToken(res.refresh_token);
    try { await supabase.auth.setSession({ access_token: res.access_token, refresh_token: res.refresh_token }); } catch {}
    const sUser = await supabaseGetUser(res.access_token);
    // Prefer data from user_login table
    let dbLogin = await supabaseGetUserLogin(res.access_token, sUser.id);
    if (!dbLogin) {
      const pendingRaw = localStorage.getItem('pending_user_login');
      if (pendingRaw) {
        try {
          const pending = JSON.parse(pendingRaw) as { firstName?: string; lastName?: string; loginType?: 'parent'|'staff'|'student' };
          await supabaseUpsertUserLogin(res.access_token, {
            id: sUser.id,
            first_name: pending.firstName,
            last_name: pending.lastName,
            login_type: pending.loginType,
            child_id: null,
          });
          localStorage.removeItem('pending_user_login');
          dbLogin = await supabaseGetUserLogin(res.access_token, sUser.id);
        } catch {}
      }
    }
    const firstName = (dbLogin?.first_name || undefined) as string | undefined;
    const lastName = (dbLogin?.last_name || undefined) as string | undefined;
    const name = [firstName, lastName].filter(Boolean).join(' ') || (sUser.email || 'User');
    const loginType = dbLogin?.login_type as 'parent' | 'staff' | 'student' | undefined;
    const profile: PublicUser = { id: sUser.id, email: sUser.email, name, firstName, lastName };
    setUser(profile);
    // Upsert user_login table for convenience
    try { await supabaseUpsertUserLogin(res.access_token, { id: sUser.id, first_name: firstName, last_name: lastName, login_type: loginType, child_id: null }); } catch {}
  };

  const logout = () => {
    try { void supabase.auth.signOut(); } catch {}
    setToken(null);
    setRefreshToken(null);
    setUser(null);
  };

  const value = useMemo(() => ({ user, token, login, logout }), [user, token]);
  return <UserAuthContext.Provider value={value}>{children}</UserAuthContext.Provider>;
};

export const useUserAuth = () => {
  const ctx = useContext(UserAuthContext);
  if (!ctx) throw new Error('useUserAuth must be used within UserAuthProvider');
  return ctx;
};
