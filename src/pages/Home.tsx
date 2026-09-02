import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { HeroSection } from '../components/HeroSection';
import { Features } from '../components/Features';
import { Testimonials } from '../components/Testimonials';
import {
  UserPlus,
  Wallet,
  Sprout,
  Banknote,
  ChevronDown,
  ArrowRight,
  Sparkles,
  TreePine,
  Sun,
  ShieldCheck,
  Layers,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  Leaf
} from 'lucide-react';
import { Link } from 'react-router-dom';

const nivelesData = [
  { nivel: 1, participacion: 'Nivel Semilla', nodos: 3, comision: 'COP 390.00', acumulado: 'COP 390.00' },
  { nivel: 2, participacion: 'Nivel Brote', nodos: 9, comision: 'COP 1,170.00', acumulado: 'COP 1,560.00' },
  { nivel: 3, participacion: 'Nivel Cultivo', nodos: 27, comision: 'COP 3,510.00', acumulado: 'COP 5,070.00' },
  { nivel: 4, participacion: 'Nivel Cosecha', nodos: 81, comision: 'COP 10,530.00', acumulado: 'COP 15,600.00' },
  { nivel: 5, participacion: 'Nivel Productor', nodos: 243, comision: 'COP 31,590.00', acumulado: 'COP 47,190.00' },
  { nivel: 6, participacion: 'Nivel Agro-Líder', nodos: 729, comision: 'COP 80,555.00', acumulado: 'COP 127,745.00' },
  { nivel: 7, participacion: 'Nivel Finca Master', nodos: 2187, comision: 'COP 241,646.00', acumulado: 'COP 369,391.00' },
  { nivel: 8, participacion: 'Nivel Hacienda', nodos: 6561, comision: 'COP 724,991.00', acumulado: 'COP 1,094,382.00' },
  { nivel: 9, participacion: 'Nivel Agro-Corporativo', nodos: 19683, comision: 'COP 2,174,972.00', acumulado: 'COP 3,269,354.00' },
  { nivel: 10, participacion: 'Nivel Valle Verde', nodos: 59049, comision: 'COP 6,124,915.00', acumulado: 'COP 9,394,269.00' },
  { nivel: 11, participacion: 'Nivel Raíz de Vida', nodos: 177147, comision: 'COP 19,574,744.00', acumulado: 'COP 28,969,013.00' },
];

const faqs = [
  {
    pregunta: "¿Cómo funciona la inversión inteligente en Granja Raíz de Vida?",
    respuesta: "Granja Raíz de Vida canaliza el capital de co-inversionistas hacia proyectos agropecuarios reales y sostenibles. Mediante nuestra plataforma tecnológica, los rendimientos generados por la producción y comercialización del campo se distribuyen automáticamente de forma diaria y transparente en las billeteras digitales de cada miembro."
  },
  {
    pregunta: "¿Cuándo y cómo se acreditan las recargas y rendimientos diarios?",
    respuesta: "El sistema ejecuta un proceso automatizado todos los días a las 7:00 AM (hora Colombia), acreditando los rendimientos diarios directamente al saldo disponible de tu billetera digital."
  },
  {
    pregunta: "¿Cómo solicito el retiro de mis ganancias a mi cuenta bancaria?",
    respuesta: "Desde tu panel en la sección Billetera, haz clic en 'Solicitar Retiro', ingresa el monto deseado y tus datos bancarios registrados. Nuestro sistema valida los fondos al instante y procesa la transferencia de forma ágil y segura."
  },
  {
    pregunta: "¿Puedo registrar múltiples posiciones para mi grupo o familia?",
    respuesta: "Sí, el formulario de registro incluye un selector para crear múltiples cuentas o posiciones simultáneas en un solo paso, permitiéndote expandir tu participación de forma cómoda."
  }
];

