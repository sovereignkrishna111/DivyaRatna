import React from 'react';
import { AchievementActivityItem } from '../../hooks/useBulletinsStore';

type Props = {
  item: AchievementActivityItem;
  onEdit: (n: AchievementActivityItem) => void;
  onDelete: (n: AchievementActivityItem) => void;
};

const AchievementsActivitiesCard: React.FC<Props> = ({ item, onEdit, onDelete }) => {
  const kindLabel = item.kind === 'achievement' ? 'Achievement' : 'Activity';
  const kindClass = item.kind === 'achievement' ? 'bg-gold-50 text-gold-800 border-gold-200' : 'bg-blue-50 text-blue-800 border-blue-200';

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex min-w-0">
      {(item.image || item.imageUrl) && (
        <img
          src={item.image || item.imageUrl}
          alt=""
          className="w-28 h-28 md:w-44 md:h-44 object-cover flex-shrink-0"
        />
      )}
      <div className="p-5 flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 min-w-0">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className={`text-xs px-2 py-1 rounded border ${kindClass}`}>{kindLabel}</span>
              {item.category && <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">{item.category}</span>}
              {!item.published && <span className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-700">Draft</span>}
            </div>
            <h4 className="text-base font-semibold text-gray-900 truncate">{item.title}</h4>
            <div className="text-sm text-gray-600">{item.date} • {item.author || 'Admin'}</div>
          </div>
          <div className="flex flex-row sm:flex-col gap-2 justify-end">
            <button onClick={() => onEdit(item)} className="px-3 py-1 text-sm rounded bg-maroon-700 text-white">Edit</button>
            <button onClick={() => onDelete(item)} className="px-3 py-1 text-sm rounded border text-red-700 border-red-200 bg-red-50">Delete</button>
          </div>
        </div>

        <p className="text-sm text-gray-700 mt-2 line-clamp-2">{item.excerpt}</p>
      </div>
    </div>
  );
};

export default AchievementsActivitiesCard;
