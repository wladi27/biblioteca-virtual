import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Background } from '../components/Background';
import { AdminNav } from '../components/AdminNav';
import { 
  Users, 
  Search, 
  User, 
  Loader2, 
  ArrowUpDown, 
  ShieldCheck, 
  Phone, 
  Mail, 
  CreditCard,
  Building2,
  Calendar,
  CheckCircle2,
  Copy,
  Check
} from 'lucide-react';
import debounce from 'lodash/debounce';

export const TotalUsuarios = () => {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [filtro, setFiltro] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [sortConfig, setSortConfig] = useState({ key: 'nivel', direction: 'asc' });
  const [isCopied, setIsCopied] = useState<Record<string, boolean>>({});
  
  const itemsPerPage = 20;
  const observer = useRef<IntersectionObserver | null>(null);

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

  const fetchUsuariosPaginados = async (page = 1, isInitialLoad = false, search = '') => {
    try {
      if (isInitialLoad) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const apiUrl = getApiUrl();
      const url = `${apiUrl}/usuarios/admin/paginados?page=${page}&limit=${itemsPerPage}${search ? `&search=${encodeURIComponent(search)}` : ''}`;
      
      const response = await fetch(url, { headers: getHeaders() });
      if (response.ok) {
        const data = await response.json();
        
        if (isInitialLoad) {
          setUsuarios(data.usuarios || []);
        } else {
          setUsuarios(prev => [...prev, ...(data.usuarios || [])]);
        }
        
        setTotalItems(data.pagination?.totalItems || 0);
        setCurrentPage(data.pagination?.currentPage || page);
        setHasMore(data.pagination?.hasNext || false);
      } else {
        throw new Error('Error al obtener usuarios');
      }
    } catch (error) {
      console.error(error);
      setMessage({ text: 'Error al conectar con el servidor', type: 'error' });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchUsuariosPaginados(1, true);
  }, []);

  const handleFiltroChange = useCallback(
    debounce((value: string) => {
      setFiltro(value);
      setUsuarios([]);
      setCurrentPage(1);
      setHasMore(true);
      fetchUsuariosPaginados(1, true, value);
    }, 400),
    []
  );

  const loadMoreUsuarios = useCallback(() => {
    if (hasMore && !loadingMore && !loading) {
      fetchUsuariosPaginados(currentPage + 1, false, filtro);
    }
  }, [hasMore, loadingMore, loading, currentPage, filtro]);

  // Observer para scroll infinito
  const lastUsuarioElementRef = useCallback((node: HTMLLIElement | null) => {
    if (loadingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreUsuarios();
      }
    }, { threshold: 0.1 });
    
    if (node) observer.current.observe(node);
  }, [loadingMore, hasMore, loadMoreUsuarios]);

  const handleSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const usuariosOrdenados = useMemo(() => {
    const sorted = [...usuarios];
    sorted.sort((a, b) => {
      if (sortConfig.key === 'nivel') {
        if (a.nivel !== b.nivel) {
          return sortConfig.direction === 'asc' ? (a.nivel || 1) - (b.nivel || 1) : (b.nivel || 1) - (a.nivel || 1);
        }
        return (a.nombre_completo || '').localeCompare(b.nombre_completo || '');
      }
      
      const valA = a[sortConfig.key] || '';
      const valB = b[sortConfig.key] || '';
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [usuarios, sortConfig]);

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
                <Users className="h-3.5 w-3.5" />
                <span>Base de Datos de Inversionistas</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-heading">
                Directorio de Socios
              </h1>
              <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
                Supervisa el padrón completo de co-inversionistas registrados, verifica sus datos bancarios y niveles en la matriz.
              </p>
            </div>

            <div className="glass-card bg-[#06140F]/80 border border-emerald-500/30 p-4 sm:p-5 rounded-2xl flex items-center gap-4 shrink-0 shadow-lg">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/30">
                <Users className="h-8 w-8" />
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-emerald-400">Total Registrados</span>
                <p className="text-2xl font-extrabold text-white font-heading">
                  {totalItems} <span className="text-xs font-normal text-slate-400">socios</span>
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Carga dinámica $O(1)$
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de Búsqueda y Filtros */}
        <div className="glass-card p-4 rounded-2xl border border-emerald-500/20 bg-[#0A1812]/80 mb-6 shadow-md flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, ID, usuario, DNI o correo..."
              onChange={(e) => handleFiltroChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-emerald-500/20 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <span className="text-xs text-slate-400">Ordenar por:</span>
            <select
              value={sortConfig.key}
              onChange={(e) => handleSort(e.target.value)}
              className="p-2 bg-slate-900 border border-emerald-500/20 text-white rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="nivel">Nivel en Matriz</option>
              <option value="nombre_completo">Nombre</option>
              <option value="nombre_usuario">Usuario</option>
            </select>
          </div>
        </div>

        {/* Listado de Usuarios */}
        {loading && usuarios.length === 0 ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={`skel-u-${i}`} className="p-5 rounded-2xl bg-[#0A1812]/70 border border-emerald-500/10 animate-pulse space-y-2">
                <div className="h-5 w-48 bg-emerald-500/20 rounded"></div>
                <div className="h-3 w-72 bg-slate-800 rounded"></div>
              </div>
            ))}
          </div>
        ) : usuariosOrdenados.length === 0 ? (
          <div className="text-center py-16 glass-card rounded-3xl border border-emerald-500/20 bg-[#0A1812]/80 p-8 shadow-xl">
            <Users className="h-14 w-14 text-emerald-500/30 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white font-heading">No se encontraron inversionistas</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Prueba con otro término de búsqueda o limpia el filtro.
            </p>
          </div>
        ) : (
          <ul className="space-y-4 mb-6">
            {usuariosOrdenados.map((usuario, index) => {
              const isLastItem = index === usuariosOrdenados.length - 1;
              const nivelNum = usuario.nivel || 1;

              return (
                <li
                  key={`${usuario._id}-${index}`}
                  ref={isLastItem ? lastUsuarioElementRef : null}
                  className="glass-card rounded-3xl border border-emerald-500/20 bg-[#0A1812]/85 hover:border-emerald-500/40 p-5 sm:p-6 transition-all shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center font-extrabold text-white text-base shrink-0">
                      {usuario.nombre_completo ? usuario.nombre_completo.charAt(0).toUpperCase() : 'U'}
                    </div>

                    <div className="truncate flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-bold text-white font-heading truncate">
                          {usuario.nombre_completo || 'Usuario'}
                        </h3>
                        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          @{usuario.nombre_usuario}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40">
                          Nivel {nivelNum}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-1">
                        <span className="flex items-center gap-1 font-mono">
                          ID: <strong className="text-emerald-300 font-normal">{usuario._id}</strong>
                        </span>
                        {usuario.dni && <span>DNI: <strong className="text-slate-300 font-normal">{usuario.dni}</strong></span>}
                        {usuario.correo_electronico && (
                          <span className="flex items-center gap-1 text-slate-400 truncate">
                            <Mail className="h-3 w-3" />
                            <span>{usuario.correo_electronico}</span>
                          </span>
                        )}
                        {usuario.linea_llamadas && (
                          <span className="flex items-center gap-1 text-slate-400">
                            <Phone className="h-3 w-3" />
                            <span>{usuario.linea_llamadas}</span>
                          </span>
                        )}
                        {usuario.banco && (
                          <span className="flex items-center gap-1 text-teal-300">
                            <Building2 className="h-3 w-3" />
                            <span>{usuario.banco}: {usuario.cuenta_numero}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCopyToClipboard(usuario._id, `u-${usuario._id}`)}
                    className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-bold transition-colors self-end sm:self-auto flex items-center gap-1.5 shrink-0"
                    title="Copiar ID"
                  >
                    {isCopied[`u-${usuario._id}`] ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>Copiar ID</span>
                  </button>
                </li>
              );
            })}

            {loadingMore && (
              <div className="py-4 text-center">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-emerald-400" />
              </div>
            )}
          </ul>
        )}
      </main>

      <br /><br />
      <AdminNav />
    </div>
  );
};