export const Home = () => {
  const [publicaciones, setPublicaciones] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    const fetchPublicaciones = async () => {
      try {
        const url = import.meta.env.VITE_URL_LOCAL || import.meta.env.VITE_API_URL;
        const response = await fetch(`${url}/api/publicaciones`);
        if (response.ok) {
          const data = await response.json();
          const activePosts = data.filter((post: any) => post.status === 'activo');
          setPublicaciones(activePosts);
          if (activePosts.length > 0) {
            setShowModal(true);
          }
        }
      } catch (error) {
        console.warn('No se pudieron cargar publicaciones:', error);
      }
    };

    fetchPublicaciones();
  }, []);

  const renderFile = (file: string) => {
    if (!file) return null;
    const fileExtension = file.split('.').pop()?.toLowerCase();

    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension || '')) {
      return <img src={file} alt="Publicación" className="w-full h-auto max-h-72 object-contain my-3 rounded-xl border border-emerald-500/20" />;
    } else if (['mp4', 'webm', 'ogg'].includes(fileExtension || '')) {
      return (
        <video controls className="w-full h-auto max-h-72 my-3 rounded-xl border border-emerald-500/20">
          <source src={file} type={`video/${fileExtension}`} />
          Tu navegador no soporta video.
        </video>
      );
    } else if (fileExtension === 'pdf') {
      return (
        <a href={file} target="_blank" rel="noopener noreferrer" className="text-emerald-400 inline-flex items-center gap-1.5 underline my-2">
          <span>Ver documento informativo</span>
          <ExternalLink className="h-4 w-4" />
        </a>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#06110D] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Background ambient lighting - 100% Emerald Green */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-b from-emerald-500/10 via-emerald-600/5 to-transparent blur-3xl"></div>
        <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-3xl"></div>
      </div>

      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* 1. Hero Section con líneas gráficas */}
        <HeroSection />

        {/* 2. Features Grid */}
        <Features />

        {/* 3. Cómo Funciona (4 Pasos) */}
        <section id="como-invertir" className="py-20 relative border-t border-emerald-500/15">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-emerald-400 text-xs sm:text-sm font-semibold uppercase tracking-wider bg-emerald-500/10 px-3.5 py-1 rounded-full border border-emerald-500/30">
              Proceso Simple & Rentable
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-4 mb-4 font-heading">
              ¿Cómo invertir en la Granja en 4 pasos?
            </h2>
            <p className="text-slate-400 text-base sm:text-lg">
              Empieza a generar rendimientos respaldados por la producción del campo sin complicaciones técnicas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="glass-card p-6 rounded-2xl border border-emerald-500/15 bg-[#0A1812]/70 relative group hover:border-emerald-400/40 transition-all">
              <div className="text-5xl font-extrabold text-white/5 absolute top-4 right-4 group-hover:text-emerald-500/20 transition-colors">01</div>
              <div className="h-12 w-12 rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5">
                <UserPlus className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 font-heading">1. Crea tu Cuenta</h3>
              <p className="text-slate-400 text-sm">Regístrate en menos de 2 minutos para abrir tu perfil de inversionista en la granja.</p>
            </div>

            {/* Step 2 */}
            <div className="glass-card p-6 rounded-2xl border border-emerald-500/15 bg-[#0A1812]/70 relative group hover:border-emerald-400/40 transition-all">
              <div className="text-5xl font-extrabold text-white/5 absolute top-4 right-4 group-hover:text-emerald-500/20 transition-colors">02</div>
              <div className="h-12 w-12 rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5">
                <Wallet className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 font-heading">2. Activa tu Billetera</h3>
              <p className="text-slate-400 text-sm">Tu billetera digital queda lista para recibir acreditaciones y monitorear tu capital.</p>
            </div>

            {/* Step 3 */}
            <div className="glass-card p-6 rounded-2xl border border-emerald-500/15 bg-[#0A1812]/70 relative group hover:border-emerald-400/40 transition-all">
              <div className="text-5xl font-extrabold text-white/5 absolute top-4 right-4 group-hover:text-emerald-500/20 transition-colors">03</div>
              <div className="h-12 w-12 rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5">
                <Sun className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 font-heading">3. Cosecha Retornos</h3>
              <p className="text-slate-400 text-sm">Recibe tus recargas y rendimientos diarios programados cada mañana a las 7:00 AM.</p>
            </div>

            {/* Step 4 */}
            <div className="glass-card p-6 rounded-2xl border border-emerald-500/15 bg-[#0A1812]/70 relative group hover:border-emerald-400/40 transition-all">
              <div className="text-5xl font-extrabold text-white/5 absolute top-4 right-4 group-hover:text-emerald-500/20 transition-colors">04</div>
              <div className="h-12 w-12 rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5">
                <Banknote className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 font-heading">4. Retira a tu Banco</h3>
              <p className="text-slate-400 text-sm">Transfiere tu dinero directamente a tu cuenta bancaria de forma rápida y segura.</p>
            </div>
          </div>
        </section>

        {/* 4. Plan de Rendimientos por Niveles */}
        <section id="rendimientos" className="py-20 relative border-t border-emerald-500/15">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-emerald-400 text-xs sm:text-sm font-semibold uppercase tracking-wider bg-emerald-500/10 px-3.5 py-1 rounded-full border border-emerald-500/30">
              Escala de Rentabilidad
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-4 mb-4 font-heading">
              Plan de Participación & Rendimientos
            </h2>
            <p className="text-slate-400 text-base sm:text-lg">
              Estructura transparente de compensación a medida que la capacidad productiva de Granja Raíz de Vida se expande.
            </p>
          </div>

          <div className="glass-panel rounded-2xl overflow-hidden border border-emerald-500/20 shadow-2xl bg-[#0A1812]/80">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#0D241B] text-emerald-300 font-semibold uppercase text-xs border-b border-emerald-500/20">
                  <tr>
                    <th className="py-4 px-6">Nivel de Participación</th>
                    <th className="py-4 px-6">Posiciones Productivas (3^N)</th>
                    <th className="py-4 px-6">Rendimiento por Nivel</th>
                    <th className="py-4 px-6">Total Acumulado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-500/10">
                  {nivelesData.map((item) => (
                    <tr key={item.nivel} className="hover:bg-emerald-500/[0.04] transition-colors">
                      <td className="py-4 px-6 font-bold text-white flex items-center gap-2.5">
                        <span className="h-6 w-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-center font-mono">
                          {item.nivel}
                        </span>
                        <div>
                          <span>Nivel {item.nivel}</span>
                          <span className="text-xs text-slate-400 block font-normal">{item.participacion}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-300 font-mono">
                        {item.nodos.toLocaleString('es-CO')} cupos
                      </td>
                      <td className="py-4 px-6 font-semibold text-emerald-400">
                        {item.comision}
                      </td>
                      <td className="py-4 px-6 text-slate-200 font-bold">
                        {item.acumulado}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 5. Testimonios */}
        <Testimonials />

        {/* 6. Preguntas Frecuentes (FAQ) */}
        <section id="faq" className="py-20 relative border-t border-emerald-500/15 max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-emerald-400 text-xs sm:text-sm font-semibold uppercase tracking-wider bg-emerald-500/10 px-3.5 py-1 rounded-full border border-emerald-500/30">
              Claridad y Confianza
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-4 mb-4 font-heading">
              Preguntas Frecuentes sobre la Inversión
            </h2>
            <p className="text-slate-400 text-base sm:text-lg">
              Todo lo que necesitas saber para empezar a co-invertir en Granja Raíz de Vida.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx} 
                  className="glass-card rounded-xl border border-emerald-500/15 bg-[#0A1812]/70 overflow-hidden transition-all hover:border-emerald-500/30"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full py-5 px-6 text-left flex items-center justify-between gap-4 focus:outline-none"
                  >
                    <span className="font-bold text-white text-base sm:text-lg flex items-center gap-3">
                      <HelpCircle className="h-5 w-5 text-emerald-400 shrink-0" />
                      {faq.pregunta}
                    </span>
                    <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180 text-emerald-400' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-slate-300 text-sm sm:text-base leading-relaxed border-t border-emerald-500/10">
                      {faq.respuesta}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 7. Call To Action Final */}
        <section className="py-20">
          <div className="relative rounded-3xl overflow-hidden glass-panel p-8 sm:p-14 border border-emerald-500/30 bg-gradient-to-r from-[#0A2218] via-[#0E2F21] to-[#0A2218] text-center shadow-2xl">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="relative z-10 max-w-2xl mx-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-4 border border-emerald-500/30">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Inscripciones Abiertas para Inversionistas
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-6 font-heading">
                Siembra hoy tu capital y cosecha rendimientos diarios
              </h2>
              <p className="text-slate-300 text-base sm:text-lg mb-8 leading-relaxed">
                Forma parte de la nueva era de inversión agro-sostenible con Granja Raíz de Vida.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-extrabold text-base shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] transition-all"
                >
                  <Sprout className="h-5 w-5 text-slate-950" />
                  <span>Crear Cuenta de Inversionista</span>
                  <ArrowRight className="h-5 w-5 ml-1 text-slate-950" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 text-emerald-300 font-semibold text-base border border-emerald-500/30 backdrop-blur-md transition-all hover:border-emerald-400"
                >
                  <span>Acceso a mi Billetera</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Modal de Publicaciones Activas */}
        {showModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-[#0A1812] border border-emerald-500/20 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
              <div className="p-6 sm:p-8 max-h-[85vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-emerald-500/15">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="h-5 w-5 text-emerald-400" />
                    <h3 className="text-xl font-bold text-white font-heading">Boletín Oficial de la Granja</h3>
                  </div>
                  <span className="text-xs text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    {publicaciones.length} comunicado(s)
                  </span>
                </div>

                <div className="space-y-6">
                  {publicaciones.map((post) => (
                    <div key={post._id} className="p-4 rounded-xl bg-slate-900/60 border border-emerald-500/15">
                      <h4 className="text-lg font-bold text-white mb-2">{post.titulo}</h4>
                      {renderFile(post.file)}
                      <p className="text-slate-300 text-sm whitespace-pre-line leading-relaxed mt-2">{post.descripcion}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-4 border-t border-emerald-500/15 flex justify-end">
                  <button
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 px-6 rounded-xl transition-colors"
                    onClick={() => setShowModal(false)}
                  >
                    Entendido / Continuar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modern Footer - Pure Emerald */}
      <footer className="bg-[#040A07] border-t border-emerald-500/15 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-slate-400 text-sm">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Sprout className="h-4 w-4" />
                </div>
                <span className="text-lg font-bold text-white">Granja Raíz de Vida</span>
              </div>
              <p className="max-w-sm text-slate-400 text-xs sm:text-sm leading-relaxed mb-4">
                Plataforma de inversión agrícola inteligente y co-producción sostenible. Conectamos capital con el desarrollo productivo del campo.
              </p>
              <p className="text-xs text-slate-500">© 2026 Granja Raíz de Vida. Todos los derechos reservados.</p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-3 text-sm">Navegación</h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li><a href="#proyectos" className="hover:text-emerald-300 transition-colors">Proyectos Agrícolas</a></li>
                <li><a href="#como-invertir" className="hover:text-emerald-300 transition-colors">Cómo Invertir</a></li>
                <li><a href="#rendimientos" className="hover:text-emerald-300 transition-colors">Plan de Rendimientos</a></li>
                <li><a href="#faq" className="hover:text-emerald-300 transition-colors">Preguntas Frecuentes</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-3 text-sm">Legal & Plataforma</h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li><Link to="/terminos-y-condiciones" className="hover:text-emerald-300 transition-colors">Términos y Condiciones</Link></li>
                <li><Link to="/login" className="hover:text-emerald-300 transition-colors">Portal de Inversionistas</Link></li>
                <li><Link to="/BV/auth/login" className="hover:text-emerald-300 transition-colors">Acceso Administrativo</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
