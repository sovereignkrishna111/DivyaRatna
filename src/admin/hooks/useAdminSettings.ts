import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';

export type AdminStats = {
  students: number;
  teachers: number;
  staff: number;
};

type Snapshot = AdminStats & { time: number };

async function fetchCounts(): Promise<AdminStats> {
  const [totalsRes, s, t, st] = await Promise.all([
    supabase.from('people_totals').select('kind,mode,total_count'),
    supabase.from('students').select('*', { count: 'exact', head: true }),
    supabase.from('teachers').select('*', { count: 'exact', head: true }),
    supabase.from('staff').select('*', { count: 'exact', head: true }),
  ]);

  const rows = (totalsRes.data || []) as Array<{ kind: string; mode: string | null; total_count: number | null }>;
  const map = new Map(rows.map((r) => [r.kind, r]));

  const students = map.get('students');
  const teachers = map.get('teachers');
  const staff = map.get('staff');

  return {
    students: students?.mode === 'count_only' && typeof students.total_count === 'number' ? students.total_count : (s.count || 0),
    teachers: teachers?.mode === 'count_only' && typeof teachers.total_count === 'number' ? teachers.total_count : (t.count || 0),
    staff: staff?.mode === 'count_only' && typeof staff.total_count === 'number' ? staff.total_count : (st.count || 0),
  };
}

function readHistory(): Snapshot[] {
  try {
    const raw = localStorage.getItem('admin_stats_history');
    const parsed = raw ? (JSON.parse(raw) as Snapshot[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeHistory(list: Snapshot[]) {
  try {
    localStorage.setItem('admin_stats_history', JSON.stringify(list.slice(-50)));
  } catch {
    void 0;
  }
}

function pctChange(curr: number, prev: number) {
  if (prev === 0) return curr === 0 ? 0 : 100;
  return ((curr - prev) / prev) * 100;
}

export function useAdminSettings() {
  const [stats, setStats] = useState<AdminStats>({ students: 0, teachers: 0, staff: 0 });
  const [history, setHistory] = useState<Snapshot[]>(() => readHistory());
  const lastStatsRef = useRef<AdminStats>(stats);

  useEffect(() => {
    let mounted = true;
    const refresh = async () => {
      const next = await fetchCounts().catch(() => lastStatsRef.current);
      if (!mounted) return;
      setStats(next);
      const last = history[history.length - 1];
      const changed = !last || last.students !== next.students || last.teachers !== next.teachers || last.staff !== next.staff;
      if (changed) {
        const snap: Snapshot = { ...next, time: Date.now() };
        const updated = [...history, snap];
        setHistory(updated);
        writeHistory(updated);
      }
      lastStatsRef.current = next;
    };

    // Initial
    refresh();

    // Realtime channels for each table
    const channels = ['students','teachers','staff'].map((table) =>
      supabase
        .channel(`realtime-stats-${table}`)
        .on('postgres_changes', { event: '*', schema: 'public', table }, () => {
          refresh();
        })
        .subscribe()
    );

    return () => {
      mounted = false;
      channels.forEach((ch) => {
        try {
          supabase.removeChannel(ch);
        } catch {
          void 0;
        }
      });
    };
  }, [history]);

  const total = useMemo(() => stats.students + stats.teachers + stats.staff, [stats]);

  const prev = history.length > 1 ? history[history.length - 2] : history[0];
  const trends = useMemo(() => {
    const base = prev || { students: 0, teachers: 0, staff: 0 } as AdminStats;
    return {
      students: pctChange(stats.students, base.students),
      teachers: pctChange(stats.teachers, base.teachers),
      staff: pctChange(stats.staff, base.staff),
      total: pctChange(total, (base.students + base.teachers + base.staff) || 0),
    };
  }, [stats, total, prev]);

  return {
    stats,
    total,
    history,
    trends,
    refresh: async () => setStats(await fetchCounts()),
  };
}
