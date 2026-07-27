import React from 'react';
import { Plus } from 'lucide-react';
import Modal from '../components/Modal';
import EventForm from '../components/events/EventForm';
import EventCard from '../components/events/EventCard';
import { CalendarEvent, EventCategory, useEventsStore } from '../hooks/useEventsStore';

const categoryOptions: (EventCategory | 'All')[] = ['All','Academic','Cultural','Sports','Holidays','Meetings','Examinations','Other'];

const Events: React.FC = () => {
  const store = useEventsStore(10);
  const { pageItems, pages, page, setPage, total } = store;

  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<CalendarEvent | null>(null);
  const [confirm, setConfirm] = React.useState<CalendarEvent | null>(null);

  const openCreate = () => { setEditing(null); setOpen(true); };
  const openEdit = (it: CalendarEvent) => { setEditing(it); setOpen(true); };

  const handleSubmit = (data: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editing) {
      store.update(editing.id, data as Partial<CalendarEvent>);
    } else {
      store.add(data);
    }
    setOpen(false);
  };

  const handleDelete = (it: CalendarEvent) => setConfirm(it);
  const confirmDelete = () => {
    if (confirm) store.remove(confirm.id);
    setConfirm(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-maroon-800">Manage Calendar Events</h3>
          <button
            onClick={openCreate}
            className="inline-flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-maroon-700 text-white rounded-lg shadow hover:bg-maroon-800 text-sm leading-tight text-center"
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span>Add Event</span>
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between mb-4">
          <div className="flex-1 flex flex-col sm:flex-row gap-2 min-w-0">
            <input
              placeholder="Search events..."
              value={store.query.search}
              onChange={(e)=>store.setQuery(q=>({ ...q, page:1, search:e.target.value }))}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-maroon-600 focus:border-maroon-600 placeholder:text-gray-400"
            />
            <select
              value={store.query.category}
              onChange={(e)=>store.setQuery(q=>({ ...q, page:1, category: e.target.value as EventCategory | 'All' }))}
              className="w-full sm:w-44 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm"
            >
              {categoryOptions.map(c=> <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="text-sm text-gray-600">{total} event{total===1?'':'s'}</div>
        </div>

        <div className="space-y-3">
          {pageItems.map((it)=> (
            <EventCard key={it.id} item={it} onEdit={openEdit} onDelete={handleDelete} />
          ))}
          {pageItems.length===0 && (
            <div className="text-gray-500 text-sm">No events found. Create one to get started.</div>
          )}
        </div>

        {pages > 1 && (
          <div className="mt-4 flex items-center justify-end gap-2">
            <button disabled={page<=1} onClick={()=>setPage(page-1)} className="px-3 py-1 rounded border disabled:opacity-50">Prev</button>
            <span className="text-sm text-gray-600">Page {page} of {pages}</span>
            <button disabled={page>=pages} onClick={()=>setPage(page+1)} className="px-3 py-1 rounded border disabled:opacity-50">Next</button>
          </div>
        )}
      </div>

      <Modal open={open} onClose={()=>setOpen(false)} title={editing? 'Update Event' : 'Add Event'}>
        <EventForm initial={editing || undefined} onSubmit={handleSubmit} onCancel={()=>setOpen(false)} />
      </Modal>

      <Modal open={!!confirm} onClose={()=>setConfirm(null)} title="Delete Event" maxWidthClass="max-w-md">
        <p className="text-sm text-gray-700">Are you sure you want to delete this event? This action cannot be undone.</p>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={()=>setConfirm(null)} className="px-4 py-2 rounded-lg border bg-white">Cancel</button>
          <button onClick={confirmDelete} className="px-4 py-2 rounded-lg bg-red-600 text-white">Delete</button>
        </div>
      </Modal>
    </div>
  );
};

export default Events;
