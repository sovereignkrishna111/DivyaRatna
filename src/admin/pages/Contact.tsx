import { useCallback, useEffect, useMemo, useState } from 'react';
import { Mail, Pencil, Plus, Save, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Modal from '../components/Modal';

type ContactSettingsRow = {
  id: string;
  hero_title: string;
  hero_subtitle: string;
  intro_title: string;
  intro_subtitle: string;
  map_title: string;
  map_embed_url: string;
  map_directions_url: string;
  emergency_title: string;
  emergency_text: string;
  emergency_hotline: string;
  emergency_note: string;
  department_section_title: string;
  department_section_subtitle: string;
  created_at: string;
  updated_at: string;
};

type ContactInfoItemRow = {
  id: string;
  title: string;
  icon_key: string;
  details: unknown;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};

type ContactDepartmentRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  email: string;
  phone: string;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};

type InfoFormState = {
  title: string;
  icon_key: string;
  detailsText: string;
  sort_order: number;
  published: boolean;
};

type DeptFormState = {
  slug: string;
  name: string;
  description: string;
  email: string;
  phone: string;
  sort_order: number;
  published: boolean;
};

const DEFAULT_SETTINGS: Omit<ContactSettingsRow, 'created_at' | 'updated_at'> = {
  id: 'default',
  hero_title: 'Contact Us',
  hero_subtitle: 'Get in touch with us for any questions, concerns, or information about DRESS',
  intro_title: 'Get in Touch',
  intro_subtitle: "We're here to help and answer any questions you might have about our school and programs",
  map_title: 'Find Us',
  map_embed_url: '',
  map_directions_url: '',
  emergency_title: 'Emergency Contact',
  emergency_text: 'For urgent matters outside office hours:',
  emergency_hotline: '',
  emergency_note: 'Available 24/7 for student emergencies',
  department_section_title: 'Department Contacts',
  department_section_subtitle: 'Connect directly with specific departments for specialized assistance',
};

function errorMessage(err: unknown) {
  if (!err) return 'Unknown error';
  if (typeof err === 'string') return err;
  const e = err as Record<string, unknown>;
  const msg = e.message;
  if (typeof msg === 'string' && msg) return msg;
  return 'Unknown error';
}

function asString(v: unknown, fallback = '') {
  return typeof v === 'string' ? v : fallback;
}

function asBool(v: unknown, fallback = false) {
  return typeof v === 'boolean' ? v : fallback;
}

function asNum(v: unknown, fallback = 0) {
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback;
}

function detailsToText(details: unknown): string {
  if (!Array.isArray(details)) return '';
  return details.map((d) => (typeof d === 'string' ? d : '')).filter(Boolean).join('\n');
}

