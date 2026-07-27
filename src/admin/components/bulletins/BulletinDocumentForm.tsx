import React from 'react';
import { BulletinDocument, BulletinDocumentKind } from '../../hooks/useBulletinDocumentsStore';

type Props = {
  kind: BulletinDocumentKind;
  initial?: Partial<BulletinDocument>;
  onSubmit: (
    data: Omit<BulletinDocument, 'id' | 'kind' | 'storagePath' | 'imageUrl' | 'createdAt' | 'updatedAt'>,
    opts?: { file?: File | null }
  ) => void;
  onCancel: () => void;
};

const classes = Array.from({ length: 12 }, (_, i) => i + 1);

const BulletinDocumentForm: React.FC<Props> = ({ kind, initial, onSubmit, onCancel }) => {
  const [data, setData] = React.useState<Omit<BulletinDocument, 'id' | 'kind' | 'storagePath' | 'imageUrl' | 'createdAt' | 'updatedAt'>>({
    classLevel: typeof initial?.classLevel === 'number' ? initial.classLevel : 1,
    title: initial?.title || '',
    date: initial?.date || '',
    published: initial?.published ?? true,
    sortOrder: typeof initial?.sortOrder === 'number' ? initial.sortOrder : 0,
  });

  const [file, setFile] = React.useState<File | null>(null);
  const [error, setError] = React.useState('');

  const set = (k: keyof typeof data, v: unknown) => setData((s) => ({ ...s, [k]: v } as typeof s));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.date) {
      setError('Date is required');
      return;
    }
    if (!file && !initial?.id) {
      setError('Image is required');
      return;
    }
    setError('');
    onSubmit(data, { file });
  };

  const label = kind === 'routine' ? 'Routine' : 'Results';

  return (
    <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {error && <div className="md:col-span-2 text-red-600 text-sm">{error}</div>}

      <div>
        <div className="text-xs text-gray-600 mb-1">Type</div>
        <div className="rounded-lg border border-gray-200 px-3 py-2 shadow-sm bg-gray-50 text-gray-700">{label}</div>
      </div>

      <div>
        <div className="text-xs text-gray-600 mb-1">Class</div>
        <select
          value={data.classLevel}
          onChange={(e) => set('classLevel', Number(e.target.value))}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
        >
          {classes.map((c) => (
            <option key={c} value={c}>
              Class {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <div className="text-xs text-gray-600 mb-1">Date</div>
        <input
          type="date"
          value={data.date}
          onChange={(e) => set('date', e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
        />
      </div>

      <div>
        <div className="text-xs text-gray-600 mb-1">Sort order</div>
        <input
          type="number"
          value={data.sortOrder}
          onChange={(e) => set('sortOrder', Number(e.target.value))}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
        />
      </div>

      <div className="md:col-span-2">
        <div className="text-xs text-gray-600 mb-1">Title (optional)</div>
        <input
          value={data.title || ''}
          onChange={(e) => set('title', e.target.value)}
          placeholder="Title (optional)"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
        />
      </div>

      <div className="md:col-span-2">
        <div className="text-xs text-gray-600 mb-1">Image</div>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full"
        />
      </div>

      <div className="md:col-span-2">
        <label className="inline-flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={data.published} onChange={(e) => set('published', e.target.checked)} />
          Publish
        </label>
      </div>

      <div className="md:col-span-2 flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg border bg-white">
          Cancel
        </button>
        <button type="submit" className="px-4 py-2 rounded-lg bg-maroon-700 text-white">
          Save
        </button>
      </div>
    </form>
  );
};

export default BulletinDocumentForm;
