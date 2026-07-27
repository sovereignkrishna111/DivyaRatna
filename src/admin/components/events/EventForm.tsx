import React from 'react';
import { CalendarEvent, EventAudience, EventCategory, EventStatus } from '../../hooks/useEventsStore';

const categories: (EventCategory | 'All')[] = ['Academic','Cultural','Sports','Holidays','Meetings','Examinations','Other'];
const audiences: EventAudience[] = ['All Students','Teachers','Parents','Parents & Teachers','Staff','Everyone'];

type Props = {
  initial?: Partial<CalendarEvent>;
  onSubmit: (data: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
};

const EventForm: React.FC<Props> = ({ initial, onSubmit, onCancel }) => {
  const [data, setData] = React.useState<Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>>({
    title: initial?.title || '',
    description: initial?.description || '',
    category: (initial?.category as EventCategory) || 'Academic',
    date: initial?.date || '',
    startTime: initial?.startTime || '',
    endTime: initial?.endTime || '',
    location: initial?.location || '',
    audience: (initial?.audience as EventAudience) || 'Everyone',
    image: initial?.image,
    imageUrl: initial?.imageUrl,
    linkUrl: initial?.linkUrl,
    status: (initial?.status as EventStatus) || 'draft',
  });
  const [error, setError] = React.useState('');

  const set = (k: keyof typeof data, v: any) => setData((s) => ({ ...s, [k]: v }));

  const fileRef = React.useRef<HTMLInputElement | null>(null);

  const onFile = (file?: File) => {
    if (!file) return set('image', undefined);
    const reader = new FileReader();
    reader.onload = () => set('image', String(reader.result));
    reader.readAsDataURL(file);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.title || !data.date) { setError('Title and Date are required'); return; }
    setError('');
    onSubmit(data);
  };

  return (
    <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {error && <div className="md:col-span-2 text-red-600 text-sm">{error}</div>}
      <input value={data.title} onChange={(e)=>set('title', e.target.value)} placeholder="Event Title" className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-maroon-600 focus:border-maroon-600" />
      <select value={data.category} onChange={(e)=>set('category', e.target.value as EventCategory)} className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
        {categories.map(c=> <option key={c} value={c}>{c}</option>)}
      </select>
      <input type="date" value={data.date} onChange={(e)=>set('date', e.target.value)} className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm" />
      <div className="flex gap-3">
        <input type="time" value={data.startTime} onChange={(e)=>set('startTime', e.target.value)} className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm" />
        <input type="time" value={data.endTime} onChange={(e)=>set('endTime', e.target.value)} className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm" />
      </div>
      <input value={data.location} onChange={(e)=>set('location', e.target.value)} placeholder="Location" className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm" />
      <select value={data.audience} onChange={(e)=>set('audience', e.target.value as EventAudience)} className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
        {audiences.map(a=> <option key={a} value={a}>{a}</option>)}
      </select>
      <div className="md:col-span-2">
        <textarea value={data.description} onChange={(e)=>set('description', e.target.value)} placeholder="Description" rows={3} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm" />
      </div>
      <input value={data.linkUrl||''} onChange={(e)=>set('linkUrl', e.target.value)} placeholder="Learn more URL (optional)" className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm md:col-span-2" />
      <div className="flex flex-wrap items-center gap-3 md:col-span-2">
        {(data.image || data.imageUrl) && <img src={data.image || data.imageUrl} alt="" className="h-12 w-12 rounded object-cover border shrink-0" />}
        <input ref={fileRef} type="file" accept="image/*" onChange={(e)=>onFile(e.target.files?.[0] || undefined)} className="shrink-0" />
        {data.image && (
          <div className="flex items-center gap-2 shrink-0">
            <button type="button" onClick={() => fileRef.current?.click()} className="px-2 py-1 text-xs rounded border">Replace</button>
            <button type="button" onClick={() => set('image', undefined)} className="px-2 py-1 text-xs rounded border text-red-700 bg-red-50">Remove</button>
          </div>
        )}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <input value={data.imageUrl||''} onChange={(e)=>set('imageUrl', e.target.value)} placeholder="Image URL (optional)" className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm" />
          {data.imageUrl && (
            <button type="button" onClick={()=>set('imageUrl', '')} className="px-2 py-1 text-xs rounded border">Clear</button>
          )}
        </div>
        <label className="inline-flex items-center gap-2 text-sm text-gray-700 shrink-0">
          <input type="checkbox" checked={data.status==='published'} onChange={(e)=>set('status', e.target.checked ? 'published' : 'draft')} />
          Publish
        </label>
      </div>
      <div className="md:col-span-2 flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg border bg-white">Cancel</button>
        <button type="submit" className="px-4 py-2 rounded-lg bg-maroon-700 text-white">Save Event</button>
      </div>
    </form>
  );
};

export default EventForm;
