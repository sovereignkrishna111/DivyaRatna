import React from 'react';
import { NewsItem } from '../../hooks/useBulletinsStore';

type Props = {
  item: NewsItem;
  onEdit: (n: NewsItem) => void;
  onDelete: (n: NewsItem) => void;
};

const NewsCard: React.FC<Props> = ({ item, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex min-w-0">
      {(item.image || item.imageUrl) && (
        <img src={item.image || item.imageUrl} alt="" className="hidden md:block w-40 h-40 object-cover flex-shrink-0" />
      )}
      <div className="p-4 flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 min-w-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">{item.category}</span>
              {!item.published && <span className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-700">Draft</span>}
            </div>
            <h4 className="text-base font-semibold text-gray-900 truncate">{item.title}</h4>
            <div className="text-sm text-gray-600">{item.date} • {item.author || 'Admin'} • {item.readTime || ''}</div>
          </div>
          <div className="flex flex-row sm:flex-col gap-2 justify-end">
            <button onClick={()=>onEdit(item)} className="px-3 py-1 text-sm rounded bg-maroon-700 text-white">Edit</button>
            <button onClick={()=>onDelete(item)} className="px-3 py-1 text-sm rounded border text-red-700 border-red-200 bg-red-50">Delete</button>
          </div>
        </div>
        <p className="text-sm text-gray-700 mt-2">{item.excerpt}</p>
        {item.linkUrl && (
          <div className="mt-2">
            <a href={item.linkUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-maroon-700 hover:underline">Link →</a>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsCard;
