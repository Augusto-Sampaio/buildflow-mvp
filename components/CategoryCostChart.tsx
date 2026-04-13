'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const planned = payload.find((p: any) => p.dataKey === 'planned')?.value || 0;
    const actual = payload.find((p: any) => p.dataKey === 'actual')?.value || 0;
    const delta = actual - planned;

    return (
      <div className="bg-white p-3 border border-slate-200 shadow-xl rounded-lg text-[10px] md:text-xs">
        <p className="font-bold text-slate-900 mb-2 border-b border-slate-100 pb-1">{label}</p>
        <div className="space-y-1">
          <div className="flex justify-between gap-4">
            <span className="text-slate-500">Planejado:</span>
            <span className="font-bold text-slate-700">{formatCurrencyFull(planned)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-500">Real:</span>
            <span className="font-bold text-slate-900">{formatCurrencyFull(actual)}</span>
          </div>
          <div className="flex justify-between gap-4 pt-1 border-t border-slate-50">
            <span className="text-slate-500">Δ:</span>
            <span className={cn(
              "font-bold",
              delta <= 0 ? "text-green-600" : "text-red-600"
            )}>
              {delta > 0 ? '+' : ''}{formatCurrencyFull(delta)}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

import { cn, formatCurrency, formatCurrencyFull } from '@/lib/utils';

interface CategoryCostChartProps {
  data: any[];
}

export function CategoryCostChart({ data }: CategoryCostChartProps) {
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
        <p className="text-xs text-slate-400 font-medium">Nenhum dado de categoria disponível.</p>
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <BarChart data={data} margin={{ top: 10, right: 30, left: 40, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="category" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: '#94a3b8' }}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            tickFormatter={formatCurrency}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '10px', paddingBottom: '20px' }} />
          <Bar name="Planejado" dataKey="planned" fill="#94a3b8" radius={[4, 4, 0, 0]} />
          <Bar name="Realizado" dataKey="actual" fill="#1e3b8a" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
