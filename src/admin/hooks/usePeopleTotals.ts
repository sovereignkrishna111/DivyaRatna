import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { queryTable } from '../../services/optimizedQueries';

export type PeopleKind = 'students' | 'teachers' | 'staff';
export type PeopleMode = 'manual' | 'count_only';

type PeopleTotalsDbRow = {
  kind: string;
  mode: string | null;
  total_count: number | null;
  updated_at: string | null;
};

export type PeopleTotalsRow = {
  kind: PeopleKind;
  mode: PeopleMode;
  total_count: number | null;
  updated_at: string;
};

const DEFAULTS: Record<PeopleKind, PeopleTotalsRow> = {
  students: { kind: 'students', mode: 'manual', total_count: null, updated_at: new Date(0).toISOString() },
  teachers: { kind: 'teachers', mode: 'manual', total_count: null, updated_at: new Date(0).toISOString() },
  staff: { kind: 'staff', mode: 'manual', total_count: null, updated_at: new Date(0).toISOString() },
};

export function usePeopleTotals() {
  const [rows, setRows] = useState<Record<PeopleKind, PeopleTotalsRow>>(DEFAULTS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchAll = async () => {
      setLoading(true);
      try {
        const data = await queryTable<PeopleTotalsDbRow>(
          'people_totals',
          { select: 'kind,mode,total_count,updated_at' }
        );
        if (!mounted) return;
        const next = { ...DEFAULTS } as Record<PeopleKind, PeopleTotalsRow>;
        (data || []).forEach((r) => {
          const kind = r.kind as PeopleKind;
          if (!kind) return;
          if (kind !== 'students' && kind !== 'teachers' && kind !== 'staff') return;
          next[kind] = {
            kind,
            mode: (r.mode === 'count_only' ? 'count_only' : 'manual') as PeopleMode,
            total_count: typeof r.total_count === 'number' ? r.total_count : null,
            updated_at: String(r.updated_at || ''),
          };
        });
        setRows(next);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAll();

    const ch = supabase
      .channel('realtime-people-totals')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'people_totals' }, fetchAll)
      .subscribe();

    return () => {
      mounted = false;
      try {
        supabase.removeChannel(ch);
      } catch {
        // ignore
      }
    };
  }, []);

  const upsert = async (kind: PeopleKind, patch: Partial<Pick<PeopleTotalsRow, 'mode' | 'total_count'>>) => {
    const payload: { kind: PeopleKind; mode: PeopleMode; total_count: number | null } = {
      kind,
      mode: patch.mode ?? rows[kind].mode,
      total_count: patch.total_count === undefined ? rows[kind].total_count : patch.total_count,
    };
    const { error } = await supabase.from('people_totals').upsert(payload);
    if (error) throw error;
  };

  return { rows, loading, upsert };
}
