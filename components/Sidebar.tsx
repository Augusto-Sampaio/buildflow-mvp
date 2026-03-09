'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  Briefcase, 
  BarChart3, 
  Wallet, 
  AlertCircle, 
  LogOut,
  User,
  Settings,
  X
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useState } from 'react';
import { ProfileModal } from '@/components/ProfileModal';

const menuItems = [
  { icon: LayoutDashboard, label: 'Visão Geral', href: '/dashboard' },
  { icon: Briefcase, label: 'Projetos', href: '/projects' },
  { icon: BarChart3, label: 'Indicadores', href: '/indicators' },
  { icon: Wallet, label: 'Custos', href: '/costs' },
  { icon: AlertCircle, label: 'Pendências', href: '/issues' },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const userDisplayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário';

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col h-screen transition-transform duration-300 lg:sticky lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-[#1e3b8a] rounded-lg flex items-center justify-center overflow-hidden shadow-sm relative">
                <Image 
                  src="https://ais-pre-727hgy4p6ql2oh4h4exeql-368926696819.us-east1.run.app/logo-aa.png" 
                  alt="A&A Logo" 
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://picsum.photos/seed/aa-logo/100/100";
                  }}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-slate-900 font-bold text-sm tracking-tight uppercase leading-tight">A&A ENGENHARIA</span>
                <span className="text-slate-500 font-normal text-[10px] opacity-70 tracking-wide uppercase">E PROJETOS</span>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="lg:hidden p-2 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                  pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                    ? "bg-slate-900 text-white shadow-md shadow-slate-900/20"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-100">
          <button 
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center gap-3 mb-6 px-2 w-full text-left hover:bg-slate-50 p-2 rounded-lg transition-colors group"
          >
            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-slate-900/10 group-hover:text-slate-900 transition-colors">
              <User size={16} />
            </div>
            <div className="flex flex-col overflow-hidden flex-1">
              <span className="text-xs font-bold text-slate-900 truncate capitalize group-hover:text-slate-900 transition-colors">
                {user?.is_anonymous ? 'Convidado' : userDisplayName}
              </span>
              <span className="text-[10px] text-slate-500 truncate">
                {user?.is_anonymous ? 'Acesso Limitado' : user?.email}
              </span>
            </div>
            {!user?.is_anonymous && (
              <Settings size={14} className="text-slate-400 group-hover:text-slate-900 transition-colors" />
            )}
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            Sair do Sistema
          </button>
        </div>
      </aside>

      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
        user={user} 
      />
    </>
  );
}
