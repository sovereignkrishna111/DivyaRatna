import React, { useState } from 'react';
import { usePagesStore, Page, PageStatus } from '../../hooks/usePagesStore';

const statusOptions: (PageStatus | 'All')[] = ['All', 'draft', 'published', 'archived'];

export default function PagesList() {
  const store = usePagesStore(10);
  const [editing, setEditing] = useState<Page | null>(null);
  const [form, setForm] = useState<Partial<Page>>({});

  const onEdit = (p: Page) => {
    setEditing(p);
    setForm({ ...p });
  };

  const onNew = () => {
    setEditing({ id: '', slug: '', title: '', status: 'draft' } as Page);
    setForm({ slug: '', title: '', status: 'draft' });
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.slug || !form.title) return;
    if (!editing?.id) {
      await store.create({
        slug: form.slug!,
        title: form.title!,
        content: form.content ?? null,
        status: (form.status as PageStatus) || 'draft',
        theme: form.theme ?? null,
        meta: form.meta ?? null,
      } as any);
    } else {
      await store.update(editing.id, form as any);
    }
    setEditing(null);
    setForm({});
  };

  const onDelete = async (p: Page) => {
    if (confirm(`Archive page "${p.title}"?`)) {
      await store.softDelete(p.id);
    }
  };

  const onHardDelete = async (p: Page) => {
    if (confirm(`Permanently delete page "${p.title}"? This cannot be undone.`)) {
      await store.hardDelete(p.id);
    }
  };

  const pages = store.pageItems;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex gap-2">
          <input
            value={store.query.search || ''}
            onChange={(e) => store.setQuery({ ...store.query, search: e.target.value })}
            placeholder="Search by title or slug"
            className="w-64 max-w-full border rounded px-3 py-2 text-sm"
          />
          <select
            value={store.query.status || 'All'}
            onChange={(e) => store.setQuery({ ...store.query, status: e.target.value as any })}
            className="border rounded px-2 py-2 text-sm"
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <button onClick={onNew} className="px-3 py-2 rounded bg-indigo-600 text-white text-sm">New Page</button>
      </div>

      <div className="overflow-auto bg-white rounded shadow">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3 font-medium text-gray-600">Title</th>
              <th className="text-left p-3 font-medium text-gray-600">Slug</th>
              <th className="text-left p-3 font-medium text-gray-600">Status</th>
              <th className="text-left p-3 font-medium text-gray-600">Updated</th>
              <th className="p-3"/>
            </tr>
          </thead>
          <tbody>
            {pages.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3">{p.title}</td>
                <td className="p-3 text-gray-600">/{p.slug}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs ${p.status === 'published' ? 'bg-green-100 text-green-700' : p.status === 'archived' ? 'bg-gray-100 text-gray-700' : 'bg-amber-100 text-amber-700'}`}>{p.status}</span>
                </td>
                <td className="p-3 text-gray-500">{p.updated_at ? new Date(p.updated_at).toLocaleString() : ''}</td>
                <td className="p-3 text-right">
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => onEdit(p)} className="px-2 py-1 text-xs rounded border">Edit</button>
                    <button onClick={() => onDelete(p)} className="px-2 py-1 text-xs rounded border text-amber-700 border-amber-300">Archive</button>
                    <button onClick={() => onHardDelete(p)} className="px-2 py-1 text-xs rounded border text-red-700 border-red-300">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {pages.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">No pages found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm">
        <div>Showing {(store.page - 1) * store.pageSize + 1} - {Math.min(store.page * store.pageSize, store.total)} of {store.total}</div>
        <div className="flex gap-2">
          <button disabled={store.page <= 1} onClick={() => store.setPage(store.page - 1)} className="px-2 py-1 border rounded disabled:opacity-50">Prev</button>
          <button disabled={store.page >= store.pages} onClick={() => store.setPage(store.page + 1)} className="px-2 py-1 border rounded disabled:opacity-50">Next</button>
        </div>
      </div>

      {/* Modal/Form */}
      {editing && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-40">
          <div className="bg-white rounded shadow-lg w-full max-w-2xl">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">{editing.id ? 'Edit Page' : 'New Page'}</h3>
              <button onClick={() => setEditing(null)} className="text-gray-500">✕</button>
            </div>
            <form onSubmit={onSave} className="p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="text-sm">Slug
                  <input required value={form.slug || ''} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="about" className="mt-1 w-full border rounded px-3 py-2"/>
                </label>
                <label className="text-sm">Title
                  <input required value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="About Us" className="mt-1 w-full border rounded px-3 py-2"/>
                </label>
              </div>
              <label className="text-sm">Status
                <select value={(form.status as any) || 'draft'} onChange={(e) => setForm({ ...form, status: e.target.value as PageStatus })} className="mt-1 border rounded px-2 py-2">
                  <option value="draft">draft</option>
                  <option value="published">published</option>
                  <option value="archived">archived</option>
                </select>
              </label>
              <label className="text-sm block">Content (JSON)
                <textarea value={JSON.stringify(form.content ?? {}, null, 2)} onChange={(e) => {
                  try { setForm({ ...form, content: JSON.parse(e.target.value || '{}') }); } catch { /* ignore */ }
                }} className="mt-1 w-full border rounded px-3 py-2 font-mono text-xs min-h-[160px]"/>
              </label>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditing(null)} className="px-3 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-3 py-2 rounded bg-indigo-600 text-white">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
