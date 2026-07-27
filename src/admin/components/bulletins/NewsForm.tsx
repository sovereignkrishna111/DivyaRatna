import React from 'react';
import { NewsItem } from '../../hooks/useBulletinsStore';

type Props = {
  initial?: Partial<NewsItem>;
  onSubmit: (data: Omit<NewsItem, 'id' | 'createdAt' | 'updatedAt'>, opts?: { file?: File | null }) => void;
  onCancel: () => void;
};

const NewsForm: React.FC<Props> = ({ initial, onSubmit, onCancel }) => {
  const [data, setData] = React.useState<Omit<NewsItem, 'id' | 'createdAt' | 'updatedAt'>>({
    title: initial?.title || '',
    date: initial?.date || '',
    category: initial?.category || 'General',
    excerpt: initial?.excerpt || '',
    content: initial?.content || '',
    image: undefined,
    imageUrl: initial?.imageUrl,
    linkUrl: initial?.linkUrl,
    author: initial?.author || 'Admin',
    readTime: initial?.readTime || '3 min read',
    published: initial?.published ?? false,
  });
  const [error, setError] = React.useState('');
  const [file, setFile] = React.useState<File | null>(null);

  const set = (k: keyof typeof data, v: any) => setData((s) => ({ ...s, [k]: v }));
  const fileRef = React.useRef<HTMLInputElement | null>(null);
  const onFile = (f?: File) => {
    if (!f) { setFile(null); set('image', undefined); return; }
    setFile(f);
    set('image', undefined);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.title || !data.date || !data.excerpt) { setError('Title, Date and Excerpt are required'); return; }
    setError('');
    onSubmit(data, { file });
  };

  return (
    <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {error && <div className="md:col-span-2 text-red-600 text-sm">{error}</div>}
      <input value={data.title} onChange={(e)=>set('title', e.target.value)} placeholder="News Title" className="rounded-lg border border-gray-200 px-3 py-2 shadow-sm" />
      <input type="date" value={data.date} onChange={(e)=>set('date', e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 shadow-sm" />
      <input value={data.category} onChange={(e)=>set('category', e.target.value)} placeholder="Category" className="rounded-lg border border-gray-200 px-3 py-2 shadow-sm" />
      <input value={data.author} onChange={(e)=>set('author', e.target.value)} placeholder="Author" className="rounded-lg border border-gray-200 px-3 py-2 shadow-sm" />
      <div className="md:col-span-2">
        <textarea value={data.excerpt} onChange={(e)=>set('excerpt', e.target.value)} placeholder="Short excerpt" rows={3} className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm" />
      </div>
      <div className="md:col-span-2">
        <textarea value={data.content} onChange={(e)=>set('content', e.target.value)} placeholder="Content (optional)" rows={5} className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm" />
      </div>
      <input value={data.linkUrl||''} onChange={(e)=>set('linkUrl', e.target.value)} placeholder="Article link URL (optional)" className="rounded-lg border border-gray-200 px-3 py-2 shadow-sm md:col-span-2" />
      <div className="flex flex-wrap items-center gap-3 md:col-span-2">
        {(file || data.imageUrl) && (
          <img src={file ? URL.createObjectURL(file) : (data.imageUrl as string)} alt="" className="h-12 w-12 rounded object-cover border shrink-0" />
        )}
        <input ref={fileRef} type="file" accept="image/*" onChange={(e)=>onFile(e.target.files?.[0] || undefined)} className="shrink-0" />
        {data.image && (
          <div className="flex items-center gap-2 shrink-0">
            <button type="button" onClick={() => fileRef.current?.click()} className="px-2 py-1 text-xs rounded border">Replace</button>
            <button type="button" onClick={() => set('image', undefined)} className="px-2 py-1 text-xs rounded border text-red-700 bg-red-50">Remove</button>
          </div>
        )}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <input value={data.imageUrl||''} onChange={(e)=>set('imageUrl', e.target.value)} placeholder="Image URL (optional)" className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2 shadow-sm" />
          {data.imageUrl && (
            <button type="button" onClick={()=>set('imageUrl','')} className="px-2 py-1 text-xs rounded border">Clear</button>
          )}
        </div>
        <label className="inline-flex items-center gap-2 text-sm text-gray-700 shrink-0">
          <input type="checkbox" checked={data.published} onChange={(e)=>set('published', e.target.checked)} />
          Publish
        </label>
      </div>
      <div className="md:col-span-2 flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg border bg-white">Cancel</button>
        <button type="submit" className="px-4 py-2 rounded-lg bg-maroon-700 text-white">Save News</button>
      </div>
    </form>
  );
};

export default NewsForm;
