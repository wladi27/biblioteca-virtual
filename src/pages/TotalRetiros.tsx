import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Background } from '../components/Background';
import { AdminNav } from '../components/AdminNav';
import { 
  Wallet, 
  Search, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Calendar, 
  DollarSign, 
  User, 
  Loader2 
} from 'lucide-react';
import debounce from 'lodash/debounce';

export const TotalWithdrawals = () => {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [filtro, setFiltro] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | null } | null>(null);
  const [loading, setLoading] = useState(true);

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

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/transacciones/retiros?limit=100`, { headers: getHeaders() });
      if (response.ok) {
        const data = await response.json();
        const retirosArray = data.retiros || (Array.isArray(data) ? data : []);
        setWithdrawals(retirosArray);
      } else {
        throw new Error('Error al obtener los retiros');
      }
    } catch (error) {
      console.error(error);
      setMessage({ text: 'Error al conectar con el servidor', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleFiltroChange = useCallback(
    debounce((value: string) => {
      setFiltro(value);
    }, 300),
    []
  );

  const withdrawalsFiltrados = useMemo(() => {
    if (!filtro.trim()) return withdrawals;
    const q = filtro.toLowerCase();
    return withdrawals.filter(w => {
      const nombre = w.usuario_id?.nombre_completo || w.usuarioId?.nombre_completo || '';
      const usuario = w.usuario_id?.nombre_usuario || w.usuarioId?.nombre_usuario || '';
      const id = typeof w.usuario_id === 'string' ? w.usuario_id : (w.usuario_id?._id || w.usuarioId || '');
      const monto = (w.monto || '').toString();
      const estado = (w.estado || '').toLowerCase();

      return (
        nombre.toLowerCase().includes(q) ||
        usuario.toLowerCase().includes(q) ||
        id.toLowerCase().includes(q) ||
        monto.includes(q) ||
        estado.includes(q)
      );
    });
  }, [withdrawals, filtro]);

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
                <Wallet className="h-3.5 w-3.5" />
                <span>Historial de Solicitudes de Retiro</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-heading">
                Retiros Solicitados
              </h1>
              <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
                Control histórico de transferencias bancarias solicitadas por los socios y liquidación de ganancias.
              </p>
            </div>

            <div className="glass-card bg-[#06140F]/80 border border-emerald-500/30 p-4 sm:p-5 rounded-2xl flex items-center gap-4 shrink-0 shadow-lg">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/30">
                <DollarSign className="h-8 w-8" />
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-emerald-400">Total Solicitudes</span>
                <p className="text-2xl font-extrabold text-white font-heading">
                  {withdrawals.length} <span className="text-xs font-normal text-slate-400">retiros</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Buscador */}
        <div className="glass-card p-4 rounded-2xl border border-emerald-500/20 bg-[#0A1812]/80 mb-6 shadow-md">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por ID, nombre, monto o estado..."
              onChange={(e) => handleFiltroChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-emerald-500/20 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
        </div>

        {/* Listado de Retiros */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={`skel-w-${i}`} className="p-5 rounded-2xl bg-[#0A1812]/70 border border-emerald-500/10 animate-pulse space-y-2">
                <div className="h-5 w-36 bg-emerald-500/20 rounded"></div>
                <div className="h-3 w-48 bg-slate-800 rounded"></div>
              </div>
            ))}
          </div>
        ) : withdrawalsFiltrados.length === 0 ? (
          <div className="text-center py-16 glass-card rounded-3xl border border-emerald-500/20 bg-[#0A1812]/80 p-8 shadow-xl">
            <Wallet className="h-14 w-14 text-emerald-500/30 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white font-heading">No se encontraron solicitudes de retiro</h3>
          </div>
        ) : (
          <ul className="space-y-3.5 mb-6">
            {withdrawalsFiltrados.map((w) => {
              const usuarioId = typeof w.usuario_id === 'object' ? w.usuario_id?._id : (w.usuario_id || w.usuarioId);
              const isAprobado = w.estado === 'aprobado';
              const isPendiente = w.estado === 'pendiente';

              return (
                <li
                  key={w._id}
                  className="glass-card rounded-2xl border border-emerald-500/20 bg-[#0A1812]/85 hover:border-emerald-500/40 p-5 transition-all shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <div className="h-11 w-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
                      <Wallet className="h-5 w-5" />
                    </div>

                    <div className="truncate flex-1">
                      <div className="flex items-center gap-2.5 mb-1">
                        <span className="font-mono text-base font-extrabold text-white">
                          COP ${w.monto ? Number(w.monto).toLocaleString('es-CO', { minimumFractionDigits: 2 }) : '0.00'}
                        </span>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                          isAprobado
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : isPendiente
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        }`}>
                          {isAprobado && <CheckCircle2 className="h-3 w-3" />}
                          {isPendiente && <Clock className="h-3 w-3" />}
                          <span className="capitalize">{w.estado || 'Pendiente'}</span>
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 text-xs text-slate-400">
                        <span>ID Usuario: <strong className="font-mono text-emerald-300 font-normal">{usuarioId}</strong></span>
                        {w.fecha && (
                          <span className="flex items-center gap-1 text-slate-500">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(w.fecha).toLocaleDateString('es-ES')}</span>
                          </span>
                        )}
                        {w.descripcion && <span className="text-slate-400 italic">"{w.descripcion}"</span>}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      <br /><br />
      <AdminNav />
    </div>
  );
};
