import React, { useEffect, useState, useCallback } from 'react';
import { Background } from '../components/Background';
import { MobileNav } from '../components/MobileNav';
import { Link } from 'react-router-dom';
import { 
  Wallet, 
  Award, 
  Users, 
  QrCode, 
  ArrowUpRight, 
  TrendingUp, 
  History, 
  Search, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Sprout, 
  ChevronRight, 
  Share2, 
  DollarSign, 
  HelpCircle, 
  MessageCircle,
  AlertCircle,
  ShieldCheck,
  Loader2,
  Sparkles
} from 'lucide-react';

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

interface RetiroItem {
  _id: string;
  monto: number;
  descripcion?: string;
  estado: 'aprobado' | 'pendiente' | 'rechazado' | string;
  fecha: string;
}

export const Dashboard = () => {
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  const [saldo, setSaldo] = useState<number>(0);
  const [nivelesCompletados, setNivelesCompletados] = useState<number>(0);
  const [totalDescendientes, setTotalDescendientes] = useState<number>(0);
  const [codigosCreados, setCodigosCreados] = useState<number>(0);
  const [retiros, setRetiros] = useState<RetiroItem[]>([]);
  const [filteredRetiros, setFilteredRetiros] = useState<RetiroItem[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingRetiros, setLoadingRetiros] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalRetiros, setTotalRetiros] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado real de aporte y verificación
  const [estadoAporte, setEstadoAporte] = useState<'verificado' | 'pendiente' | 'sin_aporte'>('sin_aporte');
  const [loadingAporte, setLoadingAporte] = useState(true);

  const LIMIT = 10;

  const fetchUserDataAndStats = async (id: string) => {
    const token = localStorage.getItem('token');
    const apiUrl = import.meta.env.VITE_URL_LOCAL || import.meta.env.VITE_API_URL || 'http://localhost:5005';
    const authHeaders = { Authorization: `Bearer ${token}` };
    setLoadingStats(true);

    try {
      await Promise.allSettled([
        // 1. Aporte status
        (async () => {
          try {
            const resAporte = await fetch(`${apiUrl}/api/aportes/estado/${id}`, { headers: authHeaders });
            if (resAporte.ok) {
              const dataAporte = await resAporte.json();
              setEstadoAporte(dataAporte.estado || (dataAporte.verificado ? 'verificado' : 'sin_aporte'));
            }
          } catch (e) {
            console.error('Error aporte:', e);
          } finally {
            setLoadingAporte(false);
          }
        })(),

        // 2. Saldo de billetera
        (async () => {
          try {
            const resWallet = await fetch(`${apiUrl}/api/billetera/wallet/${id}`, { headers: authHeaders });
            if (resWallet.ok) {
              const dataWallet = await resWallet.json();
              setSaldo(dataWallet.billetera?.saldo || dataWallet.saldo || 0);
            }
          } catch (e) {
            console.error('Error wallet:', e);
          }
        })(),

        // 3. Resumen de red y rango
        (async () => {
          try {
            const resRed = await fetch(`${apiUrl}/usuarios/piramide-red/${id}`, { headers: authHeaders });
            if (resRed.ok) {
              const dataRed = await resRed.json();
              setNivelesCompletados(dataRed.nivelesCompletados || 0);
              setTotalDescendientes(dataRed.piramide?.totalDescendientes || 0);
            }
          } catch (e) {
            console.error('Error red:', e);
          }
        })(),

        // 4. Códigos creados
        (async () => {
          try {
            const resCodes = await fetch(`${apiUrl}/api/referralCodes/user/${id}`, { headers: authHeaders });
            if (resCodes.ok) {
              const dataCodes = await resCodes.json();
              setCodigosCreados(Array.isArray(dataCodes) ? dataCodes.length : 0);
            }
          } catch (e) {
            console.error('Error codes:', e);
          }
        })()
      ]);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchRetiros = async (id: string, page = 0, isInitialLoad = false) => {
    if (isInitialLoad) {
      setLoadingRetiros(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_URL_LOCAL || import.meta.env.VITE_API_URL || 'http://localhost:5005';
      const skip = page * LIMIT;
      
      const response = await fetch(
        `${apiUrl}/api/transacciones/retiros/${id}?limit=${LIMIT}&skip=${skip}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.ok) {
        const data = await response.json();
        const nuevos = data.retiros || [];
        
        if (isInitialLoad) {
          setRetiros(nuevos);
          setFilteredRetiros(nuevos);
          setTotalRetiros(data.paginacion?.totalRetiros || nuevos.length);
          setHasMore(data.paginacion?.hasMore || false);
        } else {
          setRetiros(prev => [...prev, ...nuevos]);
          setFilteredRetiros(prev => [...prev, ...nuevos]);
          setTotalRetiros(data.paginacion?.totalRetiros || totalRetiros);
          setHasMore(data.paginacion?.hasMore || false);
        }
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error al obtener retiros:', error);
    } finally {
      setLoadingRetiros(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const raw = localStorage.getItem('usuario');
    if (raw) {
      try {
        const user = JSON.parse(raw);
        setUserName(user.nombre_completo || user.nombre_usuario || 'Inversionista');
        setUserId(user._id);
        fetchUserDataAndStats(user._id);
        fetchRetiros(user._id, 0, true);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (!val.trim()) {
      setFilteredRetiros(retiros);
    } else {
      const term = val.toLowerCase();
      setFilteredRetiros(
        retiros.filter(
          r =>
            r.descripcion?.toLowerCase().includes(term) ||
            r.monto?.toString().includes(term) ||
            r.estado?.toLowerCase().includes(term)
        )
      );
    }
  };

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
      if (scrollHeight - scrollTop <= clientHeight + 100) {
        if (!loadingMore && hasMore && userId) {
          fetchRetiros(userId, currentPage + 1, false);
        }
      }
    },
    [loadingMore, hasMore, currentPage, userId]
  );

  const handleAporteClick = async () => {
    if (!userId) return;
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_URL_LOCAL || import.meta.env.VITE_API_URL || 'http://localhost:5005';
      const response = await fetch(`${apiUrl}/api/aportes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ usuarioId: userId }),
      });

      if (response.ok) {
        setEstadoAporte('pendiente');
        const mensaje = `¡Hola! Deseo realizar mi aporte inicial en Granja Raíz de Vida. Mi usuario es: ${userName} (ID: ${userId}). ¿Podrías proporcionarme los datos de cuenta para la transferencia?`;
        const telefono = "+573137862938";
        window.open(`https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`, '_blank');
      }
    } catch (error) {
      console.error('Error al solicitar aporte:', error);
    }
  };

  const handleSubirComprobanteClick = () => {
    const mensaje = `Hola, adjunto mi comprobante de aporte para validar mi cuenta en Granja Raíz de Vida. Mi nombre: ${userName}, ID: ${userId}.`;
    const telefono = "+573137862938";
    window.open(`https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  const rangoActualNumero = nivelesCompletados > 0 ? nivelesCompletados : 1;
  const rangoActualNombre = nombresNiveles[rangoActualNumero] || 'Semilla';

  return (
    <div className="min-h-screen bg-[#06110D] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      <Background />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex-grow w-full">
        {/* Banner de Bienvenida y Perfil */}
        {loadingStats ? (
          <div className="relative rounded-3xl p-6 sm:p-8 mb-6 overflow-hidden border border-emerald-500/20 bg-gradient-to-r from-[#0B251B] via-[#091F17] to-[#071711] shadow-2xl animate-pulse">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="h-6 w-52 bg-emerald-500/20 rounded-full"></div>
                <div className="h-10 w-72 bg-emerald-500/30 rounded-xl"></div>
                <div className="h-4 w-96 max-w-full bg-slate-800 rounded"></div>
              </div>
              <div className="glass-card bg-[#06140F]/80 border border-emerald-500/30 p-5 rounded-2xl flex items-center gap-4 w-64 h-24 shrink-0">
                <div className="h-14 w-14 rounded-2xl bg-emerald-500/20"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-3 w-20 bg-emerald-500/20 rounded"></div>
                  <div className="h-5 w-32 bg-slate-700 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative rounded-3xl p-6 sm:p-8 mb-6 overflow-hidden border border-emerald-500/25 bg-gradient-to-r from-[#0B251B] via-[#091F17] to-[#071711] shadow-2xl shadow-emerald-950/40">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-3">
                  <Sprout className="h-3.5 w-3.5" />
                  <span>Panel Principal • Granja Raíz de Vida</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-heading">
                  ¡Hola, <span className="text-emerald-400">{userName}</span>!
                </h1>
                <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
                  Gestiona tus rendimientos productivos, supervisa el crecimiento de tu red y accede a retiros automáticos a tu cuenta bancaria.
                </p>
              </div>

              {/* Tarjeta de Rango Rápida */}
              <div className="glass-card bg-[#06140F]/80 border border-emerald-500/30 p-4 sm:p-5 rounded-2xl flex items-center gap-4 shrink-0 shadow-lg">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/30">
                  <Award className="h-8 w-8" />
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-emerald-400">Rango Agro-Productivo</span>
                  <p className="text-xl font-extrabold text-white font-heading">
                    Nivel {rangoActualNumero}: {rangoActualNombre}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {nivelesCompletados} de 12 niveles completos
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tarjeta de Estado de Verificación y Aporte */}
        <div className="mb-8">
          {loadingAporte || loadingStats ? (
            <div className="p-5 rounded-3xl bg-slate-900/60 border border-emerald-500/15 animate-pulse flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-11 w-11 rounded-2xl bg-emerald-500/20"></div>
                <div className="space-y-2">
                  <div className="h-4 w-48 bg-emerald-500/20 rounded"></div>
                  <div className="h-3 w-80 max-w-full bg-slate-800 rounded"></div>
                </div>
              </div>
              <div className="h-9 w-32 bg-slate-800 rounded-xl hidden sm:block"></div>
            </div>
          ) : estadoAporte === 'verificado' ? (
            <div className="p-5 rounded-3xl bg-[#0B2419]/90 border border-emerald-500/35 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-emerald-950/40">
              <div className="flex items-center gap-4">
                <div className="h-11 w-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-base">Inversionista Verificado</h3>
                    <span className="text-[10px] font-extrabold bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
                      Aporte Activo
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                    Tu cuenta y co-inversión están validadas. Tienes acceso completo a solicitar retiros bancarios y acumular rendimientos diarios.
                  </p>
                </div>
              </div>
              <Link
                to="/billetera"
                className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs transition-colors shrink-0 text-center"
              >
                Ver Mi Billetera
              </Link>
            </div>
          ) : estadoAporte === 'pendiente' ? (
            <div className="p-5 rounded-3xl bg-[#241B0B]/90 border border-amber-500/35 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="h-11 w-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-base">Aporte en Revisión Administrativa</h3>
                    <span className="text-[10px] font-extrabold bg-amber-500/25 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full">
                      Validación Pendiente
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                    Hemos registrado tu solicitud de aporte. Nuestro equipo revisará el comprobante para activar tu cuenta al 100%.
                  </p>
                </div>
              </div>
              <button
                onClick={handleSubirComprobanteClick}
                className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs transition-colors shrink-0 text-center flex items-center justify-center gap-1.5"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>Reenviar Comprobante</span>
              </button>
            </div>
          ) : (
            <div className="p-5 rounded-3xl bg-[#260F14]/90 border border-rose-500/35 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="h-11 w-11 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-base">Cuenta Sin Aporte Inicial</h3>
                    <span className="text-[10px] font-extrabold bg-rose-500/25 text-rose-300 border border-rose-500/40 px-2.5 py-0.5 rounded-full">
                      No Verificada
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                    Realiza tu aporte inicial para verificar tu cuenta de co-inversión y habilitar los retiros de fondos a tu cuenta bancaria.
                  </p>
                </div>
              </div>
              <button
                onClick={handleAporteClick}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/25 shrink-0 flex items-center justify-center gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Realizar Aporte Inicial</span>
              </button>
            </div>
          )}
        </div>

        {/* 4 Métricas Clave (KPIs) con Skeletons */}
        {loadingStats ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={`skel-user-kpi-${i}`} className="glass-card p-6 rounded-2xl border border-emerald-500/10 bg-[#0A1812]/70 animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-3 w-28 bg-emerald-500/20 rounded"></div>
                  <div className="h-10 w-10 bg-emerald-500/15 rounded-xl"></div>
                </div>
                <div className="h-8 w-36 bg-slate-800 rounded-lg mb-3"></div>
                <div className="pt-3 border-t border-emerald-500/10 flex justify-between items-center">
                  <div className="h-3 w-24 bg-slate-800/80 rounded"></div>
                  <div className="h-3 w-16 bg-emerald-500/20 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {/* 1. Saldo Disponible */}
            <div className="glass-card p-6 rounded-2xl border border-emerald-500/20 bg-[#0A1812]/80 hover:border-emerald-500/40 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Saldo Disponible</span>
                <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 group-hover:scale-110 transition-transform">
                  <Wallet className="h-5 w-5" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
                COP ${saldo.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-emerald-500/10 text-xs">
                <span className="text-slate-400">Actualizado al instante</span>
                <Link to="/billetera" className="text-emerald-400 hover:text-emerald-300 font-semibold inline-flex items-center gap-1">
                  Billetera <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* 2. Rango & Progreso */}
            <div className="glass-card p-6 rounded-2xl border border-emerald-500/20 bg-[#0A1812]/80 hover:border-emerald-500/40 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Nivel de Producción</span>
                <div className="p-2.5 rounded-xl bg-teal-500/15 text-teal-400 group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-white font-heading">
                {rangoActualNombre}
              </p>
              <div className="w-full bg-slate-900 rounded-full h-2 mt-3 overflow-hidden border border-emerald-500/10">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.max(8, (nivelesCompletados / 12) * 100)}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
                <span>{Math.round((nivelesCompletados / 12) * 100)}% completado</span>
                <Link to="/red" className="text-emerald-400 hover:text-emerald-300 font-semibold inline-flex items-center gap-1">
                  Ver Red <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* 3. Socios en tu Red */}
            <div className="glass-card p-6 rounded-2xl border border-emerald-500/20 bg-[#0A1812]/80 hover:border-emerald-500/40 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total en tu Red</span>
                <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 group-hover:scale-110 transition-transform">
                  <Users className="h-5 w-5" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
                {totalDescendientes} <span className="text-sm font-normal text-slate-400">socios</span>
              </p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-emerald-500/10 text-xs">
                <span className="text-emerald-400 font-medium">Matriz Ternaria Activa</span>
                <Link to="/red" className="text-emerald-400 hover:text-emerald-300 font-semibold inline-flex items-center gap-1">
                  Estructura <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* 4. Códigos de Invitación */}
            <div className="glass-card p-6 rounded-2xl border border-emerald-500/20 bg-[#0A1812]/80 hover:border-emerald-500/40 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Códigos Activos</span>
                <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 group-hover:scale-110 transition-transform">
                  <QrCode className="h-5 w-5" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
                {codigosCreados} <span className="text-sm font-normal text-slate-400">disponibles</span>
              </p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-emerald-500/10 text-xs">
                <span className="text-slate-400">Para nuevos referidos</span>
                <Link to="/perfil" className="text-emerald-400 hover:text-emerald-300 font-semibold inline-flex items-center gap-1">
                  Gestionar <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Acciones Rápidas */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block"></span>
            Accesos Rápidos
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <Link
              to="/billetera"
              className="p-4 rounded-2xl bg-[#0A1812]/70 border border-emerald-500/20 hover:border-emerald-500/40 hover:bg-[#0D2018] transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">Billetera Digital</p>
                  <p className="text-xs text-slate-400">Retirar o consultar saldo</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </Link>

            <Link
              to="/red"
              className="p-4 rounded-2xl bg-[#0A1812]/70 border border-emerald-500/20 hover:border-emerald-500/40 hover:bg-[#0D2018] transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">Mi Red de Socios</p>
                  <p className="text-xs text-slate-400">Explorar los 12 niveles</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </Link>

            <Link
              to="/comisiones"
              className="p-4 rounded-2xl bg-[#0A1812]/70 border border-emerald-500/20 hover:border-emerald-500/40 hover:bg-[#0D2018] transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">Mis Comisiones</p>
                  <p className="text-xs text-slate-400">Historial por nivel</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </Link>

            <Link
              to="/referidos-directos"
              className="p-4 rounded-2xl bg-[#0A1812]/70 border border-emerald-500/20 hover:border-emerald-500/40 hover:bg-[#0D2018] transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">Referidos Directos</p>
                  <p className="text-xs text-slate-400">Comisiones de $1,400</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </Link>

            <Link
              to="/perfil"
              className="p-4 rounded-2xl bg-[#0A1812]/70 border border-emerald-500/20 hover:border-emerald-500/40 hover:bg-[#0D2018] transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <QrCode className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">Mi Perfil y Códigos</p>
                  <p className="text-xs text-slate-400">Datos bancarios e invitar</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        </div>

        {/* Historial de Retiros */}
        <div className="glass-card rounded-3xl border border-emerald-500/20 bg-[#0A1812]/80 overflow-hidden shadow-xl">
          <div className="p-6 sm:p-7 border-b border-emerald-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                <History className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white font-heading">
                  Historial de Retiros
                </h2>
                <p className="text-xs text-slate-400">
                  {filteredRetiros.length} de {totalRetiros} transacciones registradas
                </p>
              </div>
            </div>

            {/* Buscador de Retiros */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar retiro o estado..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 bg-slate-900/90 border border-emerald-500/20 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          {/* Tabla de Retiros */}
          <div className="p-4 sm:p-6">
            {loadingRetiros && currentPage === 0 ? (
              <div className="space-y-3 py-2 animate-pulse">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={`skel-ret-${i}`} className="p-4 rounded-xl bg-[#07130E] border border-emerald-500/10 flex items-center justify-between">
                    <div className="space-y-1.5">
                      <div className="h-4 w-32 bg-emerald-500/20 rounded"></div>
                      <div className="h-3 w-48 bg-slate-800 rounded"></div>
                    </div>
                    <div className="h-6 w-20 bg-slate-800 rounded-full"></div>
                  </div>
                ))}
              </div>
            ) : filteredRetiros.length > 0 ? (
              <div 
                className="overflow-x-auto max-h-[420px] overflow-y-auto"
                onScroll={handleScroll}
              >
                <table className="min-w-full divide-y divide-emerald-500/10">
                  <thead>
                    <tr className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
                      <th className="px-4 py-3 text-left">Monto</th>
                      <th className="px-4 py-3 text-left">Detalle</th>
                      <th className="px-4 py-3 text-left">Estado</th>
                      <th className="px-4 py-3 text-right">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-500/10">
                    {filteredRetiros.map((retiro) => {
                      const isAprobado = retiro.estado === 'aprobado';
                      const isPendiente = retiro.estado === 'pendiente';
                      return (
                        <tr key={retiro._id} className="hover:bg-emerald-500/5 transition-colors group">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="font-mono font-bold text-white text-sm">
                              COP ${retiro.monto?.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-300">
                            {retiro.descripcion || 'Retiro a cuenta bancaria'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                              isAprobado 
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                                : isPendiente
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}>
                              {isAprobado && <CheckCircle2 className="h-3 w-3" />}
                              {isPendiente && <Clock className="h-3 w-3" />}
                              {!isAprobado && !isPendiente && <XCircle className="h-3 w-3" />}
                              <span className="capitalize">{retiro.estado}</span>
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-right text-xs text-slate-400 font-mono">
                            {new Date(retiro.fecha).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {loadingMore && (
                  <div className="py-4 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-emerald-400" />
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-400 text-sm">
                  {searchTerm ? 'No se encontraron registros que coincidan con la búsqueda.' : 'No tienes retiros registrados todavía.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <br /><br />
      <MobileNav />
    </div>
  );
};