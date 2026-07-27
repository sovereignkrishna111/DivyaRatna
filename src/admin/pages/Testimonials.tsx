import { useEffect, useMemo, useState } from 'react';
import { MessageSquareQuote, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Modal from '../components/Modal';

type TestimonialRow = {
  id: string;
  name: string;
  role: string | null;
  content: string;
  rating: number;
  sort_order: number;
  storage_path: string | null;
  image_url: string;
  published: boolean;
  created_at: string;
  updated_at: string;
};

type FormState = {
  name: string;
  role: string;
  content: string;
  rating: number;
  sort_order: number;
  published: boolean;
};

function extFromFilename(name: string) {
  const idx = name.lastIndexOf('.');
  if (idx === -1) return '';
  return name.slice(idx + 1).toLowerCase();
}

function clampRating(n: number) {
  if (Number.isNaN(n)) return 5;
  return Math.max(0, Math.min(5, Math.floor(n)));
}

export default function Testimonials() {
  const [items, setItems] = useState<TestimonialRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const [bannerKind, setBannerKind] = useState<'success' | 'error'>('success');

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TestimonialRow | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const [form, setForm] = useState<FormState>({
    name: '',
    role: '',
    content: '',
    rating: 5,
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
        .from('testimonials')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('updated_at', { ascending: false });
      if (error || !data) {
        setItems([]);
        return;
      }
      setItems(data as TestimonialRow[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    const ch = supabase
      .channel('realtime-admin-testimonials')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'testimonials' }, fetchAll)
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
    setForm({ name: '', role: '', content: '', rating: 5, sort_order: 0, published: true });
    setOpen(true);
  };

  const openEdit = (it: TestimonialRow) => {
    setEditing(it);
    setFile(null);
    setForm({
      name: it.name,
      role: it.role || '',
      content: it.content,
      rating: clampRating(it.rating),
      sort_order: typeof it.sort_order === 'number' ? it.sort_order : 0,
      published: it.published,
    });
    setOpen(true);
  };

  const uploadToStorage = async (id: string, f: File) => {
    setUploading(true);
    try {
      await requireSession();
      const ext = extFromFilename(f.name) || 'bin';
      const path = `posts/${id}/${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage.from('testimonials').upload(path, f, { upsert: true });
      if (upErr) throw upErr;

      const { data: urlData } = supabase.storage.from('testimonials').getPublicUrl(path);
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

      if (!form.name.trim()) {
        showError('Name is required');
        return;
      }

      if (!form.content.trim()) {
        showError('Testimonial text is required');
        return;
      }

      const payload = {
        name: form.name.trim(),
        role: form.role.trim() || null,
        content: form.content.trim(),
        rating: clampRating(form.rating),
        sort_order: Number.isFinite(form.sort_order) ? Math.floor(form.sort_order) : 0,
        published: form.published,
      };

      if (!editing) {
        const { data, error } = await supabase.from('testimonials').insert(payload).select('*').single();
        if (error || !data) throw error;

        const created = data as TestimonialRow;

        if (file) {
          const uploaded = await uploadToStorage(created.id, file);
          await supabase.from('testimonials').update(uploaded).eq('id', created.id);
        }

        showSaved('Testimonial added');
        setOpen(false);
        return;
      }

      let patch: Record<string, unknown> = payload;

      if (file) {
        if (editing.storage_path) {
          try {
            await supabase.storage.from('testimonials').remove([editing.storage_path]);
          } catch {
            void 0;
          }
        }
        const uploaded = await uploadToStorage(editing.id, file);
        patch = { ...patch, storage_path: uploaded.storage_path, image_url: uploaded.image_url };
      }

      const { error: upErr } = await supabase.from('testimonials').update(patch).eq('id', editing.id);
      if (upErr) throw upErr;

      showSaved('Testimonial updated');
      setOpen(false);
    } catch (e) {
      showError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (it: TestimonialRow) => {
    setSaving(true);
    try {
      await requireSession();
      if (it.storage_path) {
        try {
          await supabase.storage.from('testimonials').remove([it.storage_path]);
        } catch {
          void 0;
        }
      }
      const { error } = await supabase.from('testimonials').delete().eq('id', it.id);
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
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-maroon-800">Testimonials</h3>
            <p className="text-sm text-gray-600">Manage “What Our Community Says” items shown on the Home page.</p>
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-maroon-700 text-white rounded-lg shadow hover:bg-maroon-800"
          >
            <Plus className="h-4 w-4" />
            Add Testimonial
          </button>
        </div>

        {banner && (
          <div
            className={`mb-4 rounded-xl px-4 py-3 text-sm font-semibold border ${
              bannerKind === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {banner}
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <div>{items.length} total</div>
          <div className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            {publishedCount} published
          </div>
        </div>

        {loading ? (
          <div className="text-sm text-gray-500">Loading…</div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-maroon-700 text-white flex items-center justify-center shadow">
              <MessageSquareQuote className="h-6 w-6" />
            </div>
            <h4 className="mt-4 text-lg font-semibold text-gray-900">No testimonials yet</h4>
            <p className="mt-1 text-gray-600">Add one to make the Home page section fully dynamic.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {items.map((it) => {
              return (
                <div
                  key={it.id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_14px_35px_-28px_rgba(0,0,0,0.45)]"
                >
                  <div className="relative h-40 bg-gray-100">
                    {it.image_url ? (
                      <img src={it.image_url} alt={it.name} className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-500 text-sm">No image</div>
                    )}
                    <div className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold border bg-white/95">
                      <span className={`h-2 w-2 rounded-full ${it.published ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                      {it.published ? 'Published' : 'Hidden'}
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-base font-semibold text-gray-900 truncate">{it.name}</div>
                        <div className="mt-0.5 text-sm text-gray-600 truncate">{it.role || 'Community Member'}</div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(it)}
                          className="h-9 w-9 inline-flex items-center justify-center rounded-lg border bg-white hover:bg-gray-50"
                          aria-label="Edit"
                        >
                          <Pencil className="h-4 w-4 text-gray-700" />
                        </button>
                        <button
                          onClick={() => remove(it)}
                          disabled={saving}
                          className="h-9 w-9 inline-flex items-center justify-center rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-50"
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-rose-600" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: clampRating(it.rating) }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                      ))}
                      <div className="ml-2 text-xs text-gray-500">Order: {it.sort_order}</div>
                    </div>

                    <div className="text-sm text-gray-700 line-clamp-4">{it.content}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Update Testimonial' : 'Add Testimonial'}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-gray-800">Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm"
                placeholder="Full name"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-800">Role</label>
              <input
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm"
                placeholder="Parent / Alumni / Student"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-800">Testimonial</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm"
              rows={5}
              placeholder="Write the testimonial text…"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div>
              <label className="text-sm font-semibold text-gray-800">Rating (0–5)</label>
              <input
                type="number"
                min={0}
                max={5}
                value={form.rating}
                onChange={(e) => setForm((f) => ({ ...f, rating: Number(e.target.value) }))}
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-800">Sort Order</label>
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))}
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm"
              />
            </div>
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-800">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
              />
              Published
            </label>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-800">Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm"
            />
            <div className="mt-1 text-xs text-gray-500">Upload a profile photo. If you don’t upload, the old image stays (when editing).</div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              onClick={() => setOpen(false)}
              className="px-4 py-2 rounded-lg border bg-white"
              disabled={saving || uploading}
            >
              Cancel
            </button>
            <button
              onClick={submit}
              className="px-4 py-2 rounded-lg bg-maroon-700 text-white hover:bg-maroon-800 disabled:opacity-50"
              disabled={saving || uploading}
            >
              {saving ? 'Saving…' : uploading ? 'Uploading…' : 'Save'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
