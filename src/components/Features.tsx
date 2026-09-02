import React from 'react';
import { Sprout, Wallet, Sun, Layers, Users, Landmark } from 'lucide-react';

const features = [
  {
    icon: <Sprout className="h-6 w-6 text-emerald-400" />,
    badge: "Economía Real",
    title: "Proyectos Agro-Sostenibles",
    description: "Tu inversión financia ciclos productivos reales en el campo (cultivos orgánicos y desarrollo pecuario sostenible con alta demanda de mercado).",
    color: "from-emerald-500/15 to-emerald-900/10",
    border: "hover:border-emerald-400/40"
  },
  {
    icon: <Wallet className="h-6 w-6 text-emerald-300" />,
    badge: "Transparencia Total",
    title: "Billetera Digital de Rendimientos",
    description: "Consulta en cualquier momento tu saldo acumulado en COP y USD, con un desglose claro de tus retornos diarios, aportes y comisiones.",
    color: "from-emerald-600/15 to-emerald-950/10",
    border: "hover:border-emerald-400/40"
  },
  {
    icon: <Sun className="h-6 w-6 text-emerald-400" />,
    badge: "Automatización",
    title: "Retornos Diarios Programados",
    description: "El sistema acredita de manera automática tus rendimientos cada mañana a las 7:00 AM directamente en tu billetera digital.",
    color: "from-emerald-500/15 to-emerald-900/10",
    border: "hover:border-emerald-400/40"
  },
  {
    icon: <Layers className="h-6 w-6 text-emerald-300" />,
    badge: "11 Niveles",
    title: "Escala de Participación Productiva",
    description: "A medida que la capacidad de la granja y la comunidad crecen, desbloqueas nuevos niveles con márgenes de rendimiento superiores.",
    color: "from-emerald-600/15 to-emerald-950/10",
    border: "hover:border-emerald-400/40"
  },
  {
    icon: <Users className="h-6 w-6 text-emerald-400" />,
    badge: "Comunidad",
    title: "Programa de Embajadores del Campo",
    description: "Comparte la visión de Granja Raíz de Vida con otros inversionistas y recibe bonificaciones directas por fortalecer el proyecto.",
    color: "from-emerald-500/15 to-emerald-900/10",
    border: "hover:border-emerald-400/40"
  },
  {
    icon: <Landmark className="h-6 w-6 text-emerald-300" />,
    badge: "Liquidez Segura",
    title: "Retiros Directos a tu Banco",
    description: "Transfiere tus rendimientos a tu cuenta bancaria o billetera digital preferida con total seguridad y rapidez.",
    color: "from-emerald-600/15 to-emerald-950/10",
    border: "hover:border-emerald-400/40"
  }
];

export const Features = () => {
  return (
    <section id="proyectos" className="py-20 relative">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-emerald-400 text-xs sm:text-sm font-semibold uppercase tracking-wider bg-emerald-500/10 px-3.5 py-1 rounded-full border border-emerald-500/30">
          Modelo Productivo Inteligente
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-4 mb-4 font-heading">
          ¿Por qué invertir en Granja Raíz de Vida?
        </h2>
        <p className="text-slate-400 text-base sm:text-lg">
          Unimos la solidez de la producción agrícola real con la eficiencia y velocidad de la tecnología digital.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {features.map((feature, index) => (
          <div 
            key={index}
            className={`glass-card p-7 rounded-2xl border border-emerald-500/15 bg-gradient-to-br ${feature.color} bg-[#0A1812]/70 backdrop-blur-xl ${feature.border} transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/5 group`}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="p-3 rounded-xl bg-slate-900/90 border border-emerald-500/20 shadow-md group-hover:scale-110 group-hover:border-emerald-400 transition-all">
                {feature.icon}
              </div>
              <span className="text-[11px] font-semibold tracking-wide text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                {feature.badge}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2.5 font-heading group-hover:text-emerald-300 transition-colors">
              {feature.title}
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};