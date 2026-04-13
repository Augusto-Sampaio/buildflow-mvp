'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { 
  ArrowRight, 
  CheckCircle2, 
  BarChart3, 
  Clock, 
  TrendingUp, 
  LayoutDashboard, 
  ChevronRight,
  Menu,
  X,
  Building2,
  ShieldCheck,
  Zap,
  Loader2
} from 'lucide-react';

import { Logo } from "@/components/Logo";

export default function BuildFlowLandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [guestLoading, setGuestLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Prefetch the dashboard route to speed up the guest login navigation
    router.prefetch('/dashboard');

    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          router.push('/dashboard');
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
        setLoading(false);
      }
    };
    checkAuth();

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [router]);

  const handleGuestLogin = async () => {
    setGuestLoading(true);

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
          alert('O Login Anônimo está desativado. Ative-o no painel do Supabase (Authentication -> Settings -> Allow Anonymous Sign-ins) para permitir o acesso de convidados.');
        } else {
          throw authError;
        }
        setGuestLoading(false);
        return;
      }

      router.push('/dashboard');
      // Não definimos setGuestLoading(false) aqui em caso de sucesso
      // para que o spinner continue rodando enquanto o Next.js carrega a próxima página.
    } catch (err: any) {
      alert('Erro ao acessar como convidado.');
      console.error(err);
      setGuestLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  const features = [
    {
      title: "Acompanhamento em tempo real",
      description:
        "Monitore o progresso das obras com uma visão clara do que está dentro do planejado e do que precisa de atenção.",
      icon: <TrendingUp className="w-6 h-6 text-[#1e3b8a]" />,
    },
    {
      title: "Planejado vs Realizado",
      description:
        "Compare metas com a execução real e identifique atrasos, desvios de custo e gargalos rapidamente.",
      icon: <BarChart3 className="w-6 h-6 text-[#1e3b8a]" />,
    },
    {
      title: "Dashboards simples e práticos",
      description:
        "Transforme dados da obra em dashboards visuais fáceis de usar, sem necessidade de sistemas complexos.",
      icon: <LayoutDashboard className="w-6 h-6 text-[#1e3b8a]" />,
    },
    {
      title: "Decisões mais inteligentes",
      description:
        "Centralize informações e tome decisões mais rápidas com base em dados confiáveis.",
      icon: <Zap className="w-6 h-6 text-[#1e3b8a]" />,
    },
  ];

  const stats = [
    { label: "Desperdício de materiais", value: "30%" },
    { label: "Obras com atrasos", value: "45%" },
    { label: "Gestão analógica", value: "80%" },
    { label: "Custo de retrabalho", value: "15%" },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#1e3b8a]/10 selection:text-[#1e3b8a]">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md border-b border-slate-100 py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex flex-row md:flex-col lg:flex-row items-center md:items-start lg:items-center gap-4 md:gap-0 lg:gap-4">
            {/* LINHA DO LOGO ABAIXO */}
            <Image
              src="https://i.imgur.com/RcGMnHJ.png"
              alt="BuildFlow - Gestão de Obras"
              width={800}
              height={200}
              priority
              className="h-20 md:h-32 lg:h-40 w-auto object-contain"
            />
            <span className="text-base md:text-lg lg:text-xl font-black tracking-tight text-[#1e3b8a] uppercase md:-mt-6 lg:mt-0 md:ml-2 lg:ml-0">
              Gestão de Obras
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Funcionalidades</a>
            <a href="#benefits" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Benefícios</a>
            <a href="#pricing" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Planos</a>
            <div className="h-4 w-px bg-slate-200 mx-2"></div>
            <Link href="/login" className="text-sm font-bold text-slate-900 hover:text-[#1e3b8a] transition-colors">Entrar</Link>
            <Link href="/cadastro" className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all active:scale-95">
              Criar conta
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden text-slate-900" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full left-0 right-0 bg-white border-b border-slate-100 p-5 flex flex-col gap-4 md:hidden shadow-xl max-h-[calc(100vh-80px)] overflow-y-auto"
          >
            <a href="#features" onClick={() => setIsMenuOpen(false)} className="text-base font-semibold text-slate-600 py-1">Funcionalidades</a>
            <a href="#benefits" onClick={() => setIsMenuOpen(false)} className="text-base font-semibold text-slate-600 py-1">Benefícios</a>
            <a href="#pricing" onClick={() => setIsMenuOpen(false)} className="text-base font-semibold text-slate-600 py-1">Planos</a>
            <hr className="border-slate-100" />
            <Link href="/login" className="text-base font-bold text-slate-900 py-1">Entrar</Link>
            <Link href="/cadastro" className="bg-slate-900 text-white px-6 py-3.5 rounded-xl text-center font-bold text-base shadow-lg shadow-slate-900/10">
              Criar conta
            </Link>
            <div className="h-2" /> {/* Extra space at bottom for better scrolling */}
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-48 md:pb-32 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1e3b8a]/5 text-[#1e3b8a] text-xs font-bold uppercase tracking-wider mb-8">
              <ShieldCheck size={14} /> Gestão de obras inteligente
            </span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-slate-900 mb-8 leading-[0.9]">
              Controle total da sua <br className="hidden md:block" />
              <span className="text-[#1e3b8a]">obra na palma da mão.</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-500 font-medium leading-relaxed mb-12">
              O BuildFlow simplifica o acompanhamento de projetos, custos e prazos, 
              permitindo que você foque no que realmente importa: construir com qualidade.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/cadastro" className="w-full sm:w-auto bg-slate-900 text-white px-8 py-5 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all shadow-2xl shadow-slate-900/20 flex items-center justify-center gap-2 group">
                Começar agora gratuitamente <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <button 
                onClick={handleGuestLogin}
                disabled={guestLoading}
                className="w-full sm:w-auto bg-white border-2 border-slate-200 text-slate-900 px-8 py-5 rounded-2xl font-bold text-lg hover:border-slate-900 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {guestLoading ? <Loader2 className="animate-spin" size={24} /> : 'Ver demonstração'}
              </button>
            </div>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mt-20 relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-b from-[#1e3b8a]/20 to-transparent blur-3xl opacity-30 -z-10"></div>
            <div className="bg-slate-900 rounded-[2.5rem] p-2 md:p-4 shadow-2xl overflow-hidden border border-slate-800">
              {/* LINHA DA IMAGEM HERO (DASHBOARD PREVIEW) ABAIXO */}
              <Image 
                src="https://i.imgur.com/PutR7ES.png" 
                alt="BuildFlow Dashboard Preview" 
                width={1200}
                height={800}
                className="w-full h-auto rounded-[2rem] opacity-90"
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 border-y border-slate-100 bg-slate-50/50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">O cenário da construção no Brasil exige eficiência</h2>
            <p className="text-slate-500 max-w-2xl mx-auto font-medium">
              Dados reais do setor mostram a urgência de uma gestão digitalizada. O BuildFlow atua diretamente nesses gargalos, transformando dados em economia e produtividade.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="text-4xl md:text-6xl font-black text-[#1e3b8a] mb-2 group-hover:scale-110 transition-transform duration-300">{stat.value}</div>
                <div className="text-sm font-bold text-slate-500 uppercase tracking-widest leading-tight">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-6">
              Tudo o que você precisa para <br className="hidden md:block" />
              <span className="text-[#1e3b8a]">gerenciar suas obras.</span>
            </h2>
            <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">
              Ferramentas poderosas desenhadas especificamente para o setor da construção civil.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="p-8 rounded-[2rem] bg-white border border-slate-100 hover:border-[#1e3b8a]/20 hover:shadow-xl transition-all group">
                <div className="w-14 h-14 bg-[#1e3b8a]/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">{feature.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-32 px-6 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,#1e3b8a_0%,transparent_50%)] opacity-20"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-8 leading-tight">
                Por que escolher o <br />
                <span className="text-[#3b82f6]">BuildFlow?</span>
              </h2>
              <div className="space-y-8">
                {[
                  "Interface intuitiva que não requer treinamento complexo.",
                  "Acesso de qualquer lugar, inclusive do canteiro de obras.",
                  "Relatórios automatizados que economizam horas de trabalho.",
                  "Suporte técnico especializado em engenharia."
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="mt-1 bg-[#3b82f6] rounded-full p-1">
                      <CheckCircle2 size={18} className="text-slate-900" />
                    </div>
                    <p className="text-xl text-slate-300 font-light">{benefit}</p>
                  </div>
                ))}
              </div>
              <div className="mt-12">
                <Link href="/cadastro" className="inline-flex items-center gap-2 bg-[#3b82f6] text-slate-900 px-8 py-4 rounded-xl font-bold hover:bg-[#2563eb] transition-all">
                  Falar com um especialista <ChevronRight size={20} />
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-10 bg-[#3b82f6]/20 blur-[100px] rounded-full"></div>
              {/* LINHA DA IMAGEM DO ENGENHEIRO ABAIXO */}
              <Image 
                src="https://i.imgur.com/uSUL4hm.png" 
                alt="Engineering Team" 
                width={800}
                height={600}
                className="rounded-[2.5rem] shadow-2xl relative z-10 border border-white/10 w-full h-auto"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Feature Section */}
      <section className="py-32 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="order-2 lg:order-1">
              <div className="relative">
                <div className="absolute -inset-10 bg-[#1e3b8a]/10 blur-[100px] rounded-full"></div>
                {/* LINHA DA IMAGEM DO LAPTOP ABAIXO */}
                <Image 
                  src="https://i.imgur.com/0EWj84a.png" 
                  alt="BuildFlow Dashboard on Laptop" 
                  width={800}
                  height={600}
                  className="rounded-[2.5rem] shadow-2xl relative z-10 border border-slate-200 w-full h-auto"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-8 leading-tight">
                Uma visão clara do seu <br />
                <span className="text-[#1e3b8a]">progresso.</span>
              </h2>
              <p className="text-xl text-slate-500 font-medium leading-relaxed mb-8">
                Acompanhe cronogramas, orçamentos e a saúde financeira de cada obra em tempo real. 
                Nossa interface foi pensada para que você não perca nenhum detalhe importante.
              </p>
              <ul className="space-y-4">
                {[
                  "Gráficos de Gantt automatizados",
                  "Controle de custos por categoria",
                  "Alertas de desvios e atrasos",
                  "Relatórios de performance da equipe"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700 font-bold">
                    <CheckCircle2 className="text-[#1e3b8a] w-5 h-5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="pricing" className="py-32 px-6">
        <div className="max-w-5xl mx-auto bg-[#1e3b8a] rounded-[3rem] p-12 md:p-24 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full -mr-32 -mt-32"></div>
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-8">
              Pronto para elevar o nível <br className="hidden md:block" />
              da sua gestão?
            </h2>
            <p className="text-xl text-white/80 font-medium mb-12 max-w-2xl mx-auto">
              Junte-se a centenas de construtoras que já transformaram seus processos com o BuildFlow.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/cadastro" className="w-full sm:w-auto bg-white text-[#1e3b8a] px-10 py-5 rounded-2xl font-bold text-xl hover:bg-slate-100 transition-all shadow-2xl shadow-black/20">
                Começar teste gratuito
              </Link>
              <p className="text-sm font-bold text-white/60 uppercase tracking-widest">
                Sem cartão de crédito necessário
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-2">
              <div className="flex items-center gap-4 mb-6">
                <Image
                  src="https://i.imgur.com/RcGMnHJ.png"
                  alt="BuildFlow - Gestão de Obras"
                  width={500}
                  height={125}
                  className="h-20 md:h-28 w-auto object-contain"
                />
                <span className="text-sm md:text-base font-black tracking-tight text-[#1e3b8a] uppercase">Gestão de Obras</span>
              </div>
              <p className="text-slate-500 font-medium max-w-sm leading-relaxed">
                A plataforma definitiva para gestão de obras, focada em resultados, 
                eficiência e transparência para o setor da construção.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-widest text-xs">Produto</h4>
              <ul className="space-y-4 text-slate-500 font-medium">
                <li><a href="#" className="hover:text-[#1e3b8a] transition-colors">Funcionalidades</a></li>
                <li><a href="#" className="hover:text-[#1e3b8a] transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-[#1e3b8a] transition-colors">Estudos de Caso</a></li>
                <li><a href="#" className="hover:text-[#1e3b8a] transition-colors">Novidades</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-widest text-xs">Empresa</h4>
              <ul className="space-y-4 text-slate-500 font-medium">
                <li><a href="#" className="hover:text-[#1e3b8a] transition-colors">Sobre nós</a></li>
                <li><a href="#" className="hover:text-[#1e3b8a] transition-colors">Carreiras</a></li>
                <li><a href="#" className="hover:text-[#1e3b8a] transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-[#1e3b8a] transition-colors">Privacidade</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-slate-400 text-sm font-medium">
              © 2026 BuildFlow. Todos os direitos reservados.
            </p>
            <div className="flex gap-8">
              <a href="#" className="text-slate-400 hover:text-slate-900 transition-colors"><TrendingUp size={20} /></a>
              <a href="#" className="text-slate-400 hover:text-slate-900 transition-colors"><Building2 size={20} /></a>
              <a href="#" className="text-slate-400 hover:text-slate-900 transition-colors"><ShieldCheck size={20} /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
