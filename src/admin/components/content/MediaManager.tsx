import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../../lib/supabase';

type MediaItem = {
  id: string;
  storage_path: string;
  url: string;
  filename?: string | null;
  size?: number | null;
  mime?: string | null;
  alt?: string | null;
  created_at?: string;
};

export default function MediaManager() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);

  const fetchMedia = async () => {
    const { data, error } = await supabase.from('media').select('*').order('created_at', { ascending: false });
    if (!error && data) setItems(data as any);
  };

  useEffect(() => {
    fetchMedia();
    const channel = supabase
      .channel('realtime-media')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'media' }, () => fetchMedia())
      .subscribe();
    return () => { try { supabase.removeChannel(channel); } catch {} };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((i) => !q || (i.filename || '').toLowerCase().includes(q) || (i.alt || '').toLowerCase().includes(q));
  }, [items, search]);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const filename = `${Date.now()}_${file.name}`;
      const { data: upload, error: upErr } = await supabase.storage.from('media').upload(filename, file, { upsert: false });
      if (upErr) throw upErr;
      const storage_path = upload?.path || filename;
      const { data: urlData } = await supabase.storage.from('media').getPublicUrl(storage_path);
      const url = urlData?.publicUrl || '';
      const { error: insErr } = await supabase.from('media').insert({
        storage_path,
        url,
        filename: file.name,
        size: file.size,
        mime: file.type,
      });
      if (insErr) throw insErr;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('Upload failed', err);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const onDelete = async (m: MediaItem) => {
    if (!confirm(`Delete media ${m.filename || m.storage_path}?`)) return;
    const path = m.storage_path;
    await supabase.storage.from('media').remove([path]);
    await supabase.from('media').delete().eq('id', m.id);
    setItems((prev) => prev.filter((x) => x.id !== m.id));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex gap-2 items-center">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search media..." className="w-64 max-w-full border rounded px-3 py-2 text-sm"/>
        </div>
        <label className="px-3 py-2 rounded bg-indigo-600 text-white text-sm cursor-pointer">
          <input type="file" accept="image/*,application/pdf" onChange={onUpload} className="hidden" disabled={uploading} />
          {uploading ? 'Uploading...' : 'Upload'}
        </label>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {filtered.map((m) => (
          <div key={m.id} className="bg-white rounded shadow overflow-hidden border">
            {m.mime?.startsWith('image/') ? (
              <img src={m.url} alt={m.alt || m.filename || ''} className="aspect-video object-cover w-full"/>
            ) : (
              <div className="aspect-video flex items-center justify-center text-xs text-gray-500">{m.mime || 'file'}</div>
            )}
            <div className="p-2 text-xs">
              <div className="truncate" title={m.filename || m.storage_path}>{m.filename || m.storage_path}</div>
              <div className="text-gray-500 truncate">{m.mime || ''}</div>
              <div className="flex justify-end pt-1">
                <button onClick={() => onDelete(m)} className="px-2 py-1 border rounded text-red-700 border-red-300">Delete</button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-8">No media found</div>
        )}
      </div>
    </div>
  );
}
