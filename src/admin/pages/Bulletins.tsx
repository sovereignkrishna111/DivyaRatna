import React from 'react';
import Modal from '../components/Modal';
import { useNoticesStore, useNewsStore, useAchievementsActivitiesStore, Notice, NewsItem, AchievementActivityItem } from '../hooks/useBulletinsStore';
import { BulletinDocument, BulletinDocumentKind, useBulletinDocumentsStore } from '../hooks/useBulletinDocumentsStore';
import { useEventsStore, CalendarEvent } from '../hooks/useEventsStore';
import NoticeForm from '../components/bulletins/NoticeForm';
import NewsForm from '../components/bulletins/NewsForm';
import AchievementsActivitiesForm from '../components/bulletins/AchievementsActivitiesForm';
import BulletinDocumentForm from '../components/bulletins/BulletinDocumentForm';
import EventForm from '../components/events/EventForm';
import NoticeCard from '../components/bulletins/NoticeCard';
import EventCard from '../components/events/EventCard';
import NewsCard from '../components/bulletins/NewsCard';
import AchievementsActivitiesCard from '../components/bulletins/AchievementsActivitiesCard';
import BulletinDocumentCard from '../components/bulletins/BulletinDocumentCard';

type Tab = 'notices' | 'events' | 'news' | 'achievements' | 'routine' | 'results';
type Item = Notice | NewsItem | CalendarEvent | AchievementActivityItem | BulletinDocument;

type SubmitOpts = {
  file?: File | null;
  removeAttachment?: boolean;
  removeImage?: boolean;
};

