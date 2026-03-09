'use client';

import { useState, useRef, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Menu, Bell, User, LogOut, Settings, CheckCircle2, AlertCircle as AlertIcon } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { ProfileModal } from '@/components/ProfileModal';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  headerActions?: React.ReactNode;
}

export function DashboardLayout({ children, title, headerActions }: DashboardLayoutProps) {
  const { user, loading: authLoading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-slate-900" size={40} />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-[#f6f6f8]">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg md:text-xl font-black text-slate-900 tracking-tight truncate max-w-[200px] md:max-w-none">
              {title}
            </h1>
          </div>
          
          <div className="flex items-center gap-2 md:gap-6">
            <div className="hidden sm:flex items-center gap-4">
              {headerActions}
            </div>

            <div className="flex items-center gap-2">
              {/* Notifications */}
              <div className="relative" ref={notificationsRef}>
                <button 
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className={cn(
                    "p-2 rounded-lg transition-colors relative",
                    isNotificationsOpen ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  <Bell size={20} />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                <AnimatePresence>
                  {isNotificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                        <span className="font-bold text-slate-900">Notificações</span>
                        <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">2 NOVAS</span>
                      </div>
                      <div className="max-h-[300px] overflow-y-auto">
                        <div className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer">
                          <div className="flex gap-3">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                              <CheckCircle2 size={16} />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-slate-900">Tarefa concluída</p>
                              <p className="text-[10px] text-slate-500 mt-0.5">A concretagem da laje L2 foi finalizada com sucesso.</p>
                              <p className="text-[9px] text-slate-400 mt-1">Há 2 horas</p>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer">
                          <div className="flex gap-3">
                            <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                              <AlertIcon size={16} />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-slate-900">Atraso detectado</p>
                              <p className="text-[10px] text-slate-500 mt-0.5">A entrega de materiais para a fase de acabamento está atrasada.</p>
                              <p className="text-[9px] text-slate-400 mt-1">Há 5 horas</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 bg-slate-50 text-center">
                        <button className="text-[11px] font-bold text-slate-900 hover:underline">Ver todas as notificações</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Profile */}
              <div className="relative" ref={profileRef}>
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className={cn(
                    "h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200 transition-all overflow-hidden",
                    isProfileOpen ? "ring-2 ring-slate-900/20 border-slate-900" : "hover:border-slate-900/50"
                  )}
                >
                  <User size={16} />
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {user?.is_anonymous ? 'Convidado' : (user?.user_metadata?.full_name || 'Usuário')}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">
                          {user?.is_anonymous ? 'Acesso Limitado' : user?.email}
                        </p>
                      </div>
                      <div className="p-2">
                        <button 
                          onClick={() => {
                            setIsProfileModalOpen(true);
                            setIsProfileOpen(false);
                          }}
                          className="flex items-center gap-3 w-full px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                        >
                          <User size={14} />
                          {user?.is_anonymous ? 'Ver Perfil' : 'Meu Perfil'}
                        </button>
                        {!user?.is_anonymous && (
                          <button className="flex items-center gap-3 w-full px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                            <Settings size={14} />
                            Configurações
                          </button>
                        )}
                      </div>
                      <div className="p-2 border-t border-slate-100">
                        <button 
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <LogOut size={14} />
                          Sair do Sistema
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Header Actions (visible only on small screens) */}
        <div className="sm:hidden bg-white border-b border-slate-100 px-4 py-2 flex items-center justify-between overflow-x-auto no-scrollbar">
          {headerActions}
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-8 space-y-8 max-w-[1600px] mx-auto w-full">
            {children}
          </div>
        </div>
      </div>

      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
        user={user} 
      />
    </div>
  );
}
