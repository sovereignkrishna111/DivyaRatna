import React from 'react';
import { CalendarEvent } from '../../hooks/useEventsStore';

type Props = {
  item: CalendarEvent;
  onEdit: (item: CalendarEvent) => void;
  onDelete: (item: CalendarEvent) => void;
};

const EventCard: React.FC<Props> = ({ item, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 flex gap-4 min-w-0">
      {(item.image || item.imageUrl) && <img src={item.image || item.imageUrl} alt="" className="h-16 w-16 rounded object-cover flex-shrink-0" />}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-2 min-w-0">
          <h4 className="text-base font-semibold text-gray-900 truncate min-w-0">{item.title}</h4>
          <span className={`text-xs px-2 py-1 rounded ${item.status==='published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{item.status==='published' ? 'Published' : 'Draft'}</span>
        </div>
        <div className="text-sm text-gray-600 mt-1">
          <span className="font-medium text-maroon-800">{item.category}</span>
          {' • '}
          <span>{item.date}{item.startTime ? ` ${item.startTime}` : ''}{item.endTime ? ` - ${item.endTime}` : ''}</span>
          {item.location ? ` • ${item.location}` : ''}
          {item.audience ? ` • ${item.audience}` : ''}
        </div>
        {item.description && <p className="text-sm text-gray-700 mt-2 line-clamp-2">{item.description}</p>}
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={()=>onEdit(item)} className="px-3 py-1 text-sm rounded bg-maroon-700 text-white">Edit</button>
          <button onClick={()=>onDelete(item)} className="px-3 py-1 text-sm rounded border text-red-700 border-red-200 bg-red-50">Delete</button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
