import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

type Kind = 'routine' | 'result';

type BulletinDocument = {
  id: string;
  kind: Kind;
  classLevel: number;
  title?: string;
  date: string;
  imageUrl: string;
  published: boolean;
  sortOrder: number;
};

type Props = {
  kind: Kind;
};

const classes = Array.from({ length: 12 }, (_, i) => i + 1);

const BulletinDocumentsSection: React.FC<Props> = ({ kind }) => {
  const [classLevel, setClassLevel] = useState(1);
  const [items, setItems] = useState<BulletinDocument[]>([]);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const title = kind === 'routine' ? 'Routine' : 'Results';

  useEffect(() => {
    const fetchAll = async () => {
      const { data, error } = await supabase
        .from('bulletin_documents')
        .select('*')
        .eq('published', true)
        .eq('kind', kind)
        .eq('class_level', classLevel)
        .order('date', { ascending: true })
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (error || !data) {
        setItems([]);
        return;
      }

      setItems(
        (data as unknown as Array<Record<string, unknown>>).map((r) => ({
          id: String(r.id),
          kind: String(r.kind) as Kind,
          classLevel: typeof r.class_level === 'number' ? r.class_level : Number(r.class_level),
          title: r.title ? String(r.title) : undefined,
          date: String(r.date),
          imageUrl: r.image_url ? String(r.image_url) : '',
          published: !!r.published,
          sortOrder: typeof r.sort_order === 'number' ? r.sort_order : Number(r.sort_order) || 0,
        }))
      );
    };

    fetchAll();

    const channel = supabase
      .channel(`realtime-public-bulletin-documents-${kind}-${classLevel}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bulletin_documents' }, fetchAll)
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch {
        void 0;
      }
    };
  }, [kind, classLevel]);

  const grouped = useMemo(() => {
    const byDate = new Map<string, BulletinDocument[]>();
    for (const it of items) {
      const arr = byDate.get(it.date) || [];
      arr.push(it);
      byDate.set(it.date, arr);
    }
    return Array.from(byDate.entries()).map(([date, docs]) => ({
      date,
      docs,
    }));
  }, [items]);

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-light text-maroon-800">{title}</h2>
          <div className="text-sm text-gray-600 mt-1">Select class to view {title.toLowerCase()} images in chronological order.</div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-700">Class</div>
          <select
            value={classLevel}
            onChange={(e) => setClassLevel(Number(e.target.value))}
            className="rounded-lg border border-gray-300 px-3 py-2 bg-white"
          >
            {classes.map((c) => (
              <option key={c} value={c}>
                Class {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {grouped.length === 0 && <div className="text-sm text-gray-500">No {title.toLowerCase()} uploaded for Class {classLevel}.</div>}

      <div className="space-y-8">
        {grouped.map((g) => (
          <div key={g.date} className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="text-sm font-semibold text-gray-800">{g.date}</div>
              <div className="text-xs text-gray-500">{g.docs.length} image(s)</div>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {g.docs.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => d.imageUrl && setActiveImage(d.imageUrl)}
                  className="text-left rounded-lg border border-gray-200 overflow-hidden hover:shadow transition-shadow bg-white"
                >
                  {d.imageUrl ? (
                    <img src={d.imageUrl} alt={d.title || ''} className="w-full h-56 object-cover" />
                  ) : (
                    <div className="w-full h-56 bg-gray-100" />
                  )}
                  <div className="p-4">
                    <div className="text-sm font-semibold text-gray-900 truncate">{d.title || 'Untitled'}</div>
                    <div className="text-xs text-gray-500">#{d.sortOrder}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {activeImage && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setActiveImage(null)}
        >
          <div className="max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-end mb-2">
              <button
                type="button"
                onClick={() => setActiveImage(null)}
                className="px-3 py-1 rounded bg-white text-gray-800 text-sm"
              >
                Close
              </button>
            </div>
            <img src={activeImage} alt="" className="w-full max-h-[80vh] object-contain rounded" />
          </div>
        </div>
      )}
    </div>
  );
};

export default BulletinDocumentsSection;
