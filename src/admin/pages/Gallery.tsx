import { useEffect, useMemo, useState } from 'react';
import { Image as ImageIcon, Save, Trash2, Pencil, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Modal from '../components/Modal';

type GalleryRow = {
  id: string;
  title: string;
  type: string;
  media_kind: string;
  storage_path: string | null;
  image_url: string;
  video_url: string | null;
  thumbnail_url: string | null;
  featured: boolean;
  featured_order: number;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type FormState = {
  title: string;
  type: string;
  media_kind: string;
  video_url: string;
  thumbnail_url: string;
  featured: boolean;
  featured_order: number;
  published: boolean;
  sort_order: number;
};

const DEFAULT_TYPES = ['Events', 'Sports', 'Academics', 'Culture', 'Community', 'Facilities', 'Achievements'];

function extFromFilename(name: string) {
  const idx = name.lastIndexOf('.');
  if (idx === -1) return '';
  return name.slice(idx + 1).toLowerCase();
}

export default function Gallery() {
  const [items, setItems] = useState<GalleryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const [bannerKind, setBannerKind] = useState<'success' | 'error'>('success');

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<GalleryRow | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [customType, setCustomType] = useState('');

  const [form, setForm] = useState<FormState>({
    title: '',
    type: DEFAULT_TYPES[0],
    media_kind: 'image',
    video_url: '',
    thumbnail_url: '',
    featured: false,
    featured_order: 0,
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
        .from('gallery_items')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });
      if (error || !data) {
        setItems([]);
        return;
      }
      setItems(data as GalleryRow[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    const ch = supabase
      .channel('realtime-admin-gallery')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gallery_items' }, fetchAll)
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(ch);
      } catch (e) {
        void e;
      }
    };
  }, []);

  const allTypes = useMemo(() => {
    const set = new Set<string>(DEFAULT_TYPES);
    for (const it of items) set.add(it.type);
    return Array.from(set);
  }, [items]);

  const openCreate = () => {
    setEditing(null);
    setFile(null);
    setCustomType('');
    setForm({
      title: '',
      type: DEFAULT_TYPES[0],
      media_kind: 'image',
      video_url: '',
      thumbnail_url: '',
      featured: false,
      featured_order: 0,
      published: true,
      sort_order: 0,
    });
    setOpen(true);
  };

  const openEdit = (it: GalleryRow) => {
    setEditing(it);
    setFile(null);
    setCustomType('');
    setForm({
      title: it.title,
      type: it.type,
      media_kind: it.media_kind || 'image',
      video_url: it.video_url || '',
      thumbnail_url: it.thumbnail_url || '',
      featured: !!it.featured,
      featured_order: it.featured_order ?? 0,
      published: it.published,
      sort_order: it.sort_order ?? 0,
    });
    setOpen(true);
  };

  const uploadToStorage = async (id: string, f: File) => {
    setUploading(true);
    try {
      await requireSession();
      const ext = extFromFilename(f.name) || 'bin';
      const path = `items/${id}/${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage.from('gallery').upload(path, f, { upsert: true });
      if (upErr) throw upErr;

      const { data: urlData } = supabase.storage.from('gallery').getPublicUrl(path);
      const rawUrl = urlData?.publicUrl || '';
      const publicUrl = rawUrl ? `${rawUrl}?v=${Date.now()}` : '';

      return { storage_path: path, image_url: publicUrl };
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!form.title.trim()) {
      showError('Title is required');
      return;
    }

    const typeValue = form.type === '__custom__' ? customType.trim() : form.type;
    if (!typeValue) {
      showError('Type is required');
      return;
    }

    setSaving(true);
    try {
      const session = await requireSession();
      const role = (session as unknown as { user?: { role?: string } })?.user?.role;
      if (!role || role === 'anon') {
        throw new Error('Not authenticated in Supabase (RLS will block writes). Please log out and log in again to admin.');
      }
      const id = editing?.id || crypto.randomUUID();

      let storage_path = editing?.storage_path || null;
      let image_url = editing?.image_url || '';

      const nextMediaKind = form.media_kind === 'video' ? 'video' : 'image';

      const video_url = nextMediaKind === 'video' ? (form.video_url || null) : null;
      const thumbnail_url = nextMediaKind === 'video' ? (form.thumbnail_url || null) : null;

      if (nextMediaKind === 'image' && file) {
        if (editing?.storage_path) {
          try {
            await supabase.storage.from('gallery').remove([editing.storage_path]);
          } catch (e) {
            void e;
          }
        }
        const uploaded = await uploadToStorage(id, file);
        storage_path = uploaded.storage_path;
        image_url = uploaded.image_url;
      }

      if (nextMediaKind === 'video') {
        storage_path = null;
        image_url = '';
      }

      const payload = {
        id,
        title: form.title,
        type: typeValue,
        media_kind: nextMediaKind,
        storage_path,
        image_url,
        video_url,
        thumbnail_url,
        featured: !!form.featured,
        featured_order: Number.isFinite(form.featured_order) ? form.featured_order : 0,
        published: form.published,
        sort_order: Number.isFinite(form.sort_order) ? form.sort_order : 0,
      };

      const { error } = await supabase.from('gallery_items').upsert(payload);
      if (error) throw error;

      showSaved(editing ? 'Gallery item updated' : 'Gallery item created');
      fetchAll();
      setOpen(false);
      setEditing(null);
      setFile(null);
      setCustomType('');
    } catch (e) {
      const base = errorMessage(e);
      const hint = base.toLowerCase().includes('row-level security')
        ? ' (RLS blocked this. Confirm you ran the SQL on the same Supabase project used by VITE_SUPABASE_URL and re-login to admin.)'
        : '';
      showError(`Save failed: ${base}${hint}`);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (it: GalleryRow) => {
    if (!window.confirm('Delete this gallery item?')) return;
    try {
      await requireSession();
      if (it.storage_path) {
        try {
          await supabase.storage.from('gallery').remove([it.storage_path]);
        } catch (e) {
          void e;
        }
      }
      const { error } = await supabase.from('gallery_items').delete().eq('id', it.id);
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
            <ImageIcon className="h-5 w-5 text-maroon-700" />
            <h3 className="text-lg font-semibold text-maroon-800">Gallery</h3>
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-maroon-700 text-white rounded-lg shadow hover:bg-maroon-800"
          >
            <Plus className="h-4 w-4" />
            Add Image
          </button>
        </div>

        {loading ? (
          <div className="text-sm text-gray-500">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {items.map((it) => (
              <div key={it.id} className="rounded-lg border border-gray-200 overflow-hidden bg-white">
                <div className="relative">
                  {it.media_kind === 'video' ? (
                    it.thumbnail_url ? (
                      <img src={it.thumbnail_url} alt={it.title} className="w-full h-52 object-cover" />
                    ) : (
                      <div className="w-full h-52 bg-gray-100 flex items-center justify-center text-xs text-gray-400">No thumbnail</div>
                    )
                  ) : it.image_url ? (
                    <img src={it.image_url} alt={it.title} className="w-full h-52 object-cover" />
                  ) : (
                    <div className="w-full h-52 bg-gray-100 flex items-center justify-center text-xs text-gray-400">No image</div>
                  )}
                  {!it.published && (
                    <div className="absolute top-3 left-3 text-[11px] px-2 py-1 rounded-full bg-gray-900/70 text-white">Draft</div>
                  )}
                  {it.featured && (
                    <div className="absolute top-3 right-3 text-[11px] px-2 py-1 rounded-full bg-maroon-700 text-white">Featured</div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900 truncate">{it.title}</div>
                      <div className="mt-1 text-xs text-gray-600">Category: {it.type} • Kind: {it.media_kind} • Sort: {it.sort_order}</div>
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
              </div>
            ))}

            {items.length === 0 && (
              <div className="text-sm text-gray-500">No gallery images yet.</div>
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
          setCustomType('');
        }}
        title={editing ? 'Update Gallery Image' : 'Add Gallery Image'}
        maxWidthClass="max-w-3xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setEditing(null);
                setFile(null);
                setCustomType('');
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
                placeholder="e.g. Annual Function 2081"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Media kind</label>
              <select
                value={form.media_kind}
                onChange={(e) => {
                  const v = e.target.value;
                  setForm((s) => ({ ...s, media_kind: v }));
                  if (v === 'video') setFile(null);
                }}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
              >
                <option value="image">Image</option>
                <option value="video">Video (link)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={form.type}
                onChange={(e) => {
                  const v = e.target.value;
                  setForm((s) => ({ ...s, type: v }));
                  if (v !== '__custom__') setCustomType('');
                }}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
              >
                {allTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
                <option value="__custom__">Other (custom)</option>
              </select>
              {form.type === '__custom__' && (
                <input
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
                  placeholder="Enter custom type"
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort order</label>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm((s) => ({ ...s, sort_order: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
                />
              </div>
              <div className="flex items-end">
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

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-end">
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm((s) => ({ ...s, featured: e.target.checked }))}
                  />
                  Featured
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Featured order</label>
                <input
                  type="number"
                  value={form.featured_order}
                  onChange={(e) => setForm((s) => ({ ...s, featured_order: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
                />
              </div>
            </div>

            {form.media_kind === 'image' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <div className="mt-2 text-xs text-gray-500">
                  {editing?.image_url ? 'Uploading a new file will replace the existing image.' : 'Please upload an image file.'}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Video URL</label>
                  <input
                    value={form.video_url}
                    onChange={(e) => setForm((s) => ({ ...s, video_url: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail URL (optional)</label>
                  <input
                    value={form.thumbnail_url}
                    onChange={(e) => setForm((s) => ({ ...s, thumbnail_url: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
                    placeholder="https://.../thumbnail.jpg"
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="text-sm font-semibold text-gray-900 mb-2">Preview</div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
              {form.media_kind === 'video' ? (
                form.thumbnail_url ? (
                  <img src={form.thumbnail_url} alt="Preview" className="w-full h-72 object-cover" />
                ) : editing?.thumbnail_url ? (
                  <img src={editing.thumbnail_url} alt={editing.title} className="w-full h-72 object-cover" />
                ) : (
                  <div className="w-full h-72 flex items-center justify-center text-sm text-gray-500">No thumbnail selected</div>
                )
              ) : file ? (
                <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-72 object-cover" />
              ) : editing?.image_url ? (
                <img src={editing.image_url} alt={editing.title} className="w-full h-72 object-cover" />
              ) : (
                <div className="w-full h-72 flex items-center justify-center text-sm text-gray-500">No image selected</div>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
