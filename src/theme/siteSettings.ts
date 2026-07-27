import { createContext, createElement, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';

// Comprehensive color palette type
export type ColorPalette = Record<string, string>;

export type SiteTheme = {
  colors: ColorPalette;
  color_mode: 'light' | 'dark';
};

export type SiteAsset = {
  key: string;
  public_url: string;
  storage_path: string | null;
  mime: string | null;
  alt: string | null;
};

export type SiteSocialLinks = Record<string, string>;

type SiteSettingsState = {
  theme: SiteTheme;
  assets: Record<string, SiteAsset>;
  social: SiteSocialLinks;
  getColor: (colorKey: string, fallback?: string) => string;
  getAssetUrl: (key: string, fallback?: string) => string;
  getSocialUrl: (key: string) => string;
  getPrimarySocialUrl: () => string;
};

// Default comprehensive color palette
const DEFAULT_COLORS: ColorPalette = {
  // PRIMARY COLORS
  'primary-50': '#fef2f2',
  'primary-100': '#fee2e2',
  'primary-200': '#fecaca',
  'primary-300': '#fca5a5',
  'primary-400': '#f87171',
  'primary-500': '#ef4444',
  'primary-600': '#dc2626',
  'primary-700': '#b91c1c',
  'primary-800': '#991b1b',
  'primary-900': '#7f1d1d',
  
  // SECONDARY COLORS
  'secondary-50': '#faf5f5',
  'secondary-100': '#f5ebeb',
  'secondary-200': '#e8d5d5',
  'secondary-300': '#d4a5a5',
  'secondary-400': '#b87c7c',
  'secondary-500': '#a85555',
  'secondary-600': '#8b3b3b',
  'secondary-700': '#6b2c2c',
  'secondary-800': '#522020',
  'secondary-900': '#3d1616',
  
  // ACCENT COLORS
  'accent-50': '#fffbeb',
  'accent-100': '#fef3c7',
  'accent-200': '#fde68a',
  'accent-300': '#fcd34d',
  'accent-400': '#fbbf24',
  'accent-500': '#f59e0b',
  'accent-600': '#d97706',
  'accent-700': '#b45309',
  'accent-800': '#92400e',
  'accent-900': '#78350f',
  
  // BACKGROUND COLORS
  'background-primary': '#ffffff',
  'background-secondary': '#f9fafb',
  'background-tertiary': '#f3f4f6',
  'background-subtle': '#efefef',
  'background-dark': '#1f2937',
  
  // TEXT COLORS
  'text-primary': '#111827',
  'text-secondary': '#374151',
  'text-tertiary': '#6b7280',
  'text-light': '#9ca3af',
  'text-inverse': '#ffffff',
  'text-muted': '#d1d5db',
  
  // BUTTON COLORS
  'button-primary-bg': '#991b1b',
  'button-primary-bg-hover': '#7f1d1d',
  'button-primary-text': '#ffffff',
  'button-secondary-bg': '#7f1d1d',
  'button-secondary-bg-hover': '#6b1515',
  'button-secondary-text': '#ffffff',
  'button-success-bg': '#10b981',
  'button-success-hover': '#059669',
  'button-danger-bg': '#ef4444',
  'button-danger-hover': '#dc2626',
  'button-warning-bg': '#f59e0b',
  'button-warning-hover': '#d97706',
  'button-outline-border': '#e5e7eb',
  'button-outline-text': '#111827',
  
  // BORDER COLORS
  'border-light': '#f3f4f6',
  'border-default': '#e5e7eb',
  'border-medium': '#d1d5db',
  'border-dark': '#9ca3af',
  'border-primary': '#991b1b',
  'border-accent': '#f59e0b',
  
  // STATUS COLORS
  'success-light': '#d1fae5',
  'success-main': '#10b981',
  'success-dark': '#047857',
  'warning-light': '#fef3c7',
  'warning-main': '#f59e0b',
  'warning-dark': '#d97706',
  'error-light': '#fee2e2',
  'error-main': '#ef4444',
  'error-dark': '#dc2626',
  'info-light': '#dbeafe',
  'info-main': '#3b82f6',
  'info-dark': '#1d4ed8',
  
  // HOVER & INTERACTION STATES
  'hover-overlay': '#00000010',
  'focus-ring': '#3b82f6',
  'shadow-color': '#00000015',
  
  // GRADIENT COLORS
  'gradient-start': '#991b1b',
  'gradient-end': '#7f1d1d',
  'gradient-accent-start': '#f59e0b',
  'gradient-accent-end': '#d97706',
};

const DEFAULT_THEME: SiteTheme = {
  colors: DEFAULT_COLORS,
  color_mode: 'light',
};

const DEFAULT_SOCIAL: SiteSocialLinks = {};

const SiteSettingsContext = createContext<SiteSettingsState | null>(null);

async function fetchTheme(): Promise<SiteTheme> {
  const { data, error } = await supabase
    .from('site_theme')
    .select('colors,color_mode')
    .eq('id', 1)
    .maybeSingle();
  
  if (error || !data) return DEFAULT_THEME;
  
  // Merge database colors with defaults (fallback for any missing colors)
  const colors = typeof data.colors === 'object' && data.colors !== null
    ? { ...DEFAULT_COLORS, ...data.colors }
    : DEFAULT_COLORS;
  
  const theme: SiteTheme = {
    colors,
    color_mode: data.color_mode || 'light',
  };
  
  return theme;
}

async function fetchAssets(): Promise<Record<string, SiteAsset>> {
  const { data, error } = await supabase
    .from('site_assets')
    .select('key,public_url,storage_path,mime,alt');
  if (error || !data) return {};
  const map: Record<string, SiteAsset> = {};
  for (const row of data as SiteAsset[]) {
    map[row.key] = row;
  }
  return map;
}

async function fetchSocialLinks(): Promise<SiteSocialLinks> {
  const { data, error } = await supabase
    .from('site_settings')
    .select('social_links')
    .eq('id', 'default')
    .maybeSingle();
  if (error || !data) return DEFAULT_SOCIAL;
  const raw = (data as { social_links?: unknown }).social_links;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return DEFAULT_SOCIAL;
  const out: SiteSocialLinks = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof v === 'string') {
      const key = (k || '').trim().toLowerCase();
      const val = v.trim();
      if (key) out[key] = val;
    }
  }
  return out;
}

