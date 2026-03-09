'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, BarChart3 } from 'lucide-react';
import { KPICard } from '@/components/KPICard';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Cell, ReferenceLine, CartesianGrid } from 'recharts';

const clampPct = (v: number) => Math.max(0, Math.min(100, v));
const safeNum = (v: any) => {
  const n = Number(v);
  return isNaN(n) ? 0 : n;
};

export default function IndicatorsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [averages, setAverages] = useState({ spi: 0, cpi: 0 });

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch projects for budget
        const { data: projects, error: projErr } = await supabase
          .from('projects')
          .select('project_id, project_name, budget_brl');
        if (projErr) throw projErr;

        // 2. Fetch latest snapshots for each project
        const { data: snapshots, error: snapErr } = await supabase
          .from('weekly_snapshots')
          .select('*')
          .order('week_start', { ascending: false });
        if (snapErr) throw snapErr;

        // Group by project to get the latest snapshot
        const latestByProject = new Map<string, any>();
        (snapshots || []).forEach(s => {
          if (!latestByProject.has(s.project_id)) {
            latestByProject.set(s.project_id, s);
          }
        });

        // 3. Calculate SPI/CPI for each project
        const processed = (projects || []).map(p => {
          const snap = latestByProject.get(p.project_id);
          if (!snap) return null;

          const budget = p.budget_brl || 0;
          const plannedCost = safeNum(snap.planned_cost_to_date_brl);
          const actualCost = safeNum(snap.actual_cost_to_date_brl);
          const progress = clampPct(safeNum(snap.actual_progress_pct));
          
          const earnedValue = (progress / 100) * budget;
          const spi = plannedCost > 0 ? earnedValue / plannedCost : 1;
          const cpi = actualCost > 0 ? earnedValue / actualCost : 1;

          return {
            id: p.project_id,
            name: p.project_name,
            spi,
            cpi,
            progress,
            budget
          };
        }).filter(Boolean);

        setData(processed);

        // Calculate averages
        if (processed.length > 0) {
          const totalSpi = processed.reduce((acc, curr: any) => acc + curr.spi, 0);
          const totalCpi = processed.reduce((acc, curr: any) => acc + curr.cpi, 0);
          setAverages({
            spi: totalSpi / processed.length,
            cpi: totalCpi / processed.length
          });
        }

      } catch (err: any) {
        console.error('Error fetching indicators:', err.message || err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <DashboardLayout title="Indicadores">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Indicadores de Performance">
      <div className="space-y-8">
        {/* KPI Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard 
            title="SPI Médio (Prazo)" 
            value={averages.spi.toFixed(2)} 
            icon={<TrendingUp className="w-4 h-4 text-indigo-600" />}
            trend={{ 
              value: `${((averages.spi - 1) * 100).toFixed(1)}%`, 
              isPositive: averages.spi >= 1 
            }}
          />
          <KPICard 
            title="CPI Médio (Custo)" 
            value={averages.cpi.toFixed(2)} 
            icon={<BarChart3 className="w-4 h-4 text-emerald-600" />}
            trend={{ 
              value: `${((averages.cpi - 1) * 100).toFixed(1)}%`, 
              isPositive: averages.cpi >= 1 
            }}
          />
          <KPICard 
            title="Projetos Saudáveis" 
            value={data.filter(p => p.spi >= 0.95 && p.cpi >= 0.95).length.toString()} 
            icon={<CheckCircle2 className="w-4 h-4 text-blue-600" />}
          />
          <KPICard 
            title="Projetos em Alerta" 
            value={data.filter(p => p.spi < 0.9 || p.cpi < 0.9).length.toString()} 
            icon={<AlertTriangle className="w-4 h-4 text-amber-600" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Performance Matrix (Scatter Plot) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">Matriz de Performance (SPI vs CPI)</h3>
            <div className="h-[400px] w-full min-h-[400px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    type="number" 
                    dataKey="spi" 
                    name="SPI" 
                    domain={[0.5, 1.5]} 
                    label={{ value: 'SPI (Prazo)', position: 'bottom', offset: 0 }}
                    stroke="#94a3b8"
                    fontSize={12}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="cpi" 
                    name="CPI" 
                    domain={[0.5, 1.5]} 
                    label={{ value: 'CPI (Custo)', angle: -90, position: 'left' }}
                    stroke="#94a3b8"
                    fontSize={12}
                  />
                  <ZAxis type="number" dataKey="budget" range={[50, 400]} />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-3 border border-slate-200 shadow-xl rounded-lg">
                            <p className="font-bold text-slate-900 mb-1">{data.name}</p>
                            <p className="text-xs text-slate-500">SPI: <span className="font-mono font-bold text-slate-900">{data.spi.toFixed(2)}</span></p>
                            <p className="text-xs text-slate-500">CPI: <span className="font-mono font-bold text-slate-900">{data.cpi.toFixed(2)}</span></p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine x={1} stroke="#cbd5e1" strokeWidth={2} />
                  <ReferenceLine y={1} stroke="#cbd5e1" strokeWidth={2} />
                  <Scatter name="Projetos" data={data}>
                    {data.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.spi >= 1 && entry.cpi >= 1 ? '#10b981' : entry.spi < 0.9 || entry.cpi < 0.9 ? '#ef4444' : '#f59e0b'} 
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex justify-center gap-6 text-[10px] uppercase tracking-widest font-bold text-slate-400">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Saudável</div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Atenção</div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500"></div> Crítico</div>
            </div>
          </div>

          {/* Ranking Table */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">Ranking de Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Projeto</th>
                    <th className="text-right py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">SPI</th>
                    <th className="text-right py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">CPI</th>
                    <th className="text-right py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {[...data].sort((a, b) => (b.spi + b.cpi) - (a.spi + a.cpi)).map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 text-sm font-medium text-slate-900">{p.name}</td>
                      <td className={`py-4 text-right text-sm font-mono font-bold ${p.spi >= 1 ? 'text-emerald-600' : 'text-red-600'}`}>{p.spi.toFixed(2)}</td>
                      <td className={`py-4 text-right text-sm font-mono font-bold ${p.cpi >= 1 ? 'text-emerald-600' : 'text-red-600'}`}>{p.cpi.toFixed(2)}</td>
                      <td className="py-4 text-right">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          p.spi >= 1 && p.cpi >= 1 ? 'bg-emerald-50 text-emerald-700' : 
                          p.spi < 0.9 || p.cpi < 0.9 ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {p.spi >= 1 && p.cpi >= 1 ? 'Excelente' : p.spi < 0.9 || p.cpi < 0.9 ? 'Crítico' : 'Regular'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
