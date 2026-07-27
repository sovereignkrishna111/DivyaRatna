import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export type NoticePriority = 'low' | 'medium' | 'high';
export type NoticeCategory = 'Academic' | 'Administrative' | 'Health' | 'Other';

 export type AchievementActivityKind = 'achievement' | 'activity';

export type Notice = {
  id: string;
  title: string;
  content: string;
  date: string; // YYYY-MM-DD
  category: NoticeCategory;
  priority: NoticePriority;
  attachment?: string; // filename only
  fileDataUrl?: string; // optional stored file (URL or data URI)
  fileUrl?: string; // optional public URL (mirrors fileDataUrl when using storage)
  author?: string;
  views?: number;
  linkUrl?: string; // Read more link
  published: boolean;
  createdAt: number;
  updatedAt: number;
};

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

export type NewsItem = {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  category: string;
  excerpt: string;
  content?: string;
  image?: string; // data URL
  imageUrl?: string; // remote
  linkUrl?: string; // button link
  author?: string;
  readTime?: string;
  published: boolean;
  createdAt: number;
  updatedAt: number;
};

 export type AchievementActivityItem = {
  id: string;
  title: string;
  excerpt: string;
  content?: string;
  date: string; // YYYY-MM-DD
  kind: AchievementActivityKind;
  category?: string;
  image?: string; // data URL
  imageUrl?: string; // remote
  linkUrl?: string;
  author?: string;
  published: boolean;
  createdAt: number;
  updatedAt: number;
 };

const KEY_NOTICES = 'admin_bulletins_notices_v1';
const KEY_NEWS = 'admin_bulletins_news_v1';
 const KEY_ACH_ACT = 'admin_bulletins_achievements_activities_v1';

