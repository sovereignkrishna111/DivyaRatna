import React from 'react';
import { BulletinDocument } from '../../hooks/useBulletinDocumentsStore';

type Props = {
  item: BulletinDocument;
  onEdit: (n: BulletinDocument) => void;
  onDelete: (n: BulletinDocument) => void;
};

const BulletinDocumentCard: React.FC<Props> = ({ item, onEdit, onDelete }) => {
  const label = item.kind === 'routine' ? 'Routine' : 'Results';

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex">
      {item.imageUrl && (
        <img src={item.imageUrl} alt="" className="w-28 h-28 md:w-44 md:h-44 object-cover" />
      )}
      <div className="p-5 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs px-2 py-1 rounded border bg-gray-50 text-gray-700 border-gray-200">{label}</span>
              <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">Class {item.classLevel}</span>
              {!item.published && <span className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-700">Draft</span>}
              <span className="text-xs px-2 py-1 rounded bg-white text-gray-700 border border-gray-200">#{item.sortOrder}</span>
            </div>
            <h4 className="text-base font-semibold text-gray-900 truncate">{item.title || 'Untitled'}</h4>
            <div className="text-sm text-gray-600">{item.date}</div>
          </div>
          <div className="flex flex-col gap-2">
            <button onClick={() => onEdit(item)} className="px-3 py-1 text-sm rounded bg-maroon-700 text-white">Edit</button>
            <button onClick={() => onDelete(item)} className="px-3 py-1 text-sm rounded border text-red-700 border-red-200 bg-red-50">Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulletinDocumentCard;
