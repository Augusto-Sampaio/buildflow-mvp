import { cn } from '@/lib/utils';
import { Skeleton } from './Skeleton';

interface KPICardProps {
  title: string;
  value: string | number;
  fullValue?: string | number;
  subtitle?: string;
  trend?: {
    value: string | number;
    isPositive: boolean;
  };
  status?: {
    label: string;
    type: 'success' | 'warning' | 'danger' | 'neutral';
  };
  icon?: React.ReactNode;
  className?: string;
  loading?: boolean;
}

export function KPICard({ title, value, fullValue, subtitle, trend, status, icon, className, loading }: KPICardProps) {
  if (loading) {
    return (
      <div className={cn("bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between min-w-0 h-32", className)}>
        <div>
          <Skeleton className="h-3 w-24 mb-3" />
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-3 w-40 mt-2" />
      </div>
    );
  }

  return (
    <div className={cn("bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between min-w-0", className)}>
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">{title}</p>
          {icon && <div className="opacity-80">{icon}</div>}
        </div>
        <div className="flex items-baseline gap-1 flex-wrap">
          <h3 
            className="text-lg md:text-xl xl:text-2xl font-black text-slate-900 whitespace-nowrap overflow-hidden text-ellipsis leading-tight"
            title={String(fullValue || value)}
          >
            {value}
          </h3>
          {trend && (
            <span className={cn(
              "text-[10px] md:text-xs font-bold whitespace-nowrap",
              trend.isPositive ? "text-green-500" : "text-red-500"
            )}>
              {trend.isPositive ? '+' : ''}{trend.value}
            </span>
          )}
        </div>
        {status && (
          <div className={cn(
            "inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider mt-1",
            status.type === 'success' && "bg-green-50 text-green-600 border border-green-100",
            status.type === 'warning' && "bg-amber-50 text-amber-600 border border-amber-100",
            status.type === 'danger' && "bg-red-50 text-red-600 border border-red-100",
            status.type === 'neutral' && "bg-slate-50 text-slate-600 border border-slate-100"
          )}>
            {status.label}
          </div>
        )}
      </div>
      {subtitle && <p className="text-[10px] text-slate-400 mt-1 italic truncate">{subtitle}</p>}
    </div>
  );
}
