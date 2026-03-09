'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { X, User, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: SupabaseUser | null;
}

export function ProfileModal({ isOpen, onClose, user }: ProfileModalProps) {
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      });

      if (error) throw error;
      setSuccess(true);
      setTimeout(() => {
        onClose();
        window.location.reload(); // Reload to update all components
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar perfil.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <User className="text-[#1e3b8a]" size={20} />
                Meu Perfil
              </h2>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="p-6 space-y-6">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-50 border border-green-200 text-green-600 text-xs rounded-lg flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  Perfil atualizado com sucesso!
                </div>
              )}

              <div>
                <label className="block text-slate-700 text-sm font-semibold mb-2">
                  Nome do Engenheiro Responsável
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ex: Eng. João Silva"
                  disabled={user?.is_anonymous}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1e3b8a]/20 focus:border-[#1e3b8a] outline-none transition-all text-slate-900 disabled:opacity-60 disabled:cursor-not-allowed"
                  required
                />
                {user?.is_anonymous ? (
                  <p className="mt-2 text-[10px] text-amber-600 font-medium">
                    Contas de convidado não podem alterar o nome do responsável.
                  </p>
                ) : (
                  <p className="mt-2 text-[10px] text-slate-500 italic">
                    Este nome aparecerá no dashboard e nos relatórios como o responsável técnico.
                  </p>
                )}
              </div>

              {!user?.is_anonymous && (
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading || success}
                    className="w-full bg-[#1e3b8a] hover:bg-[#1e3b8a]/90 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      'Salvar Alterações'
                    )}
                  </button>
                </div>
              )}
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
