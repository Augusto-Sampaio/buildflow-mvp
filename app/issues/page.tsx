'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, AlertCircle, Clock, CheckCircle2, Filter, Search } from 'lucide-react';
import { KPICard } from '@/components/KPICard';
import { Pagination } from '@/components/Pagination';

export default function IssuesPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [issues, setIssues] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [issuesRes, projectsRes] = await Promise.all([
          supabase.from('issues').select('*').order('created_date', { ascending: false }),
          supabase.from('projects').select('project_id, project_name')
        ]);

        if (issuesRes.error) throw issuesRes.error;
        if (projectsRes.error) throw projectsRes.error;

        setIssues(issuesRes.data || []);
        setProjects(projectsRes.data || []);
      } catch (err: any) {
        console.error('Error fetching issues:', err.message || err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const filteredIssues = issues.filter(issue => {
    const issueStatus = (issue.status || '').trim().toLowerCase();
    
    let matchesFilter = filter === 'all';
    const filterLower = filter.toLowerCase();
    if (filterLower === 'aberta') matchesFilter = issueStatus === 'aberta';
    if (filterLower === 'resolvida') matchesFilter = issueStatus === 'resolvida';
    if (filterLower === 'em_andamento') {
      matchesFilter = issueStatus === 'em andamento' || issueStatus.includes('tratativa');
    }

    const search = searchTerm.toLowerCase();
    const description = (issue.description || '').toLowerCase();
    const projectName = (projects.find(p => p.project_id === issue.project_id)?.project_name || '').toLowerCase();
    
    const matchesSearch = description.includes(search) || projectName.includes(search);
    return matchesFilter && matchesSearch;
  });

  const totalPages = Math.ceil(filteredIssues.length / itemsPerPage);
  const paginatedIssues = filteredIssues.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchTerm]);

  const stats = issues.reduce((acc, i) => {
    const status = (i.status || '').trim().toLowerCase();
    acc.total++;
    if (status === 'aberta') acc.open++;
    else if (status === 'em tratativa' || status === 'tratativa' || status.includes('tratativa') || status === 'em andamento') acc.inProgress++;
    else if (status === 'resolvida') acc.resolved++;
    else {
      acc.others++;
      if (!acc.otherStatuses.includes(i.status)) {
        acc.otherStatuses.push(i.status);
      }
    }
    return acc;
  }, { total: 0, open: 0, inProgress: 0, resolved: 0, others: 0, otherStatuses: [] as string[] });

  if (loading) {
    return (
      <DashboardLayout title="Pendências">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Gestão de Pendências">
      <div className="space-y-8">
        {/* KPI Summary */}
        <div className={`grid grid-cols-1 md:grid-cols-2 ${stats.others > 0 ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-4`}>
          <KPICard 
            title="Total de Pendências" 
            value={stats.total.toString()} 
            icon={<AlertCircle className="w-4 h-4 text-slate-600" />}
          />
          <KPICard 
            title="Pendências Ativas" 
            value={(stats.open + stats.inProgress).toString()} 
            icon={<AlertCircle className="w-4 h-4 text-red-600" />}
            trend={{ value: "Total não resolvidas", isPositive: false }}
          />
          <KPICard 
            title="Em Andamento" 
            value={stats.inProgress.toString()} 
            icon={<Clock className="w-4 h-4 text-amber-600" />}
            subtitle="Subset das Ativas"
          />
          <KPICard 
            title="Resolvidas" 
            value={stats.resolved.toString()} 
            icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            trend={{ value: "Concluídas", isPositive: true }}
          />
          {stats.others > 0 && (
            <KPICard 
              title="Outros Status" 
              value={stats.others.toString()} 
              icon={<Filter className="w-4 h-4 text-slate-400" />}
              subtitle={stats.otherStatuses.join(', ')}
            />
          )}
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por descrição ou projeto..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select 
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all flex-1 md:flex-none"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">Todos os Status</option>
              <option value="aberta">Abertas</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="resolvida">Resolvidas</option>
            </select>
          </div>
        </div>

        {/* Issues List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Data</th>
                  <th className="text-left px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Projeto</th>
                  <th className="text-left px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Descrição</th>
                  <th className="text-left px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tipo</th>
                  <th className="text-center px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedIssues.length > 0 ? (
                  paginatedIssues.map((issue) => (
                    <tr key={issue.issue_id || issue.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-xs text-slate-500 font-mono">
                        {new Date(issue.created_date).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900">
                        {projects.find(p => p.project_id === issue.project_id)?.project_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 max-w-md truncate">
                        {issue.description}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                          {issue.issue_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          (issue.status || '').trim().toLowerCase() === 'resolvida' ? 'bg-emerald-50 text-emerald-700' : 
                          (issue.status || '').trim().toLowerCase() === 'aberta' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {issue.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">
                      Nenhuma pendência encontrada com os filtros selecionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={setCurrentPage} 
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
