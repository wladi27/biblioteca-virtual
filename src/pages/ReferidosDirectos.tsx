import React, { useEffect, useState } from 'react';
import { Background } from '../components/Background';
import { MobileNav } from '../components/MobileNav';
import { 
  Users, 
  UserPlus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  DollarSign, 
  ShieldCheck, 
  Clipboard, 
  Check, 
  Search, 
  MessageCircle, 
  Mail, 
  Sparkles, 
  CheckSquare, 
  Square, 
  Loader2, 
  X, 
  ArrowRight,
  RefreshCw,
  ChevronRight,
  UserCheck
} from 'lucide-react';

export const ReferidosDirectos = () => {
  const [activeTab, setActiveTab] = useState<'directos' | 'recibidas' | 'enviadas'>('directos');
  const [referidosDirectos, setReferidosDirectos] = useState<any[]>([]);
  const [solicitudesRecibidas, setSolicitudesRecibidas] = useState<any[]>([]);
  const [solicitudesEnviadas, setSolicitudesEnviadas] = useState<any[]>([]);
  const [resumenComisiones, setResumenComisiones] = useState<any>({
    total_referidos: 0,
    comisiones_pagadas_total: 0,
    comisiones_pendientes_total: 0,
    referidos_verificados: 0,
    patrocinador_verificado: false
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSweeping, setIsSweeping] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [referidoIdInput, setReferidoIdInput] = useState('');
  const [userId, setUserId] = useState<string>('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [selectedSolicitudes, setSelectedSolicitudes] = useState<Set<string>>(new Set());
  const [isCopied, setIsCopied] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');

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

  const showToast = (text: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleCopyToClipboard = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setIsCopied(prev => ({ ...prev, [key]: true }));
      showToast('Copiado al portapapeles', 'success');
      setTimeout(() => {
        setIsCopied(prev => ({ ...prev, [key]: false }));
      }, 2000);
    }).catch(() => {
      showToast('Error al copiar', 'error');
    });
  };

  const fetchAllData = async (uId: string) => {
    setIsLoading(true);
    const apiUrl = getApiUrl();
    const headers = getHeaders();

    try {
      const [resDirectos, resRecibidas, resEnviadas, resResumen] = await Promise.allSettled([
        fetch(`${apiUrl}/api/referralRequests/referidos-directos/${uId}?limit=50`, { headers }).then(r => r.json()),
        fetch(`${apiUrl}/api/referralRequests/recibidas/${uId}?estado=todos&limit=50`, { headers }).then(r => r.json()),
        fetch(`${apiUrl}/api/referralRequests/enviadas/${uId}?estado=todos&limit=50`, { headers }).then(r => r.json()),
        fetch(`${apiUrl}/api/referralRequests/resumen-comisiones/${uId}`, { headers }).then(r => r.json())
      ]);

      if (resDirectos.status === 'fulfilled') {
        setReferidosDirectos(resDirectos.value.referidos || []);
      }
      if (resRecibidas.status === 'fulfilled') {
        setSolicitudesRecibidas(resRecibidas.value.solicitudes || []);
      }
      if (resEnviadas.status === 'fulfilled') {
        setSolicitudesEnviadas(resEnviadas.value.solicitudes || []);
      }
      if (resResumen.status === 'fulfilled') {
        setResumenComisiones(resResumen.value);
      }
    } catch (error) {
      console.error('Error fetching direct referrals:', error);
      showToast('Error al conectar con el servidor', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSweepCommissions = async () => {
    setIsSweeping(true);
    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/api/referralRequests/liquidar-pendientes`, {
        method: 'POST',
        headers: getHeaders()
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Barrido completado: ${data.resultado?.liquidadas || 0} comisiones pagadas exitosamente.`, 'success');
        if (userId) fetchAllData(userId);
      } else {
        showToast(data.message || 'Error al ejecutar barrido', 'error');
      }
    } catch (e) {
      showToast('Error de conexión al liquidar comisiones', 'error');
    } finally {
      setIsSweeping(false);
    }
  };

  const handleCambiarEstado = async (solicitudId: string, nuevoEstado: 'aceptado' | 'rechazado') => {
    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/api/referralRequests/${solicitudId}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ estado: nuevoEstado })
      });
      const data = await res.json();

      if (res.ok) {
        showToast(data.message || `Solicitud ${nuevoEstado}`, 'success');
        if (userId) fetchAllData(userId);
      } else {
        showToast(data.message || 'Error al procesar solicitud', 'error');
      }
    } catch (error) {
      showToast('Error de conexión', 'error');
    }
  };

  const handleAceptarPorLote = async () => {
    if (selectedSolicitudes.size === 0) {
      showToast('Selecciona al menos una solicitud para aceptar', 'warning');
      return;
    }

    setIsProcessing(true);
    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/api/referralRequests/aceptar-multiples`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ solicitudesIds: Array.from(selectedSolicitudes) })
      });
      const data = await res.json();

      if (res.ok) {
        showToast(data.message || 'Solicitudes procesadas exitosamente', 'success');
        setSelectedSolicitudes(new Set());
        if (userId) fetchAllData(userId);
      } else {
        showToast(data.message || 'Error en aceptación por lote', 'error');
      }
    } catch (error) {
      showToast('Error de conexión', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCrearSolicitud = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referidoIdInput.trim() || !userId) return;

    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/api/referralRequests`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          solicitante_id: userId,
          referido_id: referidoIdInput.trim()
        })
      });
      const data = await res.json();

      if (res.ok) {
        showToast('Referido vinculado con éxito', 'success');
        setReferidoIdInput('');
        setShowInviteModal(false);
        fetchAllData(userId);
      } else {
        showToast(data.message || 'No se pudo vincular al referido', 'error');
      }
    } catch (error) {
      showToast('Error al conectar con el servidor', 'error');
    }
  };

  const toggleSelectSolicitud = (id: string) => {
    setSelectedSolicitudes(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllRecibidas = () => {
    const pendientes = solicitudesRecibidas.filter(s => s.estado === 'pendiente');
    if (selectedSolicitudes.size === pendientes.length) {
      setSelectedSolicitudes(new Set());
    } else {
      setSelectedSolicitudes(new Set(pendientes.map(s => s._id)));
    }
  };

  useEffect(() => {
    const raw = localStorage.getItem('usuario');
    if (raw) {
      try {
        const user = JSON.parse(raw);
        setUserId(user._id || user.id);
        fetchAllData(user._id || user.id);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Filtrado de referidos
  const referidosFiltrados = referidosDirectos.filter(ref => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const u = ref.usuario || {};
    return (
      u.nombre_completo?.toLowerCase().includes(term) ||
      u.nombre_usuario?.toLowerCase().includes(term) ||
      u.correo_electronico?.toLowerCase().includes(term) ||
      u.dni?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-[#06110D] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white pb-28">
      <Background />

      <main className="max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8 py-6 sm:py-10 flex-grow w-full">
        {/* Banner Superior Mobile-Friendly */}
        <div className="relative rounded-2xl sm:rounded-3xl p-5 sm:p-8 mb-6 overflow-hidden border border-emerald-500/25 bg-gradient-to-br from-[#0B251B] via-[#091F17] to-[#071711] shadow-2xl shadow-emerald-950/40">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-2.5">
                <Users className="h-3.5 w-3.5 text-emerald-400" />
                <span>Panel de Patrocinador</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-heading leading-tight">
                Mis Referidos y Comisiones
              </h1>
              <p className="text-slate-300 text-xs sm:text-base mt-2 max-w-2xl leading-relaxed">
                Recibe <strong className="text-emerald-400 font-semibold">COP $1,400</strong> por cada socio directo vinculado a tu red una vez ambos tengan su aporte verificado.
              </p>

              {/* Botones de Acción en Cabecera */}
              <div className="flex flex-wrap items-center gap-2.5 mt-4">
                <button
                  onClick={() => handleCopyToClipboard(userId, 'my-id')}
                  className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-slate-900/90 border border-emerald-500/25 hover:border-emerald-500/40 text-xs font-mono text-emerald-300 flex items-center justify-center gap-2 transition-colors active:scale-98"
                >
                  {isCopied['my-id'] ? <Check className="h-4 w-4 text-emerald-400" /> : <Clipboard className="h-4 w-4 text-slate-400" />}
                  <span>Mi ID: {userId ? userId.slice(-8) : '...'}</span>
                </button>

                <button
                  onClick={() => setShowInviteModal(true)}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 active:scale-98"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Agregar Referido</span>
                </button>

                <button
                  onClick={handleSweepCommissions}
                  disabled={isSweeping}
                  className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-[#0D261C] hover:bg-[#123627] border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors active:scale-98"
                  title="Verificar y liquidar comisiones de socios que ya hayan aportado"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isSweeping ? 'animate-spin' : ''}`} />
                  <span>{isSweeping ? 'Revisando...' : 'Re-evaluar'}</span>
                </button>
              </div>
            </div>

            {/* Badge de Estado del Patrocinador */}
            <div className="glass-card bg-[#06140F]/80 border border-emerald-500/30 p-3.5 sm:p-5 rounded-2xl shrink-0 shadow-lg min-w-[190px]">
              <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold text-slate-400 block mb-1">
                Tu Estado de Aporte (Patrocinador)
              </span>
              <div className="flex items-center gap-2">
                {resumenComisiones.patrocinador_verificado ? (
                  <>
                    <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400" />
                    <span className="font-extrabold text-emerald-300 text-xs sm:text-sm">Aporte Verificado</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400" />
                    <span className="font-extrabold text-amber-300 text-xs sm:text-sm">Sin Aporte Aprobado</span>
                  </>
                )}
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1">
                {resumenComisiones.patrocinador_verificado 
                  ? 'Habilitado para recibir comisiones' 
                  : 'Realiza tu aporte para cobrar comisiones'}
              </p>
            </div>
          </div>
        </div>

        {/* Toast */}
        {message && (
          <div className={`mb-5 p-3.5 rounded-2xl text-center font-bold text-xs sm:text-sm border shadow-2xl flex items-center justify-center gap-2 animate-fade-in ${
            message.type === 'success' 
              ? 'bg-[#0E241C] border-emerald-500 text-emerald-300 shadow-emerald-950/50' 
              : message.type === 'warning'
                ? 'bg-[#241B0B] border-amber-500 text-amber-300'
                : 'bg-[#2A0E12] border-rose-500 text-rose-300'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* 3 KPIs de Comisiones */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-5 mb-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={`skel-ref-kpi-${i}`} className="glass-card p-4 sm:p-6 rounded-2xl border border-emerald-500/10 bg-[#0A1812]/70 animate-pulse space-y-2.5">
                <div className="h-3 w-32 bg-emerald-500/20 rounded"></div>
                <div className="h-7 w-40 bg-slate-700 rounded-lg"></div>
                <div className="h-3 w-28 bg-slate-800 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-5 mb-6">
            {/* 1. Comisiones Pagadas */}
            <div className="glass-card p-4 sm:p-6 rounded-2xl border border-emerald-500/20 bg-[#0A1812]/80 group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">Comisiones Pagadas</span>
                <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 group-hover:scale-110 transition-transform">
                  <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
              </div>
              <p className="text-xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
                COP ${resumenComisiones.comisiones_pagadas_total.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-emerald-400 mt-1">
                Abonadas a tu billetera digital
              </p>
            </div>

            {/* 2. Comisiones Pendientes */}
            <div className="glass-card p-4 sm:p-6 rounded-2xl border border-emerald-500/20 bg-[#0A1812]/80 group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">Comisiones Pendientes</span>
                <div className="p-2 sm:p-2.5 rounded-xl bg-amber-500/15 text-amber-400 group-hover:scale-110 transition-transform">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
              </div>
              <p className="text-xl sm:text-3xl font-extrabold text-amber-300 font-mono tracking-tight">
                COP ${resumenComisiones.comisiones_pendientes_total.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Se liquidan al verificar los 2 aportes
              </p>
            </div>

            {/* 3. Total de Referidos */}
            <div className="glass-card p-4 sm:p-6 rounded-2xl border border-emerald-500/20 bg-[#0A1812]/80 group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">Tus Referidos</span>
                <div className="p-2 sm:p-2.5 rounded-xl bg-teal-500/15 text-teal-400 group-hover:scale-110 transition-transform">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
              </div>
              <p className="text-xl sm:text-3xl font-extrabold text-white font-heading tracking-tight">
                {resumenComisiones.total_referidos} <span className="text-xs sm:text-sm font-normal text-slate-400">socios directos</span>
              </p>
              <p className="text-[11px] text-teal-300 mt-1">
                {resumenComisiones.referidos_verificados} con aporte verificado
              </p>
            </div>
          </div>
        )}

        {/* Pestañas de Navegación Mobile-Scrollable */}
        <div className="flex overflow-x-auto no-scrollbar border-b border-emerald-500/20 mb-5 gap-1 sm:gap-2 pb-1">
          <button
            onClick={() => setActiveTab('directos')}
            className={`py-2.5 px-3.5 sm:px-5 text-xs sm:text-sm font-bold whitespace-nowrap border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'directos'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10 rounded-t-xl'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Mis Referidos ({referidosDirectos.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('recibidas')}
            className={`py-2.5 px-3.5 sm:px-5 text-xs sm:text-sm font-bold whitespace-nowrap border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'recibidas'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10 rounded-t-xl'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="h-4 w-4" />
            <span>
              Pendientes ({solicitudesRecibidas.filter(s => s.estado === 'pendiente').length})
            </span>
          </button>

          <button
            onClick={() => setActiveTab('enviadas')}
            className={`py-2.5 px-3.5 sm:px-5 text-xs sm:text-sm font-bold whitespace-nowrap border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'enviadas'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10 rounded-t-xl'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <ArrowRight className="h-4 w-4" />
            <span>Mi Patrocinador ({solicitudesEnviadas.length})</span>
          </button>
        </div>

        {/* TAB 1: MIS REFERIDOS DIRECTOS */}
        {activeTab === 'directos' && (
          <div className="space-y-3.5">
            <div className="p-3 rounded-2xl bg-[#091C14] border border-emerald-500/20 text-xs text-slate-300 flex items-start sm:items-center gap-2.5 leading-relaxed">
              <Sparkles className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5 sm:mt-0" />
              <span>
                <strong>Tus Referidos Directos:</strong> Socios vinculados bajo tu patrocinio. <strong className="text-emerald-400">Tú recibes COP $1,400</strong> por cada uno abonado a tu saldo cuando ambos estén verificados con aporte.
              </span>
            </div>

            {/* Buscador de Referidos */}
            <div className="glass-card p-3 rounded-2xl border border-emerald-500/20 bg-[#0A1812]/80 shadow-md">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, @usuario, correo o DNI..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-900/90 border border-emerald-500/20 rounded-xl text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={`skel-dir-${i}`} className="p-4 rounded-2xl bg-[#0A1812]/70 border border-emerald-500/10 animate-pulse flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20"></div>
                      <div className="space-y-2">
                        <div className="h-3.5 w-36 bg-emerald-500/20 rounded"></div>
                        <div className="h-3 w-28 bg-slate-800 rounded"></div>
                      </div>
                    </div>
                    <div className="h-7 w-28 bg-slate-800 rounded-xl"></div>
                  </div>
                ))}
              </div>
            ) : referidosFiltrados.length === 0 ? (
              <div className="text-center py-12 sm:py-16 glass-card rounded-3xl border border-emerald-500/20 bg-[#0A1812]/80 p-6 sm:p-8">
                <Users className="h-10 w-10 sm:h-12 sm:w-12 text-emerald-500/30 mx-auto mb-3" />
                <h3 className="text-base sm:text-lg font-bold text-white font-heading">No tienes referidos directos aún</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  {searchTerm 
                    ? `No se encontraron resultados para "${searchTerm}".` 
                    : 'Comparte tu ID o códigos de invitación para vincular nuevos socios a tu red y cobrar comisiones directas.'}
                </p>
              </div>
            ) : (
              referidosFiltrados.map((ref) => {
                const usuario = ref.usuario || {};
                const cleanPhone = (usuario.linea_whatsapp || usuario.linea_llamadas || '').replace(/[^0-9]/g, '');
                const isComisionPagada = ref.comision_pagada;
                const isReferidoVerificado = ref.referido_verificado;

                return (
                  <div
                    key={ref._id}
                    className="glass-card p-4 sm:p-5 rounded-2xl border border-emerald-500/20 bg-[#0A1812]/85 hover:border-emerald-500/40 transition-all shadow-md"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
                      {/* Información del Usuario */}
                      <div className="flex items-start sm:items-center gap-3 min-w-0">
                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center font-extrabold text-white text-sm sm:text-base shrink-0">
                          {usuario.nombre_completo ? usuario.nombre_completo.charAt(0).toUpperCase() : 'U'}
                        </div>

                        <div className="truncate flex-1">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            <h3 className="font-bold text-white text-xs sm:text-base truncate font-heading">
                              {usuario.nombre_completo || 'Socio Directo'}
                            </h3>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              @{usuario.nombre_usuario || 'usuario'}
                            </span>
                            <span className={`text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              isReferidoVerificado
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            }`}>
                              {isReferidoVerificado ? '✓ Aporte Verificado' : '⏳ Aporte Pendiente'}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] sm:text-xs text-slate-400">
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
                                className="inline-flex items-center gap-1 text-emerald-400 hover:underline font-semibold"
                              >
                                <MessageCircle className="h-3 w-3" />
                                <span>WhatsApp</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Estado de la Comisión */}
                      <div className="flex flex-col sm:items-end shrink-0 border-t sm:border-t-0 pt-2.5 sm:pt-0 border-emerald-500/10">
                        {isComisionPagada ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] sm:text-xs font-bold shadow-sm self-start sm:self-auto">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Comisión Pagada: COP $1,400</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] sm:text-xs font-bold shadow-sm self-start sm:self-auto">
                            <Clock className="h-3.5 w-3.5" />
                            <span>Comisión Pendiente: COP $1,400</span>
                          </div>
                        )}
                        <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1 max-w-xs sm:text-right leading-tight">
                          {ref.motivo_pendiente || (isComisionPagada ? 'Abonada a tu billetera' : 'Se liquidará automáticamente cuando ambos aportes estén validados')}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: SOLICITUDES RECIBIDAS / PENDIENTES */}
        {activeTab === 'recibidas' && (
          <div className="space-y-3.5">
            <div className="p-3 rounded-2xl bg-[#091C14] border border-emerald-500/20 text-xs text-slate-300 flex items-start sm:items-center gap-2.5 leading-relaxed">
              <UserPlus className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5 sm:mt-0" />
              <span>
                <strong>Solicitudes Pendientes:</strong> Socios que están a la espera de confirmación de patrocinio. Al aceptarlos y tener ambos aporte activo, <strong className="text-emerald-400">tú ganarás COP $1,400 por cada uno</strong>.
              </span>
            </div>

            {/* Barra de Aprobación Masiva */}
            {solicitudesRecibidas.filter(s => s.estado === 'pendiente').length > 0 && (
              <div className="p-3 rounded-2xl bg-[#0A1812]/80 border border-emerald-500/15 mb-3 flex flex-wrap items-center justify-between gap-2.5 text-xs">
                <button
                  onClick={toggleSelectAllRecibidas}
                  className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-bold transition-colors"
                >
                  {selectedSolicitudes.size === solicitudesRecibidas.filter(s => s.estado === 'pendiente').length ? (
                    <CheckSquare className="h-4 w-4" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                  <span>Seleccionar pendientes</span>
                </button>

                {selectedSolicitudes.size > 0 && (
                  <button
                    onClick={handleAceptarPorLote}
                    disabled={isProcessing}
                    className="py-1.5 px-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5 active:scale-98"
                  >
                    {isProcessing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                    <span>Aceptar ({selectedSolicitudes.size})</span>
                  </button>
                )}
              </div>
            )}

            {solicitudesRecibidas.length === 0 ? (
              <div className="text-center py-12 sm:py-16 glass-card rounded-3xl border border-emerald-500/20 bg-[#0A1812]/80 p-6 sm:p-8">
                <CheckCircle2 className="h-10 w-10 sm:h-12 sm:w-12 text-emerald-500/30 mx-auto mb-3" />
                <h3 className="text-base sm:text-lg font-bold text-white font-heading">No tienes solicitudes pendientes</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Aquí aparecerán los socios referidos pendientes de confirmación.
                </p>
              </div>
            ) : (
              solicitudesRecibidas.map((sol) => {
                const referido = sol.referido_id || {};
                const isPendiente = sol.estado === 'pendiente';
                const isAceptado = sol.estado === 'aceptado';
                const cleanPhone = (referido.linea_whatsapp || referido.linea_llamadas || '').replace(/[^0-9]/g, '');

                return (
                  <div
                    key={sol._id}
                    className="glass-card p-4 sm:p-5 rounded-2xl border border-emerald-500/20 bg-[#0A1812]/85 shadow-md"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
                      <div className="flex items-start sm:items-center gap-3 min-w-0">
                        {isPendiente && (
                          <button
                            onClick={() => toggleSelectSolicitud(sol._id)}
                            className="mt-0.5 sm:mt-0 p-1 text-emerald-400 hover:text-emerald-300"
                          >
                            {selectedSolicitudes.has(sol._id) ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5 text-slate-500" />}
                          </button>
                        )}

                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center font-extrabold text-white text-sm sm:text-base shrink-0">
                          {referido.nombre_completo ? referido.nombre_completo.charAt(0).toUpperCase() : 'U'}
                        </div>

                        <div className="truncate flex-1">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            <span className="text-[10px] font-semibold text-slate-400">Referido:</span>
                            <h3 className="font-bold text-white text-xs sm:text-base truncate font-heading">
                              {referido.nombre_completo || 'Usuario'}
                            </h3>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              @{referido.nombre_usuario || 'usuario'}
                            </span>
                            <span className={`text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              isAceptado 
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                                : isPendiente 
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            }`}>
                              {sol.estado.toUpperCase()}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] sm:text-xs text-slate-400">
                            {referido.dni && <span>DNI: <strong className="text-slate-300 font-normal">{referido.dni}</strong></span>}
                            {referido.correo_electronico && <span>{referido.correo_electronico}</span>}
                            {cleanPhone && (
                              <a href={`https://wa.me/${cleanPhone}`} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline font-semibold">
                                WhatsApp
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Acciones */}
                      {isPendiente && (
                        <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-emerald-500/10">
                          <button
                            onClick={() => handleCambiarEstado(sol._id, 'aceptado')}
                            className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-98"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Aceptar</span>
                          </button>
                          <button
                            onClick={() => handleCambiarEstado(sol._id, 'rechazado')}
                            className="px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-semibold transition-colors active:scale-98"
                          >
                            Rechazar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 3: SOLICITUDES ENVIADAS / MI PATROCINADOR */}
        {activeTab === 'enviadas' && (
          <div className="space-y-3.5">
            <div className="p-3 rounded-2xl bg-[#091C14] border border-emerald-500/20 text-xs text-slate-300 flex items-start sm:items-center gap-2.5 leading-relaxed">
              <ArrowRight className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5 sm:mt-0" />
              <span>
                <strong>Tu Patrocinador:</strong> El socio al cual te vinculaste como referido.
              </span>
            </div>

            {solicitudesEnviadas.length === 0 ? (
              <div className="text-center py-12 sm:py-16 glass-card rounded-3xl border border-emerald-500/20 bg-[#0A1812]/80 p-6 sm:p-8">
                <ArrowRight className="h-10 w-10 sm:h-12 sm:w-12 text-emerald-500/30 mx-auto mb-3" />
                <h3 className="text-base sm:text-lg font-bold text-white font-heading">No tienes patrocinador asignado</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Tu cuenta es patrocinador directo de tu propia red.
                </p>
              </div>
            ) : (
              solicitudesEnviadas.map((sol) => {
                const patrocinador = sol.solicitante_id || {};
                const isAceptado = sol.estado === 'aceptado';
                const isPendiente = sol.estado === 'pendiente';

                return (
                  <div
                    key={sol._id}
                    className="glass-card p-4 sm:p-5 rounded-2xl border border-emerald-500/20 bg-[#0A1812]/85 shadow-md"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center font-extrabold text-white text-sm sm:text-base shrink-0">
                          {patrocinador.nombre_completo ? patrocinador.nombre_completo.charAt(0).toUpperCase() : 'P'}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-semibold text-slate-400">Patrocinador:</span>
                            <h3 className="font-bold text-white text-xs sm:text-base font-heading">
                              {patrocinador.nombre_completo || 'Patrocinador'}
                            </h3>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              @{patrocinador.nombre_usuario || 'usuario'}
                            </span>
                          </div>
                          <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
                            {isPendiente 
                              ? `Pendiente de confirmación con @${patrocinador.nombre_usuario || 'tu patrocinador'}.` 
                              : `¡@${patrocinador.nombre_usuario || 'patrocinador'} es tu patrocinador activo!`}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            Fecha: {new Date(sol.fecha).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                      </div>

                      <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border self-start sm:self-auto ${
                        isAceptado 
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                          : isPendiente 
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      }`}>
                        {sol.estado.toUpperCase()}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>

      {/* Modal Agregar Referido */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0A1812] border border-emerald-500/30 rounded-3xl max-w-md w-full shadow-2xl p-6 sm:p-7">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2.5">
                <UserPlus className="h-5 w-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white font-heading">Agregar Nuevo Referido</h3>
              </div>
              <button 
                onClick={() => setShowInviteModal(false)}
                className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Ingresa el ID del nuevo socio para agregarlo bajo tu patrocinio directo en Granja Raíz de Vida.
            </p>

            <form onSubmit={handleCrearSolicitud} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">ID del Referido (Nuevo Socio)</label>
                <input
                  type="text"
                  placeholder="ID de MongoDB del socio a referir..."
                  value={referidoIdInput}
                  onChange={(e) => setReferidoIdInput(e.target.value)}
                  className="w-full p-3 bg-slate-900 border border-emerald-500/20 rounded-xl text-white text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs font-bold hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs transition-all shadow-md shadow-emerald-500/20"
                >
                  Vincular Referido
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <MobileNav />
    </div>
  );
};

export default ReferidosDirectos;