import { useEffect, useMemo, useState } from 'react';
import { Image as ImageIcon, Pencil, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Modal from '../components/Modal';

type HeroSlideRow = {
  id: string;
  asset_key: string;
  storage_path: string | null;
  image_url: string;
  title: string;
  subtitle: string;
  cta_text: string;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};

type FormState = {
  asset_key: string;
  title: string;
  subtitle: string;
  cta_text: string;
  sort_order: number;
  published: boolean;
};

const ASSET_KEY_CHOICES = ['hero_1', 'hero_2', 'hero_3'] as const;
const HERO_IMAGE_BUCKET = 'media';

export default function HomeHero() {
  const [items, setItems] = useState<HeroSlideRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const [bannerKind, setBannerKind] = useState<'success' | 'error'>('success');

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<HeroSlideRow | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const [form, setForm] = useState<FormState>({
    asset_key: 'hero_1',
    title: '',
    subtitle: '',
    cta_text: '',
    sort_order: 0,
    published: true,
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
      if (setErr) throw setErr;
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
        .from('home_hero_slides')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('updated_at', { ascending: false });

      if (error || !data) {
        setItems([]);
        return;
      }

      setItems(data as HeroSlideRow[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    const ch = supabase
      .channel('realtime-admin-home-hero')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'home_hero_slides' }, fetchAll)
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(ch);
      } catch {
        void 0;
      }
    };
  }, []);

  const publishedCount = useMemo(() => items.filter((i) => i.published).length, [items]);

  const openCreate = () => {
    setEditing(null);
    setFile(null);
    setForm({ asset_key: 'hero_1', title: '', subtitle: '', cta_text: '', sort_order: items.length, published: true });
    setOpen(true);
  };

  const openEdit = (it: HeroSlideRow) => {
    setEditing(it);
    setFile(null);
    setForm({
      asset_key: it.asset_key || 'hero_1',
      title: it.title || '',
      subtitle: it.subtitle || '',
      cta_text: it.cta_text || '',
      sort_order: typeof it.sort_order === 'number' ? it.sort_order : 0,
      published: !!it.published,
    });
    setOpen(true);
  };

  const extFromFilename = (name: string) => {
    const idx = name.lastIndexOf('.');
    if (idx === -1) return '';
    return name.slice(idx + 1).toLowerCase();
  };

  const uploadToStorage = async (id: string, f: File) => {
    setUploading(true);
    try {
      await requireSession();
      const ext = extFromFilename(f.name) || 'bin';
      const path = `home-hero/slides/${id}/${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage.from(HERO_IMAGE_BUCKET).upload(path, f, { upsert: true });
      if (upErr) throw upErr;

      const { data: urlData } = supabase.storage.from(HERO_IMAGE_BUCKET).getPublicUrl(path);
      const rawUrl = urlData?.publicUrl || '';
      const publicUrl = rawUrl ? `${rawUrl}?v=${Date.now()}` : '';

      return { storage_path: path, image_url: publicUrl };
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    setSaving(true);
    try {
      await requireSession();

      if (!form.asset_key.trim()) {
        showError('Asset key is required');
        return;
      }

      const payload = {
        asset_key: form.asset_key.trim(),
        title: form.title.trim(),
        subtitle: form.subtitle.trim(),
        cta_text: form.cta_text.trim(),
        sort_order: Number.isFinite(form.sort_order) ? Math.floor(form.sort_order) : 0,
        published: !!form.published,
      };

      if (!editing) {
        const { data, error } = await supabase.from('home_hero_slides').insert(payload).select('*').single();
        if (error || !data) throw error;

        const created = data as HeroSlideRow;

        if (file) {
          const uploaded = await uploadToStorage(created.id, file);
          await supabase.from('home_hero_slides').update(uploaded).eq('id', created.id);
        }
        showSaved('Slide added');
        setOpen(false);
        return;
      }

      let patch: Record<string, unknown> = payload;

      if (file) {
        if (editing.storage_path) {
          try {
            await supabase.storage.from(HERO_IMAGE_BUCKET).remove([editing.storage_path]);
          } catch {
            void 0;
          }
        }
        const uploaded = await uploadToStorage(editing.id, file);
        patch = { ...patch, storage_path: uploaded.storage_path, image_url: uploaded.image_url };
      }

      const { error } = await supabase.from('home_hero_slides').update(patch).eq('id', editing.id);
      if (error) throw error;
      showSaved('Slide updated');
      setOpen(false);
    } catch (e) {
      showError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (it: HeroSlideRow) => {
    if (!window.confirm('Delete this slide?')) return;
    setSaving(true);
    try {
      await requireSession();
      if (it.storage_path) {
        try {
          await supabase.storage.from(HERO_IMAGE_BUCKET).remove([it.storage_path]);
        } catch {
          void 0;
        }
      }
      const { error } = await supabase.from('home_hero_slides').delete().eq('id', it.id);
      if (error) throw error;
      showSaved('Deleted');
    } catch (e) {
      showError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

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

      <div className="bg-white rounded shadow p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-maroon-700" />
            <div>
              <h1 className="text-lg font-semibold text-maroon-800">Home Hero</h1>
              <div className="text-xs text-gray-500">
                {publishedCount} published · {items.length} total
              </div>
            </div>
          </div>

          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 text-sm bg-maroon-700 hover:bg-maroon-800 disabled:opacity-60 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-maroon-500"
            disabled={saving}
          >
            <Plus className="h-4 w-4" />
            Add slide
          </button>
        </div>
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Asset Key</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Published</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {items.map((it) => (
                <tr key={it.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-800">{it.sort_order}</td>
                  <td className="px-4 py-3 text-sm text-gray-800">{it.asset_key}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 max-w-[520px] truncate">{it.title}</td>
                  <td className="px-4 py-3 text-sm text-gray-800">{it.published ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(it)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded border border-gray-200 hover:bg-gray-50"
                        disabled={saving}
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(it)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded border border-red-200 text-red-700 hover:bg-red-50"
                        disabled={saving}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-500">
                    No slides yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {loading && <div className="px-4 py-3 text-sm text-gray-600">Loading…</div>}
      </div>

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setFile(null);
        }}
        title={editing ? 'Edit slide' : 'Add slide'}
        footer={
          <>
            <button
              onClick={() => setOpen(false)}
              className="px-4 py-2 text-sm rounded border border-gray-300 hover:bg-gray-50"
              disabled={saving || uploading}
            >
              Cancel
            </button>
            <button
              onClick={submit}
              className="px-4 py-2 text-sm rounded bg-maroon-700 hover:bg-maroon-800 text-white disabled:opacity-60"
              disabled={saving || uploading}
            >
              {saving || uploading ? 'Saving…' : 'Save'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slide image</label>
            <div className="flex flex-col gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  setFile(f || null);
                }}
                className="block w-full text-sm"
                disabled={saving || uploading}
              />

              {editing?.image_url && !file && (
                <div className="rounded border border-gray-200 overflow-hidden">
                  <img src={editing.image_url} alt="" className="w-full h-40 object-cover" />
                </div>
              )}

              {file && (
                <div className="text-xs text-gray-500">Selected: {file.name}</div>
              )}

              <div className="text-[11px] text-gray-500">
                Uploading an image here overrides Theme & Media for this slide.
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Asset Key</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={ASSET_KEY_CHOICES.includes(form.asset_key as (typeof ASSET_KEY_CHOICES)[number]) ? form.asset_key : ''}
                onChange={(e) => setForm((s) => ({ ...s, asset_key: e.target.value }))}
                className="rounded border border-gray-200 px-3 py-2 text-sm"
                disabled={saving || uploading}
              >
                <option value="">Custom…</option>
                {ASSET_KEY_CHOICES.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
              <input
                value={form.asset_key}
                onChange={(e) => setForm((s) => ({ ...s, asset_key: e.target.value }))}
                className="flex-1 rounded border border-gray-200 px-3 py-2 text-sm"
                placeholder="e.g. hero_1"
                disabled={saving || uploading}
              />
            </div>
            <div className="text-[11px] text-gray-500 mt-1">Image comes from Admin → Theme & Media → Home (matching key)</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
              className="w-full rounded border border-gray-200 px-3 py-2 text-sm"
              disabled={saving || uploading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
            <textarea
              value={form.subtitle}
              onChange={(e) => setForm((s) => ({ ...s, subtitle: e.target.value }))}
              className="w-full rounded border border-gray-200 px-3 py-2 text-sm"
              rows={3}
              disabled={saving || uploading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CTA Text</label>
            <input
              value={form.cta_text}
              onChange={(e) => setForm((s) => ({ ...s, cta_text: e.target.value }))}
              className="w-full rounded border border-gray-200 px-3 py-2 text-sm"
              disabled={saving || uploading}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort order</label>
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm((s) => ({ ...s, sort_order: parseInt(e.target.value || '0', 10) }))}
                className="w-full rounded border border-gray-200 px-3 py-2 text-sm"
                disabled={saving || uploading}
              />
            </div>

            <label className="flex items-center justify-between border rounded p-3 text-sm">
              <div>
                <div className="font-medium text-gray-800">Published</div>
                <div className="text-xs text-gray-500">Visible on public homepage</div>
              </div>
              <input
                type="checkbox"
                className="h-4 w-4 accent-maroon-700"
                checked={form.published}
                onChange={(e) => setForm((s) => ({ ...s, published: e.target.checked }))}
                disabled={saving || uploading}
              />
            </label>
          </div>
        </div>
      </Modal>
    </div>
  );
}
