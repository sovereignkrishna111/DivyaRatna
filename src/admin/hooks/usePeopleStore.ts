import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export type Student = { id: string; name: string; phone: string; address: string; className?: string; section?: string };
export type Teacher = { id: string; name: string; phone: string; address: string; className?: string; section?: string };
export type Staff = { id: string; name: string; phone: string; address: string };

type Kind = 'students' | 'teachers' | 'staff';

export function usePeopleStore<T extends Student | Teacher | Staff>(kind: Kind) {
  const [items, setItems] = useState<T[]>([]);

  useEffect(() => {
    // Initial fetch
    const fetchAll = async () => {
      const { data, error } = await supabase
        .from(kind)
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        const mapped = (data as any[]).map((row) =>
          kind === 'staff'
            ? ({ id: row.id, name: row.name, phone: row.phone, address: row.address } as T)
            : ({ id: row.id, name: row.name, phone: row.phone, address: row.address, className: row.class_name, section: row.section } as T)
        );
        setItems(mapped);
      }
    };
    fetchAll();

    // Realtime subscription
    const channel = supabase
      .channel(`realtime-${kind}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: kind },
        (payload: any) => {
          if (payload.eventType === 'INSERT') {
            const row = payload.new as any;
            const item = (kind === 'staff'
              ? { id: row.id, name: row.name, phone: row.phone, address: row.address }
              : { id: row.id, name: row.name, phone: row.phone, address: row.address, className: row.class_name, section: row.section }) as T;
            setItems((prev) => [item, ...prev.filter((p) => p.id !== item.id)]);
          } else if (payload.eventType === 'UPDATE') {
            const row = payload.new as any;
            const item = (kind === 'staff'
              ? { id: row.id, name: row.name, phone: row.phone, address: row.address }
              : { id: row.id, name: row.name, phone: row.phone, address: row.address, className: row.class_name, section: row.section }) as T;
            setItems((prev) => prev.map((p) => (p.id === item.id ? item : p)));
          } else if (payload.eventType === 'DELETE') {
            const row = payload.old as any;
            setItems((prev) => prev.filter((p) => p.id !== row.id));
          }
        }
      )
      .subscribe();

    return () => {
      try { supabase.removeChannel(channel); } catch {}
    };
  }, [kind]);

  const add = async (item: Omit<T, 'id'>) => {
    const payload: any = { name: (item as any).name, phone: (item as any).phone, address: (item as any).address };
    if (kind !== 'staff') {
      payload.class_name = (item as any).className || null;
      payload.section = (item as any).section || null;
    }
    const { data, error } = await supabase.from(kind).insert(payload).select('*').single();
    if (error) return null as unknown as T;
    const mapped = (kind === 'staff'
      ? { id: data!.id, name: data!.name, phone: data!.phone, address: data!.address }
      : { id: data!.id, name: data!.name, phone: data!.phone, address: data!.address, className: data!.class_name, section: data!.section }) as T;
    setItems((prev) => [mapped, ...prev]);
    return mapped;
  };

  const remove = async (id: string) => {
    await supabase.from(kind).delete().eq('id', id);
    setItems((prev) => prev.filter((x) => x.id !== id));
  };

  return { items, add, remove, setItems };
}