const Bulletins: React.FC = () => {
  const [tab, setTab] = React.useState<Tab>('notices');

  const notices = useNoticesStore();
  const news = useNewsStore();
  const events = useEventsStore(10);
  const achAct = useAchievementsActivitiesStore();
  const routine = useBulletinDocumentsStore('routine');
  const results = useBulletinDocumentsStore('result');

  const [open, setOpen] = React.useState(false);
  const [editingNotice, setEditingNotice] = React.useState<Notice | null>(null);
  const [editingNews, setEditingNews] = React.useState<NewsItem | null>(null);
  const [editingEvent, setEditingEvent] = React.useState<CalendarEvent | null>(null);
  const [editingAchAct, setEditingAchAct] = React.useState<AchievementActivityItem | null>(null);
  const [editingDoc, setEditingDoc] = React.useState<BulletinDocument | null>(null);
  const [docKind, setDocKind] = React.useState<BulletinDocumentKind>('routine');
  const [confirm, setConfirm] = React.useState<{ kind: 'notice'|'news'|'event'|'achievements'|'routine'|'results'; id: string } | null>(null);

  const openCreate = () => {
    setEditingNotice(null);
    setEditingNews(null);
    setEditingEvent(null);
    setEditingAchAct(null);
    setEditingDoc(null);
    setDocKind(tab === 'results' ? 'result' : tab === 'routine' ? 'routine' : 'routine');
    setOpen(true);
  };

  const onEdit = (item: Item) => {
    if (tab==='notices') setEditingNotice(item as Notice);
    if (tab==='news') setEditingNews(item as NewsItem);
    if (tab==='events') setEditingEvent(item as CalendarEvent);
    if (tab==='achievements') setEditingAchAct(item as AchievementActivityItem);
    if (tab==='routine' || tab==='results') {
      const doc = item as BulletinDocument;
      setEditingDoc(doc);
      setDocKind(doc.kind);
    }
    setOpen(true);
  };

  const onDelete = (item: Item) => {
    const id = String((item as { id: string }).id);
    // Ensure we set the correct singular kind keys for the delete confirmation
    // notices -> notice, events -> event, news -> news
    const kind: 'notice' | 'news' | 'event' | 'achievements' | 'routine' | 'results' =
      tab === 'notices'
        ? 'notice'
        : tab === 'events'
          ? 'event'
          : tab === 'news'
            ? 'news'
            : tab === 'achievements'
              ? 'achievements'
              : tab === 'routine'
                ? 'routine'
                : 'results';
    setConfirm({ kind, id });
  };

  const doDelete = () => {
    if (!confirm) return;
    if (confirm.kind==='notice') notices.remove(confirm.id);
    if (confirm.kind==='news') news.remove(confirm.id);
    if (confirm.kind==='event') events.remove(confirm.id);
    if (confirm.kind==='achievements') achAct.remove(confirm.id);
    if (confirm.kind==='routine') routine.remove(confirm.id);
    if (confirm.kind==='results') results.remove(confirm.id);
    setConfirm(null);
  };

  const submit = (data: unknown, opts?: SubmitOpts) => {
    if (tab==='notices') {
      const payload = data as Omit<Notice, 'id' | 'createdAt' | 'updatedAt' | 'views'>;
      if (editingNotice) notices.update(editingNotice.id, payload, { file: opts?.file, removeAttachment: opts?.removeAttachment });
      else notices.add(payload, { file: opts?.file });
    } else if (tab==='news') {
      const payload = data as Omit<NewsItem, 'id' | 'createdAt' | 'updatedAt'>;
      if (editingNews) news.update(editingNews.id, payload, { file: opts?.file });
      else news.add(payload, { file: opts?.file });
    } else if (tab==='achievements') {
      const payload = data as Omit<AchievementActivityItem, 'id' | 'createdAt' | 'updatedAt'>;
      if (editingAchAct) achAct.update(editingAchAct.id, payload, { file: opts?.file, removeImage: opts?.removeImage });
      else achAct.add(payload, { file: opts?.file });
    } else if (tab === 'routine' || tab === 'results') {
      const payload = data as Omit<BulletinDocument, 'id' | 'kind' | 'storagePath' | 'imageUrl' | 'createdAt' | 'updatedAt'>;
      const store = docKind === 'routine' ? routine : results;
      if (editingDoc) store.update(editingDoc.id, { ...payload, classLevel: payload.classLevel });
      else store.add(payload, { file: opts?.file });
    } else {
      const payload = data as Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>;
      if (editingEvent) events.update(editingEvent.id, payload);
      else events.add(payload);
    }
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 min-w-0">
          <h3 className="text-lg font-semibold text-maroon-800">Bulletins</h3>
          <button onClick={openCreate} className="w-full sm:w-auto px-4 py-2 bg-maroon-700 text-white rounded-lg shadow hover:bg-maroon-800 whitespace-nowrap">+ Add {tab==='notices'?'Notice':tab==='news'?'News':tab==='events'?'Event':tab==='achievements'?'Achievement':tab==='routine'?'Routine':'Results'}</button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4 min-w-0">
          <button onClick={()=>setTab('notices')} className={`px-3 py-1 rounded ${tab==='notices'?'bg-maroon-700 text-white':'border'}`}>Notices</button>
          <button onClick={()=>setTab('events')} className={`px-3 py-1 rounded ${tab==='events'?'bg-maroon-700 text-white':'border'}`}>Events</button>
          <button onClick={()=>setTab('news')} className={`px-3 py-1 rounded ${tab==='news'?'bg-maroon-700 text-white':'border'}`}>News & Media</button>
          <button onClick={()=>setTab('achievements')} className={`px-3 py-1 rounded ${tab==='achievements'?'bg-maroon-700 text-white':'border'}`}>Achievements</button>
          <button onClick={()=>setTab('routine')} className={`px-3 py-1 rounded ${tab==='routine'?'bg-maroon-700 text-white':'border'}`}>Routine</button>
          <button onClick={()=>setTab('results')} className={`px-3 py-1 rounded ${tab==='results'?'bg-maroon-700 text-white':'border'}`}>Results</button>
        </div>

        {tab==='notices' && (
          <div className="space-y-3">
            {notices.items.map(n => (
              <NoticeCard key={n.id} item={n} onEdit={onEdit} onDelete={onDelete} />
            ))}
            {notices.items.length===0 && <div className="text-sm text-gray-500">No notices yet.</div>}
          </div>
        )}

        {tab==='events' && (
          <div className="space-y-3">
            {events.items.map(e => (
              <EventCard key={e.id} item={e} onEdit={onEdit} onDelete={onDelete} />
            ))}
            {events.items.length===0 && <div className="text-sm text-gray-500">No events yet.</div>}
          </div>
        )}

        {tab==='news' && (
          <div className="space-y-3">
            {news.items.map(n => (
              <NewsCard key={n.id} item={n} onEdit={onEdit} onDelete={onDelete} />
            ))}
            {news.items.length===0 && <div className="text-sm text-gray-500">No news yet.</div>}
          </div>
        )}

        {tab==='achievements' && (
          <div className="space-y-3">
            {achAct.items.map(a => (
              <AchievementsActivitiesCard key={a.id} item={a} onEdit={onEdit} onDelete={onDelete} />
            ))}
            {achAct.items.length===0 && <div className="text-sm text-gray-500">No achievements yet.</div>}
          </div>
        )}

        {tab==='routine' && (
          <div className="space-y-3">
            {routine.items.map((d) => (
              <BulletinDocumentCard key={d.id} item={d} onEdit={onEdit} onDelete={onDelete} />
            ))}
            {routine.items.length===0 && <div className="text-sm text-gray-500">No routine uploads yet.</div>}
          </div>
        )}

        {tab==='results' && (
          <div className="space-y-3">
            {results.items.map((d) => (
              <BulletinDocumentCard key={d.id} item={d} onEdit={onEdit} onDelete={onDelete} />
            ))}
            {results.items.length===0 && <div className="text-sm text-gray-500">No results uploads yet.</div>}
          </div>
        )}
      </div>

      <Modal open={open} onClose={()=>setOpen(false)} title={(editingNotice||editingNews||editingEvent)?'Update':'Add'}>
        {tab==='notices' && (
          <NoticeForm initial={editingNotice||undefined} onSubmit={submit} onCancel={()=>setOpen(false)} />
        )}
        {tab==='news' && (
          <NewsForm initial={editingNews||undefined} onSubmit={submit} onCancel={()=>setOpen(false)} />
        )}
        {tab==='achievements' && (
          <AchievementsActivitiesForm initial={editingAchAct||undefined} onSubmit={submit} onCancel={()=>setOpen(false)} />
        )}
        {(tab==='routine' || tab==='results') && (
          <BulletinDocumentForm
            kind={tab==='results' ? 'result' : 'routine'}
            initial={editingDoc || undefined}
            onSubmit={(d, o) => submit(d, { file: o?.file })}
            onCancel={()=>setOpen(false)}
          />
        )}
        {tab==='events' && (
          <EventForm initial={editingEvent||undefined} onSubmit={(d) => submit(d)} onCancel={()=>setOpen(false)} />
        )}
      </Modal>

      <Modal open={!!confirm} onClose={()=>setConfirm(null)} title="Delete" maxWidthClass="max-w-md">
        <p className="text-sm text-gray-700">Are you sure you want to delete this item? This action cannot be undone.</p>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={()=>setConfirm(null)} className="px-4 py-2 rounded-lg border bg-white">Cancel</button>
          <button onClick={doDelete} className="px-4 py-2 rounded-lg bg-red-600 text-white">Delete</button>
        </div>
      </Modal>
    </div>
  );
};

export default Bulletins;