export function useNoticesStore() {
  const [items, setItems] = useState<Notice[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      const { data, error } = await supabase
        .from('notices')
        .select('*')
        .order('date', { ascending: false });
      if (error || !data) { setItems([]); return; }
      const rows = data as unknown as Array<Record<string, unknown>>;
      setItems(rows.map((n) => ({
        id: String(n.id),
        title: String(n.title),
        content: String(n.content),
        date: String(n.date),
        category: String(n.category) as NoticeCategory,
        priority: String(n.priority) as NoticePriority,
        attachment: n.attachment ? String(n.attachment) : undefined,
        fileDataUrl: n.file_data_url ? String(n.file_data_url) : undefined,
        fileUrl: n.file_data_url ? String(n.file_data_url) : undefined,
        author: n.author ? String(n.author) : 'Admin',
        views: typeof n.views === 'number' ? n.views : 0,
        linkUrl: n.link_url ? String(n.link_url) : undefined,
        published: !!n.published,
        createdAt: typeof n.created_at === 'number' ? n.created_at : Number(n.created_at) || 0,
        updatedAt: typeof n.updated_at === 'number' ? n.updated_at : Number(n.updated_at) || 0,
      })) as Notice[]);
    };
    fetchAll();

    const channel = supabase
      .channel('realtime-admin-notices')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notices' }, fetchAll)
      .subscribe();
    return () => {
      try { supabase.removeChannel(channel); } catch { void 0; }
    };
  }, []);

  const add = async (
    input: Omit<Notice, 'id' | 'createdAt' | 'updatedAt' | 'views'>,
    opts?: { file?: File | null }
  ) => {
    await ensureAdminSession();
    const now = Date.now();
    const tempId = `${now}-${Math.random().toString(36).slice(2,8)}`;
    let attachment = input.attachment;
    let fileUrl = input.fileDataUrl;

    if (opts?.file) {
      try {
        await ensureAdminSession();
        const path = `${tempId}/${opts.file.name}`;
        const { error: upErr } = await supabase.storage.from('notices').upload(path, opts.file, { upsert: true });
        if (!upErr) {
          const { data } = supabase.storage.from('notices').getPublicUrl(path);
          fileUrl = data.publicUrl;
          attachment = opts.file.name;
        }
      } catch { void 0; }
    }

    const item: Notice = {
      ...input,
      id: tempId,
      createdAt: now,
      updatedAt: now,
      views: 0,
      attachment: attachment,
      fileDataUrl: fileUrl,
      fileUrl: fileUrl,
    } as Notice;

    setItems((prev) => [item, ...prev]);
    supabase
      .from('notices')
      .insert({
        id: item.id,
        title: item.title,
        content: item.content,
        date: item.date,
        category: item.category,
        priority: item.priority,
        attachment: item.attachment || null,
        file_data_url: item.fileDataUrl || null,
        author: item.author || null,
        views: item.views ?? 0,
        link_url: item.linkUrl || null,
        published: item.published,
        created_at: item.createdAt,
        updated_at: item.updatedAt,
      })
      .then(() => { void 0; }, () => { void 0; });
    return item;
  };

  const update = async (
    id: string,
    patch: Partial<Notice>,
    opts?: { file?: File | null; removeAttachment?: boolean }
  ) => {
    await ensureAdminSession();
    const current = items.find(i => i.id === id);
    const updatedAt = Date.now();

    let nextAttachment = patch.attachment ?? current?.attachment;
    let nextFileUrl = patch.fileDataUrl ?? current?.fileDataUrl;

    if (opts?.removeAttachment) {
      if (current?.attachment) {
        const oldPath = `${id}/${current.attachment}`;
        try { await supabase.storage.from('notices').remove([oldPath]); } catch { void 0; }
      }
      nextAttachment = undefined;
      nextFileUrl = undefined;
    } else if (opts?.file) {
      await ensureAdminSession();
      if (current?.attachment) {
        const oldPath = `${id}/${current.attachment}`;
        try { await supabase.storage.from('notices').remove([oldPath]); } catch { void 0; }
      }
      try {
        const path = `${id}/${opts.file.name}`;
        const { error: upErr } = await supabase.storage.from('notices').upload(path, opts.file, { upsert: true });
        if (!upErr) {
          const { data } = supabase.storage.from('notices').getPublicUrl(path);
          nextAttachment = opts.file.name;
          nextFileUrl = data.publicUrl;
        }
      } catch { void 0; }
    }

    setItems(prev => prev.map(it => it.id===id? { ...it, ...patch, attachment: nextAttachment, fileDataUrl: nextFileUrl, fileUrl: nextFileUrl, updatedAt } : it));

    const payload = { ...(current ? { ...current, ...patch } : patch), attachment: nextAttachment, fileDataUrl: nextFileUrl, updatedAt } as Partial<Notice>;
    supabase
      .from('notices')
      .update({
        title: payload.title,
        content: payload.content,
        date: payload.date,
        category: payload.category,
        priority: payload.priority,
        attachment: payload.attachment ?? null,
        file_data_url: payload.fileDataUrl ?? null,
        author: payload.author ?? null,
        views: typeof payload.views === 'number' ? payload.views : undefined,
        link_url: payload.linkUrl ?? null,
        published: typeof payload.published === 'boolean' ? payload.published : undefined,
        updated_at: updatedAt,
      })
      .eq('id', id)
      .then(() => { void 0; }, () => { void 0; });
  };

  const remove = async (id: string) => {
    await ensureAdminSession();
    const current = items.find(i => i.id === id);
    if (current?.attachment) {
      const oldPath = `${id}/${current.attachment}`;
      try { await supabase.storage.from('notices').remove([oldPath]); } catch { void 0; }
    }
    try {
      const { data: files } = await supabase.storage.from('notices').list(id);
      if (files && files.length) {
        const paths = files.map(f => `${id}/${f.name}`);
        try { await supabase.storage.from('notices').remove(paths); } catch { void 0; }
      }
    } catch { void 0; }
    const prevItems = items;
    setItems(prev => prev.filter(it => it.id !== id));
    try {
      const { error } = await supabase.from('notices').delete().eq('id', id);
      if (error) {
        setItems(prevItems);
        try { alert('Failed to delete notice. Please try again.'); } catch { void 0; }
      }
    } catch {
      setItems(prevItems);
      try { alert('Failed to delete notice. Please try again.'); } catch { void 0; }
    }
  };

  return { items, add, update, remove };
}

