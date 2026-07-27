import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export type PeopleKind = 'students' | 'teachers' | 'staff';
export type PeopleMode = 'manual' | 'count_only';

export type PeopleTotalsRow = {
  kind: PeopleKind;
  mode: PeopleMode;
  total_count: number | null;
};

type DbRow = {
  kind: string;
  mode: string | null;
  total_count: number | null;
};

const DEFAULT_ROWS: Record<PeopleKind, PeopleTotalsRow> = {
  students: { kind: 'students', mode: 'manual', total_count: null },
  teachers: { kind: 'teachers', mode: 'manual', total_count: null },
  staff: { kind: 'staff', mode: 'manual', total_count: null },
};

export function usePublicPeopleTotals() {
  const [rows, setRows] = useState<Record<PeopleKind, PeopleTotalsRow>>(DEFAULT_ROWS);

  useEffect(() => {
    let mounted = true;

    const fetchAll = async () => {
      const { data, error } = await supabase.from('people_totals').select('kind,mode,total_count');
      if (error || !data) return;
      if (!mounted) return;

      setRows((prev) => {
        const next = { ...prev };
        (data as DbRow[]).forEach((r) => {
          const kind = r.kind as PeopleKind;
          if (kind !== 'students' && kind !== 'teachers' && kind !== 'staff') return;
          next[kind] = {
            kind,
            mode: (r.mode === 'count_only' ? 'count_only' : 'manual') as PeopleMode,
            total_count: typeof r.total_count === 'number' ? r.total_count : null,
          };
        });
        return next;
      });
    };

    fetchAll();

    const ch = supabase
      .channel('realtime-public-people-totals')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'people_totals' }, fetchAll)
      .subscribe();

    return () => {
      mounted = false;
      try {
        supabase.removeChannel(ch);
      } catch {
        void 0;
      }
    };
  }, []);

  return rows;
}
