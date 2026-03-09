'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ProgressChart } from '@/components/ProgressChart';
import { useAuth } from '@/hooks/use-auth';
import { formatCurrency, formatCurrencyFull } from '@/lib/utils';
import { Loader2, MapPin, Calendar, ArrowLeft, Plus, MoreVertical } from 'lucide-react';
import { Project, WeeklySnapshot, Issue, Task } from '@/lib/types';
import { Pagination } from '@/components/Pagination';

export default function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [weekly, setWeekly] = useState<WeeklySnapshot[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!user || !id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [projRes, weeklyRes, issuesRes, tasksRes] = await Promise.all([
          supabase.from('projects').select('*').eq('project_id', id).single(),
          supabase.from('weekly_snapshots').select('*').eq('project_id', id).order('week_start', { ascending: true }),
          supabase.from('issues').select('*').eq('project_id', id).order('created_date', { ascending: false }),
          supabase.from('tasks_wbs').select('*').eq('project_id', id).order('planned_start', { ascending: true })
        ]);

        const weeklyData = (weeklyRes.data || []).map(w => ({
          ...w,
          planned_progress_pct: Math.max(0, Math.min(100, Number(w.planned_progress_pct ?? 0))),
          actual_progress_pct: Math.max(0, Math.min(100, Number(w.actual_progress_pct ?? 0)))
        }));

        const weeklyWithDeltas = weeklyData.map((week, i) => {
          if (i === 0) return { ...week, planned_progress_delta: week.planned_progress_pct, actual_progress_delta: week.actual_progress_pct };
          const prev = weeklyData[i - 1];
          return {
            ...week,
            planned_progress_delta: Math.max(0, week.planned_progress_pct - prev.planned_progress_pct),
            actual_progress_delta: Math.max(0, week.actual_progress_pct - prev.actual_progress_pct)
          };
        });

        setProject(projRes.data);
        setWeekly(weeklyWithDeltas);
        setIssues(issuesRes.data || []);
        setTasks(tasksRes.data || []);
      } catch (err) {
        console.error('Error fetching project data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-[#1e3b8a]" size={40} />
      </div>
    );
  }

  if (!project) return <div>Projeto não encontrado.</div>;

  const clampPct = (v: number) => Math.max(0, Math.min(100, v));

  const latestSnapshot = (weekly[weekly.length - 1] as WeeklySnapshot) || {} as WeeklySnapshot;
  const actualProgressClamped = clampPct(latestSnapshot.actual_progress_pct || 0);

  const totalPages = Math.ceil(tasks.length / itemsPerPage);
  const paginatedTasks = tasks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const headerActions = (
    <div className="flex items-center gap-2">
      <Link 
        href="/projects" 
        className="flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-[#1e3b8a] hover:bg-slate-50 rounded-lg transition-colors text-xs font-bold uppercase tracking-widest"
      >
        <ArrowLeft size={16} /> <span className="hidden sm:inline">Voltar</span>
      </Link>
      <button className="flex items-center gap-2 px-4 py-2 bg-[#1e3b8a] text-white text-xs font-bold rounded-lg hover:bg-[#1e3b8a]/90 transition-colors shadow-lg shadow-[#1e3b8a]/20">
        <Plus size={16} /> <span className="hidden sm:inline">Nova Tarefa</span>
      </button>
    </div>
  );

  return (
    <DashboardLayout title={project.project_name} headerActions={headerActions}>
      <Link 
        href="/projects" 
        className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1e3b8a] transition-colors mb-4 font-bold text-[10px] uppercase tracking-widest group"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
        Voltar para Projetos
      </Link>

      {/* Project Header Info */}
      <div className="bg-white rounded-xl p-4 md:p-8 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black rounded uppercase tracking-widest">Em Execução</span>
              <span className="text-slate-500 flex items-center gap-1 text-sm font-medium">
                <MapPin size={14} /> {project.city}
              </span>
            </div>
            <h2 className="text-2xl md:text-4xl font-black tracking-tight text-slate-900">{project.project_name}</h2>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 text-slate-500 text-sm">
              <span className="flex items-center gap-2 font-medium">
                <Calendar size={16} /> <strong>Início:</strong> {new Date(project.start_date).toLocaleDateString('pt-BR')}
              </span>
              <span className="flex items-center gap-2 font-medium">
                <Calendar size={16} /> <strong>Fim Previsto:</strong> {new Date(project.end_date_planned).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="bg-[#1e3b8a]/5 border border-[#1e3b8a]/10 rounded-xl p-4 md:p-6 flex-1 min-w-[150px] md:min-w-[200px] overflow-hidden">
              <p className="text-[10px] font-bold text-[#1e3b8a] uppercase tracking-widest mb-2">Orçamento Total</p>
              <p className="text-xl md:text-3xl font-black text-slate-900 truncate" title={formatCurrencyFull(project.budget_brl)}>{formatCurrency(project.budget_brl)}</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 md:p-6 flex-1 min-w-[150px] md:min-w-[200px] overflow-hidden">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Progresso Físico</p>
              <p className="text-xl md:text-3xl font-black text-slate-900 truncate">{actualProgressClamped}%</p>
              <div className="w-full bg-slate-200 h-2 rounded-full mt-3 overflow-hidden">
                <div className="bg-[#1e3b8a] h-full rounded-full" style={{ width: `${actualProgressClamped}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-4 md:p-8 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <h3 className="text-xs md:text-sm font-bold text-slate-900 uppercase tracking-tight mb-8">Evolução do Projeto (Curva S)</h3>
            <ProgressChart data={weekly} mode="cumulative" />
          </div>

          {/* Tasks Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Cronograma de Fases</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[500px]">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Fase / Tarefa</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Prazo</th>
                    <th className="px-6 py-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedTasks.map((t) => (
                    <tr key={t.task_id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{t.task_name}</div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider">{t.phase}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-black rounded uppercase">Em Dia</span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-medium">
                        {new Date(t.planned_finish).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-slate-400 hover:text-[#1e3b8a] transition-colors">
                          <MoreVertical size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {tasks.length > 0 && (
              <div className="border-t border-slate-100">
                <Pagination 
                  currentPage={currentPage} 
                  totalPages={totalPages} 
                  onPageChange={setCurrentPage} 
                />
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="space-y-8">
          {/* Issues List */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span> Pendências Críticas
              </h3>
            </div>
            <div className="divide-y divide-slate-100">
              {issues.slice(0, 5).map((issue) => (
                <div key={issue.issue_id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`px-2 py-0.5 text-[9px] font-black rounded uppercase tracking-widest ${
                      issue.severity === 'Crítico' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {issue.severity}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      {new Date(issue.created_date).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-900 mb-1">{issue.issue_type}</p>
                  <p className="text-xs text-slate-500 line-clamp-2">Status: {issue.status}</p>
                </div>
              ))}
              {issues.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Nenhuma pendência crítica encontrada.
                </div>
              )}
            </div>
            <div className="p-4 bg-slate-50 text-center">
              <button className="text-[10px] font-black text-[#1e3b8a] uppercase tracking-widest hover:underline">
                Ver todas as pendências
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-[#1e3b8a] rounded-xl p-6 md:p-8 text-white shadow-xl shadow-[#1e3b8a]/20">
            <h3 className="text-xs font-bold uppercase tracking-widest opacity-70 mb-6">Resumo Financeiro</h3>
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1">Gasto Acumulado</p>
                <p className="text-xl md:text-2xl font-black" title={formatCurrencyFull(latestSnapshot.actual_cost_to_date_brl || 0)}>{formatCurrency(latestSnapshot.actual_cost_to_date_brl || 0)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1">Saldo em Caixa</p>
                <p className="text-xl md:text-2xl font-black" title={formatCurrencyFull(project.budget_brl - (latestSnapshot.actual_cost_to_date_brl || 0))}>{formatCurrency(project.budget_brl - (latestSnapshot.actual_cost_to_date_brl || 0))}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
