import React from 'react';
import { Notice, NoticeCategory, NoticePriority } from '../../hooks/useBulletinsStore';

type Props = {
  initial?: Partial<Notice>;
  onSubmit: (
    data: Omit<Notice, 'id' | 'createdAt' | 'updatedAt' | 'views'>,
    opts?: { file?: File | null; removeAttachment?: boolean }
  ) => void;
  onCancel: () => void;
};

const categories: NoticeCategory[] = ['Academic','Administrative','Health','Other'];
const priorities: NoticePriority[] = ['low','medium','high'];

const NoticeForm: React.FC<Props> = ({ initial, onSubmit, onCancel }) => {
  const [data, setData] = React.useState<Omit<Notice, 'id' | 'createdAt' | 'updatedAt' | 'views'>>({
    title: initial?.title || '',
    content: initial?.content || '',
    date: initial?.date || '',
    category: (initial?.category as NoticeCategory) || 'Academic',
    priority: (initial?.priority as NoticePriority) || 'medium',
    attachment: initial?.attachment,
    fileDataUrl: initial?.fileDataUrl,
    author: initial?.author || 'Admin',
    linkUrl: initial?.linkUrl,
    published: initial?.published ?? false,
  });
  const [error, setError] = React.useState('');
  const [file, setFile] = React.useState<File | null>(null);
  const [removeAttachment, setRemoveAttachment] = React.useState(false);

  const set = (k: keyof typeof data, v: any) => setData((s) => ({ ...s, [k]: v }));
  const onFile = (f?: File) => {
    if (!f) {
      setFile(null);
      set('fileDataUrl', undefined);
      return;
    }
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => set('fileDataUrl', String(reader.result));
    reader.readAsDataURL(f);
    set('attachment', f.name);
    setRemoveAttachment(false);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.title || !data.date || !data.content) { setError('Title, Date and Content are required'); return; }
    setError('');
    onSubmit(data, { file, removeAttachment });
  };

  return (
    <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {error && <div className="md:col-span-2 text-red-600 text-sm">{error}</div>}
      <input value={data.title} onChange={(e)=>set('title', e.target.value)} placeholder="Notice Title" className="rounded-lg border border-gray-200 px-3 py-2 shadow-sm" />
      <input type="date" value={data.date} onChange={(e)=>set('date', e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 shadow-sm" />
      <select value={data.category} onChange={(e)=>set('category', e.target.value as NoticeCategory)} className="rounded-lg border border-gray-200 px-3 py-2 shadow-sm">
        {categories.map(c=> <option key={c} value={c}>{c}</option>)}
      </select>
      <select value={data.priority} onChange={(e)=>set('priority', e.target.value as NoticePriority)} className="rounded-lg border border-gray-200 px-3 py-2 shadow-sm">
        {priorities.map(p=> <option key={p} value={p}>{p}</option>)}
      </select>
      <input value={data.linkUrl||''} onChange={(e)=>set('linkUrl', e.target.value)} placeholder="Read more URL (optional)" className="rounded-lg border border-gray-200 px-3 py-2 shadow-sm" />
      <div className="md:col-span-2">
        <textarea value={data.content} onChange={(e)=>set('content', e.target.value)} placeholder="Content" rows={4} className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm" />
      </div>
      <div className="md:col-span-2 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <input type="file" onChange={(e)=>onFile(e.target.files?.[0] || undefined)} />
          { (data.attachment || file) && (
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={removeAttachment} onChange={(e)=>{ setRemoveAttachment(e.target.checked); if (e.target.checked){ set('attachment', undefined as any); set('fileDataUrl', undefined as any); setFile(null);} }} />
              Remove attachment
            </label>
          )}
        </div>
        <label className="inline-flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={data.published} onChange={(e)=>set('published', e.target.checked)} />
          Publish
        </label>
      </div>
      <div className="md:col-span-2 flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg border bg-white">Cancel</button>
        <button type="submit" className="px-4 py-2 rounded-lg bg-maroon-700 text-white">Save Notice</button>
      </div>
    </form>
  );
};

export default NoticeForm;
