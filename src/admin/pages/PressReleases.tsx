import { useEffect, useState } from 'react';
import { FileText, Save, Trash2, Pencil, Plus, Upload } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Modal from '../components/Modal';

type PressReleaseRow = {
  id: string;
  title: string;
  subtitle: string | null;
  release_date: string;
  location: string | null;
  summary: string | null;
  body: string | null;
  featured: boolean;
  published: boolean;
  sort_order: number;
  attachment_storage_path: string | null;
  attachment_url: string | null;
  external_url: string | null;
  created_at: string;
  updated_at: string;
};

type FormState = {
  title: string;
  subtitle: string;
  release_date: string;
  location: string;
  summary: string;
  body: string;
  featured: boolean;
  published: boolean;
  sort_order: number;
  external_url: string;
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

function extFromFilename(name: string) {
  const idx = name.lastIndexOf('.');
  if (idx === -1) return '';
  return name.slice(idx + 1).toLowerCase();
}

export default function PressReleases() {
  const [items, setItems] = useState<PressReleaseRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const [bannerKind, setBannerKind] = useState<'success' | 'error'>('success');

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PressReleaseRow | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const [form, setForm] = useState<FormState>({
    title: '',
    subtitle: '',
    release_date: '',
    location: '',
    summary: '',
    body: '',
    featured: false,
    published: false,
    sort_order: 0,
    external_url: '',
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

  const errorMessage = (err: unknown) => {
    if (!err) return 'Unknown error';
    if (typeof err === 'string') return err;
    const e = err as Record<string, unknown>;
    const msg = e.message;
    if (typeof msg === 'string' && msg) return msg;
    return 'Unknown error';
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

  const fetchAll = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('press_releases')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('release_date', { ascending: false });

      if (error || !data) {
        setItems([]);
        return;
      }
      setItems(data as PressReleaseRow[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    const ch = supabase
      .channel('realtime-admin-press-releases')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'press_releases' }, fetchAll)
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
    setFile(null);
    setForm({
      title: '',
      subtitle: '',
      release_date: '',
      location: '',
      summary: '',
      body: '',
      featured: false,
      published: false,
      sort_order: 0,
      external_url: '',
    });
    setOpen(true);
  };

  const openEdit = (it: PressReleaseRow) => {
    setEditing(it);
    setFile(null);
    setForm({
      title: it.title,
      subtitle: it.subtitle || '',
      release_date: it.release_date || '',
      location: it.location || '',
      summary: it.summary || '',
      body: it.body || '',
      featured: !!it.featured,
      published: !!it.published,
      sort_order: it.sort_order ?? 0,
      external_url: it.external_url || '',
    });
    setOpen(true);
  };

  const uploadToStorage = async (id: string, f: File) => {
    setUploading(true);
    try {
      await requireSession();
      const ext = extFromFilename(f.name) || 'bin';
      const path = `items/${id}/${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage.from('press-releases').upload(path, f, { upsert: true });
      if (upErr) throw upErr;

      const { data: urlData } = supabase.storage.from('press-releases').getPublicUrl(path);
      const rawUrl = urlData?.publicUrl || '';
      const publicUrl = rawUrl ? `${rawUrl}?v=${Date.now()}` : '';

      return { attachment_storage_path: path, attachment_url: publicUrl };
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!form.title.trim()) {
      showError('Title is required');
      return;
    }
    if (!form.release_date) {
      showError('Release date is required');
      return;
    }

    setSaving(true);
    try {
      await requireSession();
      const id = editing?.id || safeUuid();

      let attachment_storage_path = editing?.attachment_storage_path || null;
      let attachment_url = editing?.attachment_url || null;

      if (file) {
        if (editing?.attachment_storage_path) {
          try {
            await supabase.storage.from('press-releases').remove([editing.attachment_storage_path]);
          } catch (e) {
            void e;
          }
        }
        const uploaded = await uploadToStorage(id, file);
        attachment_storage_path = uploaded.attachment_storage_path;
        attachment_url = uploaded.attachment_url;
      }

      const payload = {
        id,
        title: form.title,
        subtitle: form.subtitle || null,
        release_date: form.release_date,
        location: form.location || null,
        summary: form.summary || null,
        body: form.body || null,
        featured: !!form.featured,
        published: !!form.published,
        sort_order: Number.isFinite(form.sort_order) ? form.sort_order : 0,
        attachment_storage_path,
        attachment_url,
        external_url: form.external_url || null,
      };

      const { error } = await supabase.from('press_releases').upsert(payload);
      if (error) throw error;

      showSaved(editing ? 'Press release updated' : 'Press release created');
      fetchAll();
      setOpen(false);
      setEditing(null);
      setFile(null);
    } catch (e) {
      showError(`Save failed: ${errorMessage(e)}`);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (it: PressReleaseRow) => {
    if (!window.confirm('Delete this press release?')) return;
    try {
      await requireSession();
      if (it.attachment_storage_path) {
        try {
          await supabase.storage.from('press-releases').remove([it.attachment_storage_path]);
        } catch (e) {
          void e;
        }
      }
      const { error } = await supabase.from('press_releases').delete().eq('id', it.id);
      if (error) throw error;
      showSaved('Deleted');
      fetchAll();
    } catch (e) {
      showError(`Delete failed: ${errorMessage(e)}`);
    }
  };

  return (
    <div className="space-y-6">
      {banner && (
        <div className={`rounded-md px-4 py-2 text-sm border ${bannerKind==='success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          {banner}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-maroon-700" />
            <h3 className="text-lg font-semibold text-maroon-800">Press Releases</h3>
          </div>
          <button
            onClick={openCreate}
            className="inline-flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-maroon-700 text-white rounded-lg shadow hover:bg-maroon-800 text-sm leading-tight text-center"
          >
            <Plus className="h-4 w-4" />
            Add Press Release
          </button>
        </div>

        {loading ? (
          <div className="text-sm text-gray-500">Loading...</div>
        ) : (
          <div className="space-y-3">
            {items.map((it) => (
              <div key={it.id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h4 className="text-base font-semibold text-gray-900 truncate">{it.title}</h4>
                      {!it.published && <span className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-700">Draft</span>}
                      {it.featured && <span className="text-xs px-2 py-1 rounded bg-maroon-700 text-white">Featured</span>}
                    </div>
                    <div className="text-sm text-gray-600">{it.release_date}{it.location ? ` • ${it.location}` : ''}</div>
                    {it.summary && <p className="text-sm text-gray-700 mt-2">{it.summary}</p>}
                    <div className="mt-2 flex flex-wrap gap-3 text-sm">
                      {it.attachment_url && (
                        <a className="text-maroon-700 hover:underline" href={it.attachment_url} target="_blank" rel="noopener noreferrer">Attachment</a>
                      )}
                      {it.external_url && (
                        <a className="text-maroon-700 hover:underline" href={it.external_url} target="_blank" rel="noopener noreferrer">External link</a>
                      )}
                    </div>
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

            {items.length === 0 && (
              <div className="text-sm text-gray-500">No press releases yet.</div>
            )}
          </div>
        )}
      </div>

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setEditing(null);
          setFile(null);
        }}
        title={editing ? 'Update Press Release' : 'Add Press Release'}
        maxWidthClass="max-w-3xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setEditing(null);
                setFile(null);
              }}
              className="px-4 py-2 rounded-lg border bg-white"
              disabled={saving || uploading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={save}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-maroon-700 text-white hover:bg-maroon-800 disabled:opacity-60"
              disabled={saving || uploading}
            >
              <Save className="h-4 w-4" />
              {uploading ? 'Uploading...' : saving ? 'Saving...' : 'Save'}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle (optional)</label>
            <input
              value={form.subtitle}
              onChange={(e) => setForm((s) => ({ ...s, subtitle: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Release date</label>
            <input
              type="date"
              value={form.release_date}
              onChange={(e) => setForm((s) => ({ ...s, release_date: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort order</label>
            <input
              type="number"
              value={form.sort_order}
              onChange={(e) => setForm((s) => ({ ...s, sort_order: Number(e.target.value) }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Summary (optional)</label>
            <textarea
              value={form.summary}
              onChange={(e) => setForm((s) => ({ ...s, summary: e.target.value }))}
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Body (optional)</label>
            <textarea
              value={form.body}
              onChange={(e) => setForm((s) => ({ ...s, body: e.target.value }))}
              rows={6}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">External URL (optional)</label>
            <input
              value={form.external_url}
              onChange={(e) => setForm((s) => ({ ...s, external_url: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
              placeholder="https://..."
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
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm((s) => ({ ...s, featured: e.target.checked }))}
              />
              Featured
            </label>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Upload attachment (PDF/Image)</label>
            <div className="flex items-center gap-3">
              <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              <div className="text-xs text-gray-500 flex items-center gap-2">
                <Upload className="h-4 w-4" />
                {editing?.attachment_url ? 'Uploading a new file will replace the existing attachment.' : 'Optional'}
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
