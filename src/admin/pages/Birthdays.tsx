import { useEffect, useMemo, useState } from 'react';
import { Cake, Pencil, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Modal from '../components/Modal';

type BirthdayRow = {
  id: string;
  name: string;
  role: string | null;
  class_name: string | null;
  section: string | null;
  start_at: string;
  end_at: string;
  storage_path: string | null;
  image_url: string;
  published: boolean;
  created_at: string;
  updated_at: string;
};

type FormState = {
  name: string;
  role: string;
  class_name: string;
  section: string;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  published: boolean;
};

function addHoursIso(isoOrLocal: string, hours: number) {
  const d = new Date(isoOrLocal);
  d.setHours(d.getHours() + hours);
  return d.toISOString();
}

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function toDateValue(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function toTimeValue(d: Date) {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function combineDateTimeToIso(date: string, time: string) {
  if (!date || !time) return '';
  const isoLocal = `${date}T${time}:00`;
  const d = new Date(isoLocal);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString();
}

function extFromFilename(name: string) {
  const idx = name.lastIndexOf('.');
  if (idx === -1) return '';
  return name.slice(idx + 1).toLowerCase();
}

function labelFor(row: { role: string | null; class_name: string | null; section: string | null }) {
  const parts: string[] = [];
  if (row.role) parts.push(row.role);
  if (row.class_name) parts.push(`Class ${row.class_name}${row.section ? ` • ${row.section}` : ''}`);
  return parts.join(' • ');
}

function prettyRange(startAt: string, endAt: string) {
  try {
    const s = new Date(startAt);
    const e = new Date(endAt);
    const day = s.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    const st = s.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const et = e.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${day} • ${st} → ${et}`;
  } catch {
    return '';
  }
}

export default function Birthdays() {
  const [items, setItems] = useState<BirthdayRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const [bannerKind, setBannerKind] = useState<'success' | 'error'>('success');

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<BirthdayRow | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const [form, setForm] = useState<FormState>(() => {
    const start = new Date();
    start.setSeconds(0, 0);
    const end = new Date(start);
    end.setHours(end.getHours() + 24);
    return {
      name: '',
      role: '',
      class_name: '',
      section: '',
      start_date: toDateValue(start),
      start_time: toTimeValue(start),
      end_date: toDateValue(end),
      end_time: toTimeValue(end),
      published: true,
    };
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
        .from('birthdays')
        .select('*')
        .order('start_at', { ascending: false });
      if (error || !data) {
        setItems([]);
        return;
      }
      setItems(data as BirthdayRow[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    const ch = supabase
      .channel('realtime-admin-birthdays')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'birthdays' }, fetchAll)
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(ch);
      } catch {
        void 0;
      }
    };
  }, []);

  const activeCount = useMemo(() => {
    const now = Date.now();
    return items.filter((i) => {
      const s = new Date(i.start_at).getTime();
      const e = new Date(i.end_at).getTime();
      return i.published && now >= s && now < e;
    }).length;
  }, [items]);

  const openCreate = () => {
    const start = new Date();
    start.setSeconds(0, 0);
    const end = new Date(start);
    end.setHours(end.getHours() + 24);

    setEditing(null);
    setFile(null);
    setForm({
      name: '',
      role: '',
      class_name: '',
      section: '',
      start_date: toDateValue(start),
      start_time: toTimeValue(start),
      end_date: toDateValue(end),
      end_time: toTimeValue(end),
      published: true,
    });
    setOpen(true);
  };

  const openEdit = (it: BirthdayRow) => {
    const s = new Date(it.start_at);
    const e = new Date(it.end_at);
    setEditing(it);
    setFile(null);
    setForm({
      name: it.name,
      role: it.role || '',
      class_name: it.class_name || '',
      section: it.section || '',
      start_date: toDateValue(s),
      start_time: toTimeValue(s),
      end_date: toDateValue(e),
      end_time: toTimeValue(e),
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

      const { error: upErr } = await supabase.storage.from('birthdays').upload(path, f, { upsert: true });
      if (upErr) throw upErr;

      const { data: urlData } = supabase.storage.from('birthdays').getPublicUrl(path);
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

      const startIso = combineDateTimeToIso(form.start_date, form.start_time);
      if (!form.name.trim()) {
        showError('Name is required');
        return;
      }

      if (!startIso) {
        showError('Start date and time are required');
        return;
      }

      const endIso = (form.end_date && form.end_time)
        ? combineDateTimeToIso(form.end_date, form.end_time)
        : addHoursIso(startIso, 24);

      if (!endIso) {
        showError('End time is required');
        return;
      }

      if (new Date(endIso).getTime() <= new Date(startIso).getTime()) {
        showError('End time must be after start time');
        return;
      }

      if (!editing) {
        const { data, error } = await supabase
          .from('birthdays')
          .insert({
            name: form.name.trim(),
            role: form.role.trim() || null,
            class_name: form.class_name.trim() || null,
            section: form.section.trim() || null,
            start_at: startIso,
            end_at: endIso,
            published: form.published,
          })
          .select('*')
          .single();

        if (error || !data) throw error;

        const created = data as BirthdayRow;

        if (file) {
          const uploaded = await uploadToStorage(created.id, file);
          await supabase
            .from('birthdays')
            .update({ storage_path: uploaded.storage_path, image_url: uploaded.image_url })
            .eq('id', created.id);
        }

        showSaved('Birthday scheduled');
        setOpen(false);
        return;
      }

      let patch: Record<string, unknown> = {
        name: form.name.trim(),
        role: form.role.trim() || null,
        class_name: form.class_name.trim() || null,
        section: form.section.trim() || null,
        start_at: startIso,
        end_at: endIso,
        published: form.published,
      };

      if (file) {
        if (editing.storage_path) {
          try {
            await supabase.storage.from('birthdays').remove([editing.storage_path]);
          } catch {
            void 0;
          }
        }
        const uploaded = await uploadToStorage(editing.id, file);
        patch = { ...patch, storage_path: uploaded.storage_path, image_url: uploaded.image_url };
      }

      const { error: upErr } = await supabase.from('birthdays').update(patch).eq('id', editing.id);
      if (upErr) throw upErr;

      showSaved('Birthday updated');
      setOpen(false);
    } catch (e) {
      showError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (it: BirthdayRow) => {
    setSaving(true);
    try {
      await requireSession();
      if (it.storage_path) {
        try {
          await supabase.storage.from('birthdays').remove([it.storage_path]);
        } catch {
          void 0;
        }
      }
      const { error } = await supabase.from('birthdays').delete().eq('id', it.id);
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
            <h3 className="text-lg font-semibold text-maroon-800">Birthdays</h3>
            <p className="text-sm text-gray-600">Schedule birthday posts. They automatically appear and vanish on time.</p>
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-maroon-700 text-white rounded-lg shadow hover:bg-maroon-800"
          >
            <Plus className="h-4 w-4" />
            Add Birthday
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
            {activeCount} active now
          </div>
        </div>

        {loading ? (
          <div className="text-sm text-gray-500">Loading…</div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-maroon-700 text-white flex items-center justify-center shadow">
              <Cake className="h-6 w-6" />
            </div>
            <h4 className="mt-4 text-lg font-semibold text-gray-900">No birthday posts yet</h4>
            <p className="mt-1 text-gray-600">Create one to show it on the Home page automatically.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {items.map((it) => {
              const now = Date.now();
              const active = it.published && now >= new Date(it.start_at).getTime() && now < new Date(it.end_at).getTime();
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
                      <span className={`h-2 w-2 rounded-full ${active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                      {active ? 'Active' : it.published ? 'Scheduled' : 'Hidden'}
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-base font-semibold text-gray-900 truncate">{it.name}</div>
                        <div className="mt-0.5 text-sm text-gray-600 truncate">{labelFor(it) || 'School Family'}</div>
                        <div className="mt-2 text-xs text-gray-500">{prettyRange(it.start_at, it.end_at)}</div>
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
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Update Birthday' : 'Add Birthday'}>
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
                placeholder="Teacher / Student / Staff"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-gray-800">Class</label>
              <input
                value={form.class_name}
                onChange={(e) => setForm((f) => ({ ...f, class_name: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm"
                placeholder="e.g. 10"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-800">Section</label>
              <input
                value={form.section}
                onChange={(e) => setForm((f) => ({ ...f, section: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm"
                placeholder="e.g. A"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-gray-800">Start Date</label>
              <input
                type="date"
                value={form.start_date}
                onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-800">Start Time</label>
              <input
                type="time"
                value={form.start_time}
                onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-gray-800">End Date (optional)</label>
              <input
                type="date"
                value={form.end_date}
                onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-800">End Time (optional)</label>
              <input
                type="time"
                value={form.end_time}
                onChange={(e) => setForm((f) => ({ ...f, end_time: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm"
              />
              <div className="mt-1 flex items-center justify-between gap-2">
                <div className="text-xs text-gray-500">Leave End Date/Time empty to auto-expire after 24 hours.</div>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, end_date: '', end_time: '' }))}
                  className="text-xs font-semibold text-maroon-700 hover:text-maroon-900"
                >
                  Clear End
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
            <div>
              <label className="text-sm font-semibold text-gray-800">Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm"
              />
              <div className="mt-1 text-xs text-gray-500">Upload a birthday image/poster.</div>
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
