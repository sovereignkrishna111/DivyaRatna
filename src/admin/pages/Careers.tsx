import { useEffect, useMemo, useState } from 'react';
import { Briefcase, Plus, Save, Trash2, Pencil } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Modal from '../components/Modal';

type CareersSettingsRow = {
  id: string;
  hero_title: string;
  hero_subtitle: string;
};

type JobOpeningRow = {
  id: string;
  title: string;
  department: string;
  type: string;
  location: string | null;
  experience: string | null;
  deadline: string | null;
  description: string | null;
  requirements: string[] | null;
  responsibilities: string[] | null;
  published: boolean;
  sort_order: number;
};

type FormState = {
  title: string;
  department: string;
  type: string;
  location: string;
  experience: string;
  deadline: string;
  description: string;
  requirementsText: string;
  responsibilitiesText: string;
  published: boolean;
  sort_order: number;
};

const safeUuid = () => {
  const c = (globalThis as unknown as { crypto?: Crypto }).crypto;
  if (c && typeof c.randomUUID === 'function') return c.randomUUID();
  if (c && typeof c.getRandomValues === 'function') {
    const bytes = new Uint8Array(16);
    c.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
  return `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}-${Math.random().toString(16).slice(2)}`;
};

const errorMessage = (err: unknown) => {
  if (!err) return 'Unknown error';
  if (typeof err === 'string') return err;
  const e = err as Record<string, unknown>;
  const msg = e.message;
  if (typeof msg === 'string' && msg) return msg;
  return 'Unknown error';
};

const parseLines = (txt: string) => {
  const lines = txt
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  return lines;
};

export default function Careers() {
  const [banner, setBanner] = useState<string | null>(null);
  const [bannerKind, setBannerKind] = useState<'success' | 'error'>('success');

  const [settings, setSettings] = useState<CareersSettingsRow | null>(null);
  const [settingsForm, setSettingsForm] = useState({ hero_title: '', hero_subtitle: '' });
  const [jobs, setJobs] = useState<JobOpeningRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<JobOpeningRow | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<FormState>({
    title: '',
    department: '',
    type: 'Full-time',
    location: '',
    experience: '',
    deadline: '',
    description: '',
    requirementsText: '',
    responsibilitiesText: '',
    published: true,
    sort_order: 0,
  });

  const showSaved = (text = 'Saved') => {
    setBannerKind('success');
    setBanner(text);
    window.setTimeout(() => setBanner(null), 2500);
  };

  const showError = (text: string) => {
    setBannerKind('error');
    setBanner(text);
    window.setTimeout(() => setBanner(null), 5000);
  };

  const requireSession = async () => {
    const { data: first, error: firstErr } = await supabase.auth.getSession();
    if (firstErr) throw firstErr;
    if (first?.session) return first.session;

    const token = localStorage.getItem('admin_token');
    const refreshToken = localStorage.getItem('admin_refresh_token');
    if (token && refreshToken) {
      const { error: setErr } = await supabase.auth.setSession({ access_token: token, refresh_token: refreshToken });
      if (setErr) {
        const msg = (setErr as { message?: string })?.message || '';
        if (msg.toLowerCase().includes('refresh token')) {
          try {
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_refresh_token');
            localStorage.removeItem('admin_user');
          } catch (e) {
            void e;
          }
          try {
            await supabase.auth.signOut();
          } catch (e) {
            void e;
          }
          throw new Error('Your admin session expired. Please log out and log in again.');
        }
        throw setErr;
      }
      const { data: second, error: secondErr } = await supabase.auth.getSession();
      if (secondErr) throw secondErr;
      if (second?.session) return second.session;
    }

    throw new Error('Not authenticated. Please log out and log in again to admin.');
  };

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from('careers_settings')
      .select('id, hero_title, hero_subtitle')
      .eq('id', 'default')
      .limit(1);

    if (error) return;
    const row = Array.isArray(data) && data.length ? (data[0] as CareersSettingsRow) : null;
    setSettings(row);
    setSettingsForm({
      hero_title: row?.hero_title || '',
      hero_subtitle: row?.hero_subtitle || '',
    });
  };

  const fetchJobs = async () => {
    const { data, error } = await supabase
      .from('job_openings')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('deadline', { ascending: true, nullsFirst: false });

    if (error || !data) {
      setJobs([]);
      return;
    }
    setJobs(data as JobOpeningRow[]);
  };

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        await fetchSettings();
        await fetchJobs();
      } finally {
        setLoading(false);
      }
    };

    run();

    const ch = supabase
      .channel('realtime-admin-careers')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'careers_settings' }, fetchSettings)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'job_openings' }, fetchJobs)
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(ch);
      } catch (e) {
        void e;
      }
    };
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({
      title: '',
      department: '',
      type: 'Full-time',
      location: '',
      experience: '',
      deadline: '',
      description: '',
      requirementsText: '',
      responsibilitiesText: '',
      published: true,
      sort_order: 0,
    });
    setOpen(true);
  };

  const openEdit = (it: JobOpeningRow) => {
    setEditing(it);
    setForm({
      title: it.title,
      department: it.department,
      type: it.type,
      location: it.location || '',
      experience: it.experience || '',
      deadline: it.deadline || '',
      description: it.description || '',
      requirementsText: (it.requirements || []).join('\n'),
      responsibilitiesText: (it.responsibilities || []).join('\n'),
      published: !!it.published,
      sort_order: it.sort_order ?? 0,
    });
    setOpen(true);
  };

  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      await requireSession();
      if (!settingsForm.hero_title.trim()) {
        showError('Hero title is required');
        return;
      }
      if (!settingsForm.hero_subtitle.trim()) {
        showError('Hero subtitle is required');
        return;
      }

      const { error } = await supabase.from('careers_settings').upsert({
        id: 'default',
        hero_title: settingsForm.hero_title,
        hero_subtitle: settingsForm.hero_subtitle,
      });
      if (error) throw error;
      showSaved('Careers header updated');
      fetchSettings();
    } catch (e) {
      showError(`Save failed: ${errorMessage(e)}`);
    } finally {
      setSavingSettings(false);
    }
  };

  const save = async () => {
    if (!form.title.trim()) {
      showError('Title is required');
      return;
    }
    if (!form.department.trim()) {
      showError('Department is required');
      return;
    }
    if (!form.type.trim()) {
      showError('Type is required');
      return;
    }

    setSaving(true);
    try {
      await requireSession();
      const id = editing?.id || safeUuid();

      const payload = {
        id,
        title: form.title,
        department: form.department,
        type: form.type,
        location: form.location || null,
        experience: form.experience || null,
        deadline: form.deadline || null,
        description: form.description || null,
        requirements: parseLines(form.requirementsText),
        responsibilities: parseLines(form.responsibilitiesText),
        published: !!form.published,
        sort_order: Number.isFinite(form.sort_order) ? form.sort_order : 0,
      };

      const { error } = await supabase.from('job_openings').upsert(payload);
      if (error) throw error;

      showSaved(editing ? 'Job opening updated' : 'Job opening created');
      fetchJobs();
      setOpen(false);
      setEditing(null);
    } catch (e) {
      showError(`Save failed: ${errorMessage(e)}`);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (it: JobOpeningRow) => {
    if (!window.confirm('Delete this job opening?')) return;
    try {
      await requireSession();
      const { error } = await supabase.from('job_openings').delete().eq('id', it.id);
      if (error) throw error;
      showSaved('Deleted');
      fetchJobs();
    } catch (e) {
      showError(`Delete failed: ${errorMessage(e)}`);
    }
  };

  const stats = useMemo(() => {
    const published = jobs.filter((j) => j.published).length;
    const drafts = jobs.length - published;
    return { published, drafts, total: jobs.length };
  }, [jobs]);

  return (
    <div className="space-y-6">
      {banner && (
        <div
          className={`rounded-md px-4 py-2 text-sm border ${
            bannerKind === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {banner}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="h-5 w-5 text-maroon-700" />
          <h3 className="text-lg font-semibold text-maroon-800">Careers</h3>
        </div>

        {loading ? (
          <div className="text-sm text-gray-500">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="border rounded-lg p-4">
                <div className="text-sm font-semibold text-gray-900 mb-3">Hero section</div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      value={settingsForm.hero_title}
                      onChange={(e) => setSettingsForm((s) => ({ ...s, hero_title: e.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                    <textarea
                      value={settingsForm.hero_subtitle}
                      onChange={(e) => setSettingsForm((s) => ({ ...s, hero_subtitle: e.target.value }))}
                      rows={3}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={saveSettings}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-maroon-700 text-white hover:bg-maroon-800 disabled:opacity-60"
                      disabled={savingSettings}
                    >
                      <Save className="h-4 w-4" />
                      {savingSettings ? 'Saving...' : 'Save header'}
                    </button>
                  </div>

                  {!settings && (
                    <div className="text-xs text-gray-500">Settings row not found yet. Saving will create it.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="border rounded-lg p-4">
                <div className="text-sm font-semibold text-gray-900 mb-2">Overview</div>
                <div className="text-sm text-gray-700">Total: {stats.total}</div>
                <div className="text-sm text-gray-700">Published: {stats.published}</div>
                <div className="text-sm text-gray-700">Drafts: {stats.drafts}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-maroon-700" />
            <h3 className="text-lg font-semibold text-maroon-800">Job Openings</h3>
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-maroon-700 text-white rounded-lg shadow hover:bg-maroon-800"
          >
            <Plus className="h-4 w-4" />
            Add Job
          </button>
        </div>

        {loading ? (
          <div className="text-sm text-gray-500">Loading...</div>
        ) : (
          <div className="space-y-3">
            {jobs.map((it) => (
              <div key={it.id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h4 className="text-base font-semibold text-gray-900 truncate">{it.title}</h4>
                      {!it.published && <span className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-700">Draft</span>}
                      <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">{it.department}</span>
                      <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-800">{it.type}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {(it.location || '-')}{it.deadline ? ` • Deadline: ${it.deadline}` : ''}
                    </div>
                    {it.description && <p className="text-sm text-gray-700 mt-2">{it.description}</p>}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => openEdit(it)}
                      className="inline-flex items-center justify-center w-9 h-9 rounded border hover:bg-gray-50"
                      aria-label="Edit"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => remove(it)}
                      className="inline-flex items-center justify-center w-9 h-9 rounded border text-red-700 border-red-200 bg-red-50 hover:bg-red-100"
                      aria-label="Delete"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {jobs.length === 0 && <div className="text-sm text-gray-500">No job openings yet.</div>}
          </div>
        )}
      </div>

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setEditing(null);
        }}
        title={editing ? 'Update Job Opening' : 'Add Job Opening'}
        maxWidthClass="max-w-4xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setEditing(null);
              }}
              className="px-4 py-2 rounded-lg border bg-white"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={save}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-maroon-700 text-white hover:bg-maroon-800 disabled:opacity-60"
              disabled={saving}
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save'}
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <input
              value={form.department}
              onChange={(e) => setForm((s) => ({ ...s, department: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <input
              value={form.type}
              onChange={(e) => setForm((s) => ({ ...s, type: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
              placeholder="Full-time / Part-time"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location (optional)</label>
            <input
              value={form.location}
              onChange={(e) => setForm((s) => ({ ...s, location: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Experience (optional)</label>
            <input
              value={form.experience}
              onChange={(e) => setForm((s) => ({ ...s, experience: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
              placeholder="e.g. 3+ years"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deadline (optional)</label>
            <input
              type="date"
              value={form.deadline}
              onChange={(e) => setForm((s) => ({ ...s, deadline: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort order</label>
            <input
              type="number"
              value={form.sort_order}
              onChange={(e) => setForm((s) => ({ ...s, sort_order: Number(e.target.value) }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Requirements (one per line)</label>
            <textarea
              value={form.requirementsText}
              onChange={(e) => setForm((s) => ({ ...s, requirementsText: e.target.value }))}
              rows={8}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Responsibilities (one per line)</label>
            <textarea
              value={form.responsibilitiesText}
              onChange={(e) => setForm((s) => ({ ...s, responsibilitiesText: e.target.value }))}
              rows={8}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
            />
          </div>

          <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm((s) => ({ ...s, published: e.target.checked }))}
              />
              Published
            </label>
          </div>
        </div>
      </Modal>
    </div>
  );
}
