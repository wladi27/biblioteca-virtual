import React, { useEffect, useState } from 'react';
import { Background } from '../components/Background';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { User, Users, CheckCircle2, Sprout, Layers, Loader2, Search, Award, TrendingUp, ShieldCheck } from 'lucide-react';
import { MobileNav } from '../components/MobileNav';

interface MiembroRed {
  _id: string;
  nombre_usuario: string;
  nivel: number;
}

const nombresNiveles: Record<number, string> = {
  1: 'Semilla',
  2: 'Brote',
  3: 'Cultivo',
  4: 'Cosecha',
  5: 'Productor',
  6: 'Agro-Líder',
  7: 'Finca Master',
  8: 'Hacienda',
  9: 'Agro-Corporativo',
  10: 'Valle Verde',
  11: 'Raíz de Vida',
  12: 'Raíz de Vida Master'
};

export const Red = () => {
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  const [nivelesCompletados, setNivelesCompletados] = useState(0);
  const [totalDescendientes, setTotalDescendientes] = useState(0);
  const [openAcordeon, setOpenAcordeon] = useState<Record<number, boolean>>({ 1: true });
  const [loading, setLoading] = useState(true);
  const [nivelesOrganizados, setNivelesOrganizados] = useState<Record<number, MiembroRed[]>>({});
  const [busqueda, setBusqueda] = useState('');

  const cargarRedCompleta = async (idUsuario: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_URL_LOCAL || import.meta.env.VITE_API_URL || 'http://localhost:5005';

      const response = await fetch(`${apiUrl}/usuarios/piramide-red/${idUsuario}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Organizar niveles del 1 al 12
        const niveles: Record<number, MiembroRed[]> = {};
        for (let i = 1; i <= 12; i++) {
          niveles[i] = data.niveles?.[i] || [];
        }

        setNivelesOrganizados(niveles);
        setNivelesCompletados(data.nivelesCompletados || 0);
        setTotalDescendientes(data.piramide?.totalDescendientes || 0);
      } else {
        console.error('Error al obtener la red del usuario:', response.status);
      }
    } catch (error) {
      console.error('Error cargando pirámide de red:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const usuario = localStorage.getItem('usuario');
    if (usuario) {
      try {
        const userData = JSON.parse(usuario);
        setUsername(userData.nombre_completo || userData.nombre_usuario);
        setUserId(userData._id);
        cargarRedCompleta(userData._id);
      } catch {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const toggleAcordeon = (nivel: number) => {
    setOpenAcordeon(prev => ({ ...prev, [nivel]: !prev[nivel] }));
  };

  const rangoActualNumero = nivelesCompletados > 0 ? nivelesCompletados : 1;
  const rangoActualNombre = nombresNiveles[rangoActualNumero] || 'Semilla';

  const renderAcordeon = (nivel: number) => {
    const data = nivelesOrganizados[nivel] || [];
    const cantidadEsperada = Math.pow(3, nivel);
    const completado = data.length >= cantidadEsperada;
    const porcentaje = Math.min(100, Math.round((data.length / cantidadEsperada) * 100));
    const nombreNivel = nombresNiveles[nivel] || `Nivel ${nivel}`;

    // Filtrar usuarios si hay búsqueda
    const usuariosFiltrados = busqueda
      ? data.filter(u => u.nombre_usuario?.toLowerCase().includes(busqueda.toLowerCase()))
      : data;

    return (
      <div className="mb-4" key={`nivel-${nivel}`}>
        <div
          className={`p-4 rounded-2xl flex justify-between items-center cursor-pointer border transition-all ${
            completado 
              ? 'bg-[#0E241C]/80 border-emerald-500/40 shadow-lg shadow-emerald-500/5' 
              : 'bg-[#0A1812]/70 border-emerald-500/15 hover:border-emerald-500/30'
          }`}
          onClick={() => toggleAcordeon(nivel)}
        >
          <div className="flex items-center gap-3.5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-sm ${
              completado 
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30' 
                : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
            }`}>
              {nivel}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">
                  Nivel {nivel}: <span className="text-emerald-400 font-semibold">{nombreNivel}</span>
                </h3>
                {completado && (
                  <span className="flex items-center gap-1 text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    <CheckCircle2 className="h-3 w-3" />
                    Completo
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                <strong className="text-emerald-400">{data.length}</strong> de {cantidadEsperada.toLocaleString('es-CO')} cupos ocupados ({porcentaje}%)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block w-28 bg-slate-900 rounded-full h-2 border border-emerald-500/10 overflow-hidden">
              <div 
                className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${porcentaje}%` }}
              ></div>
            </div>
            <div className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white">
              {openAcordeon[nivel] ? <FaChevronUp className="h-3.5 w-3.5" /> : <FaChevronDown className="h-3.5 w-3.5" />}
            </div>
          </div>
        </div>
        
        {openAcordeon[nivel] && (
          <div className="mt-3 pl-2 sm:pl-4">
            {data.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-900/40 border border-emerald-500/10 text-center text-slate-400 text-sm">
                No hay miembros registrados aún en el Nivel {nivel} ({nombreNivel}).
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {usuariosFiltrados.map((usuario, index) => (
                  <div 
                    key={`${usuario._id}-${index}`}
                    className="p-3.5 bg-[#0D2018]/70 border border-emerald-500/20 rounded-xl flex items-center gap-3 hover:border-emerald-400/40 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 flex items-center justify-center text-xs font-bold font-mono">
                      #{index + 1}
                    </div>
                    <div className="truncate flex-1">
                      <p className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                        {usuario.nombre_usuario}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        ID: {usuario._id?.toString().slice(-6) || 'N/A'}
                      </p>
                    </div>
                  </div>
                ))}
                
                {/* Mostrar espacios disponibles */}
                {!busqueda && data.length < cantidadEsperada && (
                  Array.from({ length: Math.min(6, cantidadEsperada - data.length) }).map((_, index) => (
                    <div 
                      key={`empty-${nivel}-${index}`}
                      className="p-3.5 bg-slate-900/40 rounded-xl flex items-center gap-3 border border-dashed border-emerald-500/20 opacity-60"
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-800 text-slate-500 text-xs">
                        -
                      </div>
                      <div className="truncate text-slate-500">
                        <p className="text-sm font-medium">Cupo Disponible</p>
                        <p className="text-[11px]">Vacío para nuevo socio</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderTodosLosNiveles = () => {
    return Array.from({ length: 12 }, (_, i) => i + 1).map(nivel => renderAcordeon(nivel));
  };

  return (
    <div className="min-h-screen bg-[#06110D] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      <Background />

      <main className="max-w-6xl mx-auto px-4 py-10 flex-grow w-full">
        {/* Encabezado con Skeleton */}
        {loading ? (
          <div className="mb-8 animate-pulse space-y-4">
            <div className="h-6 w-48 bg-emerald-500/20 rounded-full"></div>
            <div className="h-9 w-64 bg-slate-700 rounded-xl"></div>
            <div className="flex gap-3">
              <div className="h-4 w-32 bg-slate-800 rounded"></div>
              <div className="h-4 w-44 bg-emerald-500/20 rounded"></div>
            </div>
          </div>
        ) : (
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2">
                  <Sprout className="h-3.5 w-3.5" />
                  <span>Ecosistema Granja Raíz de Vida</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-heading">
                  Estructura de mi Red
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-slate-300 mt-2">
                  <div className="flex items-center gap-1.5 text-sm font-medium">
                    <User className="h-4 w-4 text-emerald-400" />
                    <span>{username}</span>
                  </div>
                  <span className="text-xs text-slate-500">•</span>
                  <div className="flex items-center gap-1.5 text-sm">
                    <Award className="h-4 w-4 text-amber-400" />
                    <span className="text-xs font-bold bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-2.5 py-1 rounded-lg">
                      Rango: Nivel {rangoActualNumero} - {rangoActualNombre}
                    </span>
                  </div>
                </div>
              </div>

              {/* Buscador de usuario en la red */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar socio en tu red..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0A1812]/80 border border-emerald-500/20 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
            </div>
          </div>
        )}

        {/* 3 Tarjetas de Resumen con Skeletons */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={`skel-red-kpi-${i}`} className="glass-card p-5 rounded-2xl border border-emerald-500/10 bg-[#0A1812]/70 animate-pulse flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/20 shrink-0"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-3 w-24 bg-emerald-500/20 rounded"></div>
                  <div className="h-6 w-32 bg-slate-700 rounded-lg"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="glass-card p-5 rounded-2xl border border-emerald-500/20 bg-[#0A1812]/80 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Layers className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs uppercase font-semibold text-slate-400">Nivel Actual</p>
                <p className="text-xl font-extrabold text-white font-heading">
                  {rangoActualNombre}
                </p>
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-emerald-500/20 bg-[#0A1812]/80 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs uppercase font-semibold text-slate-400">Socios Totales</p>
                <p className="text-xl font-extrabold text-white font-mono">
                  {totalDescendientes} <span className="text-xs font-normal text-slate-400">en 12 niveles</span>
                </p>
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-emerald-500/20 bg-[#0A1812]/80 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs uppercase font-semibold text-slate-400">Niveles Completos</p>
                <p className="text-xl font-extrabold text-amber-300 font-heading">
                  {nivelesCompletados} de 12
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Acordeones de los 12 Niveles con Skeletons */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={`skel-acc-${i}`} className="p-4 rounded-2xl bg-[#0A1812]/70 border border-emerald-500/10 animate-pulse flex justify-between items-center">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-44 bg-emerald-500/20 rounded"></div>
                    <div className="h-3 w-32 bg-slate-800 rounded"></div>
                  </div>
                </div>
                <div className="w-28 h-2 bg-slate-800 rounded-full hidden sm:block"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {renderTodosLosNiveles()}
          </div>
        )}
      </main>

      <br /><br />
      <MobileNav />
    </div>
  );
};