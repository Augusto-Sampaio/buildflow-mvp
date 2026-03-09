'use client';

import { AlertTriangle, TrendingDown, DollarSign, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Alert {
  project_id: string;
  project_name: string;
  type: 'CPI' | 'SPI' | 'COST';
  message: string;
  value: string;
}

interface AlertsPanelProps {
  alerts: Alert[];
  loading?: boolean;
}

export function AlertsPanel({ alerts, loading }: AlertsPanelProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="h-4 w-32 bg-slate-200 animate-pulse rounded"></div>
        </div>
        <div className="p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="h-10 w-10 rounded-lg bg-slate-100 animate-pulse"></div>
              <div className="space-y-2 flex-1">
                <div className="h-3 w-1/3 bg-slate-100 animate-pulse rounded"></div>
                <div className="h-3 w-1/2 bg-slate-100 animate-pulse rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-red-100 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-red-50 bg-red-50/30 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <AlertTriangle size={18} className="text-red-500 shrink-0" />
          <h3 className="text-[10px] sm:text-xs font-black text-red-900 uppercase tracking-widest truncate">
            Alertas do Sistema
          </h3>
        </div>
        <div className="bg-red-500 text-white px-2.5 py-1.5 rounded-2xl flex flex-col items-center justify-center shrink-0 min-w-[64px] shadow-sm shadow-red-200">
          <span className="text-sm sm:text-base font-black leading-none">{alerts.length}</span>
          <span className="text-[7px] sm:text-[8px] font-bold uppercase leading-none mt-1 tracking-wider">Alertas</span>
        </div>
      </div>
      <div className="divide-y divide-slate-100">
        {alerts.map((alert, index) => (
          <div key={`${alert.project_id}-${alert.type}-${index}`} className="p-4 hover:bg-red-50/20 transition-colors group">
            <div className="flex gap-4">
              <div className={cn(
                "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                alert.type === 'CPI' ? "bg-amber-100 text-amber-600" :
                alert.type === 'SPI' ? "bg-blue-100 text-blue-600" :
                "bg-red-100 text-red-600"
              )}>
                {alert.type === 'CPI' ? <DollarSign size={20} /> :
                 alert.type === 'SPI' ? <Clock size={20} /> :
                 <TrendingDown size={20} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-slate-900 truncate uppercase tracking-tight mb-0.5">
                  {alert.project_name}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-red-600">
                    {alert.message}
                  </p>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                    {alert.value}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
