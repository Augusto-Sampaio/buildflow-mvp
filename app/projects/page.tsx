'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuth } from '@/hooks/use-auth';
import { formatCurrency, formatCurrencyFull } from '@/lib/utils';
import { Loader2, Search, Plus, MapPin, Calendar, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Project } from '@/lib/types';
import { Pagination } from '@/components/Pagination';

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<(Project & { status: string; actual_progress_pct: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Em execução' | 'Finalizado'>('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    if (!user) return;

    const fetchProjects = async () => {
      setLoading(true);
      try {
        const { data: projectsData } = await supabase.from('projects').select('*').order('project_name');
        
        // Fetch latest snapshots for status
        const { data: snapshots } = await supabase
          .from('weekly_snapshots')
          .select('project_id, actual_progress_pct, week_start')
          .order('week_start', { ascending: false });

        const latestMap = new Map<string, number>();
        (snapshots || []).forEach(s => {
          if (!latestMap.has(s.project_id)) {
            const rawPct = Number(s.actual_progress_pct ?? 0);
            latestMap.set(s.project_id, Math.max(0, Math.min(100, rawPct)));
          }
        });

        const projectsWithStatus = (projectsData || []).map(p => ({
          ...p,
          actual_progress_pct: latestMap.get(p.project_id) || 0,
          status: (latestMap.get(p.project_id) || 0) >= 100 ? 'Finalizado' : 'Em execução'
        }));

        setProjects(projectsWithStatus as any);
      } catch (err) {
        console.error('Error fetching projects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user]);

  const filteredProjects = projects.filter(p => {
    const search = searchTerm.toLowerCase();
    const name = (p.project_name || '').toLowerCase();
    const city = (p.city || '').toLowerCase();
    
    const matchesSearch = name.includes(search) || city.includes(search);
    const matchesStatus = statusFilter === 'Todos' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-[#1e3b8a]" size={40} />
      </div>
    );
  }

  const headerActions = (
    <Link href="/new-project" className="flex items-center gap-2 px-4 py-2 bg-[#1e3b8a] text-white text-xs font-bold rounded-lg hover:bg-[#1e3b8a]/90 transition-colors shadow-lg shadow-[#1e3b8a]/20">
      <Plus size={16} /> <span className="hidden sm:inline">Novo Projeto</span>
    </Link>
  );

  return (
    <DashboardLayout title="Gestão de Projetos" headerActions={headerActions}>
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nome ou cidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1e3b8a]/20 outline-none transition-all text-sm"
          />
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          {['Todos', 'Em execução', 'Finalizado'].map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f as any)}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                statusFilter === f ? "bg-white text-[#1e3b8a] shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {paginatedProjects.map((project) => (
            <Link 
              key={project.project_id} 
              href={`/projects/${project.project_id}`}
              className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-[#1e3b8a]/30 transition-all overflow-hidden flex flex-col"
            >
            <div className="h-32 bg-slate-100 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
              <Image 
                src={`https://picsum.photos/seed/${project.project_id}/600/300`} 
                alt={project.project_name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-3 left-4 z-20">
                <span className={`px-2 py-0.5 text-white text-[9px] font-black rounded uppercase tracking-widest ${
                  project.status === 'Finalizado' ? 'bg-blue-500' : 'bg-green-500'
                }`}>
                  {project.status}
                </span>
              </div>
            </div>
            
            <div className="p-6 flex-1 flex flex-col">
              <h3 className="text-lg font-black text-slate-900 mb-2 group-hover:text-[#1e3b8a] transition-colors">{project.project_name}</h3>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <MapPin size={14} className="text-slate-400" /> {project.city}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Calendar size={14} className="text-slate-400" /> Início: {new Date(project.start_date).toLocaleDateString('pt-BR')}
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-[#1e3b8a]">
                  <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#1e3b8a] h-full transition-all duration-500" 
                      style={{ width: `${project.actual_progress_pct}%` }}
                    ></div>
                  </div>
                  <span className="whitespace-nowrap">{project.actual_progress_pct}% concluído</span>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Orçamento</p>
                  <p className="text-sm font-black text-slate-900" title={formatCurrencyFull(project.budget_brl)}>{formatCurrency(project.budget_brl)}</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#1e3b8a] group-hover:text-white transition-all">
                  <ChevronRight size={18} />
                </div>
              </div>
            </div>
          </Link>
        ))}

          {filteredProjects.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed border-slate-300">
              <p className="text-slate-500 font-medium">Nenhum projeto encontrado.</p>
            </div>
          )}
        </div>
        
        {filteredProjects.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={setCurrentPage} 
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
