import React from 'react';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: "Mauricio Restrepo",
    role: "Inversionista Agro - Nivel 6",
    earnings: "Rendimientos diarios puntuales",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    content: "Invertir en la Granja Raíz de Vida me dio la tranquilidad de que mi capital está trabajando en la producción del campo y no en humo. Los retornos cada mañana son 100% reales."
  },
  {
    name: "Claudia Valencia",
    role: "Co-Inversionista - Nivel 7",
    earnings: "Retiros semanales a Bancolombia",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    content: "La transparencia de la billetera digital es excelente. Puedo ver cómo crece mi saldo día a día y retirar directamente a mi cuenta sin demoras ni trabas."
  },
  {
    name: "Andrés Delgado",
    role: "Embajador Raíz de Vida - Nivel 5",
    earnings: "Bonos de expansión agropecuaria",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    content: "Poder vincular a mi familia y amigos para que también participen del crecimiento de la granja ha sido una gran experiencia. La plataforma tecnológica facilita todo el proceso."
  }
];

export const Testimonials = () => {
  return (
    <section className="py-20 relative">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-emerald-400 text-xs sm:text-sm font-semibold uppercase tracking-wider bg-emerald-500/10 px-3.5 py-1 rounded-full border border-emerald-500/30">
          Experiencias de Nuestra Comunidad
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-4 mb-4 font-heading">
          Inversionistas que confían en el campo
        </h2>
        <p className="text-slate-400 text-base sm:text-lg">
          Conoce los testimonios de personas que están generando rendimientos con Granja Raíz de Vida.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {testimonials.map((testimonial, index) => (
          <div 
            key={index}
            className="glass-card p-7 rounded-2xl border border-emerald-500/15 bg-[#0A1812]/70 backdrop-blur-xl hover:border-emerald-400/40 transition-all duration-300 flex flex-col justify-between hover:-translate-y-1"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-emerald-400 fill-emerald-400" />
                  ))}
                </div>
                <Quote className="h-6 w-6 text-emerald-400/30" />
              </div>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6 italic">
                "{testimonial.content}"
              </p>
            </div>

            <div className="flex items-center gap-3.5 pt-4 border-t border-emerald-500/15">
              <img
                src={testimonial.image}
                alt={testimonial.name}
                className="h-11 w-11 rounded-full object-cover ring-2 ring-emerald-500/40"
              />
              <div>
                <h4 className="font-bold text-white text-sm">{testimonial.name}</h4>
                <p className="text-xs text-emerald-300">{testimonial.role}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{testimonial.earnings}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};