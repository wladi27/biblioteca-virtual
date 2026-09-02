import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Background } from '../components/Background';
import { AdminNav } from '../components/AdminNav';
import { 
  Wallet, 
  PlusCircle, 
  Search, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Calendar, 
  ArrowUpRight,
  TrendingUp,
  CreditCard
} from 'lucide-react';

const LIMITE = 10;

export const RecargarBilletera = () => {
  const [monto, setMonto] = useState('');
  const [usuarioId, setUsuarioId] = useState('');
  const [usuarioInfo, setUsuarioInfo] = useState<any>(null);
  const [loadingUsuario, setLoadingUsuario] = useState(false);

  const [transacciones, setTransacciones] = useState<any[]>([]);
  const [filtroUsuarioId, setFiltroUsuarioId] = useState('');
  const [loadingTransacciones, setLoadingTransacciones] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalTransacciones, setTotalTransacciones] = useState(0);
  const [saving, setSaving] = useState(false);

  const [mensaje, setMensaje] = useState<{ text: string; type: 'success' | 'error' | null } | null>(null);

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

  // Buscar usuario por ID
  useEffect(() => {
    if (!usuarioId.trim()) {
      setUsuarioInfo(null);
      return;
    }
    setLoadingUsuario(true);
    const apiUrl = getApiUrl();
    fetch(`${apiUrl}/usuarios/${usuarioId.trim()}`, { headers: getHeaders() })
      .then(res => res.ok ? res.json() : null)
      .then(data => setUsuarioInfo(data))
      .catch(() => setUsuarioInfo(null))
      .finally(() => setLoadingUsuario(false));
  }, [usuarioId]);

  // Obtener transacciones de recarga
  const fetchTransacciones = useCallback(async (page = 0, isInitialLoad = false) => {
    if (isInitialLoad) {
      setLoadingTransacciones(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const skip = page * LIMITE;
      const apiUrl = getApiUrl();
      const url = filtroUsuarioId.trim()
        ? `${apiUrl}/api/transacciones/recargas/${filtroUsuarioId.trim()}?limit=${LIMITE}&skip=${skip}`
        : `${apiUrl}/api/transacciones/recargas?limit=${LIMITE}&skip=${skip}`;

      const response = await fetch(url, { headers: getHeaders() });
      if (response.ok) {
        const data = await response.json();
        const recargasArray = data.recargas || (Array.isArray(data) ? data : []);

        if (isInitialLoad) {
          setTransacciones(recargasArray);
        } else {
          setTransacciones(prev => [...prev, ...recargasArray]);
        }

        setHasMore(data.paginacion?.hasMore || (recargasArray.length === LIMITE));
        setCurrentPage(page);
        setTotalTransacciones(data.paginacion?.totalRecargas || recargasArray.length);
      }
    } catch (error) {
      console.error('Error cargando recargas:', error);
    } finally {
      setLoadingTransacciones(false);
      setLoadingMore(false);
    }
  }, [filtroUsuarioId]);

  useEffect(() => {
    setCurrentPage(0);
    fetchTransacciones(0, true);
  }, [filtroUsuarioId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje(null);
    if (!usuarioInfo) {
      setMensaje({ text: 'Por favor, busca un usuario válido primero.', type: 'error' });
      return;
    }
    const montoNum = parseFloat(monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      setMensaje({ text: 'Por favor, ingresa un monto válido mayor que 0.', type: 'error' });
      return;
    }

    setSaving(true);
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/billetera/recargar`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          usuarioId: usuarioId.trim(),
          usuario_id: usuarioId.trim(),
          monto: montoNum,
          descripcion: `Recarga individual administrativa manual a ${usuarioInfo.nombre_usuario || usuarioInfo.nombre_completo}`
        }),
      });

      if (response.ok) {
        setMensaje({ 
          text: `✅ Recarga de COP $${montoNum.toLocaleString('es-CO')} aplicada exitosamente a @${usuarioInfo.nombre_usuario}`, 
          type: 'success' 
        });
        setMonto('');
        setUsuarioId('');
        setUsuarioInfo(null);
        fetchTransacciones(0, true);
      } else {
        const err = await response.json();
        setMensaje({ text: err.mensaje || err.message || 'Error al procesar la recarga', type: 'error' });
      }
    } catch (error) {
      setMensaje({ text: 'Error al conectar con el servidor', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06110D] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      <Background />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex-grow w-full">
        {/* Banner Superior */}
        <div className="relative rounded-3xl p-6 sm:p-8 mb-8 overflow-hidden border border-emerald-500/25 bg-gradient-to-r from-[#0B251B] via-[#091F17] to-[#071711] shadow-2xl shadow-emerald-950/40">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-3">
              <Wallet className="h-3.5 w-3.5" />
              <span>Abonos Directos a Billetera</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-heading">
              Recargar Billetera Individual
            </h1>
            <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
              Abona saldo en COP a la billetera activa de cualquier socio y consulta el historial de recargas realizadas.
            </p>
          </div>
        </div>

        {/* Notificación Toast */}
        {mensaje && (
          <div className={`mb-6 p-4 rounded-2xl text-center font-bold text-sm border shadow-2xl flex items-center justify-center gap-2.5 animate-fade-in ${
            mensaje.type === 'success' 
              ? 'bg-[#0E241C] border-emerald-500 text-emerald-300 shadow-emerald-950/50' 
              : 'bg-[#2A0E12] border-rose-500 text-rose-300'
          }`}>
            {mensaje.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            <span>{mensaje.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Formulario de Recarga */}
          <div className="glass-card rounded-3xl border border-emerald-500/20 bg-[#0A1812]/85 p-6 sm:p-7 shadow-xl">
            <h2 className="text-lg font-bold text-white font-heading mb-4 flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-emerald-400" />
              <span>Nuevo Abono Directo</span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">ID del Inversionista</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Ingresa ID del usuario..."
                    value={usuarioId}
                    onChange={(e) => setUsuarioId(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-emerald-500/20 text-white text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  {loadingUsuario && (
                    <Loader2 className="absolute right-3 top-3.5 h-4 w-4 animate-spin text-emerald-400" />
                  )}
                </div>
              </div>

              {usuarioInfo && (
                <div className="p-3.5 rounded-2xl bg-[#07130E] border border-emerald-500/20 text-xs space-y-1">
                  <p className="font-bold text-white text-sm">{usuarioInfo.nombre_completo}</p>
                  <p className="text-slate-400">Usuario: <strong className="text-emerald-300">@{usuarioInfo.nombre_usuario}</strong></p>
                  <p className="text-slate-400">Nivel: <strong className="text-teal-300">Nivel {usuarioInfo.nivel || 1}</strong></p>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Monto a Recargar (COP)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Ej: 50000"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-emerald-500/20 text-white text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={saving || !usuarioInfo}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
                <span>Aplicar Recarga</span>
              </button>
            </form>
          </div>

          {/* Historial de Recargas */}
          <div className="lg:col-span-2 glass-card rounded-3xl border border-emerald-500/20 bg-[#0A1812]/85 p-6 sm:p-7 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h2 className="text-lg font-bold text-white font-heading flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                  <span>Historial de Recargas</span>
                </h2>

                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filtrar por ID..."
                    value={filtroUsuarioId}
                    onChange={(e) => setFiltroUsuarioId(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-emerald-500/20 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {loadingTransacciones && transacciones.length === 0 ? (
                <div className="py-12 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-emerald-400" />
                </div>
              ) : transacciones.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No se encontraron recargas registradas.
                </div>
              ) : (
                <ul className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {transacciones.map((t, idx) => {
                    const usuario = typeof t.usuario_id === 'object' ? t.usuario_id?._id : (t.usuario_id || 'N/A');
                    const montoFormat = t.monto ? Number(t.monto).toLocaleString('es-CO', { minimumFractionDigits: 2 }) : '0.00';

                    return (
                      <li
                        key={`${t._id}-${idx}`}
                        className="p-3.5 rounded-2xl bg-[#07130E] border border-emerald-500/15 flex items-center justify-between gap-3"
                      >
                        <div className="truncate">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-extrabold text-white text-sm">
                              COP ${montoFormat}
                            </span>
                            <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                              {t.estado || 'Aprobado'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 font-mono mt-0.5 truncate">
                            ID: {usuario} {t.descripcion && `• ${t.descripcion}`}
                          </p>
                        </div>

                        {t.fecha && (
                          <span className="text-[11px] text-slate-500 font-mono shrink-0">
                            {new Date(t.fecha).toLocaleDateString('es-ES')}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {hasMore && transacciones.length > 0 && (
              <button
                onClick={() => fetchTransacciones(currentPage + 1, false)}
                disabled={loadingMore}
                className="mt-4 w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold border border-emerald-500/20"
              >
                {loadingMore ? 'Cargando más...' : 'Cargar más recargas'}
              </button>
            )}
          </div>
        </div>
      </main>

      <br /><br />
      <AdminNav />
    </div>
  );
};