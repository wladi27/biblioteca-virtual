import React, { useEffect, useState, useCallback } from 'react';
import { Background } from '../components/Background';
import { AdminNav } from '../components/AdminNav';
import { 
  Users, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  User, 
  Award, 
  Sprout, 
  ArrowUpRight, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Copy, 
  Check, 
  Loader2,
  TreeDeciduous,
  Network
} from 'lucide-react';

interface Usuario {
  _id: string;
  nombre_usuario: string;
  nombre_completo?: string;
  nivel?: number;
  dni?: string;
  profundidad?: number;
}

interface NivelesOrganizados {
  [key: number]: Usuario[];
}

const nombresNiveles: Record<number, string> = {
  0: 'Usuario Raíz',
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

export const RedAdmin = () => {
  const [usuarioRaiz, setUsuarioRaiz] = useState<Usuario | null>(null);
  const [nivelesOrganizados, setNivelesOrganizados] = useState<NivelesOrganizados>({});
  const [openAcordeon, setOpenAcordeon] = useState<{ [key: number]: boolean }>({ 0: true, 1: true });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [usuarioIdInput, setUsuarioIdInput] = useState('');
  const [loadingNivel, setLoadingNivel] = useState<{ [key: number]: boolean }>({});
  const [totalEnRed, setTotalEnRed] = useState(0);
  const [nivelesCompletados, setNivelesCompletados] = useState(0);
  const [isCopied, setIsCopied] = useState<Record<string, boolean>>({});

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    };
  };

  const getApiUrl = () => {
    return import.meta.env.VITE_URL_LOCAL || import.meta.env.VITE_API_URL || 'http://localhost:5005';
  };

  const handleCopyToClipboard = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setIsCopied(prev => ({ ...prev, [id]: true }));
      setTimeout(() => {
        setIsCopied(prev => ({ ...prev, [id]: false }));
      }, 2000);
    });
  };

  const fetchRedCompleta = async (usuarioId: string) => {
    setLoading(true);
    setError('');
    try {
      const apiUrl = getApiUrl();
      // 1. Obtener usuario raíz
      const userRes = await fetch(`${apiUrl}/usuarios/${usuarioId.trim()}`, { headers: getHeaders() });
      if (!userRes.ok) {
        throw new Error('No se encontró ningún usuario con el ID especificado.');
      }
      const userData = await userRes.json();
      setUsuarioRaiz(userData);

      // 2. Obtener pirámide completa con graphLookup
      const piramideRes = await fetch(`${apiUrl}/usuarios/piramide-red/${userData._id}`, { headers: getHeaders() });
      if (piramideRes.ok) {
        const piramideData = await piramideRes.json();
        
        const organizados: NivelesOrganizados = {
          0: [userData]
        };

        const nivelesFuente = piramideData.niveles || piramideData.piramide?.niveles || {};
        const openStates: { [key: number]: boolean } = { 0: true };
        let totalSociosEncontrados = 0;

        for (let i = 1; i <= 12; i++) {
          const listaSocios = nivelesFuente[i] || nivelesFuente[i.toString()] || [];
          organizados[i] = listaSocios;
          totalSociosEncontrados += listaSocios.length;
          
          // Abrir automáticamente los niveles que contengan miembros
          if (listaSocios.length > 0) {
            openStates[i] = true;
          }
        }

        setNivelesOrganizados(organizados);
        setOpenAcordeon(openStates);
        setNivelesCompletados(piramideData.nivelesCompletados || 0);
        setTotalEnRed(piramideData.piramide?.totalDescendientes || totalSociosEncontrados);
      } else {
        // Fallback básico
        const nivelesVacios: NivelesOrganizados = { 0: [userData] };
        for (let i = 1; i <= 12; i++) {
          nivelesVacios[i] = [];
        }
        setNivelesOrganizados(nivelesVacios);
        await fetchNivelIndividual(userData._id, 1);
      }
    } catch (err: any) {
      setError(err.message || 'Error al conectar con el servidor.');
      setUsuarioRaiz(null);
      setNivelesOrganizados({});
    } finally {
      setLoading(false);
    }
  };

  const fetchNivelIndividual = async (usuarioId: string, nivel: number) => {
    setLoadingNivel(prev => ({ ...prev, [nivel]: true }));
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/usuarios/piramide-nivel/${usuarioId}/${nivel}`, { headers: getHeaders() });
      if (response.ok) {
        const data = await response.json();
        setNivelesOrganizados(prev => ({
          ...prev,
          [nivel]: data.usuarios || [],
        }));
      }
    } catch (err) {
      console.error(`Error fetching level ${nivel}:`, err);
    } finally {
      setLoadingNivel(prev => ({ ...prev, [nivel]: false }));
    }
  };

  const toggleAcordeon = (nivel: number) => {
    const isOpening = !openAcordeon[nivel];
    setOpenAcordeon(prev => ({ ...prev, [nivel]: isOpening }));

    if (isOpening && usuarioRaiz && nivelesOrganizados[nivel]?.length === 0) {
      fetchNivelIndividual(usuarioRaiz._id, nivel);
    }
  };

  const calcularCapacidadEsperada = (nivel: number): number => {
    return nivel === 0 ? 1 : Math.pow(3, nivel);
  };

  const DEFAULT_ROOT_ID = '67be02be2fed45952ad6fd94';

  const handleBuscar = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (usuarioIdInput.trim()) {
      fetchRedCompleta(usuarioIdInput.trim());
    }
  };

  useEffect(() => {
    // Cargar por defecto la Red Raíz Principal de la plataforma
    setUsuarioIdInput(DEFAULT_ROOT_ID);
    fetchRedCompleta(DEFAULT_ROOT_ID);
  }, []);

  return (
    <div className="min-h-screen bg-[#06110D] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      <Background />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex-grow w-full">
        {/* Banner Superior */}
        <div className="relative rounded-3xl p-6 sm:p-8 mb-8 overflow-hidden border border-emerald-500/25 bg-gradient-to-r from-[#0B251B] via-[#091F17] to-[#071711] shadow-2xl shadow-emerald-950/40">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-3">
                <Network className="h-3.5 w-3.5" />
                <span>Supervisión de Matriz Ternaria • 12 Niveles</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-heading">
                Red Global de Inversión
              </h1>
              <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
                Inspecciona la genealogía completa de cualquier inversionista, verifica los cupos completados por nivel ($3^N$) y navega por los sub-árboles de la red.
              </p>
            </div>

            {usuarioRaiz && (
              <div className="glass-card bg-[#06140F]/80 border border-emerald-500/30 p-4 sm:p-5 rounded-2xl flex items-center gap-4 shrink-0 shadow-lg">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/30">
                  <TreeDeciduous className="h-8 w-8" />
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-emerald-400">Total en Esta Red</span>
                  <p className="text-2xl font-extrabold text-white font-heading">
                    {totalEnRed} <span className="text-sm font-normal text-slate-400">socios</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Raíz: {usuarioRaiz.nombre_usuario || 'Seleccionado'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Buscador de Usuario Raíz */}
        <div className="glass-card p-6 rounded-3xl border border-emerald-500/20 bg-[#0A1812]/80 mb-8 shadow-xl">
          <form onSubmit={handleBuscar} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={usuarioIdInput}
                onChange={(e) => setUsuarioIdInput(e.target.value)}
                placeholder="Ingresa el ID del usuario raíz para explorar su red..."
                className="w-full pl-10 pr-4 py-3 bg-slate-900/90 border border-emerald-500/20 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-mono"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading || !usuarioIdInput.trim()}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2 shrink-0"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                <span>Consultar Red</span>
              </button>
              {usuarioIdInput !== DEFAULT_ROOT_ID && (
                <button
                  type="button"
                  onClick={() => {
                    setUsuarioIdInput(DEFAULT_ROOT_ID);
                    fetchRedCompleta(DEFAULT_ROOT_ID);
                  }}
                  className="px-4 py-3 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-bold text-xs rounded-xl transition-colors shrink-0"
                  title="Volver a la red principal"
                >
                  Raíz Principal
                </button>
              )}
            </div>
          </form>

          {error && (
            <div className="mt-4 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}
        </div>

        {/* SKELETON LOADER AL BUSCAR RED */}
        {loading ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#0B251B]/40 border border-emerald-500/20 animate-pulse flex items-center gap-3">
              <div className="h-10 w-10 bg-emerald-500/20 rounded-xl"></div>
              <div className="space-y-2">
                <div className="h-4 w-48 bg-emerald-500/20 rounded"></div>
                <div className="h-3 w-32 bg-slate-800 rounded"></div>
              </div>
            </div>

            {Array.from({ length: 4 }).map((_, i) => (
              <div key={`skel-red-${i}`} className="p-5 rounded-2xl bg-[#0A1812]/70 border border-emerald-500/10 animate-pulse space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-emerald-500/15 rounded-xl"></div>
                    <div className="space-y-1.5">
                      <div className="h-4 w-36 bg-emerald-500/20 rounded"></div>
                      <div className="h-3 w-24 bg-slate-800 rounded"></div>
                    </div>
                  </div>
                  <div className="h-6 w-24 bg-emerald-500/10 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : usuarioRaiz ? (
          <>
            {/* Detalles del Usuario Raíz Seleccionado */}
            <div className="mb-6 p-4 rounded-2xl bg-[#0B251B]/80 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">
                    {usuarioRaiz.nombre_completo || usuarioRaiz.nombre_usuario}
                  </p>
                  <p className="text-xs text-slate-400">
                    ID: <span className="font-mono text-emerald-300 font-bold">{usuarioRaiz._id}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleCopyToClipboard(usuarioRaiz._id, 'root-user')}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-colors self-start sm:self-auto flex items-center gap-1.5"
              >
                {isCopied['root-user'] ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>Copiar ID</span>
              </button>
            </div>

            {/* Listado de los 12 Niveles de la Matriz Ternaria */}
            <div className="space-y-4">
              {Array.from({ length: 13 }, (_, i) => i).map((nivel) => {
                const miembros = nivelesOrganizados[nivel] || [];
                const capacidad = calcularCapacidadEsperada(nivel);
                const porcentaje = Math.min(100, Math.round((miembros.length / capacidad) * 100));
                const isCompleto = miembros.length >= capacidad;
                const isOpen = !!openAcordeon[nivel];
                const nombreNivel = nombresNiveles[nivel] || `Nivel ${nivel}`;

                return (
                  <div
                    key={`nivel-${nivel}`}
                    className="glass-card rounded-2xl border border-emerald-500/20 bg-[#0A1812]/80 overflow-hidden shadow-lg transition-all"
                  >
                    {/* Encabezado del Nivel */}
                    <div
                      onClick={() => toggleAcordeon(nivel)}
                      className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-emerald-500/5 transition-colors gap-4"
                    >
                      <div className="flex items-center gap-3.5 flex-1 min-w-0">
                        <div className={`h-11 w-11 rounded-xl flex items-center justify-center font-mono font-extrabold text-sm shrink-0 ${
                          isCompleto 
                            ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30' 
                            : miembros.length > 0 
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-500'
                        }`}>
                          {nivel}
                        </div>
                        <div className="truncate">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm sm:text-base font-bold text-white truncate font-heading">
                              {nivel === 0 ? 'Nivel 0: Usuario Raíz' : `Nivel ${nivel}: ${nombreNivel}`}
                            </h3>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {miembros.length} de {capacidad.toLocaleString()} socios ({porcentaje}%)
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {/* Barra de Progreso Compacta */}
                        <div className="hidden sm:block w-32 bg-slate-900 rounded-full h-2 overflow-hidden border border-emerald-500/10">
                          <div 
                            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all"
                            style={{ width: `${porcentaje}%` }}
                          ></div>
                        </div>

                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                          isCompleto
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : miembros.length > 0
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                          {isCompleto ? 'Completo 100%' : miembros.length > 0 ? `${porcentaje}% Activo` : 'Sin Socios'}
                        </span>

                        <div className="p-1 rounded-lg bg-white/5 text-slate-400">
                          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                      </div>
                    </div>

                    {/* Cuerpo Desplegable con los Socios del Nivel */}
                    {isOpen && (
                      <div className="p-4 sm:p-5 pt-0 border-t border-emerald-500/10 bg-[#07130E]/50">
                        {loadingNivel[nivel] ? (
                          <div className="py-6 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
                            <span>Cargando socios del nivel...</span>
                          </div>
                        ) : miembros.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-4">
                            {miembros.map((socio, idx) => (
                              <div
                                key={`${socio._id}-${idx}`}
                                className="p-3.5 rounded-xl bg-[#0A1812] border border-emerald-500/15 hover:border-emerald-500/35 transition-all flex items-center justify-between gap-3 group"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="h-8 w-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                                    {socio.nombre_usuario ? socio.nombre_usuario.charAt(0).toUpperCase() : 'U'}
                                  </div>
                                  <div className="truncate">
                                    <p className="text-xs font-bold text-white truncate">
                                      {socio.nombre_usuario || `Socio #${idx + 1}`}
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-mono truncate">
                                      {socio._id}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    onClick={() => handleCopyToClipboard(socio._id, `copy-${socio._id}`)}
                                    className="p-1.5 rounded-lg bg-emerald-500/10 text-slate-400 hover:text-emerald-300 hover:bg-emerald-500/20 transition-colors"
                                    title="Copiar ID"
                                  >
                                    {isCopied[`copy-${socio._id}`] ? (
                                      <Check className="h-3 w-3 text-emerald-400" />
                                    ) : (
                                      <Copy className="h-3 w-3" />
                                    )}
                                  </button>
                                  <button
                                    onClick={() => {
                                      setUsuarioIdInput(socio._id);
                                      fetchRedCompleta(socio._id);
                                    }}
                                    className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/25 transition-colors"
                                    title="Explorar este sub-árbol"
                                  >
                                    <ArrowUpRight className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="py-6 text-center text-slate-500 text-xs">
                            No hay miembros posicionados en este nivel todavía.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-center py-16 text-slate-400">
            <TreeDeciduous className="h-16 w-16 mx-auto mb-4 text-emerald-500/30" />
            <p className="text-base font-bold text-white">Explorador de Red de Inversión</p>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Ingresa el ID de cualquier inversionista en el buscador superior para visualizar su estructura de red al instante.
            </p>
          </div>
        )}
      </main>

      <br /><br />
      <AdminNav />
    </div>
  );
};