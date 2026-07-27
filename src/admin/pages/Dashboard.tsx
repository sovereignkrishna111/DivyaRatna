import React, { useEffect, useMemo, useState } from 'react';
import { useAdminSettings } from '../hooks/useAdminSettings';
import { supabase } from '../../lib/supabase';
import { 
  Users, UserCheck, UserCog, TrendingUp, 
  BarChart2, AlertCircle, CheckCircle2, Clock as Clock3
} from 'lucide-react';
import StatCard from '../components/StatCard';
import DonutChart from '../components/DonutChart';
import LineChartComponent from '../components/LineChart';
import BarChartComponent from '../components/BarChart';
import { LoginActivity } from '../types';

const Dashboard: React.FC = () => {
  const { stats, trends, history } = useAdminSettings();
  const [timeRange, setTimeRange] = useState('week');
  const [isLoading, setIsLoading] = useState(true);
  const [systemLatencyMs, setSystemLatencyMs] = useState<number | null>(null);
  const [systemStatus, setSystemStatus] = useState<'operational' | 'degraded' | 'down'>('operational');
  const [systemLoadPct, setSystemLoadPct] = useState<number>(0);

  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let mounted = true;

    const measure = async () => {
      const start = performance.now();
      const res = await supabase
        .from('people_totals')
        .select('kind')
        .limit(1);

      const latency = Math.max(0, Math.round(performance.now() - start));
      if (!mounted) return;

      if (res.error) {
        setSystemLatencyMs(latency);
        setSystemStatus('down');
        setSystemLoadPct(100);
        return;
      }

      setSystemLatencyMs(latency);
      const nextStatus: 'operational' | 'degraded' | 'down' = latency < 350 ? 'operational' : latency < 900 ? 'degraded' : 'down';
      setSystemStatus(nextStatus);

      const pct = Math.min(100, Math.max(0, Math.round((latency / 1200) * 100)));
      setSystemLoadPct(pct);
    };

    measure();
    const id = window.setInterval(() => {
      measure();
    }, 30000);

    return () => {
      mounted = false;
      window.clearInterval(id);
    };
  }, []);

  const activities: LoginActivity[] = (() => {
    try {
      const raw = localStorage.getItem('admin_login_activities');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  })();

  // Charts fed by real data
  const performanceData = useMemo(() => {
    const points = (history.length ? history : [{ time: Date.now(), students: stats.students, teachers: stats.teachers, staff: stats.staff }]).slice(-12);
    return {
      labels: points.map(p => new Date(p.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })),
      datasets: [
        {
          label: 'Total Users',
          data: points.map(p => (p.students + p.teachers + p.staff)),
          borderColor: '#4f46e5',
          backgroundColor: 'rgba(79, 70, 229, 0.1)',
          tension: 0.3,
          fill: true,
        }
      ]
    };
  }, [history, stats]);

  const categoryBarData = useMemo(() => ({
    labels: ['Students', 'Teachers', 'Staff'],
    datasets: [
      {
        label: 'Count',
        data: [stats.students, stats.teachers, stats.staff],
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
      }
    ]
  }), [stats]);

  return (
    <div className="relative space-y-6">
      <div className="pointer-events-none absolute -left-16 -top-24 h-72 w-72 rounded-full bg-gradient-to-br from-indigo-500/10 via-sky-500/10 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-24 h-80 w-80 rounded-full bg-gradient-to-br from-fuchsia-500/10 via-emerald-500/10 to-transparent blur-3xl" />

      {/* Header */}
      <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Dashboard Overview</h1>
          <p className="mt-1 text-sm text-slate-500">Welcome back! Here's what's happening with your platform.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center rounded-2xl border border-white/40 bg-white/70 p-1 shadow-sm backdrop-blur-xl">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="h-9 rounded-xl bg-transparent px-3 text-sm font-semibold text-slate-700 outline-none"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="relative grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          label="Total Students" 
          value={stats.students} 
          icon={Users} 
          colorClass="text-blue-600" 
          trend={`${(trends.students ?? 0).toFixed(1)}%`}
          trendType={(trends.students ?? 0) >= 0 ? 'up' : 'down'}
          loading={isLoading}
        />
        <StatCard 
          label="Total Teachers" 
          value={stats.teachers} 
          icon={UserCheck} 
          colorClass="text-emerald-600" 
          trend={`${(trends.teachers ?? 0).toFixed(1)}%`}
          trendType={(trends.teachers ?? 0) >= 0 ? 'up' : 'down'}
          loading={isLoading}
        />
        <StatCard 
          label="Total Staff" 
          value={stats.staff} 
          icon={UserCog} 
          colorClass="text-purple-600" 
          trend={`${(trends.staff ?? 0).toFixed(1)}%`}
          trendType={(trends.staff ?? 0) >= 0 ? 'up' : 'down'}
          loading={isLoading}
        />
        <StatCard 
          label="Others" 
          value={stats.teachers + stats.staff} 
          icon={TrendingUp} 
          colorClass="text-amber-600" 
          trend={`${(trends.total ?? 0).toFixed(1)}%`}
          trendType={(trends.total ?? 0) >= 0 ? 'up' : 'down'}
          loading={isLoading}
        />
      </div>

      {/* Main Content */}
      <div className="relative grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Performance Overview */}
        <div className="lg:col-span-2 overflow-hidden rounded-2xl border border-white/40 bg-white/70 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.45)] backdrop-blur-xl">
          <div className="flex flex-col gap-4 border-b border-white/40 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h2 className="text-base font-semibold tracking-tight text-slate-900">Performance Overview</h2>
              <p className="mt-1 text-sm text-slate-500">User growth over the selected period</p>
            </div>
            <div className="inline-flex items-center gap-1 rounded-2xl bg-slate-900/5 p-1">
              <button className="rounded-xl px-3 py-1 text-sm font-semibold text-indigo-700 bg-white/80 shadow-sm">Week</button>
              <button className="rounded-xl px-3 py-1 text-sm font-semibold text-slate-600 hover:text-slate-800">Month</button>
              <button className="rounded-xl px-3 py-1 text-sm font-semibold text-slate-600 hover:text-slate-800">Year</button>
            </div>
          </div>
          <div className="h-80 p-6">
            <LineChartComponent data={performanceData} />
          </div>
        </div>

        {/* User Distribution */}
        <div className="overflow-visible rounded-2xl border border-white/40 bg-white/70 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.45)] backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/40 p-6">
            <div>
              <h2 className="text-base font-semibold tracking-tight text-slate-900">User Distribution</h2>
              <p className="mt-1 text-sm text-slate-500">Breakdown by category</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/40 bg-white/60 shadow-sm">
              <BarChart2 className="h-5 w-5 text-slate-500" />
            </div>
          </div>
          <div className="h-80 p-6 overflow-visible">
            <DonutChart
              data={[
                { label: 'Students', value: stats.students, color: '#3b82f6' },
                { label: 'Teachers', value: stats.teachers, color: '#10b981' },
                { label: 'Staff', value: stats.staff, color: '#f59e0b' },
              ]}
              size={220}
              thickness={52}
            />
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Activities */}
        <div className="lg:col-span-2 overflow-hidden rounded-2xl border border-white/40 bg-white/70 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.45)] backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/40 p-6">
            <div>
              <h2 className="text-base font-semibold tracking-tight text-slate-900">Recent Activities</h2>
              <p className="mt-1 text-sm text-slate-500">Latest admin login events</p>
            </div>
            <button className="rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">View All</button>
          </div>
          <div className="flow-root p-2 sm:p-4">
            <ul className="divide-y divide-white/50 rounded-xl bg-white/50">
              {activities.length > 0 ? (
                activities.slice(0, 5).map((activity) => (
                  <li key={activity.id} className="px-4 py-4 sm:px-5">
                    <div className="flex items-center gap-4">
                      <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl ring-1 ring-white/60 ${
                        activity.status === 'success' ? 'bg-emerald-100/80 text-emerald-700' : 'bg-rose-100/80 text-rose-700'
                      }`}>
                        {activity.status === 'success' ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <AlertCircle className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {activity.name || activity.email || 'User'}
                        </p>
                        <p className="text-sm text-slate-500 truncate">
                          {activity.status === 'success' ? 'Successfully logged in' : 'Failed login attempt'}
                        </p>
                      </div>
                      <div className="inline-flex items-center text-sm font-medium text-slate-500">
                        <Clock3 className="mr-1.5 h-4 w-4 text-slate-400" />
                        {new Date(activity.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <div className="py-10 text-center">
                  <p className="text-slate-500">No recent activities found</p>
                </div>
              )}
            </ul>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          <div className="overflow-hidden rounded-2xl border border-white/40 bg-white/70 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.45)] backdrop-blur-xl">
            <div className="border-b border-white/40 p-6">
              <h3 className="text-base font-semibold tracking-tight text-slate-900">Category Counts</h3>
              <p className="mt-1 text-sm text-slate-500">Current totals by role</p>
            </div>
            <div className="h-64 p-6">
              <BarChartComponent data={categoryBarData} />
            </div>
          </div>
          
          <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-slate-900 via-indigo-900 to-fuchsia-900 p-6 text-white shadow-[0_20px_60px_-30px_rgba(15,23,42,0.7)]">
            <div className="pointer-events-none absolute -right-20 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -left-24 -bottom-24 h-56 w-56 rounded-full bg-emerald-400/10 blur-2xl" />
            <div className="relative">
              <h3 className="text-base font-semibold tracking-tight">System Status</h3>
              <p className="mt-1 text-sm text-white/70">
                {systemStatus === 'operational' ? 'All systems are operational' : systemStatus === 'degraded' ? 'Performance is slightly degraded' : 'Service disruption detected'}
              </p>
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white/80">Server Load</span>
                  <span className="text-sm font-semibold">{systemLoadPct}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/15">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-emerald-300 via-sky-300 to-fuchsia-300"
                    style={{ width: `${systemLoadPct}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span>0%</span>
                  <span>
                    {systemLatencyMs === null ? 'Checking…' : `${systemLatencyMs}ms`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
