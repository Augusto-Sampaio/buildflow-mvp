'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Lock, Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if we have a session (the user should be logged in via the recovery link)
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // If no session, they shouldn't be here unless they just finished
        if (!success) {
          router.push('/login');
        }
      }
    };
    checkSession();
  }, [router, success]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;
      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar a senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f6f6f8]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[500px] bg-white rounded-xl shadow-2xl p-8 md:p-12"
      >
        <div className="mb-10 flex flex-col items-center">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-12 w-12 bg-[#1e3b8a] rounded-lg flex items-center justify-center text-white">
              <Lock size={24} />
            </div>
            <div className="flex flex-col">
              <span className="text-[#1e3b8a] font-bold text-xl tracking-tight uppercase leading-tight">A&A</span>
              <span className="text-[#1e3b8a] font-normal text-xs opacity-70 tracking-wide uppercase">ENGENHARIA E PROJETOS</span>
            </div>
          </div>
          <h1 className="text-slate-900 text-2xl font-bold tracking-tight text-center">Nova Senha</h1>
          <p className="text-slate-500 mt-2 text-center">Defina sua nova senha de acesso</p>
        </div>

        {success ? (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                <CheckCircle2 size={40} />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900">Senha Atualizada!</h2>
              <p className="text-slate-500">Sua senha foi alterada com sucesso. Você será redirecionado para o login em instantes.</p>
            </div>
            <button
              onClick={() => router.push('/login')}
              className="w-full bg-[#1e3b8a] text-white font-bold py-3.5 rounded-lg"
            >
              Ir para o Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleUpdatePassword} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-slate-700 text-sm font-semibold mb-2" htmlFor="password">
                Nova Senha
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 text-slate-400" size={18} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1e3b8a]/20 focus:border-[#1e3b8a] outline-none transition-all text-slate-900 placeholder:text-slate-400"
                  placeholder="Mínimo 6 caracteres"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-400 hover:text-[#1e3b8a] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 text-sm font-semibold mb-2" htmlFor="confirm-password">
                Confirmar Nova Senha
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 text-slate-400" size={18} />
                <input
                  id="confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1e3b8a]/20 focus:border-[#1e3b8a] outline-none transition-all text-slate-900 placeholder:text-slate-400"
                  placeholder="Repita a nova senha"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1e3b8a] hover:bg-[#1e3b8a]/90 text-white font-bold py-3.5 px-4 rounded-lg transition-colors shadow-lg shadow-[#1e3b8a]/20 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                'Atualizar Senha'
              )}
            </button>
          </form>
        )}

        <div className="mt-10 pt-6 border-t border-slate-100">
          <p className="text-slate-400 text-[10px] text-center uppercase tracking-widest">
            © 2026 A&A Engenharia e Projetos
          </p>
        </div>
      </motion.div>
    </div>
  );
}
