import React from 'react';
import { usePeopleStore, Teacher } from '../hooks/usePeopleStore';
import Select from '../components/Select';
import { usePeopleTotals } from '../hooks/usePeopleTotals';

const Teachers: React.FC = () => {
  const { items, add, remove } = usePeopleStore<Teacher>('teachers');
  const { rows, upsert } = usePeopleTotals();
  const totals = rows.teachers;

  const [form, setForm] = React.useState<Omit<Teacher, 'id'>>({
    name: '', phone: '', address: '', className: '', section: ''
  });
  const [filter, setFilter] = React.useState<{ className: string; section: string }>({ className: '', section: '' });
  const [countDraft, setCountDraft] = React.useState<string>('');
  const [savingCount, setSavingCount] = React.useState(false);
  const [savingMode, setSavingMode] = React.useState(false);
  const [banner, setBanner] = React.useState<string | null>(null);
  const [bannerKind, setBannerKind] = React.useState<'success' | 'error'>('success');

  React.useEffect(() => {
    setCountDraft(totals.total_count == null ? '' : String(totals.total_count));
  }, [totals.total_count]);

  const showSaved = (text: string) => {
    setBannerKind('success');
    setBanner(text);
    window.setTimeout(() => setBanner(null), 2500);
  };

  const showError = (text: string) => {
    setBannerKind('error');
    setBanner(text);
    window.setTimeout(() => setBanner(null), 5000);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    add(form);
    setForm({ name: '', phone: '', address: '', className: '', section: '' });
  };

  const setMode = async (mode: 'manual' | 'count_only') => {
    setSavingMode(true);
    try {
      await upsert('teachers', { mode });
      showSaved('Mode updated');
    } catch {
      showError('Failed to update mode');
    } finally {
      setSavingMode(false);
    }
  };

  const saveCount = async () => {
    const next = countDraft.trim() === '' ? null : Number(countDraft);
    if (next != null && (!Number.isFinite(next) || next < 0)) {
      showError('Enter a valid non-negative number');
      return;
    }
    setSavingCount(true);
    try {
      await upsert('teachers', { total_count: next });
      showSaved('Total saved');
    } catch {
      showError('Failed to save total');
    } finally {
      setSavingCount(false);
    }
  };

  const filtered = items.filter((it) =>
    (!filter.className || it.className === filter.className) &&
    (!filter.section || it.section === filter.section)
  );

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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-maroon-800">Teachers Mode</h3>
            <p className="text-sm text-gray-600">Choose whether to add teacher details or only set the total count.</p>
          </div>
          <div className="inline-flex rounded-lg border border-gray-200 bg-white overflow-hidden">
            <button
              type="button"
              onClick={() => setMode('manual')}
              disabled={savingMode}
              className={`px-4 py-2 text-sm ${totals.mode === 'manual' ? 'bg-maroon-700 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} disabled:opacity-60`}
            >
              Manual Entry
            </button>
            <button
              type="button"
              onClick={() => setMode('count_only')}
              disabled={savingMode}
              className={`px-4 py-2 text-sm ${totals.mode === 'count_only' ? 'bg-maroon-700 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} disabled:opacity-60`}
            >
              Count Only
            </button>
          </div>
        </div>

        {totals.mode === 'count_only' && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Teachers (optional)</label>
              <input
                value={countDraft}
                onChange={(e) => setCountDraft(e.target.value)}
                placeholder="e.g. 87"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-maroon-600 focus:border-maroon-600 placeholder:text-gray-400"
              />
            </div>
            <div className="md:col-span-4">
              <button
                type="button"
                onClick={saveCount}
                disabled={savingCount}
                className="px-4 py-2 bg-maroon-700 text-white rounded-lg shadow hover:bg-maroon-800 disabled:opacity-60"
              >
                {savingCount ? 'Saving...' : 'Save Total'}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-maroon-800 mb-4">Add Teacher</h3>
        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <input placeholder="Name" value={form.name} onChange={(e)=>setForm(f=>({...f,name:e.target.value}))}
            className="md:col-span-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-maroon-600 focus:border-maroon-600 placeholder:text-gray-400" />
          <input placeholder="Phone Number" value={form.phone} onChange={(e)=>setForm(f=>({...f,phone:e.target.value}))}
            className="md:col-span-1 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-maroon-600 focus:border-maroon-600 placeholder:text-gray-400" />
          <input placeholder="Address" value={form.address} onChange={(e)=>setForm(f=>({...f,address:e.target.value}))}
            className="md:col-span-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-maroon-600 focus:border-maroon-600 placeholder:text-gray-400" />
          <div className="flex gap-3 md:col-span-1">
            <Select value={form.className} onChange={(e)=>setForm(f=>({...f,className:(e.target as HTMLSelectElement).value}))}>
              <option value="">Class</option>
              {Array.from({length:12}).map((_,i)=>(<option key={i+1} value={`Class ${i+1}`}>{`Class ${i+1}`}</option>))}
            </Select>
            <Select value={form.section} onChange={(e)=>setForm(f=>({...f,section:(e.target as HTMLSelectElement).value}))}>
              <option value="">Section</option>
              {['A','B','C','D','E'].map(s=> <option key={s} value={s}>{s}</option>)}
            </Select>
          </div>
          <div className="md:col-span-6">
            <button type="submit" disabled={totals.mode === 'count_only'} className="px-4 py-2 bg-maroon-700 text-white rounded-lg shadow hover:bg-maroon-800 disabled:opacity-60">Add</button>
            {totals.mode === 'count_only' && (
              <span className="ml-3 text-sm text-gray-500">Manual entry is disabled in Count Only mode.</span>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-maroon-800">Teachers</h3>
          <div className="flex gap-2">
            <Select value={filter.className} onChange={(e)=>setFilter(f=>({...f,className:(e.target as HTMLSelectElement).value}))}>
              <option value="">All Classes</option>
              {Array.from({length:12}).map((_,i)=>(<option key={i+1} value={`Class ${i+1}`}>{`Class ${i+1}`}</option>))}
            </Select>
            <Select value={filter.section} onChange={(e)=>setFilter(f=>({...f,section:(e.target as HTMLSelectElement).value}))}>
              <option value="">All Sections</option>
              {['A','B','C','D','E'].map(s=> <option key={s} value={s}>{s}</option>)}
            </Select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600 border-b">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Phone</th>
                <th className="py-2 pr-4">Address</th>
                <th className="py-2 pr-4">Class</th>
                <th className="py-2 pr-4">Section</th>
                <th className="py-2 pr-4"></th>
              </tr>
            </thead>
            <tbody>
              {totals.mode !== 'count_only' && filtered.map((t) => (
                <tr key={t.id} className="border-b last:border-0">
                  <td className="py-2 pr-4 font-medium text-gray-800">{t.name}</td>
                  <td className="py-2 pr-4">{t.phone}</td>
                  <td className="py-2 pr-4">{t.address}</td>
                  <td className="py-2 pr-4">{t.className}</td>
                  <td className="py-2 pr-4">{t.section}</td>
                  <td className="py-2 pr-4 text-right">
                    <button onClick={()=>{ remove(t.id); }} className="text-red-600 hover:underline">Remove</button>
                  </td>
                </tr>
              ))}
              {totals.mode !== 'count_only' && filtered.length===0 && (
                <tr><td className="py-4 text-gray-500" colSpan={6}>No teachers yet.</td></tr>
              )}
              {totals.mode === 'count_only' && (
                <tr><td className="py-4 text-gray-500" colSpan={6}>Count Only mode is enabled. Individual teacher list is hidden.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Teachers;