function textToDetails(detailsText: string): string[] {
  return (detailsText || '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

async function requireSession() {
  const { data: first, error: firstErr } = await supabase.auth.getSession();
  if (firstErr) throw firstErr;
  if (first?.session) return first.session;

  const token = localStorage.getItem('admin_token');
  const refreshToken = localStorage.getItem('admin_refresh_token');
  if (token && refreshToken) {
    const { error: setErr } = await supabase.auth.setSession({ access_token: token, refresh_token: refreshToken });
    if (setErr) throw setErr;
    const { data: second, error: secondErr } = await supabase.auth.getSession();
    if (secondErr) throw secondErr;
    if (second?.session) return second.session;
  }

  throw new Error('Not authenticated. Please log out and log in again to admin.');
}

export default function Contact() {
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsBanner, setSettingsBanner] = useState<string | null>(null);
  const [settingsBannerKind, setSettingsBannerKind] = useState<'success' | 'error'>('success');
  const [settings, setSettings] = useState<Omit<ContactSettingsRow, 'created_at' | 'updated_at'>>({ ...DEFAULT_SETTINGS });

  const [infoItems, setInfoItems] = useState<ContactInfoItemRow[]>([]);
  const [infoLoading, setInfoLoading] = useState(false);
  const [infoSaving, setInfoSaving] = useState(false);
  const [infoBanner, setInfoBanner] = useState<string | null>(null);
  const [infoBannerKind, setInfoBannerKind] = useState<'success' | 'error'>('success');
  const [infoOpen, setInfoOpen] = useState(false);
  const [infoEditing, setInfoEditing] = useState<ContactInfoItemRow | null>(null);
  const [infoForm, setInfoForm] = useState<InfoFormState>({
    title: '',
    icon_key: 'phone',
    detailsText: '',
    sort_order: 0,
    published: true,
  });

  const [departments, setDepartments] = useState<ContactDepartmentRow[]>([]);
  const [deptLoading, setDeptLoading] = useState(false);
  const [deptSaving, setDeptSaving] = useState(false);
  const [deptBanner, setDeptBanner] = useState<string | null>(null);
  const [deptBannerKind, setDeptBannerKind] = useState<'success' | 'error'>('success');
  const [deptOpen, setDeptOpen] = useState(false);
  const [deptEditing, setDeptEditing] = useState<ContactDepartmentRow | null>(null);
  const [deptForm, setDeptForm] = useState<DeptFormState>({
    slug: '',
    name: '',
    description: '',
    email: '',
    phone: '',
    sort_order: 0,
    published: true,
  });

  const showSettingsSaved = (text = 'Saved') => {
    setSettingsBannerKind('success');
    setSettingsBanner(text);
    window.setTimeout(() => setSettingsBanner(null), 2500);
  };

  const showSettingsError = (text: string) => {
    setSettingsBannerKind('error');
    setSettingsBanner(text);
    window.setTimeout(() => setSettingsBanner(null), 5000);
  };

  const showInfoSaved = (text = 'Saved') => {
    setInfoBannerKind('success');
    setInfoBanner(text);
    window.setTimeout(() => setInfoBanner(null), 2500);
  };

  const showInfoError = (text: string) => {
    setInfoBannerKind('error');
    setInfoBanner(text);
    window.setTimeout(() => setInfoBanner(null), 5000);
  };

  const showDeptSaved = (text = 'Saved') => {
    setDeptBannerKind('success');
    setDeptBanner(text);
    window.setTimeout(() => setDeptBanner(null), 2500);
  };

  const showDeptError = (text: string) => {
    setDeptBannerKind('error');
    setDeptBanner(text);
    window.setTimeout(() => setDeptBanner(null), 5000);
  };

  const loadSettings = useCallback(async () => {
    setSettingsLoading(true);
    try {
      const res = await supabase.from('contact_settings').select('*').eq('id', 'default').maybeSingle();
      if (res.error) throw res.error;

      const row = (res.data as Partial<ContactSettingsRow>) || null;
      if (!row) {
        const { error: upErr } = await supabase.from('contact_settings').upsert({ ...DEFAULT_SETTINGS });
        if (upErr) throw upErr;
        setSettings({ ...DEFAULT_SETTINGS });
        return;
      }

      setSettings({
        ...DEFAULT_SETTINGS,
        id: asString(row.id, 'default'),
        hero_title: asString(row.hero_title, DEFAULT_SETTINGS.hero_title),
        hero_subtitle: asString(row.hero_subtitle, DEFAULT_SETTINGS.hero_subtitle),
        intro_title: asString(row.intro_title, DEFAULT_SETTINGS.intro_title),
        intro_subtitle: asString(row.intro_subtitle, DEFAULT_SETTINGS.intro_subtitle),
        map_title: asString(row.map_title, DEFAULT_SETTINGS.map_title),
        map_embed_url: asString(row.map_embed_url, DEFAULT_SETTINGS.map_embed_url),
        map_directions_url: asString(row.map_directions_url, DEFAULT_SETTINGS.map_directions_url),
        emergency_title: asString(row.emergency_title, DEFAULT_SETTINGS.emergency_title),
        emergency_text: asString(row.emergency_text, DEFAULT_SETTINGS.emergency_text),
        emergency_hotline: asString(row.emergency_hotline, DEFAULT_SETTINGS.emergency_hotline),
        emergency_note: asString(row.emergency_note, DEFAULT_SETTINGS.emergency_note),
        department_section_title: asString(row.department_section_title, DEFAULT_SETTINGS.department_section_title),
        department_section_subtitle: asString(row.department_section_subtitle, DEFAULT_SETTINGS.department_section_subtitle),
      });
    } catch (e) {
      showSettingsError(`Load failed: ${errorMessage(e)}`);
    } finally {
      setSettingsLoading(false);
    }
  }, []);

  const saveSettings = async () => {
    setSettingsSaving(true);
    try {
      await requireSession();
      const { error } = await supabase.from('contact_settings').upsert({ ...settings, id: 'default' });
      if (error) throw error;
      showSettingsSaved('Settings saved');
      await loadSettings();
    } catch (e) {
      showSettingsError(`Save failed: ${errorMessage(e)}`);
    } finally {
      setSettingsSaving(false);
    }
  };

  const fetchInfoItems = useCallback(async () => {
    setInfoLoading(true);
    try {
      const { data, error } = await supabase
        .from('contact_info_items')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('updated_at', { ascending: false });
      if (error || !data) {
        setInfoItems([]);
        return;
      }
      setInfoItems(data as ContactInfoItemRow[]);
    } finally {
      setInfoLoading(false);
    }
  }, []);

  const fetchDepartments = useCallback(async () => {
    setDeptLoading(true);
    try {
      const { data, error } = await supabase
        .from('contact_departments')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('updated_at', { ascending: false });
      if (error || !data) {
        setDepartments([]);
        return;
      }
      setDepartments(data as ContactDepartmentRow[]);
    } finally {
      setDeptLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
    fetchInfoItems();
    fetchDepartments();

    const chSettings = supabase
      .channel('realtime-admin-contact-settings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_settings' }, loadSettings)
      .subscribe();

    const chInfo = supabase
      .channel('realtime-admin-contact-info-items')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_info_items' }, fetchInfoItems)
      .subscribe();

    const chDept = supabase
      .channel('realtime-admin-contact-departments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_departments' }, fetchDepartments)
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(chSettings);
      } catch {
        void 0;
      }
      try {
        supabase.removeChannel(chInfo);
      } catch {
        void 0;
      }
      try {
        supabase.removeChannel(chDept);
      } catch {
        void 0;
      }
    };
  }, [fetchDepartments, fetchInfoItems, loadSettings]);

  const publishedInfoCount = useMemo(() => infoItems.filter((i) => i.published).length, [infoItems]);
  const publishedDeptCount = useMemo(() => departments.filter((d) => d.published).length, [departments]);

  const openInfoCreate = () => {
    setInfoEditing(null);
    setInfoForm({ title: '', icon_key: 'phone', detailsText: '', sort_order: 0, published: true });
    setInfoOpen(true);
  };

  const openInfoEdit = (it: ContactInfoItemRow) => {
    setInfoEditing(it);
    setInfoForm({
      title: it.title,
      icon_key: it.icon_key || 'phone',
      detailsText: detailsToText(it.details),
      sort_order: asNum(it.sort_order, 0),
      published: asBool(it.published, true),
    });
    setInfoOpen(true);
  };

  const saveInfoItem = async () => {
    if (!infoForm.title.trim()) {
      showInfoError('Title is required');
      return;
    }

    const payload = {
      title: infoForm.title.trim(),
      icon_key: infoForm.icon_key.trim() || 'phone',
      details: textToDetails(infoForm.detailsText),
      sort_order: Number.isFinite(infoForm.sort_order) ? Math.floor(infoForm.sort_order) : 0,
      published: !!infoForm.published,
    };

    setInfoSaving(true);
    try {
      await requireSession();

      if (infoEditing) {
        const { error } = await supabase.from('contact_info_items').update(payload).eq('id', infoEditing.id);
        if (error) throw error;
        showInfoSaved('Updated');
      } else {
        const { error } = await supabase.from('contact_info_items').insert(payload);
        if (error) throw error;
        showInfoSaved('Created');
      }

      setInfoOpen(false);
      setInfoEditing(null);
      await fetchInfoItems();
    } catch (e) {
      showInfoError(`Save failed: ${errorMessage(e)}`);
    } finally {
      setInfoSaving(false);
    }
  };

  const removeInfoItem = async (it: ContactInfoItemRow) => {
    if (!window.confirm('Delete this item?')) return;
    setInfoSaving(true);
    try {
      await requireSession();
      const { error } = await supabase.from('contact_info_items').delete().eq('id', it.id);
      if (error) throw error;
      showInfoSaved('Deleted');
      await fetchInfoItems();
    } catch (e) {
      showInfoError(`Delete failed: ${errorMessage(e)}`);
    } finally {
      setInfoSaving(false);
    }
  };

  const openDeptCreate = () => {
    setDeptEditing(null);
    setDeptForm({ slug: '', name: '', description: '', email: '', phone: '', sort_order: 0, published: true });
    setDeptOpen(true);
  };

  const openDeptEdit = (it: ContactDepartmentRow) => {
    setDeptEditing(it);
    setDeptForm({
      slug: it.slug,
      name: it.name,
      description: it.description || '',
      email: it.email || '',
      phone: it.phone || '',
      sort_order: asNum(it.sort_order, 0),
      published: asBool(it.published, true),
    });
    setDeptOpen(true);
  };

  const saveDepartment = async () => {
    if (!deptForm.slug.trim()) {
      showDeptError('Slug is required');
      return;
    }
    if (!deptForm.name.trim()) {
      showDeptError('Name is required');
      return;
    }

    const payload = {
      slug: deptForm.slug.trim(),
      name: deptForm.name.trim(),
      description: deptForm.description.trim(),
      email: deptForm.email.trim(),
      phone: deptForm.phone.trim(),
      sort_order: Number.isFinite(deptForm.sort_order) ? Math.floor(deptForm.sort_order) : 0,
      published: !!deptForm.published,
    };

    setDeptSaving(true);
    try {
      await requireSession();

      if (deptEditing) {
        const { error } = await supabase.from('contact_departments').update(payload).eq('id', deptEditing.id);
        if (error) throw error;
        showDeptSaved('Updated');
      } else {
        const { error } = await supabase.from('contact_departments').insert(payload);
        if (error) throw error;
        showDeptSaved('Created');
      }

      setDeptOpen(false);
      setDeptEditing(null);
      await fetchDepartments();
    } catch (e) {
      showDeptError(`Save failed: ${errorMessage(e)}`);
    } finally {
      setDeptSaving(false);
    }
  };

  const removeDepartment = async (it: ContactDepartmentRow) => {
    if (!window.confirm('Delete this department?')) return;
    setDeptSaving(true);
    try {
      await requireSession();
      const { error } = await supabase.from('contact_departments').delete().eq('id', it.id);
      if (error) throw error;
      showDeptSaved('Deleted');
      await fetchDepartments();
    } catch (e) {
      showDeptError(`Delete failed: ${errorMessage(e)}`);
    } finally {
      setDeptSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {settingsBanner && (
        <div
          className={`rounded-md px-4 py-2 text-sm border ${
            settingsBannerKind === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {settingsBanner}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="h-5 w-5 text-maroon-700" />
          <h3 className="text-lg font-semibold text-maroon-800">Contact</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="border rounded-lg p-4 space-y-4">
              <div className="text-sm font-semibold text-gray-900">Page settings</div>

              {settingsLoading ? (
                <div className="text-sm text-gray-500">Loading…</div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hero title</label>
                    <input
                      value={settings.hero_title}
                      onChange={(e) => setSettings((s) => ({ ...s, hero_title: e.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
                      disabled={settingsSaving}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hero subtitle</label>
                    <textarea
                      value={settings.hero_subtitle}
                      onChange={(e) => setSettings((s) => ({ ...s, hero_subtitle: e.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
                      rows={2}
                      disabled={settingsSaving}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Intro title</label>
                    <input
                      value={settings.intro_title}
                      onChange={(e) => setSettings((s) => ({ ...s, intro_title: e.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
                      disabled={settingsSaving}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Intro subtitle</label>
                    <textarea
                      value={settings.intro_subtitle}
                      onChange={(e) => setSettings((s) => ({ ...s, intro_subtitle: e.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
                      rows={2}
                      disabled={settingsSaving}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Map title</label>
                      <input
                        value={settings.map_title}
                        onChange={(e) => setSettings((s) => ({ ...s, map_title: e.target.value }))}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
                        disabled={settingsSaving}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Directions URL</label>
                      <input
                        value={settings.map_directions_url}
                        onChange={(e) => setSettings((s) => ({ ...s, map_directions_url: e.target.value }))}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
                        disabled={settingsSaving}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Map embed URL</label>
                    <textarea
                      value={settings.map_embed_url}
                      onChange={(e) => setSettings((s) => ({ ...s, map_embed_url: e.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
                      rows={2}
                      disabled={settingsSaving}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Emergency title</label>
                      <input
                        value={settings.emergency_title}
                        onChange={(e) => setSettings((s) => ({ ...s, emergency_title: e.target.value }))}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
                        disabled={settingsSaving}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Emergency hotline</label>
                      <input
                        value={settings.emergency_hotline}
                        onChange={(e) => setSettings((s) => ({ ...s, emergency_hotline: e.target.value }))}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
                        disabled={settingsSaving}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Emergency text</label>
                    <input
                      value={settings.emergency_text}
                      onChange={(e) => setSettings((s) => ({ ...s, emergency_text: e.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
                      disabled={settingsSaving}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Emergency note</label>
                    <input
                      value={settings.emergency_note}
                      onChange={(e) => setSettings((s) => ({ ...s, emergency_note: e.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
                      disabled={settingsSaving}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department section title</label>
                    <input
                      value={settings.department_section_title}
                      onChange={(e) => setSettings((s) => ({ ...s, department_section_title: e.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
                      disabled={settingsSaving}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department section subtitle</label>
                    <textarea
                      value={settings.department_section_subtitle}
                      onChange={(e) => setSettings((s) => ({ ...s, department_section_subtitle: e.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
                      rows={2}
                      disabled={settingsSaving}
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={saveSettings}
                      disabled={settingsSaving}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-maroon-700 text-white hover:bg-maroon-800 disabled:opacity-60"
                    >
                      <Save className="h-4 w-4" />
                      {settingsSaving ? 'Saving…' : 'Save settings'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1 space-y-4">
            <div className="border rounded-lg p-4">
              <div className="text-sm font-semibold text-gray-900 mb-2">Overview</div>
              <div className="text-sm text-gray-700">Contact info cards: {infoItems.length}</div>
              <div className="text-sm text-gray-700">Published: {publishedInfoCount}</div>
              <div className="mt-3 text-sm text-gray-700">Departments: {departments.length}</div>
              <div className="text-sm text-gray-700">Published: {publishedDeptCount}</div>
            </div>
          </div>
        </div>
      </div>

      {infoBanner && (
        <div
          className={`rounded-md px-4 py-2 text-sm border ${
            infoBannerKind === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {infoBanner}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="text-lg font-semibold text-maroon-800">Contact info cards</div>
          <button
            onClick={openInfoCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-maroon-700 text-white rounded-lg shadow hover:bg-maroon-800"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>

        {infoLoading ? (
          <div className="text-sm text-gray-500">Loading…</div>
        ) : infoItems.length === 0 ? (
          <div className="text-sm text-gray-500">No items yet.</div>
        ) : (
          <div className="space-y-3">
            {infoItems.map((it) => (
              <div key={it.id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <div className="text-base font-semibold text-gray-900 truncate">{it.title}</div>
                      {!it.published && <span className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-700">Draft</span>}
                      <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">Order: {it.sort_order}</span>
                      <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">Icon: {it.icon_key}</span>
                    </div>
                    <div className="text-sm text-gray-700 whitespace-pre-line">{detailsToText(it.details)}</div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => openInfoEdit(it)}
                      className="inline-flex items-center justify-center w-9 h-9 rounded border hover:bg-gray-50"
                      aria-label="Edit"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => removeInfoItem(it)}
                      className="inline-flex items-center justify-center w-9 h-9 rounded border text-red-700 border-red-200 bg-red-50 hover:bg-red-100"
                      aria-label="Delete"
                      title="Delete"
                      disabled={infoSaving}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {deptBanner && (
        <div
          className={`rounded-md px-4 py-2 text-sm border ${
            deptBannerKind === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {deptBanner}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="text-lg font-semibold text-maroon-800">Departments</div>
          <button
            onClick={openDeptCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-maroon-700 text-white rounded-lg shadow hover:bg-maroon-800"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>

        {deptLoading ? (
          <div className="text-sm text-gray-500">Loading…</div>
        ) : departments.length === 0 ? (
          <div className="text-sm text-gray-500">No departments yet.</div>
        ) : (
          <div className="space-y-3">
            {departments.map((it) => (
              <div key={it.id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <div className="text-base font-semibold text-gray-900 truncate">{it.name}</div>
                      <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">{it.slug}</span>
                      {!it.published && <span className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-700">Draft</span>}
                      <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">Order: {it.sort_order}</span>
                    </div>
                    <div className="text-sm text-gray-700">{it.description}</div>
                    <div className="mt-2 text-sm text-gray-700">{it.email}</div>
                    <div className="text-sm text-gray-700">{it.phone}</div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => openDeptEdit(it)}
                      className="inline-flex items-center justify-center w-9 h-9 rounded border hover:bg-gray-50"
                      aria-label="Edit"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => removeDepartment(it)}
                      className="inline-flex items-center justify-center w-9 h-9 rounded border text-red-700 border-red-200 bg-red-50 hover:bg-red-100"
                      aria-label="Delete"
                      title="Delete"
                      disabled={deptSaving}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={infoOpen}
        onClose={() => {
          setInfoOpen(false);
          setInfoEditing(null);
        }}
        title={infoEditing ? 'Update info card' : 'Add info card'}
        maxWidthClass="max-w-3xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => {
                setInfoOpen(false);
                setInfoEditing(null);
              }}
              className="px-4 py-2 rounded-lg border bg-white"
              disabled={infoSaving}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveInfoItem}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-maroon-700 text-white hover:bg-maroon-800 disabled:opacity-60"
              disabled={infoSaving}
            >
              <Save className="h-4 w-4" />
              {infoSaving ? 'Saving…' : 'Save'}
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              value={infoForm.title}
              onChange={(e) => setInfoForm((s) => ({ ...s, title: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
            <select
              value={infoForm.icon_key}
              onChange={(e) => setInfoForm((s) => ({ ...s, icon_key: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
            >
              <option value="phone">Phone</option>
              <option value="mail">Mail</option>
              <option value="map">Map</option>
              <option value="clock">Clock</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Details (one per line)</label>
            <textarea
              value={infoForm.detailsText}
              onChange={(e) => setInfoForm((s) => ({ ...s, detailsText: e.target.value }))}
              rows={6}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort order</label>
              <input
                type="number"
                value={infoForm.sort_order}
                onChange={(e) => setInfoForm((s) => ({ ...s, sort_order: Number(e.target.value) }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
              />
            </div>
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={infoForm.published}
                onChange={(e) => setInfoForm((s) => ({ ...s, published: e.target.checked }))}
              />
              Published
            </label>
          </div>
        </div>
      </Modal>

      <Modal
        open={deptOpen}
        onClose={() => {
          setDeptOpen(false);
          setDeptEditing(null);
        }}
        title={deptEditing ? 'Update department' : 'Add department'}
        maxWidthClass="max-w-3xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => {
                setDeptOpen(false);
                setDeptEditing(null);
              }}
              className="px-4 py-2 rounded-lg border bg-white"
              disabled={deptSaving}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveDepartment}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-maroon-700 text-white hover:bg-maroon-800 disabled:opacity-60"
              disabled={deptSaving}
            >
              <Save className="h-4 w-4" />
              {deptSaving ? 'Saving…' : 'Save'}
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
              <input
                value={deptForm.slug}
                onChange={(e) => setDeptForm((s) => ({ ...s, slug: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                value={deptForm.name}
                onChange={(e) => setDeptForm((s) => ({ ...s, name: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={deptForm.description}
              onChange={(e) => setDeptForm((s) => ({ ...s, description: e.target.value }))}
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                value={deptForm.email}
                onChange={(e) => setDeptForm((s) => ({ ...s, email: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                value={deptForm.phone}
                onChange={(e) => setDeptForm((s) => ({ ...s, phone: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort order</label>
              <input
                type="number"
                value={deptForm.sort_order}
                onChange={(e) => setDeptForm((s) => ({ ...s, sort_order: Number(e.target.value) }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
              />
            </div>
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={deptForm.published}
                onChange={(e) => setDeptForm((s) => ({ ...s, published: e.target.checked }))}
              />
              Published
            </label>
          </div>
        </div>
      </Modal>
    </div>
  );
}
