import React, { useEffect, useMemo, useState } from 'react';
import { Save, RotateCcw, Copy, Check, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { ColorPalette } from '../../theme/siteSettings';

type ThemeRow = {
  id: number;
  colors: ColorPalette;
  color_mode: 'light' | 'dark';
  created_at: string;
  updated_at: string;
};

// Color group definitions for better organization
type ColorGroup = {
  id: string;
  label: string;
  description: string;
  colors: Array<{ key: string; label: string; hint?: string }>;
};

const COLOR_GROUPS: ColorGroup[] = [
  {
    id: 'primary',
    label: 'Primary Colors (Brand)',
    description: 'Main brand colors used across the site',
    colors: [
      { key: 'primary-50', label: 'Lightest', hint: 'Backgrounds' },
      { key: 'primary-100', label: '100', hint: 'Very Light' },
      { key: 'primary-200', label: '200', hint: 'Light' },
      { key: 'primary-300', label: '300' },
      { key: 'primary-400', label: '400' },
      { key: 'primary-500', label: '500', hint: 'Medium' },
      { key: 'primary-600', label: '600' },
      { key: 'primary-700', label: '700', hint: 'Dark' },
      { key: 'primary-800', label: 'Darkest', hint: 'Text & Buttons' },
      { key: 'primary-900', label: 'Very Dark', hint: 'High Contrast' },
    ],
  },
  {
    id: 'secondary',
    label: 'Secondary Colors',
    description: 'Complementary brand colors',
    colors: [
      { key: 'secondary-50', label: 'Lightest' },
      { key: 'secondary-100', label: '100' },
      { key: 'secondary-200', label: '200' },
      { key: 'secondary-300', label: '300' },
      { key: 'secondary-400', label: '400' },
      { key: 'secondary-500', label: '500' },
      { key: 'secondary-600', label: '600' },
      { key: 'secondary-700', label: '700', hint: 'Most Used' },
      { key: 'secondary-800', label: '800' },
      { key: 'secondary-900', label: 'Darkest' },
    ],
  },
  {
    id: 'accent',
    label: 'Accent Colors (Gold/Amber)',
    description: 'Highlight and accent colors for CTAs and emphasis',
    colors: [
      { key: 'accent-50', label: 'Lightest' },
      { key: 'accent-100', label: '100' },
      { key: 'accent-200', label: '200' },
      { key: 'accent-300', label: '300' },
      { key: 'accent-400', label: '400' },
      { key: 'accent-500', label: '500', hint: 'Most Used' },
      { key: 'accent-600', label: '600' },
      { key: 'accent-700', label: '700' },
      { key: 'accent-800', label: '800' },
      { key: 'accent-900', label: 'Darkest' },
    ],
  },
  {
    id: 'backgrounds',
    label: 'Background Colors',
    description: 'Page and section backgrounds',
    colors: [
      { key: 'background-primary', label: 'Primary BG', hint: 'Main pages' },
      { key: 'background-secondary', label: 'Secondary BG', hint: 'Sections' },
      { key: 'background-tertiary', label: 'Tertiary BG', hint: 'Cards' },
      { key: 'background-subtle', label: 'Subtle BG', hint: 'Hover states' },
      { key: 'background-dark', label: 'Dark BG', hint: 'Dark sections' },
    ],
  },
  {
    id: 'text',
    label: 'Text Colors',
    description: 'Text color hierarchy',
    colors: [
      { key: 'text-primary', label: 'Primary Text', hint: 'Main content' },
      { key: 'text-secondary', label: 'Secondary Text', hint: 'Descriptions' },
      { key: 'text-tertiary', label: 'Tertiary Text', hint: 'Hints' },
      { key: 'text-light', label: 'Light Text', hint: 'Disabled' },
      { key: 'text-inverse', label: 'Inverse Text', hint: 'On colored BG' },
      { key: 'text-muted', label: 'Muted Text', hint: 'Subtle' },
    ],
  },
  {
    id: 'buttons',
    label: 'Button Colors',
    description: 'Button and interactive element colors',
    colors: [
      { key: 'button-primary-bg', label: 'Primary Button BG' },
      { key: 'button-primary-bg-hover', label: 'Primary Button Hover' },
      { key: 'button-primary-text', label: 'Primary Button Text' },
      { key: 'button-secondary-bg', label: 'Secondary Button BG' },
      { key: 'button-secondary-bg-hover', label: 'Secondary Button Hover' },
      { key: 'button-secondary-text', label: 'Secondary Button Text' },
      { key: 'button-success-bg', label: 'Success Button' },
      { key: 'button-success-hover', label: 'Success Hover' },
      { key: 'button-danger-bg', label: 'Danger Button' },
      { key: 'button-danger-hover', label: 'Danger Hover' },
      { key: 'button-warning-bg', label: 'Warning Button' },
      { key: 'button-warning-hover', label: 'Warning Hover' },
      { key: 'button-outline-border', label: 'Outline Border' },
      { key: 'button-outline-text', label: 'Outline Text' },
    ],
  },
  {
    id: 'borders',
    label: 'Border Colors',
    description: 'Border and divider colors',
    colors: [
      { key: 'border-light', label: 'Light Border', hint: 'Subtle dividers' },
      { key: 'border-default', label: 'Default Border', hint: 'Standard' },
      { key: 'border-medium', label: 'Medium Border' },
      { key: 'border-dark', label: 'Dark Border', hint: 'Prominent' },
      { key: 'border-primary', label: 'Primary Border', hint: 'Accent' },
      { key: 'border-accent', label: 'Accent Border', hint: 'Highlight' },
    ],
  },
  {
    id: 'status',
    label: 'Status Colors',
    description: 'Success, warning, error, and info colors',
    colors: [
      { key: 'success-light', label: 'Success Light' },
      { key: 'success-main', label: 'Success Main' },
      { key: 'success-dark', label: 'Success Dark' },
      { key: 'warning-light', label: 'Warning Light' },
      { key: 'warning-main', label: 'Warning Main' },
      { key: 'warning-dark', label: 'Warning Dark' },
      { key: 'error-light', label: 'Error Light' },
      { key: 'error-main', label: 'Error Main' },
      { key: 'error-dark', label: 'Error Dark' },
      { key: 'info-light', label: 'Info Light' },
      { key: 'info-main', label: 'Info Main' },
      { key: 'info-dark', label: 'Info Dark' },
    ],
  },
  {
    id: 'effects',
    label: 'Effects & Overlays',
    description: 'Colors for shadows, overlays, and gradients',
    colors: [
      { key: 'hover-overlay', label: 'Hover Overlay' },
      { key: 'focus-ring', label: 'Focus Ring', hint: 'Focus states' },
      { key: 'shadow-color', label: 'Shadow Color' },
      { key: 'gradient-start', label: 'Gradient Start' },
      { key: 'gradient-end', label: 'Gradient End' },
      { key: 'gradient-accent-start', label: 'Accent Gradient Start' },
      { key: 'gradient-accent-end', label: 'Accent Gradient End' },
    ],
  },
];

// Default colors - same as database defaults
const DEFAULT_COLORS: ColorPalette = {
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
  'background-primary': '#ffffff',
  'background-secondary': '#f9fafb',
  'background-tertiary': '#f3f4f6',
  'background-subtle': '#efefef',
  'background-dark': '#1f2937',
  'text-primary': '#111827',
  'text-secondary': '#374151',
  'text-tertiary': '#6b7280',
  'text-light': '#9ca3af',
  'text-inverse': '#ffffff',
  'text-muted': '#d1d5db',
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
  'border-light': '#f3f4f6',
  'border-default': '#e5e7eb',
  'border-medium': '#d1d5db',
  'border-dark': '#9ca3af',
  'border-primary': '#991b1b',
  'border-accent': '#f59e0b',
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
  'hover-overlay': '#00000010',
  'focus-ring': '#3b82f6',
  'shadow-color': '#00000015',
  'gradient-start': '#991b1b',
  'gradient-end': '#7f1d1d',
  'gradient-accent-start': '#f59e0b',
  'gradient-accent-end': '#d97706',
};

const THEME_DEFAULT: ThemeRow = {
  id: 1,
  colors: DEFAULT_COLORS,
  color_mode: 'light',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export default function ComprehensiveThemeEditor() {
  const [banner, setBanner] = useState<string | null>(null);
  const [bannerKind, setBannerKind] = useState<'success' | 'error'>('success');
  const [savingTheme, setSavingTheme] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const [theme, setTheme] = useState<ThemeRow>(THEME_DEFAULT);
  const [activeGroupId, setActiveGroupId] = useState<string>('primary');

  const showSaved = (text = 'Theme saved successfully!') => {
    setBannerKind('success');
    setBanner(text);
    window.setTimeout(() => setBanner(null), 2500);
  };

  const showError = (text: string) => {
    setBannerKind('error');
    setBanner(text);
    window.setTimeout(() => setBanner(null), 5000);
  };

  const errorMessage = (err: unknown) => {
    if (!err) return 'Unknown error';
    if (typeof err === 'string') return err;
    const e = err as any;
    return e?.message || e?.error_description || e?.error || 'Unknown error';
  };

  const activeGroup = useMemo(() => {
    return COLOR_GROUPS.find((g) => g.id === activeGroupId) || COLOR_GROUPS[0];
  }, [activeGroupId]);

  const fetchTheme = async () => {
    const { data } = await supabase
      .from('site_theme')
      .select('id,colors,color_mode,created_at,updated_at')
      .eq('id', 1)
      .maybeSingle();
    if (data) setTheme(data as ThemeRow);
  };

  useEffect(() => {
    fetchTheme();

    const ch = supabase
      .channel('admin-theme-colors')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_theme' }, fetchTheme)
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(ch);
      } catch (e) {
        void e;
      }
    };
  }, []);

  const handleColorChange = (colorKey: string, newColor: string) => {
    setTheme((prev) => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorKey]: newColor,
      },
    }));
  };

  const copyToClipboard = (colorValue: string, colorKey: string) => {
    navigator.clipboard.writeText(colorValue);
    setCopied(colorKey);
    setTimeout(() => setCopied(null), 2000);
  };

  const saveTheme = async () => {
    setSavingTheme(true);
    try {
      const { error } = await supabase
        .from('site_theme')
        .upsert({
          id: 1,
          colors: theme.colors,
          color_mode: theme.color_mode,
        });
      if (error) throw error;
      showSaved('All colors updated! Theme applies instantly across the site.');
    } catch (e) {
      console.warn('[ComprehensiveThemeEditor] saveTheme failed', e);
      showError(`Failed to save theme: ${errorMessage(e)}`);
    } finally {
      setSavingTheme(false);
    }
  };

  const resetToDefaults = async () => {
    if (!confirm('Reset all colors to defaults? This cannot be undone.')) return;
    setSavingTheme(true);
    try {
      const { error } = await supabase
        .from('site_theme')
        .update({
          colors: DEFAULT_COLORS,
        })
        .eq('id', 1);
      if (error) throw error;
      showSaved('Colors reset to defaults');
      fetchTheme();
    } catch (e) {
      showError(`Failed to reset: ${errorMessage(e)}`);
    } finally {
      setSavingTheme(false);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dynamic Theme Manager</h1>
          <p className="text-gray-600 mt-1">
            Manage every color on your website. Changes apply instantly across all pages.
          </p>
        </div>
        <button
          onClick={saveTheme}
          disabled={savingTheme}
          style={{
            backgroundColor: 'var(--color-primary-800)',
            color: 'var(--color-button-primary-text)',
          }}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-medium disabled:opacity-60 transition-colors"
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary-900)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary-800)'}
        >
          <Save className="h-4 w-4" />
          {savingTheme ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>

      {/* Banner */}
      {banner && (
        <div
          className={`rounded-lg p-4 ${
            bannerKind === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          } flex items-center gap-3`}
        >
          {bannerKind === 'success' ? (
            <Check className="h-5 w-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
          )}
          <span>{banner}</span>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden sticky top-20 max-h-[calc(100vh-10rem)]">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 text-sm">Color Groups</h3>
            </div>
            <nav className="space-y-1 p-2 overflow-y-auto max-h-[calc(100vh-15rem)]">
              {COLOR_GROUPS.map((group) => (
                <button
                  key={group.id}
                  onClick={() => setActiveGroupId(group.id)}
                  style={
                    activeGroupId === group.id
                      ? {
                          backgroundColor: 'var(--color-primary-50)',
                          color: 'var(--color-primary-800)',
                        }
                      : {
                          color: 'rgb(55, 65, 81)',
                        }
                  }
                  onMouseEnter={(e) => {
                    if (activeGroupId !== group.id) {
                      e.currentTarget.style.backgroundColor = 'rgb(243, 244, 246)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeGroupId !== group.id) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                >
                  {group.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Editor */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 max-h-[calc(100vh-10rem)] flex flex-col">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{activeGroup.label}</h2>
              <p className="text-gray-600 text-sm mt-1">{activeGroup.description}</p>
            </div>

            {/* Color Editor Grid */}
            <div className="space-y-4 overflow-y-auto flex-1 pr-4">
              {activeGroup.colors.map((colorDef) => {
                const colorValue = theme.colors[colorDef.key] || '#000000';
                const isCopied = copied === colorDef.key;
                return (
                  <div key={colorDef.key} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{colorDef.label}</h4>
                        {colorDef.hint && (
                          <p className="text-xs text-gray-500 mt-0.5">{colorDef.hint}</p>
                        )}
                        <code className="text-xs text-gray-500 font-mono mt-1">
                          {colorDef.key}
                        </code>
                      </div>
                      <button
                        onClick={() => copyToClipboard(colorValue, colorDef.key)}
                        className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors flex items-center gap-1 text-xs"
                      >
                        {isCopied ? (
                          <>
                            <Check className="h-3 w-3" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" /> Copy
                          </>
                        )}
                      </button>
                    </div>

                    {/* Color Input */}
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <input
                          type="color"
                          value={colorValue}
                          onChange={(e) => handleColorChange(colorDef.key, e.target.value)}
                          className="h-12 w-16 rounded cursor-pointer border border-gray-300"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={colorValue}
                          onChange={(e) => handleColorChange(colorDef.key, e.target.value)}
                          placeholder="#000000"
                          style={{
                            borderColor: 'rgb(209, 213, 219)',
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = 'var(--color-primary-500)';
                            e.currentTarget.style.boxShadow = '0 0 0 1px var(--color-primary-500)';
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = 'rgb(209, 213, 219)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                          className="w-full px-3 py-2 rounded border font-mono text-sm outline-none"
                        />
                      </div>
                      <div
                        className="h-12 w-12 rounded border border-gray-300 flex-shrink-0"
                        style={{ backgroundColor: colorValue }}
                        title={`Preview: ${colorValue}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Live Preview Section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Live Preview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <button 
              style={{
                backgroundColor: 'var(--color-primary-800)',
                color: 'var(--color-button-primary-text)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary-900)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary-800)'}
              className="w-full px-4 py-2 rounded font-medium transition-colors"
            >
              Primary Button
            </button>
            <div className="text-xs text-gray-600">Primary Button</div>
          </div>
          <div className="space-y-2">
            <button 
              style={{
                backgroundColor: 'var(--color-accent-500)',
                color: 'var(--color-button-primary-text)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-accent-600)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-accent-500)'}
              className="w-full px-4 py-2 rounded font-medium transition-colors"
            >
              Accent Button
            </button>
            <div className="text-xs text-gray-600">Accent Button</div>
          </div>
          <div className="space-y-2">
            <button 
              style={{
                backgroundColor: 'var(--color-success-main)',
                color: 'var(--color-button-primary-text)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-success-dark)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-success-main)'}
              className="w-full px-4 py-2 rounded font-medium transition-colors"
            >
              Success
            </button>
            <div className="text-xs text-gray-600">Success Status</div>
          </div>
          <div className="space-y-2">
            <button 
              style={{
                backgroundColor: 'var(--color-error-main)',
                color: 'var(--color-button-primary-text)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-error-dark)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-error-main)'}
              className="w-full px-4 py-2 rounded font-medium transition-colors"
            >
              Danger
            </button>
            <div className="text-xs text-gray-600">Danger Status</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={resetToDefaults}
          disabled={savingTheme}
          className="inline-flex items-center gap-2 px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-60 font-medium transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
          Reset to Defaults
        </button>
      </div>
    </div>
  );
}
