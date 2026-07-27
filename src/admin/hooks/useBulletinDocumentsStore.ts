import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export type BulletinDocumentKind = 'routine' | 'result';

export type BulletinDocument = {
  id: string;
  kind: BulletinDocumentKind;
  classLevel: number;
  title?: string;
  date: string; // YYYY-MM-DD
  storagePath?: string;
  imageUrl: string;
  published: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

const table = 'bulletin_documents';

const ensureAdminSession = async () => {
  const { data: first, error: firstErr } = await supabase.auth.getSession();
  if (firstErr) throw firstErr;
  if (first?.session) return first.session;

  const token = localStorage.getItem('admin_token');
  const refreshToken = localStorage.getItem('admin_refresh_token');
  if (token && refreshToken) {
    const { error: setErr } = await supabase.auth.setSession({ access_token: token, refresh_token: refreshToken });
    if (setErr) throw setErr;
    const { data: second, error: secondErr } = await supabase.auth.getSession();
    if (secondErr) throw secondErr;
    if (second?.session) return second.session;
  }

  throw new Error('Not authenticated. Please log out and log in again to admin.');
};

const mapRow = (r: Record<string, unknown>): BulletinDocument => ({
  id: String(r.id),
  kind: String(r.kind) as BulletinDocumentKind,
  classLevel: typeof r.class_level === 'number' ? r.class_level : Number(r.class_level),
  title: r.title ? String(r.title) : undefined,
  date: String(r.date),
  storagePath: r.storage_path ? String(r.storage_path) : undefined,
  imageUrl: r.image_url ? String(r.image_url) : '',
  published: !!r.published,
  sortOrder: typeof r.sort_order === 'number' ? r.sort_order : Number(r.sort_order) || 0,
  createdAt: String(r.created_at),
  updatedAt: String(r.updated_at),
});

export function useBulletinDocumentsStore(kind: BulletinDocumentKind) {
  const [items, setItems] = useState<BulletinDocument[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('kind', kind)
        .order('class_level', { ascending: true })
        .order('date', { ascending: true })
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (error || !data) {
        setItems([]);
        return;
      }

      const rows = data as unknown as Array<Record<string, unknown>>;
      setItems(rows.map(mapRow));
    };

    fetchAll();

    const channel = supabase
      .channel(`realtime-admin-bulletin-documents-${kind}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, fetchAll)
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch {
        void 0;
      }
    };
  }, [kind]);

  const add = async (
    input: Omit<BulletinDocument, 'id' | 'kind' | 'storagePath' | 'imageUrl' | 'createdAt' | 'updatedAt'>,
    opts?: { file?: File | null }
  ) => {
    const nowIso = new Date().toISOString();

    await ensureAdminSession();

    let imageUrl = '';
    let storagePath: string | undefined;

    if (opts?.file) {
      await ensureAdminSession();
      const id = crypto.randomUUID();
      const safeName = opts.file.name.replace(/\s+/g, '_');
      const path = `${kind}/class-${input.classLevel}/${input.date}/${id}-${safeName}`;
      storagePath = path;

      const { error: upErr } = await supabase.storage
        .from('bulletin_documents')
        .upload(path, opts.file, { upsert: true });

      if (!upErr) {
        const { data } = supabase.storage.from('bulletin_documents').getPublicUrl(path);
        imageUrl = `${data.publicUrl}${data.publicUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;
      } else {
        try {
          console.error('Bulletin document upload failed:', upErr);
        } catch {
          void 0;
        }
        throw upErr;
      }
    }

    const { data, error } = await supabase
      .from(table)
      .insert({
        kind,
        class_level: input.classLevel,
        title: input.title ?? null,
        date: input.date,
        storage_path: storagePath ?? null,
        image_url: imageUrl,
        published: input.published,
        sort_order: input.sortOrder,
      })
      .select('*')
      .single();

    if (error || !data) throw error;

    const created = mapRow(data as unknown as Record<string, unknown>);
    created.createdAt = created.createdAt || nowIso;
    created.updatedAt = created.updatedAt || nowIso;

    setItems((prev) => [...prev, created]);
    return created;
  };

  const update = async (
    id: string,
    patch: Partial<Omit<BulletinDocument, 'id' | 'kind' | 'storagePath' | 'imageUrl' | 'createdAt' | 'updatedAt'>>
  ) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } as BulletinDocument : it)));

    await ensureAdminSession();

    const payload = {
      class_level: typeof patch.classLevel === 'number' ? patch.classLevel : undefined,
      title: typeof patch.title === 'string' ? patch.title : patch.title === null ? null : undefined,
      date: typeof patch.date === 'string' ? patch.date : undefined,
      published: typeof patch.published === 'boolean' ? patch.published : undefined,
      sort_order: typeof patch.sortOrder === 'number' ? patch.sortOrder : undefined,
    };

    const { error } = await supabase.from(table).update(payload).eq('id', id);
    if (error) throw error;
  };

  const remove = async (id: string) => {
    const current = items.find((i) => i.id === id);

    await ensureAdminSession();

    if (current?.storagePath) {
      try {
        await supabase.storage.from('bulletin_documents').remove([current.storagePath]);
      } catch {
        void 0;
      }
    }

    const prevItems = items;
    setItems((prev) => prev.filter((it) => it.id !== id));

    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) {
      setItems(prevItems);
      throw error;
    }
  };

  return { items, add, update, remove };
}

export const BULLETIN_DOCUMENT_KINDS: BulletinDocumentKind[] = ['routine', 'result'];
