'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { DashboardLayout } from '@/components/DashboardLayout';
import { KPICard } from '@/components/KPICard';
import { ProgressChart } from '@/components/ProgressChart';
import { CostChart } from '@/components/CostChart';
import { CategoryCostChart } from '@/components/CategoryCostChart';
import { IssuesChart } from '@/components/IssuesChart';
import { AlertsPanel, Alert } from '@/components/AlertsPanel';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, ChevronDown, Calendar, Clock } from 'lucide-react';
import { cn, pct, formatCurrency, formatCurrencyFull } from '@/lib/utils';
import Link from 'next/link';
import { Skeleton } from '@/components/Skeleton';

export const dynamic = 'force-dynamic';

const WINDOW_DAYS: Record<number, number> = {
  4: 28,
  8: 56,
  12: 84,
  24: 168,
};

function daysAgoISO(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [windowWeeks, setWindowWeeks] = useState<number>(4);
  const [scopeMode, setScopeMode] = useState<'WINDOW' | 'GERAL'>('GERAL');
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const days = WINDOW_DAYS[windowWeeks] ?? 84;
        const sinceISO = scopeMode === 'GERAL' ? null : daysAgoISO(days);

        console.log("FILTER:", { scopeMode, windowWeeks, days, sinceISO, selectedProjectId });

        const { data: projectsData } = await supabase.from('projects').select('*');

        // B) Buscar snapshots (snapQuery)
        let snapQuery = supabase
          .from('weekly_snapshots')
          .select('project_id, week_start, planned_progress_pct, actual_progress_pct, planned_cost_to_date_brl, actual_cost_to_date_brl')
          .order('week_start', { ascending: true });

        if (scopeMode !== 'GERAL' && sinceISO) {
          snapQuery = snapQuery.gte('week_start', sinceISO);
        }

        if (selectedProjectId !== 'all') {
          snapQuery = snapQuery.eq('project_id', selectedProjectId);
        }

        const { data: snapRows, error: snapErr } = await snapQuery;
        if (snapErr) throw snapErr;

        console.log("SNAP:", snapRows?.length, snapRows?.[0], snapRows?.[snapRows.length - 1]);

        const safeNum = (v: any) => Number(v ?? 0);
        const clampPct = (v: number) => Math.max(0, Math.min(100, v));
        const pctCalc = (num: number, den: number) => (den === 0 ? 0 : (num / den) * 100);

        // C) Agregação por Semana (para os gráficos)
        let weeklyDataForCharts = snapRows || [];
        if (scopeMode !== 'GERAL' && sinceISO) {
          // Para gráficos, buscamos um pouco mais para ter o ponto inicial
          let chartQuery = supabase
            .from('weekly_snapshots')
            .select('project_id, week_start, planned_progress_pct, actual_progress_pct, planned_cost_to_date_brl, actual_cost_to_date_brl')
            .gte('week_start', daysAgoISO(days + 7)) // Uma semana a mais para o delta inicial
            .order('week_start', { ascending: true });
          
          if (selectedProjectId !== 'all') {
            chartQuery = chartQuery.eq('project_id', selectedProjectId);
          }
          
          const { data: chartRows } = await chartQuery;
          weeklyDataForCharts = chartRows || [];
        }

        const weeklyAggregated = new Map<string, any>();
        weeklyDataForCharts.forEach(row => {
          const week = row.week_start;
          const curr = weeklyAggregated.get(week) || { 
            week_start: week, 
            planned_progress_pct: 0, 
            actual_progress_pct: 0, 
            planned_cost_to_date_brl: 0, 
            actual_cost_to_date_brl: 0,
            count: 0 
          };
          
          curr.planned_progress_pct += clampPct(safeNum(row.planned_progress_pct));
          curr.actual_progress_pct += clampPct(safeNum(row.actual_progress_pct));
          curr.planned_cost_to_date_brl += safeNum(row.planned_cost_to_date_brl);
          curr.actual_cost_to_date_brl += safeNum(row.actual_cost_to_date_brl);
          curr.count++;
          
          weeklyAggregated.set(week, curr);
        });

        const sortedAggregated = Array.from(weeklyAggregated.values()).sort((a, b) => a.week_start.localeCompare(b.week_start));
        
        if (selectedProjectId === 'all') {
          sortedAggregated.forEach(week => {
            week.planned_progress_pct /= week.count;
            week.actual_progress_pct /= week.count;
          });
        }

        const weeklyDeltas = sortedAggregated.map((week, i) => {
          if (i === 0) return { ...week, planned_progress_delta: 0, actual_progress_delta: 0, planned_cost_delta: 0, actual_cost_delta: 0 };
          const prev = sortedAggregated[i - 1];
          return {
            ...week,
            planned_progress_delta: Math.max(0, week.planned_progress_pct - prev.planned_progress_pct),
            actual_progress_delta: Math.max(0, week.actual_progress_pct - prev.actual_progress_pct),
            planned_cost_delta: Math.max(0, week.planned_cost_to_date_brl - prev.planned_cost_to_date_brl),
            actual_cost_delta: Math.max(0, week.actual_cost_to_date_brl - prev.actual_cost_to_date_brl)
          };
        });

        // E) Lógica de snapshots para KPIs (Último por projeto a partir de snapRows)
        const latestByProject = new Map<string, any>();
        for (const r of snapRows ?? []) {
          const prev = latestByProject.get(r.project_id);
          if (!prev || new Date(r.week_start) > new Date(prev.week_start)) {
            latestByProject.set(r.project_id, r);
          }
        }
        const latestRows = Array.from(latestByProject.values());

        // Enrich projects with status for the table
        const projectsWithStatus = (projectsData || []).map(p => {
          const latest = latestByProject.get(p.project_id);
          const pct = latest ? Number(latest.actual_progress_pct ?? 0) : 0;
          return {
            ...p,
            status: pct >= 100 ? 'Finalizado' : 'Em execução'
          };
        });
        setProjects(projectsWithStatus);

        let finished = 0;
        let running = 0;

        for (const row of latestRows) {
          const pct = clampPct(Number(row.actual_progress_pct ?? 0));
          if (pct >= 100) finished++;
          else running++;
        }

        // LOG que bate com seu SQL
        console.log("LATEST:", {
          latestCount: latestRows.length,
          uniqueProjects: new Set((snapRows ?? []).map(r => r.project_id)).size,
          finished,
          running
        });

        // Comparação (sempre 4 semanas atrás em relação ao "agora" ou início da janela)
        const comparisonDateISO = scopeMode === 'GERAL' ? daysAgoISO(28) : sinceISO;
        const { data: comparisonData } = await supabase
          .from('weekly_snapshots')
          .select('project_id, week_start, actual_progress_pct, actual_cost_to_date_brl')
          .lte('week_start', comparisonDateISO)
          .order('week_start', { ascending: false });

        const comparisonMap = new Map<string, any>();
        (comparisonData || []).forEach(row => {
          if (!comparisonMap.has(row.project_id)) {
            comparisonMap.set(row.project_id, row);
          }
        });
        let comparisonRows = Array.from(comparisonMap.values());

        if (selectedProjectId !== 'all') {
          comparisonRows = comparisonRows.filter(r => r.project_id === selectedProjectId);
        }

        // KPI agregados atuais
        const plannedProgress = latestRows.length
          ? latestRows.reduce((a, r) => a + clampPct(safeNum(r.planned_progress_pct)), 0) / latestRows.length
          : 0;
        const actualProgress = latestRows.length
          ? latestRows.reduce((a, r) => a + clampPct(safeNum(r.actual_progress_pct)), 0) / latestRows.length
          : 0;
        const plannedCost = latestRows.reduce((a, r) => a + safeNum(r.planned_cost_to_date_brl), 0);
        const actualCost = latestRows.reduce((a, r) => a + safeNum(r.actual_cost_to_date_brl), 0);

        // KPI agregados comparação
        const compActualProgress = comparisonRows.length
          ? comparisonRows.reduce((a, r) => a + clampPct(safeNum(r.actual_progress_pct)), 0) / comparisonRows.length
          : 0;
        const compActualCost = comparisonRows.reduce((a, r) => a + safeNum(r.actual_cost_to_date_brl), 0);

        const progressVariance = actualProgress - plannedProgress;
        const costVariancePct = pctCalc(actualCost - plannedCost, plannedCost);
        
        const earnedValue = latestRows.reduce((acc, r) => {
          const project = projectsData?.find(p => p.project_id === r.project_id);
          const budget = project?.budget_brl || 0;
          return acc + (clampPct(safeNum(r.actual_progress_pct)) / 100) * budget;
        }, 0);

        const spi = plannedCost > 0 ? earnedValue / plannedCost : 1;
        const cpi = actualCost > 0 ? earnedValue / actualCost : 1;

        const progressComparison = actualProgress - compActualProgress;
        const costComparison = actualCost - compActualCost;

        // Dados para os gráficos: filtramos para a janela selecionada
        const chartData = scopeMode === 'GERAL' ? weeklyDeltas : weeklyDeltas.filter(r => r.week_start >= (sinceISO || '1900-01-01'));
console.table(
  latestRows.map(r => ({
    project: r.project_id,
    week: r.week_start,
    planned: r.planned_progress_pct,
    actual: r.actual_progress_pct,
    planned_cost: r.planned_cost_to_date_brl,
    actual_cost: r.actual_cost_to_date_brl
  }))
);
        // 2) Consertar Issues Abertas e “Issues por tipo”
        let issuesQuery = supabase
          .from('issues')
          .select('issue_type, status, created_date, project_id');

        if (selectedProjectId !== 'all') {
          issuesQuery = issuesQuery.eq('project_id', selectedProjectId);
        }

        const { data: issuesRows, error: issuesErr } = await issuesQuery;
        if (issuesErr) throw issuesErr;

        // calcular issues abertas corretamente
        const issuesOpen = (issuesRows || []).filter(issue => {
          const status = (issue.status || '').trim().toLowerCase()
          return status !== 'resolvida'
        })

        const issuesOpenCount = issuesOpen.length

        const issuesByType: Record<string, number> = {}

        issuesOpen.forEach(issue => {
          const type = issue.issue_type || 'Outro'

          if (!issuesByType[type]) {
            issuesByType[type] = 0
          }

          issuesByType[type]++
        })

        const issuesChartData = Object.entries(issuesByType).map(([type, count]) => ({
          type,
          count
        }))

        // 3) Deixar o gráfico de custos limpo (Top 6 + Outros)
        let costQuery = supabase
          .from('costs_monthly')
          .select('project_id, cost_category, planned_cost_brl, actual_cost_brl');

        if (selectedProjectId !== 'all') {
          costQuery = costQuery.eq('project_id', selectedProjectId);
        }

        const { data: costsData, error: costsErr } = await costQuery;
        if (costsErr) throw costsErr;

        // agregação por categoria
        const catMap = new Map<string, { category: string; planned: number; actual: number }>();
        for (const c of costsData || []) {
          const cat = c.cost_category || 'Outro';
          const curr = catMap.get(cat) || { category: cat, planned: 0, actual: 0 };
          curr.planned += safeNum(c.planned_cost_brl);
          curr.actual += safeNum(c.actual_cost_brl);
          catMap.set(cat, curr);
        }

        const sortedCats = Array.from(catMap.values()).sort((a,b) => b.actual - a.actual);
        const topN = 6;
        const top = sortedCats.slice(0, topN);
        const rest = sortedCats.slice(topN);

        const others = rest.reduce(
          (acc, r) => ({ category: 'Outros', planned: acc.planned + r.planned, actual: acc.actual + r.actual }),
          { category: 'Outros', planned: 0, actual: 0 }
        );

        const categoryCosts = rest.length ? [...top, others] : top;

        // 4) Calcular Alertas
        const calculatedAlerts: Alert[] = [];
        latestRows.forEach(r => {
          const project = projectsData?.find(p => p.project_id === r.project_id);
          if (!project) return;

          const budget = project.budget_brl || 0;
          const actualProgress = clampPct(safeNum(r.actual_progress_pct));
          const actualCost = safeNum(r.actual_cost_to_date_brl);
          const plannedCost = safeNum(r.planned_cost_to_date_brl);

          const ev = (actualProgress / 100) * budget;
          const pv = plannedCost; 
          const ac = actualCost;

          const cpi = ac > 0 ? ev / ac : 1;
          const spi = pv > 0 ? ev / pv : 1;

          if (cpi < 0.9) {
            calculatedAlerts.push({
              project_id: r.project_id,
              project_name: project.project_name,
              type: 'CPI',
              message: 'CPI < 0.9',
              value: cpi.toFixed(2)
            });
          }

          if (pv > 0 && (ac / pv) > 1.12) {
            calculatedAlerts.push({
              project_id: r.project_id,
              project_name: project.project_name,
              type: 'COST',
              message: `Custo ${((ac/pv - 1) * 100).toFixed(0)}% acima do planejado`,
              value: (ac/pv).toFixed(2)
            });
          }

          if (spi < 0.95) {
            calculatedAlerts.push({
              project_id: r.project_id,
              project_name: project.project_name,
              type: 'SPI',
              message: 'SPI < 0.95',
              value: spi.toFixed(2)
            });
          }
        });

        const kpis = {
          projectCount: latestRows.length,
          finishedCount: finished,
          runningCount: running,
          plannedProgress,
          actualProgress,
          progressVariance,
          plannedCost,
          actualCost,
          costVariancePct,
          openIssuesCount: issuesOpenCount,
          spi,
          cpi,
          comparisons: {
            progress: progressComparison,
            cost: costComparison
          }
        };

        setDashboardData({ 
          weekly: chartData, 
          issues: issuesChartData, 
          costs: categoryCosts, 
          kpis,
          issuesOpen: issuesOpenCount,
          alerts: calculatedAlerts
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, selectedProjectId, windowWeeks, scopeMode]);

  const headerActions = (
    <>
      <div className="flex items-center gap-2">
        <span className="hidden md:inline text-[10px] font-bold text-slate-400 uppercase tracking-widest">Projeto:</span>
        <div className="relative">
          {loading ? (
            <Skeleton className="h-8 w-32 rounded-lg" />
          ) : (
            <>
              <select 
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="appearance-none bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 pr-8 text-[10px] md:text-xs font-bold text-slate-700 focus:ring-2 focus:ring-slate-900/20 outline-none cursor-pointer"
              >
                <option value="all">Todos os Projetos</option>
                {projects.map(p => (
                  <option key={p.project_id} value={p.project_id}>{p.project_name}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </>
          )}
        </div>
      </div>

      <div className="flex bg-slate-100 p-1 rounded-lg">
        {[4, 8, 12, 24].map((w) => (
          <button
            key={w}
            onClick={() => {
              setWindowWeeks(w);
              setScopeMode('WINDOW');
            }}
            className={`px-2 md:px-3 py-1 text-[10px] font-bold rounded-md transition-all ${
              scopeMode === 'WINDOW' && windowWeeks === w ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {w} sem
          </button>
        ))}
        <button
          onClick={() => setScopeMode('GERAL')}
          className={`px-2 md:px-3 py-1 text-[10px] font-bold rounded-md transition-all ${
            scopeMode === 'GERAL' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          GERAL
        </button>
      </div>
    </>
  );

  return (
    <DashboardLayout title="Dashboard Geral" headerActions={headerActions}>
      {/* Meta Info */}
      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 -mt-4 mb-6">
        <div className="flex items-center gap-1.5 text-[10px] md:text-xs font-medium text-slate-500">
          <Calendar className="w-3 h-3 opacity-50" />
          <span className="uppercase tracking-wider opacity-70">Última atualização:</span>
          <span className="text-slate-900">
            {loading ? (
              <Skeleton className="h-3 w-20" />
            ) : dashboardData?.weekly?.length 
              ? (() => {
                  const [y, m, d] = dashboardData.weekly[dashboardData.weekly.length - 1].week_start.split('-').map(Number);
                  return new Date(y, m - 1, d).toLocaleDateString('pt-BR');
                })()
              : 'N/A'}
          </span>
        </div>
        <div className="hidden md:block w-px h-3 bg-slate-200" />
        <div className="flex items-center gap-1.5 text-[10px] md:text-xs font-medium text-slate-500">
          <Clock className="w-3 h-3 opacity-50" />
          <span className="uppercase tracking-wider opacity-70">Janela:</span>
          <span className="text-slate-900">
            {scopeMode === 'GERAL' ? 'Histórico Geral' : `${windowWeeks} semanas`}
          </span>
        </div>
      </div>

      {/* KPIs and Alerts */}
      <div className={cn(
        "grid grid-cols-1 gap-6 mb-8",
        dashboardData?.alerts?.length > 0 ? "lg:grid-cols-4" : "lg:grid-cols-3"
      )}>
        {/* Alerts Panel - First on mobile, last on desktop */}
        {dashboardData?.alerts?.length > 0 && (
          <div className="lg:col-span-1 lg:order-2">
            <AlertsPanel alerts={dashboardData?.alerts || []} loading={loading} />
          </div>
        )}

        {/* KPI Cards */}
        <div className={cn(
          "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6",
          dashboardData?.alerts?.length > 0 ? "lg:col-span-3 lg:order-1" : "lg:col-span-3"
        )}>
          <KPICard 
            title="Status dos Projetos" 
            value={loading ? '' : `${dashboardData?.kpis.projectCount} PROJETOS`} 
            subtitle={loading ? '' : `${dashboardData?.kpis.runningCount} Em execução | ${dashboardData?.kpis.finishedCount} Finalizados`}
            loading={loading}
          />
          <KPICard 
            title="Avanço Planejado" 
            value={loading ? '' : `${dashboardData?.kpis.plannedProgress.toFixed(1)}%`} 
            loading={loading}
          />
          <KPICard 
            title="Avanço Real" 
            value={loading ? '' : `${dashboardData?.kpis.actualProgress.toFixed(1)}%`} 
            trend={loading ? undefined : { value: `${dashboardData?.kpis.progressVariance.toFixed(1)}%`, isPositive: dashboardData?.kpis.progressVariance >= 0 }}
            status={loading ? undefined : (() => {
              const v = dashboardData?.kpis.progressVariance;
              if (v <= -3) return { label: "Crítico", type: 'danger' };
              if (v <= -1) return { label: "Atenção", type: 'warning' };
              if (v >= 1) return { label: "Adiantado", type: 'success' };
              return { label: "No alvo", type: 'success' };
            })()}
            subtitle={loading ? '' : (dashboardData?.kpis.comparisons.progress !== 0 ? `${dashboardData?.kpis.comparisons.progress >= 0 ? '↑' : '↓'} ${Math.abs(dashboardData?.kpis.comparisons.progress).toFixed(1)}% vs últimas 4 semanas` : "Sem dados de comparação")}
            loading={loading}
          />
          <KPICard 
            title="Custo Planejado" 
            value={loading ? '' : formatCurrency(dashboardData?.kpis.plannedCost)} 
            fullValue={loading ? '' : formatCurrencyFull(dashboardData?.kpis.plannedCost)}
            subtitle={loading ? '' : "Orçamento OK"}
            loading={loading}
          />
          <KPICard 
            title="Custo Real" 
            value={loading ? '' : formatCurrency(dashboardData?.kpis.actualCost)} 
            fullValue={loading ? '' : formatCurrencyFull(dashboardData?.kpis.actualCost)}
            trend={loading ? undefined : { 
              value: `${dashboardData?.kpis.costVariancePct.toFixed(1)}%`, 
              isPositive: dashboardData?.kpis.actualCost <= dashboardData?.kpis.plannedCost 
            }}
            subtitle={loading ? '' : (dashboardData?.kpis.comparisons.cost !== 0 ? `${dashboardData?.kpis.comparisons.cost >= 0 ? '↑' : '↓'} ${formatCurrency(Math.abs(dashboardData?.kpis.comparisons.cost))} vs últimas 4 semanas` : "Sem dados de comparação")}
            loading={loading}
          />
          <KPICard 
            title="Pendências Ativas" 
            value={loading ? '' : dashboardData?.kpis.openIssuesCount} 
            subtitle={loading ? '' : "Abertas + Em Andamento"}
            loading={loading}
          />
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <h3 className="text-xs md:text-sm font-bold text-slate-900 uppercase tracking-tight mb-6">
            Avanço Semanal (%) - {scopeMode === 'GERAL' ? 'Histórico Completo' : `Últimas ${windowWeeks} semanas`}
          </h3>
          {loading ? (
            <Skeleton className="h-[300px] w-full rounded-lg" />
          ) : (
            <ProgressChart data={dashboardData?.weekly} />
          )}
        </div>
        <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <h3 className="text-xs md:text-sm font-bold text-slate-900 uppercase tracking-tight mb-6">
            Fluxo de Caixa Semanal (R$) - {scopeMode === 'GERAL' ? 'Histórico Completo' : `Últimas ${windowWeeks} semanas`}
          </h3>
          {loading ? (
            <Skeleton className="h-[300px] w-full rounded-lg" />
          ) : (
            <CostChart data={dashboardData?.weekly} />
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <h3 className="text-xs md:text-sm font-bold text-slate-900 uppercase tracking-tight mb-6">Custos por Categoria</h3>
          {loading ? (
            <Skeleton className="h-[300px] w-full rounded-lg" />
          ) : (
            <CategoryCostChart data={dashboardData?.costs} />
          )}
        </div>
        <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <h3 className="text-xs md:text-sm font-bold text-slate-900 uppercase tracking-tight mb-6">Pendências por Tipo</h3>
          {loading ? (
            <Skeleton className="h-[300px] w-full rounded-lg" />
          ) : (
            <IssuesChart data={dashboardData?.issues} />
          )}
        </div>
      </div>

    </DashboardLayout>
  );
}
