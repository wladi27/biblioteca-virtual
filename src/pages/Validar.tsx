import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Background } from '../components/Background';
import { AdminNav } from '../components/AdminNav';
import { 
  CheckCircle2, 
  Clock, 
  Trash2, 
  CheckSquare, 
  Square, 
  Search, 
  User, 
  ShieldCheck, 
  MessageCircle, 
  Loader2, 
  AlertCircle, 
  X, 
  UserCheck, 
  CreditCard, 
  Calendar, 
  ExternalLink,
  Users,
  Mail,
  Phone,
  Building2,
  Sparkles,
  Layers,
  Check
} from 'lucide-react';
import debounce from 'lodash/debounce';

export const Validar = () => {
  const [publicaciones, setPublicaciones] = useState<any[]>([]);
  const [filter, setFilter] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | null } | null>(null);
  const [isValidateModalOpen, setIsValidateModalOpen] = useState(false);
  const [validateUserId, setValidateUserId] = useState('');
  const [validateUser, setValidateUser] = useState<any>(null);
  const [validateLoading, setValidateLoading] = useState(false);
  const [validateError, setValidateError] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedAportes, setSelectedAportes] = useState<Set<string>>(new Set());
  const [isBatchValidating, setIsBatchValidating] = useState(false);
  const [isFilterBatchValidating, setIsFilterBatchValidating] = useState(false);
  
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

  const fetchPublicacionesNoValidadas = async (page = 1, isInitialLoad = false, search = '') => {
    try {
      if (isInitialLoad) {
        setLoading(true);
        setPublicaciones([]);
        setSelectedAportes(new Set());
      } else {
        setLoadingMore(true);
      }

      const apiUrl = getApiUrl();
      const url = `${apiUrl}/api/aportes/admin/no-validados?page=${page}&limit=${itemsPerPage}${search ? `&search=${encodeURIComponent(search)}` : ''}`;
      
      const response = await fetch(url, { headers: getHeaders() });
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      const nuevosAportes = data.aportes || [];
      
      if (isInitialLoad) {
        setPublicaciones(nuevosAportes);
      } else {
        setPublicaciones(prev => {
          const existingIds = new Set(prev.map(p => (p._id ? p._id.toString() : '')));
          const uniqueNew = nuevosAportes.filter(p => p._id && !existingIds.has(p._id.toString()));
          return [...prev, ...uniqueNew];
        });
      }
      
      setTotalItems(data.pagination?.totalItems || nuevosAportes.length);
      setCurrentPage(data.pagination?.currentPage || page);
      setHasMore(data.pagination?.hasNext && nuevosAportes.length > 0);
      
    } catch (error) {
      console.error('Error cargando aportes no validados:', error);
      setMessage({ text: 'Error al conectar con el servidor', type: 'error' });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleFilterChange = useCallback(
    debounce((value: string) => {
      setFilter(value);
      setPublicaciones([]);
      setSelectedAportes(new Set());
      setCurrentPage(1);
      setHasMore(true);
      fetchPublicacionesNoValidadas(1, true, value);
    }, 400),
    []
  );

  const loadMorePublicaciones = useCallback(() => {
    if (hasMore && !loadingMore && !loading) {
      fetchPublicacionesNoValidadas(currentPage + 1, false, filter);
    }
  }, [hasMore, loadingMore, loading, currentPage, filter]);

  const lastPublicacionElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loadingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMorePublicaciones();
      }
    }, {
      threshold: 0.1,
      rootMargin: '100px'
    });
    
    if (node) observer.current.observe(node);
  }, [loadingMore, hasMore, loadMorePublicaciones]);

  const toggleSelectAporte = (aporteId: string) => {
    if (!aporteId) return;
    const strId = aporteId.toString();
    setSelectedAportes(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(strId)) {
        newSelection.delete(strId);
      } else {
        newSelection.add(strId);
      }
      return newSelection;
    });
  };

  const isSomeSelected = selectedAportes.size > 0;
  const isAllVisibleSelected = publicaciones.length > 0 && publicaciones.every(p => p._id && selectedAportes.has(p._id.toString()));

  const handleToggleSelectAll = () => {
    if (isSomeSelected) {
      // Si hay al menos uno seleccionado, deseleccionar TODO inmediatamente
      setSelectedAportes(new Set());
    } else {
      // Si no hay ninguno, seleccionar todos los visibles
      const allIds = publicaciones.map(pub => pub._id ? pub._id.toString() : '').filter(Boolean);
      setSelectedAportes(new Set(allIds));
    }
  };

  const handleClearSelection = () => {
    setSelectedAportes(new Set());
  };

  // Validación individual
  const handleValidate = async (id: string, usuarioNombre?: string) => {
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/aportes/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ aporte: true }),
      });

      if (response.ok) {
        setMessage({ 
          text: `✅ Aporte de ${usuarioNombre || 'socio'} validado y cuenta verificada exitosamente`, 
          type: 'success' 
        });
        setPublicaciones(prev => prev.filter(pub => pub._id.toString() !== id.toString()));
        setSelectedAportes(prev => {
          const newSelection = new Set(prev);
          newSelection.delete(id.toString());
          return newSelection;
        });
        setTotalItems(prev => Math.max(0, prev - 1));
      } else {
        const errorData = await response.json();
        setMessage({ text: errorData.message || 'Error al validar el aporte', type: 'error' });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ text: 'Error al conectar con el servidor', type: 'error' });
    }
  };

  // Validación por selección de checkboxes (endpoint en lote)
  const handleBatchValidate = async () => {
    if (selectedAportes.size === 0) {
      setMessage({ text: 'Selecciona al menos un aporte para validar', type: 'error' });
      return;
    }

    setIsBatchValidating(true);
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/aportes/validar-lote`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          aporteIds: Array.from(selectedAportes)
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const countValidated = data.validados || selectedAportes.size;
        setMessage({ 
          text: `✅ ${countValidated} aportes seleccionados validados exitosamente`, 
          type: 'success' 
        });
        setPublicaciones(prev => prev.filter(pub => !selectedAportes.has(pub._id.toString())));
        setTotalItems(prev => Math.max(0, prev - countValidated));
        setSelectedAportes(new Set());
      } else {
        setMessage({ text: data.error || data.message || 'Error en validación por lotes', type: 'error' });
      }
    } catch (error) {
      console.error('Error en validación por lotes:', error);
      setMessage({ text: 'Error al conectar con el servidor', type: 'error' });
    } finally {
      setIsBatchValidating(false);
    }
  };

  // Validación de TODOS los aportes que coinciden con el filtro actual
  const handleValidateAllFilter = async () => {
    if (totalItems === 0) return;
    if (!window.confirm(`¿Estás seguro de que deseas aprobar TODOS los ${totalItems} aportes que coinciden con "${filter || 'todos los pendientes'}"?`)) {
      return;
    }

    setIsFilterBatchValidating(true);
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/aportes/validar-lote`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          validarTodosFiltro: true,
          search: filter
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ 
          text: `🎉 ${data.validados} aportes validados exitosamente para el filtro "${filter || 'General'}"`, 
          type: 'success' 
        });
        setPublicaciones([]);
        setSelectedAportes(new Set());
        setTotalItems(0);
        fetchPublicacionesNoValidadas(1, true, filter);
      } else {
        setMessage({ text: data.error || data.message || 'Error al validar aportes', type: 'error' });
      }
    } catch (error) {
      console.error('Error al validar filtro en lote:', error);
      setMessage({ text: 'Error de conexión con el servidor', type: 'error' });
    } finally {
      setIsFilterBatchValidating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta solicitud de aporte?')) return;

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/aportes/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      if (response.ok) {
        setMessage({ text: 'Aporte eliminado correctamente', type: 'success' });
        setPublicaciones(prev => prev.filter(pub => pub._id.toString() !== id.toString()));
        setSelectedAportes(prev => {
          const newSelection = new Set(prev);
          newSelection.delete(id.toString());
          return newSelection;
        });
        setTotalItems(prev => Math.max(0, prev - 1));
      } else {
        const errorData = await response.json();
        setMessage({ text: errorData.message || 'Error al eliminar el aporte', type: 'error' });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ text: 'Error al conectar con el servidor', type: 'error' });
    }
  };

  // Buscar usuario por ID en modal
  const handleSearchUser = async () => {
    if (!validateUserId.trim()) return;
    setValidateError('');
    setValidateUser(null);
    setValidateLoading(true);
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/usuarios/${validateUserId.trim()}`, { headers: getHeaders() });
      if (!response.ok) {
        setValidateError('Usuario no encontrado');
        setValidateLoading(false);
        return;
      }
      const user = await response.json();
      setValidateUser(user);
    } catch (e) {
      setValidateError('Error al buscar usuario');
    } finally {
      setValidateLoading(false);
    }
  };

  // Validar aporte directo por ID
  const handleValidateByUser = async () => {
    setValidateError('');
    setValidateLoading(true);
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/aportes`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          usuarioId: validateUserId.trim(),
          aporte: true
        }),
      });
      if (response.ok) {
        setMessage({ text: 'Aporte validado y cuenta verificada exitosamente', type: 'success' });
        setIsValidateModalOpen(false);
        fetchPublicacionesNoValidadas(1, true, filter);
      } else {
        const errorData = await response.json();
        setValidateError(errorData.message || 'Error al validar el aporte');
      }
    } catch (e) {
      setValidateError('Error al conectar con el servidor');
    } finally {
      setValidateLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicacionesNoValidadas(1, true);
  }, []);

  return (
    <div className="min-h-screen bg-[#06110D] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      <Background />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex-grow w-full">
        {/* Banner Superior */}
        <div className="relative rounded-3xl p-6 sm:p-8 mb-8 overflow-hidden border border-emerald-500/25 bg-gradient-to-r from-[#0B251B] via-[#091F17] to-[#071711] shadow-2xl shadow-emerald-950/40">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-3">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Mesa de Control y Aprobaciones</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-heading">
                Validar Aportes Iniciales
              </h1>
              <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
                Aprueba los aportes de socios de forma individual, por selección en lote o por criterios de filtro (nombre, DNI, email o ID).
              </p>
            </div>

            <div className="glass-card bg-[#06140F]/80 border border-emerald-500/30 p-4 sm:p-5 rounded-2xl flex items-center gap-4 shrink-0 shadow-lg">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-500 to-emerald-500 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20">
                <Clock className="h-7 w-7" />
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-amber-400">Pendientes</span>
                <p className="text-2xl font-extrabold text-white font-heading">
                  {totalItems} <span className="text-xs font-normal text-slate-400">solicitudes</span>
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Validación atómica en lote
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mensaje Toast */}
        {message && (
          <div className={`mb-6 p-4 rounded-2xl text-center font-bold text-sm border shadow-2xl flex items-center justify-center gap-2.5 animate-fade-in ${
            message.type === 'success' 
              ? 'bg-[#0E241C] border-emerald-500 text-emerald-300 shadow-emerald-950/50' 
              : 'bg-[#2A0E12] border-rose-500 text-rose-300'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Barra de Acciones Principales */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <button
            onClick={() => {
              setIsValidateModalOpen(true);
              setValidateUserId('');
              setValidateUser(null);
              setValidateError('');
            }}
            className="py-3 px-5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs rounded-2xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            <UserCheck className="h-4 w-4" />
            <span>Validar por ID Directo</span>
          </button>

          {selectedAportes.size > 0 && (
            <button
              onClick={handleBatchValidate}
              disabled={isBatchValidating}
              className="py-3 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-2xl transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
            >
              {isBatchValidating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Aprobando {selectedAportes.size} seleccionados...</span>
                </>
              ) : (
                <>
                  <CheckSquare className="h-4 w-4" />
                  <span>Aprobar Selección ({selectedAportes.size})</span>
                </>
              )}
            </button>
          )}

          {totalItems > 0 && (
            <button
              onClick={handleValidateAllFilter}
              disabled={isFilterBatchValidating}
              className="py-3 px-5 bg-[#0D2E21] hover:bg-[#123E2D] border border-emerald-500/40 text-emerald-300 font-extrabold text-xs rounded-2xl transition-all flex items-center justify-center gap-2 ml-auto"
            >
              {isFilterBatchValidating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Aprobando todos los filtrados...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                  <span>Aprobar Todos del Filtro ({totalItems})</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Buscador Multi-Criterio */}
        <div className="glass-card p-4 rounded-2xl border border-emerald-500/20 bg-[#0A1812]/80 mb-6 shadow-md">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, DNI, correo electrónico, WhatsApp, usuario o ID..."
              defaultValue={filter}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-emerald-500/20 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
        </div>

        {/* Control Seleccionar / Desmarcar Todos */}
        {publicaciones.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-[#0A1812]/80 border border-emerald-500/15 mb-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={handleToggleSelectAll}
                className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-bold transition-colors"
              >
                {isSomeSelected ? (
                  <CheckSquare className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Square className="h-4 w-4 text-slate-500" />
                )}
                <span>
                  {isSomeSelected ? 'Desmarcar todos los seleccionados' : 'Seleccionar visibles en pantalla'}
                </span>
              </button>

              {isSomeSelected && (
                <button
                  onClick={handleClearSelection}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition-colors"
                >
                  Limpiar selección
                </button>
              )}
            </div>

            <span className="text-slate-400 font-mono text-xs">
              <strong className="text-emerald-300 font-normal">{selectedAportes.size}</strong> seleccionados de <strong className="text-slate-200 font-normal">{publicaciones.length}</strong> visibles
            </span>
          </div>
        )}

        {/* Listado de Aportes No Validados */}
        {loading && publicaciones.length === 0 ? (
          <div className="text-center py-16">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-emerald-400 mb-2" />
            <p className="text-slate-400 text-xs">Consultando aportes pendientes...</p>
          </div>
        ) : publicaciones.length === 0 ? (
          <div className="text-center py-16 glass-card rounded-3xl border border-emerald-500/20 bg-[#0A1812]/80 p-8 shadow-xl">
            <CheckCircle2 className="h-14 w-14 text-emerald-400/40 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white font-heading">¡Al día! No hay aportes pendientes</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {filter ? `No se encontraron resultados para "${filter}".` : 'Todos los socios han sido verificados exitosamente.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {publicaciones.map((pub, index) => {
              const isLastItem = index === publicaciones.length - 1;
              const pubId = pub._id ? pub._id.toString() : `idx-${index}`;
              const isSelected = selectedAportes.has(pubId);
              const usuario = pub.usuario || {};
              const cleanPhone = (usuario.linea_whatsapp || usuario.linea_llamadas || '').replace(/[^0-9]/g, '');

              return (
                <div
                  key={pubId}
                  ref={isLastItem ? lastPublicacionElementRef : null}
                  className={`glass-card p-5 rounded-2xl border transition-all shadow-lg ${
                    isSelected 
                      ? 'border-emerald-500/60 bg-[#0E261D]' 
                      : 'border-emerald-500/20 bg-[#0A1812]/85 hover:border-emerald-500/40'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Checkbox y Datos del Usuario */}
                    <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => toggleSelectAporte(pubId)}
                        className="mt-1 sm:mt-0 p-1 text-emerald-400 hover:text-emerald-300 transition-colors shrink-0 cursor-pointer"
                      >
                        {isSelected ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5 text-slate-500" />}
                      </button>

                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center font-extrabold text-white text-base shrink-0">
                        {usuario.nombre_completo ? usuario.nombre_completo.charAt(0).toUpperCase() : 'U'}
                      </div>

                      <div className="truncate flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-white text-sm sm:text-base truncate font-heading">
                            {usuario.nombre_completo || 'Usuario'}
                          </h3>
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            @{usuario.nombre_usuario || 'usuario'}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Pendiente
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                          <span>ID: <strong className="font-mono text-emerald-300 font-normal">{pub.usuarioId}</strong></span>
                          {usuario.dni && <span>DNI: <strong className="text-slate-300 font-normal">{usuario.dni}</strong></span>}
                          {usuario.correo_electronico && (
                            <span className="flex items-center gap-1 text-slate-400 truncate">
                              <Mail className="h-3 w-3" />
                              <span>{usuario.correo_electronico}</span>
                            </span>
                          )}
                          {cleanPhone && (
                            <a
                              href={`https://wa.me/${cleanPhone}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-emerald-400 hover:underline"
                            >
                              <MessageCircle className="h-3 w-3" />
                              <span>WhatsApp</span>
                            </a>
                          )}
                          {usuario.banco && (
                            <span className="flex items-center gap-1 text-teal-300">
                              <Building2 className="h-3 w-3" />
                              <span>{usuario.banco}: {usuario.cuenta_numero}</span>
                            </span>
                          )}
                          {usuario.padre?.nombre && (
                            <span className="text-[11px] text-teal-300">Patrocinador: {usuario.padre.nombre}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Botones de Acción */}
                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      <button
                        onClick={() => handleValidate(pubId, usuario.nombre_completo)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Aprobar</span>
                      </button>
                      <button
                        onClick={() => handleDelete(pubId)}
                        className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 transition-colors"
                        title="Eliminar solicitud"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {loadingMore && (
              <div className="py-4 text-center">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-emerald-400" />
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODAL: Validar por ID de Usuario */}
      {isValidateModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0A1812] border border-emerald-500/30 rounded-3xl max-w-md w-full shadow-2xl p-6 sm:p-7">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2.5">
                <UserCheck className="h-5 w-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white font-heading">Validar Aporte Directo</h3>
              </div>
              <button 
                onClick={() => setIsValidateModalOpen(false)}
                className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Ingresa el ID del usuario para verificar su información y validar su aporte inmediatamente.
            </p>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="ID de usuario..."
                value={validateUserId}
                onChange={(e) => setValidateUserId(e.target.value)}
                className="flex-1 p-2.5 bg-slate-900/90 border border-emerald-500/20 rounded-xl text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                onClick={handleSearchUser}
                disabled={validateLoading || !validateUserId.trim()}
                className="px-4 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 font-bold text-xs rounded-xl transition-colors disabled:opacity-50"
              >
                {validateLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Buscar'}
              </button>
            </div>

            {validateError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                {validateError}
              </div>
            )}

            {validateUser && (
              <div className="p-4 rounded-2xl bg-[#07130E] border border-emerald-500/20 space-y-2 text-xs mb-5">
                <p className="font-bold text-white text-sm">{validateUser.nombre_completo}</p>
                <p className="text-slate-400">Usuario: <span className="font-mono text-emerald-300">@{validateUser.nombre_usuario}</span></p>
                {validateUser.correo_electronico && <p className="text-slate-400">Correo: {validateUser.correo_electronico}</p>}
                {validateUser.dni && <p className="text-slate-400">DNI: {validateUser.dni}</p>}
                {validateUser.banco && <p className="text-teal-300">Banco: {validateUser.banco} ({validateUser.cuenta_numero})</p>}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setIsValidateModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs font-bold hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleValidateByUser}
                disabled={validateLoading || !validateUserId.trim()}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs transition-all disabled:opacity-50"
              >
                Aprobar Aporte
              </button>
            </div>
          </div>
        </div>
      )}

      <br /><br />
      <AdminNav />
    </div>
  );
};