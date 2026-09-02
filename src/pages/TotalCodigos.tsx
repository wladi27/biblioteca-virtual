import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Background } from '../components/Background';
import { AdminNav } from '../components/AdminNav';
import { 
  QrCode, 
  Search, 
  User, 
  CheckCircle2, 
  Clock, 
  Copy, 
  Check, 
  Loader2, 
  Calendar,
  Sparkles
} from 'lucide-react';
import debounce from 'lodash/debounce';

export const TotalReferralCodes = () => {
  const [referralCodes, setReferralCodes] = useState<any[]>([]);
  const [filtro, setFiltro] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | null } | null>(null);
  const [loading, setLoading] = useState(true);
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

  const fetchReferralCodes = async () => {
    setLoading(true);
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/referralCodes`, { headers: getHeaders() });
      if (response.ok) {
        const data = await response.json();
        setReferralCodes(Array.isArray(data) ? data : []);
      } else {
        throw new Error('Error al obtener los códigos de referencia');
      }
    } catch (error) {
      console.error(error);
      setMessage({ text: 'Error al conectar con el servidor', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferralCodes();
  }, []);

  const handleFiltroChange = useCallback(
    debounce((value: string) => {
      setFiltro(value);
    }, 300),
    []
  );

  const referralCodesFiltrados = useMemo(() => {
    if (!filtro.trim()) return referralCodes;
    const q = filtro.toLowerCase();
    return referralCodes.filter(
      (code) =>
        (code.code && code.code.toLowerCase().includes(q)) ||
        (code.userId?.nombre_completo && code.userId.nombre_completo.toLowerCase().includes(q)) ||
        (code.userId?.nombre_usuario && code.userId.nombre_usuario.toLowerCase().includes(q))
    );
  }, [referralCodes, filtro]);

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
                <QrCode className="h-3.5 w-3.5" />
                <span>Gestión de Códigos de Afiliación</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-heading">
                Códigos de Invitación
              </h1>
              <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
                Supervisa todos los códigos únicos emitidos para nuevos socios, su estado de uso y los patrocinadores emisores.
              </p>
            </div>

            <div className="glass-card bg-[#06140F]/80 border border-emerald-500/30 p-4 sm:p-5 rounded-2xl flex items-center gap-4 shrink-0 shadow-lg">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/30">
                <Sparkles className="h-8 w-8" />
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-emerald-400">Total Códigos</span>
                <p className="text-2xl font-extrabold text-white font-heading">
                  {referralCodes.length} <span className="text-xs font-normal text-slate-400">emitidos</span>
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
              placeholder="Buscar por código de referido, nombre de usuario..."
              onChange={(e) => handleFiltroChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-emerald-500/20 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
        </div>

        {/* Listado de Códigos */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={`skel-c-${i}`} className="p-5 rounded-2xl bg-[#0A1812]/70 border border-emerald-500/10 animate-pulse space-y-2">
                <div className="h-5 w-32 bg-emerald-500/20 rounded"></div>
                <div className="h-3 w-48 bg-slate-800 rounded"></div>
              </div>
            ))}
          </div>
        ) : referralCodesFiltrados.length === 0 ? (
          <div className="text-center py-16 glass-card rounded-3xl border border-emerald-500/20 bg-[#0A1812]/80 p-8 shadow-xl">
            <QrCode className="h-14 w-14 text-emerald-500/30 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white font-heading">No se encontraron códigos de invitación</h3>
          </div>
        ) : (
          <ul className="space-y-3.5 mb-6">
            {referralCodesFiltrados.map((code) => {
              const user = code.userId || {};

              return (
                <li
                  key={code._id}
                  className="glass-card rounded-2xl border border-emerald-500/20 bg-[#0A1812]/85 hover:border-emerald-500/40 p-4 sm:p-5 transition-all shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <div className="h-11 w-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-mono font-extrabold text-sm shrink-0">
                      <QrCode className="h-5 w-5" />
                    </div>

                    <div className="truncate flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-base font-extrabold text-white tracking-wider">
                          {code.code}
                        </span>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                          code.used 
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}>
                          {code.used ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                          <span>{code.used ? 'Utilizado' : 'Disponible / Sin Usar'}</span>
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 text-xs text-slate-400">
                        <span>Emisor: <strong className="text-slate-200 font-medium">{user.nombre_completo || 'Usuario'}</strong> (@{user.nombre_usuario || 'usuario'})</span>
                        {code.createdAt && (
                          <span className="flex items-center gap-1 text-slate-500">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(code.createdAt).toLocaleDateString('es-ES')}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCopyToClipboard(code.code, `code-${code._id}`)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-bold transition-colors self-end sm:self-auto flex items-center gap-1.5 shrink-0"
                  >
                    {isCopied[`code-${code._id}`] ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>Copiar Código</span>
                  </button>
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