export function useNewsStore() {
  const [items, setItems] = useState<NewsItem[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('date', { ascending: false });
      if (error || !data) { setItems([]); return; }
      const rows = data as unknown as Array<Record<string, unknown>>;
      setItems(rows.map((n) => ({
        id: String(n.id),
        title: String(n.title),
        date: String(n.date),
        category: String(n.category),
        excerpt: String(n.excerpt),
        content: n.content ? String(n.content) : undefined,
        image: undefined,
        imageUrl: n.image_url ? String(n.image_url) : undefined,
        linkUrl: n.link_url ? String(n.link_url) : undefined,
        author: n.author ? String(n.author) : 'Admin',
        readTime: n.read_time ? String(n.read_time) : undefined,
        published: !!n.published,
        createdAt: typeof n.created_at === 'number' ? n.created_at : Number(n.created_at) || 0,
        updatedAt: typeof n.updated_at === 'number' ? n.updated_at : Number(n.updated_at) || 0,
      })) as NewsItem[]);
    };
    fetchAll();

    const channel = supabase
      .channel('realtime-admin-news')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'news' }, fetchAll)
      .subscribe();
    return () => {
      try { supabase.removeChannel(channel); } catch { void 0; }
    };
  }, []);

  const add = async (
    input: Omit<NewsItem, 'id' | 'createdAt' | 'updatedAt'>,
    opts?: { file?: File | null }
  ) => {
    await ensureAdminSession();
    const now = Date.now();
    const tempId = `${now}-${Math.random().toString(36).slice(2,8)}`;
    let imageUrl = input.imageUrl;

    if (opts?.file) {
      try {
        await ensureAdminSession();
        const path = `${tempId}/${opts.file.name}`;
        const { error: upErr } = await supabase.storage.from('news').upload(path, opts.file, {
          upsert: true,
          contentType: opts.file.type || 'image/*',
          cacheControl: '3600',
        });
        if (!upErr) {
          const { data } = supabase.storage.from('news').getPublicUrl(path);
          imageUrl = `${data.publicUrl}${data.publicUrl.includes('?') ? '&' : '?'}t=${now}`;
        } else {
          try {
            console.error('News image upload failed:', upErr);
          } catch { void 0; }
          try {
            const msg = (upErr as unknown as { message?: string }).message || String(upErr);
            alert(`Image upload failed.\n\nBucket: news\nError: ${msg}\n\nCommon causes:\n- bucket does not exist\n- storage policy denied (RLS)\n- not logged in`);
          } catch { void 0; }
        }
      } catch { void 0; }
    }

    const item: NewsItem = {
      ...input,
      id: tempId,
      imageUrl,
      createdAt: now,
      updatedAt: now,
    } as NewsItem;

    setItems((prev) => [item, ...prev]);
    supabase
      .from('news')
      .insert({
        id: item.id,
        title: item.title,
        date: item.date,
        category: item.category,
        excerpt: item.excerpt,
        content: item.content || null,
        image_url: item.imageUrl || null,
        link_url: item.linkUrl || null,
        author: item.author || null,
        read_time: item.readTime || null,
        published: item.published,
        created_at: item.createdAt,
        updated_at: item.updatedAt,
      })
      .then(() => { void 0; }, () => { void 0; });
    return item;
  };

  const update = async (
    id: string,
    patch: Partial<NewsItem>,
    opts?: { file?: File | null; removeImage?: boolean }
  ) => {
    await ensureAdminSession();
    const current = items.find(i => i.id === id);
    const updatedAt = Date.now();

    let nextImageUrl = patch.imageUrl ?? current?.imageUrl;

    if (opts?.removeImage) {
      try {
        const { data: files } = await supabase.storage.from('news').list(id);
        if (files && files.length) {
          const paths = files.map(f => `${id}/${f.name}`);
          try { await supabase.storage.from('news').remove(paths); } catch { void 0; }
        }
      } catch { void 0; }
      nextImageUrl = undefined;
    } else if (opts?.file) {
      await ensureAdminSession();
      try {
        const { data: files } = await supabase.storage.from('news').list(id);
        if (files && files.length) {
          const paths = files.map(f => `${id}/${f.name}`);
          try { await supabase.storage.from('news').remove(paths); } catch { void 0; }
        }
      } catch { void 0; }
      try {
        const now = Date.now();
        const path = `${id}/${opts.file.name}`;
        const { error: upErr } = await supabase.storage.from('news').upload(path, opts.file, {
          upsert: true,
          contentType: opts.file.type || 'image/*',
          cacheControl: '3600',
        });
        if (!upErr) {
          const { data } = supabase.storage.from('news').getPublicUrl(path);
          nextImageUrl = `${data.publicUrl}${data.publicUrl.includes('?') ? '&' : '?'}t=${now}`;
        } else {
          try {
            console.error('News image upload failed:', upErr);
          } catch { void 0; }
          try {
            const msg = (upErr as unknown as { message?: string }).message || String(upErr);
            alert(`Image upload failed.\n\nBucket: news\nError: ${msg}\n\nCommon causes:\n- bucket does not exist\n- storage policy denied (RLS)\n- not logged in`);
          } catch { void 0; }
        }
      } catch { void 0; }
    }

    setItems(prev => prev.map(it => it.id===id ? { ...it, ...patch, imageUrl: nextImageUrl, updatedAt } : it));

    const payload = { ...(current ? { ...current, ...patch } : patch), imageUrl: nextImageUrl } as Partial<NewsItem>;
    supabase
      .from('news')
      .update({
        title: payload.title,
        date: payload.date,
        category: payload.category,
        excerpt: payload.excerpt,
        content: payload.content ?? null,
        image_url: nextImageUrl ?? null,
        link_url: payload.linkUrl ?? null,
        author: payload.author ?? null,
        read_time: payload.readTime ?? null,
        published: typeof payload.published === 'boolean' ? payload.published : undefined,
        updated_at: updatedAt,
      })
      .eq('id', id)
      .then(() => { void 0; }, () => { void 0; });
  };

  const remove = async (id: string) => {
    await ensureAdminSession();
    try {
      const { data: files } = await supabase.storage.from('news').list(id);
      if (files && files.length) {
        const paths = files.map(f => `${id}/${f.name}`);
        try { await supabase.storage.from('news').remove(paths); } catch { void 0; }
      }
    } catch { void 0; }
    const prevItems = items;
    setItems(prev => prev.filter(it => it.id !== id));
    try {
      const { error } = await supabase.from('news').delete().eq('id', id);
      if (error) {
        setItems(prevItems);
        try { alert('Failed to delete news. Please try again.'); } catch { void 0; }
      }
    } catch {
      setItems(prevItems);
      try { alert('Failed to delete news. Please try again.'); } catch { void 0; }
    }
  };

  return { items, add, update, remove };
}

