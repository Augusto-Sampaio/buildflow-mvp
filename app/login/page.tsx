'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { LogIn, Mail, Lock, Loader2, Eye, EyeOff, UserCircle, UserPlus } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [view, setView] = useState<'login' | 'forgot-password'>('login');
  const [resetSent, setResetSent] = useState(false);
  const router = useRouter();

  const GUEST_EMAIL = 'admin@admin.com';
  const GUEST_PASSWORD = 'admin12345';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Erro ao entrar. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      // Tenta entrar anonimamente (Modo Convidado oficial do Supabase)
      const { data, error: authError } = await supabase.auth.signInAnonymously({
        options: {
          data: {
            full_name: 'Convidado',
          }
        }
      });

      if (authError) {
        // Se der erro, provavelmente a opção não está ativa no painel
        if (authError.message.includes('Anonymous sign-ins are disabled')) {
          setError('O Login Anônimo está desativado. Ative-o no painel do Supabase (Authentication -> Settings -> Allow Anonymous Sign-ins) para permitir o acesso de convidados.');
        } else {
          throw authError;
        }
        return;
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError('Erro ao acessar como convidado. Verifique as configurações de Login Anônimo no seu Supabase.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) throw error;
      setResetSent(true);
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar e-mail de recuperação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f6f6f8]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex w-full max-w-[1000px] bg-white rounded-xl shadow-2xl overflow-hidden min-h-[600px]"
      >
        {/* Left Side: Visual */}
        <div className="hidden md:block w-1/2 relative">
          <div className="absolute inset-0 bg-slate-900/20 mix-blend-multiply z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent z-20"></div>
          <div 
            className="h-full w-full bg-cover bg-center" 
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2070&auto=format&fit=crop')" }}
          ></div>
          <div className="absolute bottom-12 left-12 z-30 text-white max-w-md">
            <h2 className="text-4xl font-bold mb-3 tracking-tight">Planejamento & Controle</h2>
            <p className="text-slate-100 text-xl font-light leading-relaxed">Gerencie suas obras com precisão e eficiência tecnológica.</p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-white">
          <div className="mb-12 flex flex-col items-center md:items-start">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-16 w-16 bg-[#1e3b8a] rounded-2xl flex items-center justify-center overflow-hidden shadow-lg shadow-[#1e3b8a]/20">
                <Image 
                  src="https://ais-pre-727hgy4p6ql2oh4h4exeql-368926696819.us-east1.run.app/logo-aa.png" 
                  alt="A&A Logo" 
                  width={64} 
                  height={64}
                  className="object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // Fallback if image not found
                    const target = e.target as HTMLImageElement;
                    target.src = "https://picsum.photos/seed/aa-logo/200/200";
                  }}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-slate-900 font-black text-2xl tracking-tighter uppercase leading-none">A&A</span>
                <span className="text-slate-500 font-medium text-[10px] opacity-60 tracking-[0.2em] uppercase mt-1">ENGENHARIA E PROJETOS</span>
              </div>
            </div>
            <h1 className="text-slate-900 text-4xl font-black tracking-tight mb-2">
              {view === 'login' ? 'Acesso ao Sistema' : 'Recuperar Senha'}
            </h1>
            <p className="text-slate-400 font-medium">
              {view === 'login' 
                ? 'Entre com suas credenciais para continuar' 
                : 'Informe seu e-mail para receber o link de recuperação'}
            </p>
          </div>

          {view === 'login' ? (
            <div className="space-y-8">
              <form onSubmit={handleLogin} className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl font-medium">
                    {error}
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="block text-slate-700 text-sm font-bold ml-1" htmlFor="email">
                    E-mail corporativo
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-4 text-slate-400" size={20} />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-[#1e3b8a]/10 focus:border-[#1e3b8a] outline-none transition-all text-slate-900 placeholder:text-slate-300 font-medium"
                      placeholder="seu@email.com.br"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-slate-700 text-sm font-bold ml-1" htmlFor="password">
                    Senha
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-4 text-slate-400" size={20} />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-14 py-4 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all text-slate-900 placeholder:text-slate-300 font-medium"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 text-slate-300 hover:text-slate-900 transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4.5 px-6 rounded-xl transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-3 disabled:opacity-70 active:scale-[0.98]"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={22} />
                    ) : (
                      <>
                        <span className="text-lg">Entrar no Sistema</span>
                        <LogIn size={22} />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleGuestLogin}
                    disabled={loading}
                    className="w-full bg-white border-2 border-slate-200 hover:border-slate-900 hover:bg-slate-50 text-slate-700 font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-70 active:scale-[0.98]"
                  >
                    <UserCircle size={22} />
                    <span className="text-lg">Entrar como Convidado</span>
                  </button>
                </div>
              </form>

              <div className="text-center pt-2">
                <button 
                  type="button" 
                  onClick={() => setView('forgot-password')}
                  className="text-slate-500 hover:text-slate-900 text-sm font-bold transition-colors underline underline-offset-4 decoration-2 decoration-slate-200 hover:decoration-slate-900"
                >
                  Esqueci minha senha
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-8">
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl font-medium">
                  {error}
                </div>
              )}

              {resetSent ? (
                <div className="p-6 bg-green-50 border border-green-100 text-green-700 text-sm rounded-xl text-center">
                  <p className="font-bold text-lg mb-2">E-mail enviado!</p>
                  <p className="opacity-80">Verifique sua caixa de entrada para as instruções de recuperação.</p>
                  <button 
                    type="button"
                    onClick={() => {
                      setView('login');
                      setResetSent(false);
                    }}
                    className="mt-6 text-[#1e3b8a] font-bold hover:underline underline-offset-4"
                  >
                    Voltar para o Login
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="block text-slate-700 text-sm font-bold ml-1" htmlFor="reset-email">
                      E-mail corporativo
                    </label>
                    <div className="relative flex items-center">
                      <Mail className="absolute left-4 text-slate-400" size={20} />
                      <input
                        id="reset-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-[#1e3b8a]/10 focus:border-[#1e3b8a] outline-none transition-all text-slate-900 placeholder:text-slate-300 font-medium"
                        placeholder="seu@email.com.br"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#1e3b8a] hover:bg-[#1e3b8a]/95 text-white font-bold py-4.5 px-6 rounded-xl transition-all shadow-xl shadow-[#1e3b8a]/20 flex items-center justify-center gap-3 disabled:opacity-70 active:scale-[0.98]"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={22} />
                    ) : (
                      <span className="text-lg">Enviar Link de Recuperação</span>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <button 
                      type="button" 
                      onClick={() => setView('login')}
                      className="text-slate-400 hover:text-[#1e3b8a] text-sm font-bold transition-colors"
                    >
                      Voltar para o Login
                    </button>
                  </div>
                </>
              )}
            </form>
          )}

          <div className="mt-auto pt-10 border-t border-slate-100 mt-12">
            <p className="text-slate-400 text-[10px] text-center uppercase tracking-widest leading-relaxed">
              © 2024 A&A Engenharia e Projetos - Sistema de Planejamento e Controle de Obras.<br />
              Todos os direitos reservados.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
