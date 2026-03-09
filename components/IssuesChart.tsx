'use client';

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-slate-200 shadow-xl rounded-lg text-[10px] md:text-xs">
        <p className="font-bold text-slate-900 mb-1">{label}</p>
        <div className="flex justify-between gap-4">
          <span className="text-slate-500">Pendências:</span>
          <span className="font-bold text-[#1e3b8a]">{payload[0].value}</span>
        </div>
      </div>
    );
  }
  return null;
};

export function IssuesChart({ data }: { data: { type: string; count: number }[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[280px] w-full flex items-center justify-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
        <p className="text-xs text-slate-400 font-medium">Nenhuma pendência registrada.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[280px] min-h-[280px]">
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <BarChart data={data} layout="vertical" margin={{ left: 40, right: 20 }}>
          <XAxis type="number" hide />
          <YAxis 
            type="category" 
            dataKey="type" 
            width={120} 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }}
          />
          <Tooltip 
            cursor={{ fill: '#f8fafc' }}
            content={<CustomTooltip />}
          />
          <Bar 
            dataKey="count" 
            fill="#1e3b8a" 
            radius={[0, 4, 4, 0]} 
            barSize={20}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
