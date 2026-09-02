import React from 'react';
import { ArrowRight, Sprout, ShieldCheck, Sun, Wallet, TreePine, TrendingUp, Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HeroSection = () => {
  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
      {/* 1. Fondo de Líneas Gráficas Vectoriales (Grid & Graphic Lines) */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Cuadrícula de líneas gráficas precisas */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98112_1px,transparent_1px),linear-gradient(to_bottom,#10b98112_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)]"></div>

        {/* Líneas diagonales / vectoriales de crecimiento */}
        <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="agro-lines" width="120" height="120" patternUnits="userSpaceOnUse">
              <path d="M 0 60 L 120 60 M 60 0 L 60 120 M 0 0 L 120 120 M 120 0 L 0 120" fill="none" stroke="#10b981" strokeWidth="0.5" strokeDasharray="3 6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#agro-lines)" />
        </svg>

        {/* Círculos concéntricos de topografía / radar agrícola */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-emerald-500/10 pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-emerald-500/15 pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-emerald-500/20 pointer-events-none"></div>

        {/* Resplandor ambiental 100% verde esmeralda */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      <div className="max-w-5xl mx-auto text-center px-4 relative z-10">
        {/* Top Tag / Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-semibold mb-8 shadow-inner shadow-emerald-500/10">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
          <span className="flex items-center gap-1.5">
            <Leaf className="h-3.5 w-3.5 text-emerald-400" />
            Producción Agropecuaria Sostenible & Rendimientos Digitales
          </span>
        </div>

        {/* Main Title - Pure Emerald Green */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-8 font-heading leading-[1.12]">
          Invierte Inteligentemente en el Campo y Cosecha{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-200">
            Rendimientos Diarios
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
          Únete a <strong className="text-white font-semibold">Granja Raíz de Vida</strong>: la plataforma de co-inversión que conecta el potencial productivo del sector agropecuario con tecnología financiera moderna. Haz crecer tu capital con respaldo productivo real, recargas diarias automáticas y retiros bancarios directos.
        </p>

        {/* Action Buttons - Pure Emerald */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Link
            to="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-extrabold text-base shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] transition-all"
          >
            <Sprout className="h-5 w-5 text-slate-950" />
            <span>Comenzar a Invertir</span>
            <ArrowRight className="h-5 w-5 ml-1 text-slate-950" />
          </Link>
          <a
            href="#rendimientos"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 text-emerald-300 font-semibold text-base border border-emerald-500/30 backdrop-blur-md transition-all hover:border-emerald-400 hover:bg-emerald-500/10"
          >
            <TrendingUp className="h-5 w-5 text-emerald-400" />
            <span>Ver Plan de Rendimientos</span>
          </a>
        </div>

        {/* Feature Highlights Grid - Pure Emerald */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-left">
          <div className="glass-card p-5 rounded-2xl border border-emerald-500/15 bg-[#0A1812]/70 backdrop-blur-xl hover:border-emerald-400/40 transition-all group">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-110 transition-transform">
              <TreePine className="h-5 w-5" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-white font-heading">Campo Real</p>
            <p className="text-xs sm:text-sm text-slate-400">Proyectos agropecuarios y producción viva.</p>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-emerald-500/15 bg-[#0A1812]/70 backdrop-blur-xl hover:border-emerald-400/40 transition-all group">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-110 transition-transform">
              <Sun className="h-5 w-5" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-white font-heading">Renta Diaria</p>
            <p className="text-xs sm:text-sm text-slate-400">Acreditaciones automáticas cada mañana.</p>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-emerald-500/15 bg-[#0A1812]/70 backdrop-blur-xl hover:border-emerald-400/40 transition-all group">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-110 transition-transform">
              <TrendingUp className="h-5 w-5" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-white font-heading">11 Niveles</p>
            <p className="text-xs sm:text-sm text-slate-400">Escala de beneficios por participación.</p>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-emerald-500/15 bg-[#0A1812]/70 backdrop-blur-xl hover:border-emerald-400/40 transition-all group">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-110 transition-transform">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-white font-heading">Transparente</p>
            <p className="text-xs sm:text-sm text-slate-400">Billetera auditable y retiros a tu banco.</p>
          </div>
        </div>
      </div>
    </section>
  );
};