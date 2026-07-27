import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';

export type PageStatus = 'draft' | 'published' | 'archived';

export type Page = {
  id: string;
  slug: string;
  title: string;
  content?: any;
  status: PageStatus;
  theme?: any;
  meta?: any;
  created_at?: string;
  updated_at?: string;
};

type Query = {
  search?: string;
  status?: PageStatus | 'All';
  page?: number;
  pageSize?: number;
};

export function usePagesStore(initialPageSize = 10) {
  const [items, setItems] = useState<Page[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState<Query>({ page: 1, pageSize: initialPageSize, status: 'All', search: '' });

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('pages')
        .select('*')
        .order('updated_at', { ascending: false });
      setItems((data as any[])?.map((r) => ({
        id: r.id,
        slug: r.slug,
        title: r.title,
        content: r.content,
        status: r.status as PageStatus,
        theme: r.theme,
        meta: r.meta,
        created_at: r.created_at,
        updated_at: r.updated_at,
      })) || []);
      setLoading(false);
    };
    fetchAll();

    const channel = supabase
      .channel('realtime-pages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pages' }, (payload: any) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const r = payload.new || payload.record;
          const p: Page = {
            id: r.id,
            slug: r.slug,
            title: r.title,
            content: r.content,
            status: r.status,
            theme: r.theme,
            meta: r.meta,
            created_at: r.created_at,
            updated_at: r.updated_at,
          };
          setItems((prev) => [p, ...prev.filter((x) => x.id !== p.id)]);
        } else if (payload.eventType === 'DELETE') {
          const r = payload.old || payload.record;
          setItems((prev) => prev.filter((x) => x.id !== r.id));
        }
      })
      .subscribe();

    return () => {
      try { supabase.removeChannel(channel); } catch {}
    };
  }, []);

  const filtered = useMemo(() => {
    const q = (query.search || '').trim().toLowerCase();
    return items.filter((p) => {
      const inStatus = !query.status || query.status === 'All' || p.status === query.status;
      const inSearch = !q || p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q);
      return inStatus && inSearch;
    });
  }, [items, query.status, query.search]);

  const total = filtered.length;
  const pageSize = query.pageSize || initialPageSize;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, query.page || 1), pages);
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  const create = async (input: Omit<Page, 'id' | 'created_at' | 'updated_at'>) => {
    const payload: any = {
      slug: input.slug,
      title: input.title,
      content: input.content ?? null,
      status: input.status ?? 'draft',
      theme: input.theme ?? null,
      meta: input.meta ?? null,
    };
    const { data, error } = await supabase.from('pages').insert(payload).select('*').single();
    if (error || !data) throw error;
    const p: Page = data as any;
    setItems((prev) => [p, ...prev]);
    return p;
  };

  const update = async (id: string, patch: Partial<Page>) => {
    const payload: any = {};
    if (patch.slug !== undefined) payload.slug = patch.slug;
    if (patch.title !== undefined) payload.title = patch.title;
    if (patch.content !== undefined) payload.content = patch.content;
    if (patch.status !== undefined) payload.status = patch.status;
    if (patch.theme !== undefined) payload.theme = patch.theme;
    if (patch.meta !== undefined) payload.meta = patch.meta;
    const { error } = await supabase.from('pages').update(payload).eq('id', id);
    if (error) throw error;
  };

  const softDelete = async (id: string) => update(id, { status: 'archived' });

  const hardDelete = async (id: string) => {
    const { error } = await supabase.from('pages').delete().eq('id', id);
    if (error) throw error;
    setItems((prev) => prev.filter((x) => x.id !== id));
  };

  const setPage = (p: number) => setQuery((q) => ({ ...q, page: p }));

  return { items, loading, query, setQuery, page, pages, pageItems, pageSize, total, create, update, softDelete, hardDelete, setPage };
}
