import React from 'react';
import { ArrowUp, ArrowDown, Loader2 } from 'lucide-react';

type TrendType = 'up' | 'down' | 'neutral';

type Props = {
  label: string;
  value: string | number;
  icon?: React.ComponentType<{ className?: string }>;
  colorClass?: string;
  trend?: string;
  trendType?: TrendType;
  loading?: boolean;
};

const StatCard: React.FC<Props> = ({
  label,
  value,
  icon: Icon,
  colorClass = 'text-blue-600',
  trend,
  trendType = 'up',
  loading = false,
}) => {
  const trendColors = {
    up: 'text-emerald-700 bg-emerald-50 ring-emerald-200/60',
    down: 'text-rose-700 bg-rose-50 ring-rose-200/60',
    neutral: 'text-slate-700 bg-slate-50 ring-slate-200/60',
  };

  const trendIcons = {
    up: <ArrowUp className="w-3.5 h-3.5" />,
    down: <ArrowDown className="w-3.5 h-3.5" />,
    neutral: null,
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/40 bg-white/70 p-6 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.45)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_44px_-26px_rgba(15,23,42,0.55)]">
      <div className="pointer-events-none absolute -right-20 -top-24 h-44 w-44 rounded-full bg-gradient-to-br from-indigo-400/20 via-sky-400/10 to-transparent blur-2xl" />
      <div className="pointer-events-none absolute -left-24 -bottom-24 h-44 w-44 rounded-full bg-gradient-to-tr from-fuchsia-400/10 via-emerald-400/10 to-transparent blur-2xl" />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-wide text-slate-500">{label}</p>
          {loading ? (
            <div className="h-8 flex items-center">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          ) : (
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
          )}
        </div>
        
        {Icon && (
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/70 to-white/10 blur" />
            <div className={`relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/40 ${colorClass.replace('text-', 'bg-')} bg-opacity-10 shadow-sm`}>
              <Icon className={`h-5 w-5 ${colorClass}`} />
            </div>
          </div>
        )}
      </div>
      
      {trend && !loading && (
        <div className={`mt-5 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${trendColors[trendType]}`}>
          <span>{trendIcons[trendType]}</span>
          <span className="whitespace-nowrap">{trend}</span>
          <span className="whitespace-nowrap text-slate-500">from last period</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
