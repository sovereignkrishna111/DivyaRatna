import React, { useEffect, useMemo, useState } from 'react';
import { Image as ImageIcon, Palette, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';

type ThemeRow = {
  id: number;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
};

type AssetRow = {
  key: string;
  public_url: string;
  storage_path: string | null;
  mime: string | null;
  alt: string | null;
};

const THEME_DEFAULT: ThemeRow = {
  id: 1,
  primary_color: '#991b1b',
  secondary_color: '#7f1d1d',
  accent_color: '#f59e0b',
  background_color: '#ffffff',
  text_color: '#111827',
};

type AssetKeyDef = { key: string; label: string; hint: string };

type AssetGroup = {
  id: string;
  label: string;
  items: AssetKeyDef[];
};

const ASSET_GROUPS: AssetGroup[] = [
  {
    id: 'global',
    label: 'Global',
    items: [
      { key: 'logo', label: 'Site Logo', hint: 'Header logo image' },
      { key: 'favicon', label: 'Favicon', hint: 'Browser tab / URL bar icon' },
    ],
  },
  {
    id: 'home',
    label: 'Home',
    items: [
      { key: 'hero_1', label: 'Hero Slide 1', hint: 'Homepage hero background' },
      { key: 'hero_2', label: 'Hero Slide 2', hint: 'Homepage hero background' },
      { key: 'hero_3', label: 'Hero Slide 3', hint: 'Homepage hero background' },
      { key: 'home_cta_bg', label: 'CTA Background', hint: 'Homepage CTA fixed background image' },
      { key: 'about_image', label: 'About Section Image', hint: 'Homepage about section image' },
      { key: 'explore_bg', label: 'Explore Section Background', hint: 'Background image behind explore section' },
      { key: 'program_1', label: 'Program Image 1', hint: 'Programs section card image' },
      { key: 'program_2', label: 'Program Image 2', hint: 'Programs section card image' },
      { key: 'program_3', label: 'Program Image 3', hint: 'Programs section card image' },
      { key: 'program_4', label: 'Program Image 4', hint: 'Programs section card image' },
      { key: 'testimonial_1', label: 'Testimonial Image 1', hint: 'Homepage testimonials avatar image' },
      { key: 'testimonial_2', label: 'Testimonial Image 2', hint: 'Homepage testimonials avatar image' },
      { key: 'testimonial_3', label: 'Testimonial Image 3', hint: 'Homepage testimonials avatar image' },
    ],
  },
  {
    id: 'about_us',
    label: 'About Us (About)',
    items: [
      { key: 'about_hero', label: 'About Us Hero', hint: 'About page header background image' },
      { key: 'about_feature_image', label: 'About Feature Image', hint: 'About page featured content image' },
    ],
  },
  {
    id: 'accreditation',
    label: 'Accreditation (About)',
    items: [
      { key: 'accreditation_hero', label: 'Accreditation Hero', hint: 'Accreditation page header background image' },
      { key: 'accreditation_feature_image', label: 'Accreditation Feature Image', hint: 'Accreditation page content image' },
    ],
  },
  {
    id: 'strategic_framework',
    label: 'Strategic Framework (About)',
    items: [
      { key: 'strategic_framework_hero', label: 'Strategic Framework Hero', hint: 'Strategic Framework page header background image' },
    ],
  },
  {
    id: 'governance',
    label: 'Governance (About)',
    items: [
      { key: 'governance_hero', label: 'Governance Hero', hint: 'Governance page header background image' },
      { key: 'governance_member_1', label: 'Board Member 1', hint: 'Governance page board member avatar' },
      { key: 'governance_member_2', label: 'Board Member 2', hint: 'Governance page board member avatar' },
      { key: 'governance_member_3', label: 'Board Member 3', hint: 'Governance page board member avatar' },
      { key: 'governance_member_4', label: 'Board Member 4', hint: 'Governance page board member avatar' },
    ],
  },
  {
    id: 'school_profile',
    label: 'School Profile (About)',
    items: [
      { key: 'school_profile_hero', label: 'School Profile Hero', hint: 'School Profile page header background image' },
      { key: 'school_profile_image', label: 'School Profile Image', hint: 'School Profile page content image' },
    ],
  },
  {
    id: 'mission',
    label: 'Mission',
    items: [{ key: 'mission_hero', label: 'Mission Hero', hint: 'Mission page header background image' }],
  },
  {
    id: 'facilities',
    label: 'Facilities',
    items: [
      { key: 'facilities_hero', label: 'Facilities Hero', hint: 'Facilities page header background image' },
      { key: 'facilities_1', label: 'Facility Image 1', hint: 'Facilities page content image' },
      { key: 'facilities_2', label: 'Facility Image 2', hint: 'Facilities page content image' },
      { key: 'facilities_3', label: 'Facility Image 3', hint: 'Facilities page content image' },
      { key: 'facilities_4', label: 'Facility Image 4', hint: 'Facilities page content image' },
      { key: 'facilities_5', label: 'Facility Image 5', hint: 'Facilities page content image' },
      { key: 'facilities_6', label: 'Facility Image 6', hint: 'Facilities page content image' },
      { key: 'facilities_7', label: 'Facility Image 7', hint: 'Facilities page content image' },
      { key: 'facilities_8', label: 'Facility Image 8', hint: 'Facilities page content image' },
    ],
  },
  {
    id: 'faculty',
    label: 'Faculty',
    items: [
      { key: 'faculty_hero', label: 'Faculty Hero', hint: 'Faculty page header background image' },
      { key: 'faculty_member_1', label: 'Faculty Member 1', hint: 'Faculty page member avatar' },
      { key: 'faculty_member_2', label: 'Faculty Member 2', hint: 'Faculty page member avatar' },
      { key: 'faculty_member_3', label: 'Faculty Member 3', hint: 'Faculty page member avatar' },
      { key: 'faculty_member_4', label: 'Faculty Member 4', hint: 'Faculty page member avatar' },
      { key: 'faculty_member_5', label: 'Faculty Member 5', hint: 'Faculty page member avatar' },
      { key: 'faculty_member_6', label: 'Faculty Member 6', hint: 'Faculty page member avatar' },
      { key: 'faculty_image', label: 'Faculty Image', hint: 'Faculty page content image' },
    ],
  },
  {
    id: 'academics',
    label: 'Academics',
    items: [
      { key: 'academics_hero', label: 'Academics Hero', hint: 'Academics page header background image' },
      { key: 'academics_program_1', label: 'Program Image 1', hint: 'Academics page program image (Elementary)' },
      { key: 'academics_program_2', label: 'Program Image 2', hint: 'Academics page program image (Middle School)' },
      { key: 'academics_program_3', label: 'Program Image 3', hint: 'Academics page program image (High School)' },
    ],
  },
  {
    id: 'services',
    label: 'Services',
    items: [
      { key: 'services_hero', label: 'Services Hero', hint: 'Services page header background image' },
      { key: 'services_1', label: 'Service Image 1', hint: 'Services page content image' },
      { key: 'services_2', label: 'Service Image 2', hint: 'Services page content image' },
      { key: 'services_3', label: 'Service Image 3', hint: 'Services page content image' },
      { key: 'services_4', label: 'Service Image 4', hint: 'Services page content image' },
      { key: 'services_5', label: 'Service Image 5', hint: 'Services page content image' },
      { key: 'services_6', label: 'Service Image 6', hint: 'Services page content image' },
      { key: 'services_7', label: 'Service Image 7', hint: 'Services page content image' },
      { key: 'services_8', label: 'Service Image 8', hint: 'Services page content image' },
      { key: 'services_image', label: 'Services Image', hint: 'Services page content image' },
    ],
  },
  {
    id: 'community',
    label: 'Community',
    items: [
      { key: 'community_hero', label: 'Community Hero', hint: 'Community page header background image' },
      { key: 'community_event_1', label: 'Event Image 1', hint: 'Community page event image' },
      { key: 'community_event_2', label: 'Event Image 2', hint: 'Community page event image' },
      { key: 'community_event_3', label: 'Event Image 3', hint: 'Community page event image' },
      { key: 'community_testimonial_1', label: 'Testimonial Image 1', hint: 'Community page testimonial avatar' },
      { key: 'community_testimonial_2', label: 'Testimonial Image 2', hint: 'Community page testimonial avatar' },
      { key: 'community_testimonial_3', label: 'Testimonial Image 3', hint: 'Community page testimonial avatar' },
    ],
  },
  {
    id: 'careers',
    label: 'Careers',
    items: [
      { key: 'work_at_dress_hero', label: 'Work at DRESS Hero', hint: 'Work at DRESS page header background image' },
      { key: 'work_at_dress_testimonial_1', label: 'Work at DRESS Testimonial 1', hint: 'Work at DRESS page testimonial avatar image' },
      { key: 'work_at_dress_testimonial_2', label: 'Work at DRESS Testimonial 2', hint: 'Work at DRESS page testimonial avatar image' },
      { key: 'work_at_dress_testimonial_3', label: 'Work at DRESS Testimonial 3', hint: 'Work at DRESS page testimonial avatar image' },
    ],
  },
];

function extFromFilename(name: string) {
  const idx = name.lastIndexOf('.');
  if (idx === -1) return '';
  return name.slice(idx + 1).toLowerCase();
}

export default function ThemeMedia() {
  const [banner, setBanner] = useState<string | null>(null);
  const [bannerKind, setBannerKind] = useState<'success' | 'error'>('success');
  const [savingTheme, setSavingTheme] = useState(false);

  const [theme, setTheme] = useState<ThemeRow>(THEME_DEFAULT);
  const [assets, setAssets] = useState<Record<string, AssetRow>>({});
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [activeHomeGroupId, setActiveHomeGroupId] = useState<string>('home');
  const [activeAboutGroupId, setActiveAboutGroupId] = useState<string>('about_us');
  const [activeServicesGroupId, setActiveServicesGroupId] = useState<string>('services');
  const [activeCommunityGroupId, setActiveCommunityGroupId] = useState<string>('community');
  const [activeCareersGroupId, setActiveCareersGroupId] = useState<string>('careers');

  const showSaved = (text = 'Saved') => {
    setBannerKind('success');
    setBanner(text);
    window.setTimeout(() => setBanner(null), 2500);
  };

  const groupById = useMemo(() => {
    const map: Record<string, AssetGroup> = {};
    for (const g of ASSET_GROUPS) map[g.id] = g;
    return map;
  }, []);

  const homeGroups = useMemo(() => {
    return ['global', 'home'].map((id) => groupById[id]).filter(Boolean);
  }, [groupById]);

  const aboutGroups = useMemo(() => {
    return [
      'about_us',
      'mission',
      'accreditation',
      'strategic_framework',
      'governance',
      'faculty',
      'facilities',
      'school_profile',
    ]
      .map((id) => groupById[id])
      .filter(Boolean);
  }, [groupById]);

  const servicesGroups = useMemo(() => {
    return ['services'].map((id) => groupById[id]).filter(Boolean);
  }, [groupById]);

  const communityGroups = useMemo(() => {
    return ['community'].map((id) => groupById[id]).filter(Boolean);
  }, [groupById]);

  const careersGroups = useMemo(() => {
    return ['careers'].map((id) => groupById[id]).filter(Boolean);
  }, [groupById]);

  const activeHomeGroup = useMemo(() => {
    return groupById[activeHomeGroupId] || groupById.home || homeGroups[0];
  }, [activeHomeGroupId, groupById, homeGroups]);

  const activeAboutGroup = useMemo(() => {
    return groupById[activeAboutGroupId] || groupById.about_us || aboutGroups[0];
  }, [activeAboutGroupId, groupById, aboutGroups]);

  const activeServicesGroup = useMemo(() => {
    return groupById[activeServicesGroupId] || groupById.services || servicesGroups[0];
  }, [activeServicesGroupId, groupById, servicesGroups]);

  const activeCommunityGroup = useMemo(() => {
    return groupById[activeCommunityGroupId] || groupById.community || communityGroups[0];
  }, [activeCommunityGroupId, groupById, communityGroups]);

  const activeCareersGroup = useMemo(() => {
    return groupById[activeCareersGroupId] || groupById.careers || careersGroups[0];
  }, [activeCareersGroupId, groupById, careersGroups]);

  const showError = (text: string) => {
    setBannerKind('error');
    setBanner(text);
    window.setTimeout(() => setBanner(null), 5000);
  };

  const errorMessage = (err: unknown) => {
    if (!err) return 'Unknown error';
    if (typeof err === 'string') return err;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const e = err as any;
    return e?.message || e?.error_description || e?.error || 'Unknown error';
  };

  const fetchTheme = async () => {
    const { data } = await supabase
      .from('site_theme')
      .select('id,primary_color,secondary_color,accent_color,background_color,text_color')
      .eq('id', 1)
      .maybeSingle();
    if (data) setTheme(data as ThemeRow);
  };

  const fetchAssets = async () => {
    const { data } = await supabase
      .from('site_assets')
      .select('key,public_url,storage_path,mime,alt');
    const map: Record<string, AssetRow> = {};
    for (const row of (data as AssetRow[]) || []) map[row.key] = row;
    setAssets(map);
  };

  useEffect(() => {
    fetchTheme();
    fetchAssets();

    const chTheme = supabase
      .channel('admin-theme')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_theme' }, fetchTheme)
      .subscribe();

    const chAssets = supabase
      .channel('admin-assets')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_assets' }, fetchAssets)
      .subscribe();

    return () => {
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
    };
  }, []);

  const previewStyle = useMemo(() => {
    return {
      backgroundColor: theme.background_color,
      color: theme.text_color,
      borderColor: 'rgba(0,0,0,0.08)',
    } as React.CSSProperties;
  }, [theme.background_color, theme.text_color]);

  const saveTheme = async () => {
    setSavingTheme(true);
    try {
      const { error } = await supabase
        .from('site_theme')
        .upsert({
          id: 1,
          primary_color: theme.primary_color,
          secondary_color: theme.secondary_color,
          accent_color: theme.accent_color,
          background_color: theme.background_color,
          text_color: theme.text_color,
        });
      if (error) throw error;
      showSaved('Theme saved (applies instantly)');
    } catch (e) {
      console.warn('[ThemeMedia] saveTheme failed', e);
      showError(`Failed to save theme: ${errorMessage(e)}`);
    } finally {
      setSavingTheme(false);
    }
  };

  const renderGroupItems = (group: AssetGroup) => {
    if (group.items.length === 0) {
      return (
        <div className="text-sm text-gray-600 border rounded-lg p-4 bg-gray-50">
          No image slots are configured yet for this page.
        </div>
      );
    }

    return (
      <div className="max-h-[540px] overflow-y-auto pr-2">
        <div className="space-y-4">
          {group.items.map((a) => {
          const row = assets[a.key];
          const url = row?.public_url || '';
          const isUploading = uploadingKey === a.key;
          return (
            <div key={a.key} className="border rounded-lg p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="font-medium text-gray-900">{a.label}</div>
                  <div className="text-xs text-gray-500">Key: {a.key} · {a.hint}</div>
                </div>

                <label className="inline-flex items-center justify-center px-4 py-2 rounded bg-maroon-700 text-white text-sm cursor-pointer hover:bg-maroon-800 disabled:opacity-60 whitespace-nowrap min-w-[140px] leading-none">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={!!uploadingKey}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      uploadAsset(a.key, file);
                      e.target.value = '';
                    }}
                  />
                  {isUploading ? 'Uploading...' : 'Upload / Replace'}
                </label>
              </div>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">
                <div className="sm:col-span-1">
                  <div className="text-xs text-gray-500 mb-1">Current</div>
                  {url ? (
                    <img src={url} alt={row?.alt || a.label} className="w-full h-24 object-cover rounded border" />
                  ) : (
                    <div className="w-full h-24 rounded border flex items-center justify-center text-xs text-gray-400">Not set</div>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">Alt text</label>
                  <input
                    value={row?.alt || ''}
                    onChange={(e) =>
                      setAssets((prev) => ({
                        ...prev,
                        [a.key]: {
                          key: a.key,
                          public_url: prev[a.key]?.public_url || '',
                          storage_path: prev[a.key]?.storage_path || null,
                          mime: prev[a.key]?.mime || null,
                          alt: e.target.value,
                        },
                      }))
                    }
                    onBlur={(e) => updateAlt(a.key, e.target.value)}
                    className="w-full rounded border border-gray-200 px-3 py-2 text-sm"
                    placeholder="Describe the image (for accessibility)"
                  />
                  {url && (
                    <div className="mt-1 text-[11px] text-gray-500 break-all">{url}</div>
                  )}
                </div>
              </div>
            </div>
          );
          })}
        </div>
      </div>
    );
  };

  const updateAlt = async (key: string, alt: string) => {
    const { error } = await supabase.from('site_assets').upsert({
      key,
      alt,
      public_url: assets[key]?.public_url || '',
      storage_path: assets[key]?.storage_path || null,
      mime: assets[key]?.mime || null,
    });
    if (error) {
      console.warn('[ThemeMedia] updateAlt failed', error);
    }
  };

  const uploadAsset = async (key: string, file: File) => {
    setUploadingKey(key);
    try {
      const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
      if (sessionErr) throw sessionErr;
      if (!sessionData?.session) {
        throw new Error('Not authenticated. Please log out and log in again to admin.');
      }

      const ext = extFromFilename(file.name) || 'bin';
      const storage_path = `site/${key}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from('media')
        .upload(storage_path, file, { upsert: true });
      if (upErr) throw upErr;

      const { data: urlData } = await supabase.storage.from('media').getPublicUrl(storage_path);
      const rawUrl = urlData?.publicUrl || '';
      const public_url = rawUrl ? `${rawUrl}?v=${Date.now()}` : '';

      const { error: dbErr } = await supabase.from('site_assets').upsert({
        key,
        storage_path,
        public_url,
        mime: file.type,
        alt: assets[key]?.alt || null,
      });
      if (dbErr) throw dbErr;

      showSaved('Asset replaced (applies instantly)');
    } catch (e) {
      console.warn('[ThemeMedia] uploadAsset failed', e);
      showError(`Upload failed: ${errorMessage(e)}`);
    } finally {
      setUploadingKey(null);
    }
  };

  return (
    <div className="space-y-6">
      {banner && (
        <div className={`rounded-md px-4 py-2 text-sm border ${bannerKind==='success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          {banner}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-maroon-700" />
              <h2 className="text-lg font-semibold text-maroon-800">Theme</h2>
            </div>
            <button
              onClick={saveTheme}
              disabled={savingTheme}
              className="inline-flex items-center gap-2 text-sm bg-maroon-700 hover:bg-maroon-800 disabled:opacity-60 text-white px-3 py-1.5 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-maroon-500"
            >
              <Save className="h-4 w-4" />
              {savingTheme ? 'Saving...' : 'Save'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Primary (brand)</label>
              <input type="color" value={theme.primary_color} onChange={(e) => setTheme((s) => ({ ...s, primary_color: e.target.value }))} className="h-10 w-full rounded border border-gray-200" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Secondary</label>
              <input type="color" value={theme.secondary_color} onChange={(e) => setTheme((s) => ({ ...s, secondary_color: e.target.value }))} className="h-10 w-full rounded border border-gray-200" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Accent</label>
              <input type="color" value={theme.accent_color} onChange={(e) => setTheme((s) => ({ ...s, accent_color: e.target.value }))} className="h-10 w-full rounded border border-gray-200" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Background</label>
              <input type="color" value={theme.background_color} onChange={(e) => setTheme((s) => ({ ...s, background_color: e.target.value }))} className="h-10 w-full rounded border border-gray-200" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Text</label>
              <input type="color" value={theme.text_color} onChange={(e) => setTheme((s) => ({ ...s, text_color: e.target.value }))} className="h-10 w-full rounded border border-gray-200" />
            </div>
          </div>

          <div className="mt-6 rounded-lg border p-4" style={previewStyle}>
            <div className="text-sm font-semibold">Live Preview</div>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded text-sm" style={{ backgroundColor: theme.primary_color, color: '#fff' }}>Primary</span>
              <span className="px-3 py-1 rounded text-sm" style={{ backgroundColor: theme.secondary_color, color: '#fff' }}>Secondary</span>
              <span className="px-3 py-1 rounded text-sm" style={{ backgroundColor: theme.accent_color, color: '#111827' }}>Accent</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon className="h-5 w-5 text-maroon-700" />
              <h2 className="text-lg font-semibold text-maroon-800">Home</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-1">
                <div className="space-y-1">
                  {homeGroups.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setActiveHomeGroupId(g.id)}
                      className={`w-full text-left px-3 py-2 rounded text-sm border transition-colors ${
                        activeHomeGroupId === g.id
                          ? 'bg-maroon-50 border-maroon-200 text-maroon-800'
                          : 'bg-white border-transparent text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-3">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-gray-900">{activeHomeGroup.label}</div>
                    <div className="text-xs text-gray-500">Upload/replace the images used on this page/section</div>
                  </div>
                </div>
                {renderGroupItems(activeHomeGroup)}
              </div>
            </div>
          </div>

          <div className="bg-white rounded shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon className="h-5 w-5 text-maroon-700" />
              <h2 className="text-lg font-semibold text-maroon-800">About</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-1">
                <div className="space-y-1">
                  {aboutGroups.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setActiveAboutGroupId(g.id)}
                      className={`w-full text-left px-3 py-2 rounded text-sm border transition-colors ${
                        activeAboutGroupId === g.id
                          ? 'bg-maroon-50 border-maroon-200 text-maroon-800'
                          : 'bg-white border-transparent text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {g.label.replace(' (About)', '')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-3">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-gray-900">{activeAboutGroup.label.replace(' (About)', '')}</div>
                    <div className="text-xs text-gray-500">Upload/replace the images used on this page/section</div>
                  </div>
                </div>
                {renderGroupItems(activeAboutGroup)}
              </div>
            </div>
          </div>

          <div className="bg-white rounded shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon className="h-5 w-5 text-maroon-700" />
              <h2 className="text-lg font-semibold text-maroon-800">Services</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-1">
                <div className="space-y-1">
                  {servicesGroups.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setActiveServicesGroupId(g.id)}
                      className={`w-full text-left px-3 py-2 rounded text-sm border transition-colors ${
                        activeServicesGroupId === g.id
                          ? 'bg-maroon-50 border-maroon-200 text-maroon-800'
                          : 'bg-white border-transparent text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-3">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-gray-900">{activeServicesGroup.label}</div>
                    <div className="text-xs text-gray-500">Upload/replace the images used on this page/section</div>
                  </div>
                </div>
                {renderGroupItems(activeServicesGroup)}
              </div>
            </div>
          </div>

          <div className="bg-white rounded shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon className="h-5 w-5 text-maroon-700" />
              <h2 className="text-lg font-semibold text-maroon-800">Community</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-1">
                <div className="space-y-1">
                  {communityGroups.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setActiveCommunityGroupId(g.id)}
                      className={`w-full text-left px-3 py-2 rounded text-sm border transition-colors ${
                        activeCommunityGroupId === g.id
                          ? 'bg-maroon-50 border-maroon-200 text-maroon-800'
                          : 'bg-white border-transparent text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-3">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-gray-900">{activeCommunityGroup.label}</div>
                    <div className="text-xs text-gray-500">Upload/replace the images used on this page/section</div>
                  </div>
                </div>
                {renderGroupItems(activeCommunityGroup)}
              </div>
            </div>
          </div>

          <div className="bg-white rounded shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon className="h-5 w-5 text-maroon-700" />
              <h2 className="text-lg font-semibold text-maroon-800">Careers</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-1">
                <div className="space-y-1">
                  {careersGroups.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setActiveCareersGroupId(g.id)}
                      className={`w-full text-left px-3 py-2 rounded text-sm border transition-colors ${
                        activeCareersGroupId === g.id
                          ? 'bg-maroon-50 border-maroon-200 text-maroon-800'
                          : 'bg-white border-transparent text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-3">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-gray-900">{activeCareersGroup.label}</div>
                    <div className="text-xs text-gray-500">Upload/replace the images used on this page/section</div>
                  </div>
                </div>
                {renderGroupItems(activeCareersGroup)}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded shadow p-6">
          <h2 className="text-lg font-semibold text-maroon-800 mb-2">Notes</h2>
          <div className="text-sm text-gray-700 space-y-1">
            <div>Changes apply instantly on the public website if Supabase is configured and the site is running.</div>
            <div>Make sure the Supabase Storage bucket <span className="font-mono">media</span> exists and is public for reads.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
