'use client';

import { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const date = new Date(label + 'T12:00:00');
    const formattedDate = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    
    const planned = payload.find((p: any) => p.dataKey.includes('planned'))?.value || 0;
    const actual = payload.find((p: any) => p.dataKey.includes('actual'))?.value || 0;
    const delta = actual - planned;

    return (
      <div className="bg-white p-3 border border-slate-200 shadow-xl rounded-lg text-[10px] md:text-xs">
        <p className="font-bold text-slate-900 mb-2 border-b border-slate-100 pb-1">{formattedDate}</p>
        <div className="space-y-1">
          <div className="flex justify-between gap-4">
            <span className="text-slate-500">Planejado:</span>
            <span className="font-bold text-slate-700">{planned.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-500">Real:</span>
            <span className="font-bold text-slate-900">{actual.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between gap-4 pt-1 border-t border-slate-50">
            <span className="text-slate-500">Δ:</span>
            <span className={cn(
              "font-bold",
              delta >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {delta > 0 ? '+' : ''}{delta.toFixed(1)} p.p.
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

import { cn } from '@/lib/utils';

interface ProgressChartProps {
  data: any[];
  mode?: 'weekly' | 'cumulative';
}

export function ProgressChart({ data, mode = 'weekly' }: ProgressChartProps) {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!isMounted) {
    return <div className="h-[300px] w-full" />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
        <p className="text-xs text-slate-400 font-medium">Nenhum dado de progresso disponível.</p>
      </div>
    );
  }

  const plannedKey = mode === 'weekly' ? 'planned_progress_delta' : 'planned_progress_pct';
  const actualKey = mode === 'weekly' ? 'actual_progress_delta' : 'actual_progress_pct';
  const nameSuffix = mode === 'weekly' ? '(Semanal)' : '(Acumulado)';

  return (
    <div className="h-[300px] w-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <LineChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="week_start" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            tickFormatter={(v) => {
              const date = new Date(v + 'T12:00:00');
              return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '10px', paddingBottom: '20px' }} />
          <Line 
            name={`Planejado ${nameSuffix}`}
            type="monotone" 
            dataKey={plannedKey} 
            stroke="#94a3b8" 
            strokeWidth={2} 
            strokeDasharray={mode === 'weekly' ? "5 5" : "0"}
            dot={false}
          />
          <Line 
            name={`Realizado ${nameSuffix}`}
            type="monotone" 
            dataKey={actualKey} 
            stroke="#1e3b8a" 
            strokeWidth={3} 
            dot={{ r: 4, fill: '#1e3b8a', strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
