'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { LogIn, Mail, Lock, Loader2, Eye, EyeOff, UserPlus, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';

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
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1531834685032-c34bf0d84c77?q=80&w=2070&auto=format&fit=crop')" }}
          ></div>
          <div className="absolute bottom-12 left-12 z-30 text-white max-w-md">
            <h2 className="text-4xl font-bold mb-3 tracking-tight">Gestão & Controle</h2>
            <p className="text-slate-100 text-xl font-light leading-relaxed">Gerencie suas obras com precisão e eficiência tecnológica.</p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-white relative">
          <button 
            onClick={() => {
              router.push('/');
            }}
            className="absolute top-6 left-8 md:top-10 md:left-16 text-slate-400 hover:text-slate-900 transition-colors flex items-center gap-2 text-sm font-bold group z-[999] cursor-pointer pointer-events-auto"
            type="button"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Voltar para o início
          </button>
          <div className="mb-12 flex justify-center md:justify-start">
            <Image
              src="https://i.imgur.com/RcGMnHJ.png"
              alt="BuildFlow - Gestão de Obras"
              width={280}
              height={80}
              priority
              className="h-auto w-[220px] md:w-[280px]"
            />
          </div>
          <div className="mb-10 flex flex-col items-center md:items-start">
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
                </div>
              </form>

              <div className="text-center pt-2 flex flex-col gap-4">
                <button 
                  type="button" 
                  onClick={() => setView('forgot-password')}
                  className="text-slate-500 hover:text-slate-900 text-sm font-bold transition-colors underline underline-offset-4 decoration-2 decoration-slate-200 hover:decoration-slate-900"
                >
                  Esqueci minha senha
                </button>
                <p className="text-slate-500 text-sm font-medium">
                  Não tem uma conta?{' '}
                  <Link 
                    href="/cadastro"
                    className="text-slate-900 font-bold hover:underline underline-offset-4 decoration-2 decoration-slate-200 hover:decoration-slate-900 transition-colors"
                  >
                    Criar conta agora
                  </Link>
                </p>
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
              © 2026 BuildFlow - Sistema de Gestão e Controle de Obras.<br />
              Todos os direitos reservados.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