function normalizeUrl(url: string): string {
  const u = (url || '').trim();
  if (!u) return '';
  if (u.startsWith('http://') || u.startsWith('https://')) return u;
  return `https://${u}`;
}

function cacheThemeColors(colors: ColorPalette) {
  // Cache theme colors in localStorage for instant loading on next page load
  try {
    localStorage.setItem('site_theme_cache', JSON.stringify(colors));
  } catch (e) {
    // Silently fail if localStorage is full or unavailable
  }
}

function applyThemeToDom(theme: SiteTheme) {
  const root = document.documentElement;
  
  // Cache the theme colors for instant loading on next page load
  cacheThemeColors(theme.colors);
  
  // Apply all colors as CSS custom properties
  if (theme.colors) {
    for (const [key, value] of Object.entries(theme.colors)) {
      if (typeof value === 'string') {
        // Convert color keys to CSS variable format: primary-800 -> --color-primary-800
        const cssVarName = `--color-${key}`;
        root.style.setProperty(cssVarName, value);
      }
    }
  }
  
  // Legacy CSS variables for backward compatibility
  root.style.setProperty('--brand', theme.colors['primary-800'] || '#991b1b');
  root.style.setProperty('--brand-2', theme.colors['secondary-800'] || '#7f1d1d');
  root.style.setProperty('--accent', theme.colors['accent-500'] || '#f59e0b');
  root.style.setProperty('--site-bg', theme.colors['background-primary'] || '#ffffff');
  root.style.setProperty('--site-text', theme.colors['text-primary'] || '#111827');
  
  // Apply color mode class for dark theme support in future
  if (theme.color_mode === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

function applyFaviconToDom(url: string, mime?: string | null) {
  const href = (url || '').trim();
  if (!href) return;

  const type = (mime || '').trim() || 'image/png';

  const head = document.head;
  const existingById = head.querySelector<HTMLLinkElement>('link#site-favicon');
  const existing = existingById || head.querySelector<HTMLLinkElement>('link[rel~="icon"]');
  const link = existing || document.createElement('link');
  link.rel = 'icon';
  link.type = type;
  link.href = href;
  if (!link.id) link.id = 'site-favicon';
  if (!existing) head.appendChild(link);
 }

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<SiteTheme>(DEFAULT_THEME);
  const [assets, setAssets] = useState<Record<string, SiteAsset>>({});
  const [social, setSocial] = useState<SiteSocialLinks>(DEFAULT_SOCIAL);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const [t, a, s] = await Promise.all([fetchTheme(), fetchAssets(), fetchSocialLinks()]);
      if (!mounted) return;
      setTheme(t);
      setAssets(a);
      setSocial(s);
      applyThemeToDom(t);
      applyFaviconToDom(a.favicon?.public_url || '', a.favicon?.mime);
    };
    load();

    const chTheme = supabase
      .channel('realtime-site-theme')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_theme' }, async () => {
        const t = await fetchTheme();
        if (!mounted) return;
        setTheme(t);
        applyThemeToDom(t);
      })
      .subscribe();

    const chAssets = supabase
      .channel('realtime-site-assets')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_assets' }, async () => {
        const a = await fetchAssets();
        if (!mounted) return;
        setAssets(a);
        applyFaviconToDom(a.favicon?.public_url || '', a.favicon?.mime);
      })
      .subscribe();

    const chSettings = supabase
      .channel('realtime-site-settings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, async () => {
        const s = await fetchSocialLinks();
        if (!mounted) return;
        setSocial(s);
      })
      .subscribe();

    return () => {
      mounted = false;
      try {
        supabase.removeChannel(chTheme);
      } catch (e) {
        void e;
      }
      try {
        supabase.removeChannel(chAssets);
      } catch (e) {
        void e;
      }
      try {
        supabase.removeChannel(chSettings);
      } catch (e) {
        void e;
      }
    };
  }, []);

  const value = useMemo<SiteSettingsState>(() => {
    const getSocialUrlAliased = (key: string) => {
      const k = (key || '').trim().toLowerCase();
      if (!k) return '';
      const candidates = [
        k,
        `${k}_url`,
        k === 'twitter' ? 'x' : '',
        k === 'x' ? 'twitter' : '',
      ].filter(Boolean);
      for (const c of candidates) {
        const u = normalizeUrl(social[c] || '');
        if (u) return u;
      }
      return '';
    };

    const getColorValue = (colorKey: string, fallback?: string): string => {
      const key = (colorKey || '').trim().toLowerCase();
      if (!key) return fallback || '#000000';
      const color = theme.colors?.[key];
      return color || fallback || '#000000';
    };

    return {
      theme,
      assets,
      social,
      getColor: getColorValue,
      getAssetUrl: (key: string, fallback?: string) => {
        const url = assets[key]?.public_url;
        return url || fallback || '';
      },
      getSocialUrl: (key: string) => getSocialUrlAliased(key),
      getPrimarySocialUrl: () => {
        const priority = ['facebook', 'instagram', 'youtube', 'tiktok', 'twitter', 'linkedin', 'whatsapp', 'telegram', 'website'];
        for (const k of priority) {
          const u = getSocialUrlAliased(k);
          if (u) return u;
        }
        return '';
      },
    };
  }, [theme, assets, social]);

  return createElement(SiteSettingsContext.Provider, { value }, children);
}

export function useSiteSettings() {
  const ctx = useContext(SiteSettingsContext);
  if (!ctx) {
    return {
      theme: DEFAULT_THEME,
      assets: {},
      social: DEFAULT_SOCIAL,
      getColor: (colorKey: string, fallback?: string) => fallback || '#000000',
      getAssetUrl: (_key: string, fallback?: string) => fallback || '',
      getSocialUrl: (_key: string) => '',
      getPrimarySocialUrl: () => '',
    } as SiteSettingsState;
  }
  return ctx;
}
