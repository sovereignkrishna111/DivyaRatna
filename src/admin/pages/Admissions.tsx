import { useEffect, useMemo, useState } from 'react';
import { Calendar, Plus, Save, Trash2, Pencil, ListChecks } from 'lucide-react';
import Modal from '../components/Modal';
import { AdminLogoIcon } from '../components/AdminLogo';
import { supabase } from '../../lib/supabase';

type GradeKey = 'elementary' | 'middle' | 'high';

type AdmissionsGradeRequirementRow = {
  id: string;
  grade_key: GradeKey;
  title: string;
  requirements: string[];
  annual_tuition: string | null;
  application_deadline: string | null;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type AdmissionsImportantDateRow = {
  id: string;
  event: string;
  date: string;
  type: 'info' | 'deadline' | 'success' | 'important';
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type GradeFormState = {
  grade_key: GradeKey;
  title: string;
  requirements_text: string;
  annual_tuition: string;
  application_deadline: string;
  published: boolean;
  sort_order: number;
};

type DateFormState = {
  event: string;
  date: string;
  type: 'info' | 'deadline' | 'success' | 'important';
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

const parseRequirements = (text: string) => {
  return text
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
};

const toDateInputValue = (value: string | null | undefined) => {
  if (!value) return '';
  // Postgres date comes as YYYY-MM-DD; if not, try to parse.
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return '';
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export default function Admissions() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const [bannerKind, setBannerKind] = useState<'success' | 'error'>('success');

  const [gradeItems, setGradeItems] = useState<AdmissionsGradeRequirementRow[]>([]);
  const [dateItems, setDateItems] = useState<AdmissionsImportantDateRow[]>([]);

  const [gradeOpen, setGradeOpen] = useState(false);
  const [gradeEditing, setGradeEditing] = useState<AdmissionsGradeRequirementRow | null>(null);
  const [gradeForm, setGradeForm] = useState<GradeFormState>({
    grade_key: 'elementary',
    title: '',
    requirements_text: '',
    annual_tuition: '',
    application_deadline: '',
    published: true,
    sort_order: 0,
  });

  const [dateOpen, setDateOpen] = useState(false);
  const [dateEditing, setDateEditing] = useState<AdmissionsImportantDateRow | null>(null);
  const [dateForm, setDateForm] = useState<DateFormState>({
    event: '',
    date: '',
    type: 'info',
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
      const [{ data: grades, error: gErr }, { data: dates, error: dErr }] = await Promise.all([
        supabase.from('admissions_grade_requirements').select('*').order('sort_order', { ascending: true }),
        supabase
          .from('admissions_important_dates')
          .select('*')
          .order('sort_order', { ascending: true })
          .order('date', { ascending: true }),
      ]);

      if (gErr || !grades) setGradeItems([]);
      else setGradeItems(grades as AdmissionsGradeRequirementRow[]);

      if (dErr || !dates) setDateItems([]);
      else setDateItems(dates as AdmissionsImportantDateRow[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();

    const ch = supabase
      .channel('realtime-admin-admissions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'admissions_grade_requirements' }, fetchAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'admissions_important_dates' }, fetchAll)
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(ch);
      } catch (e) {
        void e;
      }
    };
  }, []);

  const gradeStats = useMemo(() => {
    const published = gradeItems.filter((i) => i.published).length;
    const drafts = gradeItems.length - published;
    return { published, drafts, total: gradeItems.length };
  }, [gradeItems]);

  const dateStats = useMemo(() => {
    const published = dateItems.filter((i) => i.published).length;
    const drafts = dateItems.length - published;
    return { published, drafts, total: dateItems.length };
  }, [dateItems]);

  const openCreateGrade = () => {
    setGradeEditing(null);
    setGradeForm({
      grade_key: 'elementary',
      title: '',
      requirements_text: '',
      annual_tuition: '',
      application_deadline: '',
      published: true,
      sort_order: 0,
    });
    setGradeOpen(true);
  };

  const openEditGrade = (it: AdmissionsGradeRequirementRow) => {
    setGradeEditing(it);
    setGradeForm({
      grade_key: it.grade_key,
      title: it.title || '',
      requirements_text: (it.requirements || []).join('\n'),
      annual_tuition: it.annual_tuition || '',
      application_deadline: toDateInputValue(it.application_deadline),
      published: !!it.published,
      sort_order: it.sort_order ?? 0,
    });
    setGradeOpen(true);
  };

  const saveGrade = async () => {
    if (!gradeForm.title.trim()) {
      showError('Title is required');
      return;
    }

    setSaving(true);
    try {
      await requireSession();

      const payload = {
        id: gradeEditing?.id || crypto.randomUUID(),
        grade_key: gradeForm.grade_key,
        title: gradeForm.title,
        requirements: parseRequirements(gradeForm.requirements_text),
        annual_tuition: gradeForm.annual_tuition.trim() || null,
        application_deadline: gradeForm.application_deadline || null,
        published: !!gradeForm.published,
        sort_order: Number.isFinite(gradeForm.sort_order) ? gradeForm.sort_order : 0,
      };

      const { error } = await supabase.from('admissions_grade_requirements').upsert(payload);
      if (error) throw error;

      showSaved(gradeEditing ? 'Grade requirements updated' : 'Grade requirements created');
      fetchAll();
      setGradeOpen(false);
      setGradeEditing(null);
    } catch (e) {
      showError(`Save failed: ${errorMessage(e)}`);
    } finally {
      setSaving(false);
    }
  };

  const removeGrade = async (it: AdmissionsGradeRequirementRow) => {
    if (!window.confirm('Delete this grade requirements entry?')) return;
    try {
      await requireSession();
      const { error } = await supabase.from('admissions_grade_requirements').delete().eq('id', it.id);
      if (error) throw error;
      showSaved('Deleted');
      fetchAll();
    } catch (e) {
      showError(`Delete failed: ${errorMessage(e)}`);
    }
  };

  const openCreateDate = () => {
    setDateEditing(null);
    setDateForm({
      event: '',
      date: '',
      type: 'info',
      published: true,
      sort_order: 0,
    });
    setDateOpen(true);
  };

  const openEditDate = (it: AdmissionsImportantDateRow) => {
    setDateEditing(it);
    setDateForm({
      event: it.event || '',
      date: toDateInputValue(it.date),
      type: it.type || 'info',
      published: !!it.published,
      sort_order: it.sort_order ?? 0,
    });
    setDateOpen(true);
  };

  const saveDate = async () => {
    if (!dateForm.event.trim()) {
      showError('Event is required');
      return;
    }
    if (!dateForm.date) {
      showError('Date is required');
      return;
    }

    setSaving(true);
    try {
      await requireSession();

      const payload = {
        id: dateEditing?.id || crypto.randomUUID(),
        event: dateForm.event,
        date: dateForm.date,
        type: dateForm.type,
        published: !!dateForm.published,
        sort_order: Number.isFinite(dateForm.sort_order) ? dateForm.sort_order : 0,
      };

      const { error } = await supabase.from('admissions_important_dates').upsert(payload);
      if (error) throw error;

      showSaved(dateEditing ? 'Important date updated' : 'Important date created');
      fetchAll();
      setDateOpen(false);
      setDateEditing(null);
    } catch (e) {
      showError(`Save failed: ${errorMessage(e)}`);
    } finally {
      setSaving(false);
    }
  };

  const removeDate = async (it: AdmissionsImportantDateRow) => {
    if (!window.confirm('Delete this important date?')) return;
    try {
      await requireSession();
      const { error } = await supabase.from('admissions_important_dates').delete().eq('id', it.id);
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
        <div className="flex items-center gap-2 mb-4">
          <AdminLogoIcon className="h-5 w-5" alt="Logo" />
          <h3 className="text-lg font-semibold text-maroon-800">Admissions</h3>
        </div>

        {loading ? (
          <div className="text-sm text-gray-500">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Grade requirements</div>
                    <div className="text-sm text-gray-600">Edit the content shown under Admission Requirements tabs.</div>
                  </div>
                  <button
                    onClick={openCreateGrade}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-maroon-700 text-white rounded-lg shadow hover:bg-maroon-800"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </button>
                </div>

                <div className="space-y-3">
                  {gradeItems.map((it) => (
                    <div key={it.id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h4 className="text-base font-semibold text-gray-900 truncate">{it.title}</h4>
                            {!it.published && (
                              <span className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-700">Draft</span>
                            )}
                            <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">Key: {it.grade_key}</span>
                            <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">Order: {it.sort_order}</span>
                          </div>
                          <div className="text-sm text-gray-700 mt-2 space-y-2">
                            <div className="text-gray-600">Annual tuition: {it.annual_tuition || '-'}</div>
                            <div className="text-gray-600">Deadline: {toDateInputValue(it.application_deadline) || '-'}</div>
                            <div className="text-gray-700 whitespace-pre-line">
                              {(it.requirements || []).join('\n')}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => openEditGrade(it)}
                            className="inline-flex items-center justify-center w-9 h-9 rounded border hover:bg-gray-50"
                            aria-label="Edit"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => removeGrade(it)}
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

                  {gradeItems.length === 0 && <div className="text-sm text-gray-500">No grade requirements yet.</div>}
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Important dates</div>
                    <div className="text-sm text-gray-600">Edit the cards shown under Important Dates.</div>
                  </div>
                  <button
                    onClick={openCreateDate}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-maroon-700 text-white rounded-lg shadow hover:bg-maroon-800"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </button>
                </div>

                <div className="space-y-3">
                  {dateItems.map((it) => (
                    <div key={it.id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h4 className="text-base font-semibold text-gray-900 truncate">{it.event}</h4>
                            {!it.published && (
                              <span className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-700">Draft</span>
                            )}
                            <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">Type: {it.type}</span>
                            <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">Order: {it.sort_order}</span>
                          </div>
                          <div className="text-sm text-gray-700 mt-2">
                            <div className="inline-flex items-center gap-2 text-gray-600">
                              <Calendar className="h-4 w-4" />
                              {toDateInputValue(it.date)}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => openEditDate(it)}
                            className="inline-flex items-center justify-center w-9 h-9 rounded border hover:bg-gray-50"
                            aria-label="Edit"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => removeDate(it)}
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

                  {dateItems.length === 0 && <div className="text-sm text-gray-500">No important dates yet.</div>}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                  <ListChecks className="h-4 w-4" />
                  Overview
                </div>
                <div className="text-sm text-gray-700">Grades total: {gradeStats.total}</div>
                <div className="text-sm text-gray-700">Grades published: {gradeStats.published}</div>
                <div className="text-sm text-gray-700">Grades drafts: {gradeStats.drafts}</div>
                <div className="mt-3 text-sm text-gray-700">Dates total: {dateStats.total}</div>
                <div className="text-sm text-gray-700">Dates published: {dateStats.published}</div>
                <div className="text-sm text-gray-700">Dates drafts: {dateStats.drafts}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Modal
        open={gradeOpen}
        onClose={() => {
          setGradeOpen(false);
          setGradeEditing(null);
        }}
        title={gradeEditing ? 'Update Grade Requirements' : 'Add Grade Requirements'}
        maxWidthClass="max-w-3xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => {
                setGradeOpen(false);
                setGradeEditing(null);
              }}
              className="px-4 py-2 rounded-lg border bg-white"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveGrade}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Grade key</label>
            <select
              value={gradeForm.grade_key}
              onChange={(e) => setGradeForm((s) => ({ ...s, grade_key: e.target.value as GradeKey }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
            >
              <option value="elementary">Elementary</option>
              <option value="middle">Middle</option>
              <option value="high">High</option>
            </select>
            {gradeEditing && (
              <div className="text-xs text-gray-500 mt-1">
                Grade key is unique. Changing it may fail if another row already uses that key.
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              value={gradeForm.title}
              onChange={(e) => setGradeForm((s) => ({ ...s, title: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Requirements (one per line)</label>
            <textarea
              value={gradeForm.requirements_text}
              onChange={(e) => setGradeForm((s) => ({ ...s, requirements_text: e.target.value }))}
              rows={8}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Annual tuition</label>
              <input
                value={gradeForm.annual_tuition}
                onChange={(e) => setGradeForm((s) => ({ ...s, annual_tuition: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
                placeholder="NPR 180,000 per year"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Application deadline</label>
              <input
                type="date"
                value={gradeForm.application_deadline}
                onChange={(e) => setGradeForm((s) => ({ ...s, application_deadline: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort order</label>
            <input
              type="number"
              value={gradeForm.sort_order}
              onChange={(e) => setGradeForm((s) => ({ ...s, sort_order: Number(e.target.value) }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={gradeForm.published}
                onChange={(e) => setGradeForm((s) => ({ ...s, published: e.target.checked }))}
              />
              Published
            </label>
          </div>
        </div>
      </Modal>

      <Modal
        open={dateOpen}
        onClose={() => {
          setDateOpen(false);
          setDateEditing(null);
        }}
        title={dateEditing ? 'Update Important Date' : 'Add Important Date'}
        maxWidthClass="max-w-3xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => {
                setDateOpen(false);
                setDateEditing(null);
              }}
              className="px-4 py-2 rounded-lg border bg-white"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveDate}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Event</label>
            <input
              value={dateForm.event}
              onChange={(e) => setDateForm((s) => ({ ...s, event: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={dateForm.date}
                onChange={(e) => setDateForm((s) => ({ ...s, date: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={dateForm.type}
                onChange={(e) => setDateForm((s) => ({ ...s, type: e.target.value as DateFormState['type'] }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
              >
                <option value="info">Info</option>
                <option value="deadline">Deadline</option>
                <option value="success">Success</option>
                <option value="important">Important</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort order</label>
            <input
              type="number"
              value={dateForm.sort_order}
              onChange={(e) => setDateForm((s) => ({ ...s, sort_order: Number(e.target.value) }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={dateForm.published}
                onChange={(e) => setDateForm((s) => ({ ...s, published: e.target.checked }))}
              />
              Published
            </label>
          </div>
        </div>
      </Modal>
    </div>
  );
}
