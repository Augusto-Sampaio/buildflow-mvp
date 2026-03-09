'use client';

import { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, DollarSign, PieChart, ArrowUpRight, ArrowDownRight, Wallet, ChevronDown } from 'lucide-react';
import { KPICard } from '@/components/KPICard';
import { CategoryCostChart } from '@/components/CategoryCostChart';
import { formatCurrency, formatCurrencyFull } from '@/lib/utils';

const safeNum = (v: any) => {
  const n = Number(v);
  return isNaN(n) ? 0 : n;
};

export default function CostsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [stats, setStats] = useState({
    totalBudget: 0,
    totalActual: 0,
    totalPlanned: 0,
    projects: [] as any[],
    categories: [] as any[]
  });

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: projects, error: projErr } = await supabase
          .from('projects')
          .select('*');
        if (projErr) throw projErr;

        const { data: snapshots, error: snapErr } = await supabase
          .from('weekly_snapshots')
          .select('*')
          .order('week_start', { ascending: false });
        if (snapErr) throw snapErr;

        const { data: costsData, error: costsErr } = await supabase
          .from('costs_monthly')
          .select('project_id, cost_category, planned_cost_brl, actual_cost_brl');
        if (costsErr) throw costsErr;

        const latestByProject = new Map<string, any>();
        (snapshots || []).forEach(s => {
          if (!latestByProject.has(s.project_id)) {
            latestByProject.set(s.project_id, s);
          }
        });

        let totalBudget = 0;
        let totalActual = 0;
        let totalPlanned = 0;

        const processedProjects = (projects || []).map(p => {
          const snap = latestByProject.get(p.project_id);
          const budget = p.budget_brl || 0;
          const actual = snap ? safeNum(snap.actual_cost_to_date_brl) : 0;
          const planned = snap ? safeNum(snap.planned_cost_to_date_brl) : 0;

          totalBudget += budget;
          totalActual += actual;
          totalPlanned += planned;

          return {
            ...p,
            actual,
            planned,
            variance: actual - planned,
            variancePct: planned > 0 ? ((actual - planned) / planned) * 100 : 0,
            utilizationPct: budget > 0 ? Math.min(100, (actual / budget) * 100) : 0
          };
        });

        setStats({
          totalBudget,
          totalActual,
          totalPlanned,
          projects: processedProjects,
          categories: costsData || []
        });

      } catch (err: any) {
        console.error('Error fetching costs:', err.message || err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Filtered stats for KPIs and Chart
  const filteredStats = useMemo(() => {
    const filteredCategories = selectedProjectId === 'all' 
      ? stats.categories 
      : stats.categories.filter(c => c.project_id === selectedProjectId);

    // Aggregate by category
    const catMap = new Map<string, { category: string; planned: number; actual: number }>();
    filteredCategories.forEach(c => {
      const cat = c.cost_category || 'Outro';
      const curr = catMap.get(cat) || { category: cat, planned: 0, actual: 0 };
      curr.planned += safeNum(c.planned_cost_brl);
      curr.actual += safeNum(c.actual_cost_brl);
      catMap.set(cat, curr);
    });
    const chartData = Array.from(catMap.values()).sort((a, b) => b.actual - a.actual);

    if (selectedProjectId === 'all') {
      return {
        budget: stats.totalBudget,
        actual: stats.totalActual,
        planned: stats.totalPlanned,
        projects: stats.projects,
        chartData
      };
    }
    const project = stats.projects.find(p => p.project_id === selectedProjectId);
    return {
      budget: project?.budget_brl || 0,
      actual: project?.actual || 0,
      planned: project?.planned || 0,
      projects: project ? [project] : [],
      chartData
    };
  }, [selectedProjectId, stats]);

  if (loading) {
    return (
      <DashboardLayout title="Custos">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      </DashboardLayout>
    );
  }

  const budgetUtilization = stats.totalBudget > 0 ? Math.min(100, (stats.totalActual / stats.totalBudget) * 100) : 0;
  const costVariance = stats.totalActual - stats.totalPlanned;

  const filteredUtilization = filteredStats.budget > 0 ? Math.min(100, (filteredStats.actual / filteredStats.budget) * 100) : 0;
  const filteredVariance = filteredStats.actual - filteredStats.planned;

  const headerActions = (
    <div className="flex items-center gap-2">
      <span className="hidden md:inline text-[10px] font-bold text-slate-400 uppercase tracking-widest">Filtrar Projeto:</span>
      <div className="relative">
        <select 
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          className="appearance-none bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 pr-8 text-[10px] md:text-xs font-bold text-slate-700 focus:ring-2 focus:ring-[#1e3b8a]/20 outline-none cursor-pointer"
        >
          <option value="all">Todos os Projetos</option>
          {stats.projects.map(p => (
            <option key={p.project_id} value={p.project_id}>{p.project_name}</option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>
    </div>
  );

  return (
    <DashboardLayout title="Gestão de Custos" headerActions={headerActions}>
      <div className="space-y-8">
        {/* KPI Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard 
            title={selectedProjectId === 'all' ? "Orçamento Total" : "Orçamento do Projeto"} 
            value={formatCurrency(filteredStats.budget)} 
            fullValue={formatCurrencyFull(filteredStats.budget)}
            icon={<Wallet className="w-4 h-4 text-indigo-600" />}
          />
          <KPICard 
            title="Custo Real Acumulado" 
            value={formatCurrency(filteredStats.actual)} 
            fullValue={formatCurrencyFull(filteredStats.actual)}
            icon={<DollarSign className="w-4 h-4 text-emerald-600" />}
            trend={{ 
              value: `${Math.abs((filteredStats.actual - filteredStats.planned) / (filteredStats.planned || 1) * 100).toFixed(1)}% vs planejado`, 
              isPositive: filteredStats.actual <= filteredStats.planned 
            }}
          />
          <KPICard 
            title="Utilização do Orçamento" 
            value={`${filteredUtilization.toFixed(1)}%`} 
            icon={<PieChart className="w-4 h-4 text-blue-600" />}
          />
          <KPICard 
            title="Desvio de Custo" 
            value={formatCurrency(Math.abs(filteredVariance))} 
            fullValue={formatCurrencyFull(Math.abs(filteredVariance))}
            icon={filteredVariance > 0 ? <ArrowUpRight className="w-4 h-4 text-red-600" /> : <ArrowDownRight className="w-4 h-4 text-emerald-600" />}
            trend={{ 
              value: filteredVariance > 0 ? "Acima do plano" : "Abaixo do plano", 
              isPositive: filteredVariance <= 0 
            }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Category Breakdown */}
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">
              {selectedProjectId === 'all' ? 'Distribuição Geral' : 'Distribuição do Projeto'}
            </h3>
            <div className="h-[300px]">
              <CategoryCostChart data={filteredStats.chartData} />
            </div>
          </div>

          {/* Project Cost Table */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">
              {selectedProjectId === 'all' ? 'Detalhamento por Projeto' : 'Status do Projeto Selecionado'}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Projeto</th>
                    <th className="text-right py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Orçamento</th>
                    <th className="text-right py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Realizado</th>
                    <th className="text-right py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Desvio</th>
                    <th className="text-right py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Utilização</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {(selectedProjectId === 'all' ? stats.projects : filteredStats.projects).sort((a, b) => b.actual - a.actual).map((p) => (
                    <tr key={p.project_id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 text-sm font-medium text-slate-900">{p.project_name}</td>
                      <td className="py-4 text-right text-sm font-mono text-slate-600" title={formatCurrencyFull(p.budget_brl)}>{formatCurrency(p.budget_brl)}</td>
                      <td className="py-4 text-right text-sm font-mono font-bold text-slate-900" title={formatCurrencyFull(p.actual)}>{formatCurrency(p.actual)}</td>
                      <td className={`py-4 text-right text-sm font-mono font-bold ${p.variance > 0 ? 'text-red-600' : 'text-emerald-600'}`} title={formatCurrencyFull(p.variance)}>
                        {p.variance > 0 ? '+' : ''}{formatCurrency(p.variance)}
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${p.utilizationPct >= 100 ? 'bg-red-500' : p.utilizationPct > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                              style={{ width: `${p.utilizationPct}%` }}
                            ></div>
                          </div>
                          <span className={`text-[10px] font-bold font-mono ${p.utilizationPct >= 100 ? 'text-red-600' : 'text-slate-600'}`}>
                            {p.utilizationPct.toFixed(1)}%
                          </span>
                        </div>
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
