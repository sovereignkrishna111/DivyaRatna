import { useEffect, useMemo, useState } from 'react';
import { HelpCircle, Plus, Save, Trash2, Pencil } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Modal from '../components/Modal';

type FaqRow = {
  id: string;
  question: string;
  answer: string;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type FormState = {
  question: string;
  answer: string;
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

export default function Faqs() {
  const [items, setItems] = useState<FaqRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const [bannerKind, setBannerKind] = useState<'success' | 'error'>('success');

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<FaqRow | null>(null);

  const [form, setForm] = useState<FormState>({
    question: '',
    answer: '',
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

  const fetchAll = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('updated_at', { ascending: false });

      if (error || !data) {
        setItems([]);
        return;
      }
      setItems(data as FaqRow[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    const ch = supabase
      .channel('realtime-admin-faqs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'faqs' }, fetchAll)
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
      question: '',
      answer: '',
      published: true,
      sort_order: 0,
    });
    setOpen(true);
  };

  const openEdit = (it: FaqRow) => {
    setEditing(it);
    setForm({
      question: it.question,
      answer: it.answer,
      published: !!it.published,
      sort_order: it.sort_order ?? 0,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.question.trim()) {
      showError('Question is required');
      return;
    }
    if (!form.answer.trim()) {
      showError('Answer is required');
      return;
    }

    setSaving(true);
    try {
      await requireSession();
      const id = editing?.id || safeUuid();

      const payload = {
        id,
        question: form.question,
        answer: form.answer,
        published: !!form.published,
        sort_order: Number.isFinite(form.sort_order) ? form.sort_order : 0,
      };

      const { error } = await supabase.from('faqs').upsert(payload);
      if (error) throw error;

      showSaved(editing ? 'FAQ updated' : 'FAQ created');
      fetchAll();
      setOpen(false);
      setEditing(null);
    } catch (e) {
      showError(`Save failed: ${errorMessage(e)}`);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (it: FaqRow) => {
    if (!window.confirm('Delete this FAQ?')) return;
    try {
      await requireSession();
      const { error } = await supabase.from('faqs').delete().eq('id', it.id);
      if (error) throw error;
      showSaved('Deleted');
      fetchAll();
    } catch (e) {
      showError(`Delete failed: ${errorMessage(e)}`);
    }
  };

  const stats = useMemo(() => {
    const published = items.filter((i) => i.published).length;
    const drafts = items.length - published;
    return { published, drafts, total: items.length };
  }, [items]);

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
          <HelpCircle className="h-5 w-5 text-maroon-700" />
          <h3 className="text-lg font-semibold text-maroon-800">FAQs</h3>
        </div>

        {loading ? (
          <div className="text-sm text-gray-500">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="border rounded-lg p-4">
                <div className="text-sm font-semibold text-gray-900 mb-3">Manage items</div>

                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-gray-600">Create, edit, publish, and reorder FAQs.</div>
                  <button
                    onClick={openCreate}
                    className="inline-flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-maroon-700 text-white rounded-lg shadow hover:bg-maroon-800 text-sm leading-tight text-center"
                  >
                    <Plus className="h-4 w-4" />
                    Add FAQ
                  </button>
                </div>

                <div className="space-y-3">
                  {items.map((it) => (
                    <div key={it.id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h4 className="text-base font-semibold text-gray-900 truncate">{it.question}</h4>
                            {!it.published && (
                              <span className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-700">Draft</span>
                            )}
                            <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">Order: {it.sort_order}</span>
                          </div>
                          <p className="text-sm text-gray-700 mt-2 whitespace-pre-line">{it.answer}</p>
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

                  {items.length === 0 && <div className="text-sm text-gray-500">No FAQs yet.</div>}
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

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setEditing(null);
        }}
        title={editing ? 'Update FAQ' : 'Add FAQ'}
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
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
            <input
              value={form.question}
              onChange={(e) => setForm((s) => ({ ...s, question: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
            <textarea
              value={form.answer}
              onChange={(e) => setForm((s) => ({ ...s, answer: e.target.value }))}
              rows={6}
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

          <div className="flex flex-wrap items-center justify-between gap-3">
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