export function useAchievementsActivitiesStore() {
  const [items, setItems] = useState<AchievementActivityItem[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      const { data, error } = await supabase
        .from('achievements_activities')
        .select('*')
        .order('date', { ascending: false });
      if (error || !data) { setItems([]); return; }
      const rows = data as unknown as Array<Record<string, unknown>>;
      setItems(rows.map((n) => ({
        id: String(n.id),
        title: String(n.title),
        excerpt: String(n.excerpt),
        content: n.content ? String(n.content) : undefined,
        date: String(n.date),
        kind: (String(n.kind) as AchievementActivityKind) || 'achievement',
        category: n.category ? String(n.category) : undefined,
        image: undefined,
        imageUrl: n.image_url ? String(n.image_url) : undefined,
        linkUrl: n.link_url ? String(n.link_url) : undefined,
        author: n.author ? String(n.author) : 'Admin',
        published: !!n.published,
        createdAt: typeof n.created_at === 'number' ? n.created_at : Number(n.created_at) || 0,
        updatedAt: typeof n.updated_at === 'number' ? n.updated_at : Number(n.updated_at) || 0,
      })) as AchievementActivityItem[]);
    };

    fetchAll();

    const channel = supabase
      .channel('realtime-admin-achievements-activities')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'achievements_activities' }, fetchAll)
      .subscribe();
    return () => {
      try { supabase.removeChannel(channel); } catch { void 0; }
    };
  }, []);

  const add = async (
    input: Omit<AchievementActivityItem, 'id' | 'createdAt' | 'updatedAt'>,
    opts?: { file?: File | null }
  ) => {
    await ensureAdminSession();
    const now = Date.now();
    const tempId = `${now}-${Math.random().toString(36).slice(2,8)}`;
    let imageUrl = input.imageUrl;

    if (opts?.file) {
      try {
        await ensureAdminSession();
        const path = `${tempId}/${opts.file.name}`;
        const { error: upErr } = await supabase.storage.from('achievements_activities').upload(path, opts.file, { upsert: true });
        if (!upErr) {
          const { data } = supabase.storage.from('achievements_activities').getPublicUrl(path);
          imageUrl = `${data.publicUrl}${data.publicUrl.includes('?') ? '&' : '?'}t=${now}`;
        } else {
          try {
            // Surface the real storage error so we can fix bucket/policies precisely.
            console.error('Achievements/Activities image upload failed:', upErr);
          } catch { void 0; }
          try {
            const msg = (upErr as unknown as { message?: string }).message || String(upErr);
            alert(`Image upload failed.\n\nBucket: achievements_activities\nError: ${msg}\n\nCommon causes:\n- bucket does not exist\n- storage policy denied (RLS)\n- not logged in`);
          } catch { void 0; }
        }
      } catch { void 0; }
    }

    const item: AchievementActivityItem = {
      ...input,
      id: tempId,
      imageUrl,
      createdAt: now,
      updatedAt: now,
    } as AchievementActivityItem;

    setItems((prev) => [item, ...prev]);
    supabase
      .from('achievements_activities')
      .insert({
        id: item.id,
        title: item.title,
        excerpt: item.excerpt,
        content: item.content || null,
        date: item.date,
        kind: item.kind,
        category: item.category || null,
        image_url: item.imageUrl || null,
        link_url: item.linkUrl || null,
        author: item.author || null,
        published: item.published,
        created_at: item.createdAt,
        updated_at: item.updatedAt,
      })
      .then(() => {}, () => {});
    return item;
  };

  const update = async (
    id: string,
    patch: Partial<AchievementActivityItem>,
    opts?: { file?: File | null; removeImage?: boolean }
  ) => {
    await ensureAdminSession();
    const current = items.find(i => i.id === id);
    const updatedAt = Date.now();

    let nextImageUrl = patch.imageUrl ?? current?.imageUrl;

    if (opts?.removeImage) {
      try {
        const { data: files } = await supabase.storage.from('achievements_activities').list(id);
        if (files && files.length) {
          const paths = files.map(f => `${id}/${f.name}`);
          try { await supabase.storage.from('achievements_activities').remove(paths); } catch { void 0; }
        }
      } catch { void 0; }
      nextImageUrl = undefined;
    } else if (opts?.file) {
      try {
        const { data: files } = await supabase.storage.from('achievements_activities').list(id);
        if (files && files.length) {
          const paths = files.map(f => `${id}/${f.name}`);
          try { await supabase.storage.from('achievements_activities').remove(paths); } catch { void 0; }
        }
      } catch { void 0; }
      try {
        await ensureAdminSession();
        const path = `${id}/${opts.file.name}`;
        const { error: upErr } = await supabase.storage.from('achievements_activities').upload(path, opts.file, { upsert: true });
        if (!upErr) {
          const { data } = supabase.storage.from('achievements_activities').getPublicUrl(path);
          nextImageUrl = `${data.publicUrl}${data.publicUrl.includes('?') ? '&' : '?'}t=${updatedAt}`;
        } else {
          try {
            console.error('Achievements/Activities image upload failed:', upErr);
          } catch { void 0; }
          try {
            const msg = (upErr as unknown as { message?: string }).message || String(upErr);
            alert(`Image upload failed.\n\nBucket: achievements_activities\nError: ${msg}\n\nCommon causes:\n- bucket does not exist\n- storage policy denied (RLS)\n- not logged in`);
          } catch { void 0; }
        }
      } catch { void 0; }
    }

    setItems(prev => prev.map(it => it.id===id ? { ...it, ...patch, imageUrl: nextImageUrl, updatedAt } : it));

    const payload = { ...(current ? { ...current, ...patch } : patch), imageUrl: nextImageUrl } as Partial<AchievementActivityItem>;
    supabase
      .from('achievements_activities')
      .update({
        title: payload.title,
        excerpt: payload.excerpt,
        content: payload.content ?? null,
        date: payload.date,
        kind: payload.kind,
        category: payload.category ?? null,
        image_url: nextImageUrl ?? null,
        link_url: payload.linkUrl ?? null,
        author: payload.author ?? null,
        published: typeof payload.published === 'boolean' ? payload.published : undefined,
        updated_at: updatedAt,
      })
      .eq('id', id)
      .then(() => { void 0; }, () => { void 0; });
  };

  const remove = async (id: string) => {
    await ensureAdminSession();
    try {
      const { data: files } = await supabase.storage.from('achievements_activities').list(id);
      if (files && files.length) {
        const paths = files.map(f => `${id}/${f.name}`);
        try { await supabase.storage.from('achievements_activities').remove(paths); } catch { void 0; }
      }
    } catch { void 0; }
    const prevItems = items;
    setItems(prev => prev.filter(it => it.id !== id));
    try {
      const { error } = await supabase.from('achievements_activities').delete().eq('id', id);
      if (error) {
        setItems(prevItems);
        try { alert('Failed to delete item. Please try again.'); } catch { void 0; }
      }
    } catch {
      setItems(prevItems);
      try { alert('Failed to delete item. Please try again.'); } catch { void 0; }
    }
  };

  return { items, add, update, remove };
}

export const BULLETIN_KEYS = { NOTICES: KEY_NOTICES, NEWS: KEY_NEWS, ACHIEVEMENTS_ACTIVITIES: KEY_ACH_ACT };
