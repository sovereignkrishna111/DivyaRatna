import React from 'react';
import { Notice } from '../../hooks/useBulletinsStore';

type Props = {
  item: Notice;
  onEdit: (n: Notice) => void;
  onDelete: (n: Notice) => void;
};

const NoticeCard: React.FC<Props> = ({ item, onEdit, onDelete }) => {
  const priorityClass = item.priority === 'high' ? 'bg-red-100 text-red-800 border-red-200' : item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-green-100 text-green-800 border-green-200';
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h4 className="text-base font-semibold text-gray-900">{item.title}</h4>
            <span className={`text-xs px-2 py-1 rounded border ${priorityClass}`}>{item.priority.toUpperCase()}</span>
            <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">{item.category}</span>
            {!item.published && <span className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-700">Draft</span>}
          </div>
          <div className="text-sm text-gray-600 mb-2">{item.date} • {item.author || 'Admin'}</div>
          <p className="text-sm text-gray-700">{item.content}</p>
          {item.attachment && (
            <div className="mt-2 text-sm">
              <a className="text-maroon-700 hover:underline" href={item.fileDataUrl || item.fileUrl || '#'} target="_blank" rel="noopener noreferrer" download>
                {item.attachment}
              </a>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2 justify-end">
          <button onClick={()=>onEdit(item)} className="px-3 py-1 text-sm rounded bg-maroon-700 text-white">Edit</button>
          <button onClick={()=>onDelete(item)} className="px-3 py-1 text-sm rounded border text-red-700 border-red-200 bg-red-50">Delete</button>
        </div>
      </div>
    </div>
  );
};

export default NoticeCard;
