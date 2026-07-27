import { useEffect, useMemo, useState } from 'react';
import { Award, Calendar, Globe, Heart, HeartHandshake, Pencil, Plus, Save, Trash2, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Modal from '../components/Modal';

type CommunityItemRow = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  details: string | null;
  category: string | null;
  icon_key: string | null;
  image_key: string | null;
  color: string | null;
  features: string[] | null;
  link_url: string | null;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type FormState = {
  title: string;
  subtitle: string;
  description: string;
  details: string;
  category: string;
  icon_key: string;
  image_key: string;
  color: string;
  features_text: string;
  link_url: string;
  published: boolean;
  sort_order: number;
};

const errorMessage = (err: unknown) => {
  if (!err) return 'Unknown error';
  if (typeof err === 'string') return err;
  const e = err as Record<string, unknown>;
  const msg = e.message;
  if (typeof msg === 'string' && msg) return msg;
  return 'Unknown error';
};

function extFromFilename(name: string) {
  const idx = name.lastIndexOf('.');
  if (idx === -1) return '';
  return name.slice(idx + 1).toLowerCase();
}

const ICON_CHOICES = [
  { key: 'users', label: 'Users', Icon: Users },
  { key: 'award', label: 'Award', Icon: Award },
  { key: 'heart', label: 'Heart', Icon: Heart },
  { key: 'globe', label: 'Globe', Icon: Globe },
  { key: 'calendar', label: 'Calendar', Icon: Calendar },
] as const;

export default function Community() {
  const [items, setItems] = useState<CommunityItemRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const [bannerKind, setBannerKind] = useState<'success' | 'error'>('success');

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CommunityItemRow | null>(null);

  const [form, setForm] = useState<FormState>({
    title: '',
    subtitle: '',
    description: '',
    details: '',
    category: '',
    icon_key: '',
    image_key: '',
    color: '',
    features_text: '',
    link_url: '',
    published: true,
    sort_order: 0,
  });

  const [imageUploading, setImageUploading] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

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

  const fetchAssetUrl = async (key: string) => {
    const k = (key || '').trim();
    if (!k) return null;
    const { data, error } = await supabase
      .from('site_assets')
      .select('public_url')
      .eq('key', k)
      .maybeSingle();
    if (error || !data) return null;
    const url = (data as { public_url?: string | null }).public_url;
    return typeof url === 'string' && url ? url : null;
  };

  const uploadImageForKey = async (key: string, file: File) => {
    const k = (key || '').trim();
    if (!k) {
      showError('Please set an image key first (e.g. community_event_1)');
      return;
    }

    setImageUploading(true);
    try {
      await requireSession();

      const ext = extFromFilename(file.name) || 'bin';
      const storage_path = `site/${k}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from('media')
        .upload(storage_path, file, { upsert: true });
      if (upErr) throw upErr;

      const { data: urlData } = await supabase.storage.from('media').getPublicUrl(storage_path);
      const rawUrl = urlData?.publicUrl || '';
      const public_url = rawUrl ? `${rawUrl}?v=${Date.now()}` : '';

      const { error: dbErr } = await supabase.from('site_assets').upsert({
        key: k,
        storage_path,
        public_url,
        mime: file.type,
        alt: null,
      });
      if (dbErr) throw dbErr;

      if (editing?.id) {
        const { error: linkErr } = await supabase
          .from('community_items')
          .update({ image_key: k })
          .eq('id', editing.id);
        if (linkErr) throw linkErr;
        fetchAll();
      }

      setImagePreviewUrl(public_url || null);
      showSaved('Image uploaded');
    } catch (e) {
      showError(`Image upload failed: ${errorMessage(e)}`);
    } finally {
      setImageUploading(false);
    }
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
        .from('community_items')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error || !data) {
        setItems([]);
        return;
      }
      setItems(data as CommunityItemRow[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    const ch = supabase
      .channel('realtime-admin-community')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_items' }, fetchAll)
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(ch);
      } catch (e) {
        void e;
      }
    };
  }, []);

  const stats = useMemo(() => {
    const published = items.filter((i) => i.published).length;
    const drafts = items.length - published;
    return { total: items.length, published, drafts };
  }, [items]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      title: '',
      subtitle: '',
      description: '',
      details: '',
      category: '',
      icon_key: '',
      image_key: '',
      color: '',
      features_text: '',
      link_url: '',
      published: true,
      sort_order: 0,
    });
    setImagePreviewUrl(null);
    setOpen(true);
  };

  const openEdit = (it: CommunityItemRow) => {
    setEditing(it);
    setForm({
      title: it.title,
      subtitle: it.subtitle || '',
      description: it.description || '',
      details: it.details || '',
      category: it.category || '',
      icon_key: it.icon_key || '',
      image_key: it.image_key || '',
      color: it.color || '',
      features_text: (it.features || []).filter(Boolean).join('\n'),
      link_url: it.link_url || '',
      published: !!it.published,
      sort_order: it.sort_order ?? 0,
    });
    setImagePreviewUrl(null);
    setOpen(true);
  };

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!open) return;
      const k = (form.image_key || '').trim();
      if (!k) {
        setImagePreviewUrl(null);
        return;
      }
      const url = await fetchAssetUrl(k);
      if (!cancelled) setImagePreviewUrl(url);
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [open, form.image_key]);

  const save = async () => {
    if (!form.title.trim()) {
      showError('Title is required');
      return;
    }

    setSaving(true);
    try {
      await requireSession();
      const features = (form.features_text || '')
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean);
      const payload = {
        id: editing?.id || crypto.randomUUID(),
        title: form.title,
        subtitle: form.subtitle.trim() || null,
        description: form.description.trim() || null,
        details: form.details.trim() || null,
        category: form.category.trim() || null,
        icon_key: form.icon_key.trim() || null,
        image_key: form.image_key.trim() || null,
        color: form.color.trim() || null,
        features,
        link_url: form.link_url.trim() || null,
        published: !!form.published,
        sort_order: Number.isFinite(form.sort_order) ? form.sort_order : 0,
      };

      const { error } = await supabase.from('community_items').upsert(payload);
      if (error) throw error;

      showSaved(editing ? 'Community item updated' : 'Community item created');
      fetchAll();
      setOpen(false);
      setEditing(null);
    } catch (e) {
      showError(`Save failed: ${errorMessage(e)}`);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (it: CommunityItemRow) => {
    if (!window.confirm('Delete this community item?')) return;
    try {
      await requireSession();
      const { error } = await supabase.from('community_items').delete().eq('id', it.id);
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
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <HeartHandshake className="h-5 w-5 text-maroon-700" />
            <h3 className="text-lg font-semibold text-maroon-800">Community</h3>
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-maroon-700 text-white rounded-lg shadow hover:bg-maroon-800"
          >
            <Plus className="h-4 w-4" />
            Add Item
          </button>
        </div>

        <div className="mb-4 text-sm text-gray-700">
          Total: {stats.total} | Published: {stats.published} | Drafts: {stats.drafts}
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
                      {it.category && <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">{it.category}</span>}
                      <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">Order: {it.sort_order}</span>
                    </div>
                    {it.subtitle && <div className="text-sm text-gray-700">{it.subtitle}</div>}
                    {it.description && <p className="text-sm text-gray-700 mt-2 whitespace-pre-line">{it.description}</p>}
                    {it.link_url && (
                      <div className="mt-2">
                        <a
                          className="text-sm text-maroon-700 hover:underline"
                          href={it.link_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Link
                        </a>
                      </div>
                    )}
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

            {items.length === 0 && <div className="text-sm text-gray-500">No community items yet.</div>}
          </div>
        )}
      </div>

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setEditing(null);
        }}
        title={editing ? 'Update Community Item' : 'Add Community Item'}
        maxWidthClass="max-w-3xl"
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

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle (optional)</label>
            <input
              value={form.subtitle}
              onChange={(e) => setForm((s) => ({ ...s, subtitle: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
              rows={6}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Details (optional)</label>
            <textarea
              value={form.details}
              onChange={(e) => setForm((s) => ({ ...s, details: e.target.value }))}
              rows={4}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Icon key (optional)</label>
            <div className="flex items-center gap-2 mb-2">
              <select
                value={form.icon_key}
                onChange={(e) => setForm((s) => ({ ...s, icon_key: e.target.value }))}
                className="flex-1 rounded-lg border border-gray-200 px-3 py-2 shadow-sm bg-white"
              >
                <option value="">(none)</option>
                {ICON_CHOICES.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    {opt.label} ({opt.key})
                  </option>
                ))}
              </select>

              {(() => {
                const found = ICON_CHOICES.find((x) => x.key === (form.icon_key || '').trim().toLowerCase());
                if (!found) return null;
                const I = found.Icon;
                return (
                  <div className="h-10 w-10 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center">
                    <I className="h-5 w-5 text-gray-700" />
                  </div>
                );
              })()}
            </div>
            <input
              value={form.icon_key}
              onChange={(e) => setForm((s) => ({ ...s, icon_key: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
              placeholder="e.g. users"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image key (optional)</label>
            <input
              value={form.image_key}
              onChange={(e) => setForm((s) => ({ ...s, image_key: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
              placeholder="e.g. community_event_1"
            />
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <label className="inline-flex items-center justify-center px-3 py-2 rounded bg-maroon-700 text-white text-sm cursor-pointer hover:bg-maroon-800 disabled:opacity-60">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={imageUploading || saving}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    void uploadImageForKey(form.image_key, file);
                    e.target.value = '';
                  }}
                />
                {imageUploading ? 'Uploading...' : 'Upload / Replace'}
              </label>
              <div className="text-xs text-gray-500">
                Uploads to <span className="font-mono">site/&lt;image_key&gt;.*</span> in bucket <span className="font-mono">media</span>
              </div>
            </div>
            {imagePreviewUrl ? (
              <img src={imagePreviewUrl} alt="" className="mt-2 w-full h-28 object-cover rounded border" />
            ) : null}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Color class (optional)</label>
            <input
              value={form.color}
              onChange={(e) => setForm((s) => ({ ...s, color: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
              placeholder="e.g. bg-blue-600"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Features (one per line)</label>
            <textarea
              value={form.features_text}
              onChange={(e) => setForm((s) => ({ ...s, features_text: e.target.value }))}
              rows={6}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
              placeholder="Feature A\nFeature B\nFeature C"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Category (optional)</label>
            <input
              value={form.category}
              onChange={(e) => setForm((s) => ({ ...s, category: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
              placeholder="e.g. Parents / Alumni"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Link URL (optional)</label>
            <input
              value={form.link_url}
              onChange={(e) => setForm((s) => ({ ...s, link_url: e.target.value }))}
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
          </div>
        </div>
      </Modal>
    </div>
  );
}
