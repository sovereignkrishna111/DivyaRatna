const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY as string;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // eslint-disable-next-line no-console
  console.warn('Supabase env missing: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
}

// ===== user_login table helpers =====
export type UserLoginRow = {
  id: string;
  login_type: 'parent' | 'staff' | 'student' | null;
  first_name: string | null;
  last_name: string | null;
  child_id: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export async function supabaseUpsertUserLogin(accessToken: string, row: {
  id: string;
  login_type?: 'parent' | 'staff' | 'student';
  first_name?: string | undefined;
  last_name?: string | undefined;
  child_id?: string | null;
}): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/user_login`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates',
    },
    body: JSON.stringify([{ ...row, updated_at: new Date().toISOString() }]),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    // eslint-disable-next-line no-console
    console.warn('user_login upsert failed', text || res.status);
  }
}

export async function supabaseGetUserLogin(accessToken: string, id: string): Promise<UserLoginRow | null> {
  const url = `${SUPABASE_URL}/rest/v1/user_login?select=*&id=eq.${encodeURIComponent(id)}&limit=1`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${accessToken}`,
    }
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    // eslint-disable-next-line no-console
    console.warn('user_login fetch failed', text || res.status);
    return null;
  }
  const rows = await res.json();
  return Array.isArray(rows) && rows.length ? rows[0] as UserLoginRow : null;
}

export type ProfileRow = {
  id: string;
  login_type: 'parent' | 'staff' | 'student' | null;
  first_name: string | null;
  last_name: string | null;
  child_id: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export async function supabaseGetProfile(accessToken: string, id: string): Promise<ProfileRow | null> {
  const url = `${SUPABASE_URL}/rest/v1/profiles?select=*&id=eq.${encodeURIComponent(id)}&limit=1`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${accessToken}`,
    }
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    // eslint-disable-next-line no-console
    console.warn('Profile fetch failed', text || res.status);
    return null;
  }
  const rows = await res.json();
  return Array.isArray(rows) && rows.length ? rows[0] as ProfileRow : null;
}

export type SupabaseUser = {
  id: string;
  email: string | null;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
};

export type SupabaseLoginResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: SupabaseUser;
};

export type SupabaseSignUpInput = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  loginType?: 'parent' | 'staff' | 'student';
};

export async function supabaseSignUp(input: SupabaseSignUpInput): Promise<SupabaseUser> {
  const { email, password } = input;
  const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Supabase signup failed (${res.status})`);
  }
  const json = await res.json();
  // Response includes 'user' object when email confirmation is optional; align to expected return
  return (json?.user as SupabaseUser) || json;
}

export async function supabasePasswordLogin(email: string, password: string): Promise<SupabaseLoginResponse> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Supabase login failed (${res.status})`);
  }
  return res.json();
}

export async function supabaseGetUser(accessToken: string): Promise<SupabaseUser> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    method: 'GET',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${accessToken}`,
    }
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Supabase user fetch failed (${res.status})`);
  }
  return res.json();
}

export async function supabaseSignOut(accessToken: string): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${accessToken}`,
    }
  });
  if (!res.ok) {
    // logout failures are non-fatal in the client; swallow error
    // eslint-disable-next-line no-console
    console.warn('Supabase logout failed');
  }
}

// Lightweight profile upsert helper using Supabase REST
// Table: profiles (id uuid primary key, email text, first_name text, last_name text, full_name text, created_at timestamptz default now())
export async function supabaseUpsertProfile(accessToken: string, row: {
  id: string;
  login_type?: 'parent' | 'staff' | 'student';
  first_name?: string | undefined;
  last_name?: string | undefined;
  child_id?: string | null;
}): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates',
    },
    body: JSON.stringify([{ ...row, updated_at: new Date().toISOString() }]),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    // non-fatal for client; log quietly
    // eslint-disable-next-line no-console
    console.warn('Profile upsert failed', text || res.status);
  }
}
