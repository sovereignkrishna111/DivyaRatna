import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { queryTableWhere } from '../services/optimizedQueries';

export type BirthdayPerson = {
  id: string;
  name: string;
  role?: string;
  className?: string;
  section?: string;
  startAt: string;
  endAt: string;
  imageUrl?: string;
};

type BirthdayRow = {
  id: string;
  name: string;
  role: string | null;
  class_name: string | null;
  section: string | null;
  start_at: string;
  end_at: string;
  image_url: string;
  published: boolean;
};

export function usePublicBirthdays() {
  const [items, setItems] = useState<BirthdayPerson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchAll = async () => {
      setLoading(true);
      try {
        const data = await queryTableWhere<any>(
          'birthdays',
          'published',
          true,
          { select: 'id,person_name,photo_url,class_name,section,start_at,end_at', cacheTtl: 600000 }
        );

        if (!mounted) return;
        const mapped = (data || []).map((r) => ({
          id: String(r.id),
          name: String(r.person_name),
          role: undefined,
          className: r.class_name || undefined,
          section: r.section || undefined,
          startAt: String(r.start_at),
          endAt: String(r.end_at),
          imageUrl: r.photo_url || undefined,
        }));

        setItems(mapped);
      } catch (error) {
        if (!mounted) return;
        setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAll();

    const interval = window.setInterval(() => {
      fetchAll();
    }, 60000);

    const ch = supabase
      .channel('realtime-home-birthdays')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'birthdays' }, fetchAll)
      .subscribe();

    return () => {
      mounted = false;
      window.clearInterval(interval);
      try {
        supabase.removeChannel(ch);
      } catch {
        void 0;
      }
    };
  }, []);

  const active = useMemo(() => {
    const now = Date.now();
    return items.filter((i) => {
      const s = new Date(i.startAt).getTime();
      const e = new Date(i.endAt).getTime();
      return now >= s && now < e;
    });
  }, [items]);

  return { items: active, loading };
}
