import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { queryTable, invalidateCache } from '../../services/optimizedQueries';

export type EventStatus = 'draft' | 'published';
export type EventCategory = 'Academic' | 'Cultural' | 'Sports' | 'Holidays' | 'Meetings' | 'Examinations' | 'Other';
export type EventAudience = 'All Students' | 'Teachers' | 'Parents' | 'Parents & Teachers' | 'Staff' | 'Everyone';

export type CalendarEvent = {
  id: string;
  title: string;
  description?: string;
  category: EventCategory;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  location?: string;
  audience?: EventAudience;
  image?: string; // data URL
  imageUrl?: string; // remote URL
  linkUrl?: string; // Learn more link
  status: EventStatus;
  createdAt: number;
  updatedAt: number;
};

type Query = {
  search?: string;
  category?: EventCategory | 'All';
  page?: number;
  pageSize?: number;
};

export function useEventsStore(initialPageSize = 10) {
  const [items, setItems] = useState<CalendarEvent[]>([]);
  const [query, setQuery] = useState<Query>({ page: 1, pageSize: initialPageSize, category: 'All', search: '' });

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const data = await queryTable<any>('events', {
          select: 'id,title,description,category,date,start_time,end_time,location,audience,image,image_url,link_url,status,created_at,updated_at',
          useCache: false, // Admin needs fresh data
        });
        const mapped: CalendarEvent[] = (data as any[]).map((row) => ({
          id: row.id,
          title: row.title,
          description: row.description || undefined,
          category: row.category as EventCategory,
          date: row.date ? String(row.date) : '',
          startTime: row.start_time || undefined,
          endTime: row.end_time || undefined,
          location: row.location || undefined,
          audience: (row.audience as EventAudience) || undefined,
          image: row.image || undefined,
          imageUrl: row.image_url || undefined,
          linkUrl: row.link_url || undefined,
          status: (row.status as EventStatus) || 'draft',
          createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
          updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : Date.now(),
        }));
        setItems(mapped);
      } catch (error) {
        // Fallback to empty if query fails
        setItems([]);
      }
    };
    fetchAll();

    const channel = supabase
      .channel('realtime-events')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, (payload: any) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const row = (payload.new || payload.record) as any;
          const item: CalendarEvent = {
            id: row.id,
            title: row.title,
            description: row.description || undefined,
            category: row.category as EventCategory,
            date: row.date ? String(row.date) : '',
            startTime: row.start_time || undefined,
            endTime: row.end_time || undefined,
            location: row.location || undefined,
            audience: (row.audience as EventAudience) || undefined,
            image: row.image || undefined,
            imageUrl: row.image_url || undefined,
            linkUrl: row.link_url || undefined,
            status: (row.status as EventStatus) || 'draft',
            createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
            updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : Date.now(),
          };
          setItems((prev) => [item, ...prev.filter((p) => p.id !== item.id)]);
        } else if (payload.eventType === 'DELETE') {
          const row = (payload.old || payload.record) as any;
          setItems((prev) => prev.filter((p) => p.id !== row.id));
        }
      })
      .subscribe();

    return () => {
      try { supabase.removeChannel(channel); } catch {}
    };
  }, []);

  const filtered = useMemo(() => {
    const q = (query.search || '').trim().toLowerCase();
    return items.filter((e) => {
      const inCategory = !query.category || query.category === 'All' || e.category === query.category;
      const inSearch = !q ||
        e.title.toLowerCase().includes(q) ||
        (e.description || '').toLowerCase().includes(q) ||
        (e.location || '').toLowerCase().includes(q);
      return inCategory && inSearch;
    });
  }, [items, query.category, query.search]);

  const total = filtered.length;
  const pageSize = query.pageSize || initialPageSize;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, query.page || 1), pages);
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  const add = async (input: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
    const payload: any = {
      title: input.title,
      description: input.description || null,
      category: input.category,
      date: input.date || null,
      start_time: input.startTime || null,
      end_time: input.endTime || null,
      location: input.location || null,
      audience: input.audience || null,
      image: input.image || null,
      image_url: input.imageUrl || null,
      link_url: input.linkUrl || null,
      status: input.status || 'draft',
    };
    const { data, error } = await supabase.from('events').insert(payload).select('*').single();
    if (error || !data) return null as unknown as CalendarEvent;
    const item: CalendarEvent = {
      id: data.id,
      title: data.title,
      description: data.description || undefined,
      category: data.category,
      date: data.date ? String(data.date) : '',
      startTime: data.start_time || undefined,
      endTime: data.end_time || undefined,
      location: data.location || undefined,
      audience: data.audience || undefined,
      image: data.image || undefined,
      imageUrl: data.image_url || undefined,
      linkUrl: data.link_url || undefined,
      status: data.status,
      createdAt: data.created_at ? new Date(data.created_at).getTime() : Date.now(),
      updatedAt: data.updated_at ? new Date(data.updated_at).getTime() : Date.now(),
    };
    setItems((prev) => [item, ...prev]);
    return item;
  };

  const update = async (id: string, patch: Partial<CalendarEvent>) => {
    const payload: any = {};
    if (patch.title !== undefined) payload.title = patch.title;
    if (patch.description !== undefined) payload.description = patch.description;
    if (patch.category !== undefined) payload.category = patch.category;
    if (patch.date !== undefined) payload.date = patch.date || null;
    if (patch.startTime !== undefined) payload.start_time = patch.startTime || null;
    if (patch.endTime !== undefined) payload.end_time = patch.endTime || null;
    if (patch.location !== undefined) payload.location = patch.location || null;
    if (patch.audience !== undefined) payload.audience = patch.audience || null;
    if (patch.image !== undefined) payload.image = patch.image || null;
    if (patch.imageUrl !== undefined) payload.image_url = patch.imageUrl || null;
    if (patch.linkUrl !== undefined) payload.link_url = patch.linkUrl || null;
    if (patch.status !== undefined) payload.status = patch.status;
    await supabase.from('events').update(payload).eq('id', id);
  };

  const replaceImage = (id: string, dataUrl?: string) => update(id, { image: dataUrl });

  const remove = async (id: string) => {
    await supabase.from('events').delete().eq('id', id);
    setItems((prev) => prev.filter((e) => e.id !== id));
  };

  const setPage = (p: number) => setQuery((q) => ({ ...q, page: p }));

  return {
    items,
    add,
    update,
    replaceImage,
    remove,
    query,
    setQuery,
    page,
    pages,
    pageItems,
    total,
    pageSize,
    setPage,
  };
}
