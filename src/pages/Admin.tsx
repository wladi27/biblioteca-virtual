import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { Background } from '../components/Background';
import { AdminNav } from '../components/AdminNav';
import { Link } from 'react-router-dom';
import { 
  Users, 
  CheckCircle2, 
  QrCode, 
  Wallet, 
  FileText, 
  RefreshCw, 
  Search, 
  ShieldCheck, 
  Sprout, 
  TrendingUp, 
  DollarSign, 
  Download, 
  KeyRound, 
  Layers, 
  Clock, 
  XCircle, 
  X, 
  Clipboard, 
  Check, 
  Loader2, 
  ArrowUpRight,
  User,
  Building2,
  Phone,
  Mail,
  CreditCard
} from 'lucide-react';

export const Admin = () => {
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [totalAportes, setTotalAportes] = useState(0);
  const [totalReferralCodes, setTotalReferralCodes] = useState(0);
  const [totalWithdrawals, setTotalWithdrawals] = useState(0);
  const [totalBilleteras, setTotalBilleteras] = useState(0);
  const [totalPublicaciones, setTotalPublicaciones] = useState(0);
  
  const [transacciones, setTransacciones] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingRetiros, setLoadingRetiros] = useState(true);
  const TRANSACTIONS_PER_PAGE = 10;
  
  const [busqueda, setBusqueda] = useState('');
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [transaccionSeleccionada, setTransaccionSeleccionada] = useState<any>(null);
  const [loadingUsuario, setLoadingUsuario] = useState(false);
  const [error, setError] = useState('');
  const [isCopied, setIsCopied] = useState<Record<string, boolean>>({});

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

  // Cargar métricas globales y retiros consolidados en 1 sola petición HTTP instantánea
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoadingRetiros(true);
        const apiUrl = getApiUrl();
        const response = await fetch(`${apiUrl}/api/summary/admin-dashboard`, {
          headers: getHeaders()
        });
        
        if (response.ok) {
          const data = await response.json();
          const metricas = data.metricas || {};
          setTotalUsuarios(metricas.totalUsuarios || 0);
          setTotalAportes(metricas.totalAportes || 0);
          setTotalReferralCodes(metricas.totalReferralCodes || 0);
          setTotalWithdrawals(metricas.totalWithdrawals || 0);
          setTotalBilleteras(metricas.totalBilleteras || 0);
          setTotalPublicaciones(metricas.totalPublicaciones || 0);

          const retirosArray = data.retiros || [];
          setTransacciones(retirosArray);
          setHasMore(data.paginacion?.hasMore || (retirosArray.length === TRANSACTIONS_PER_PAGE));
        }
      } catch (err: any) {
        console.error('Error cargando dashboard:', err);
        setError(err.message || 'Error al conectar con el servidor');
      } finally {
        setLoadingRetiros(false);
      }
    };

    fetchDashboardData();
  }, []);

  // 3. Paginación de retiros
  const loadMoreRetiros = useCallback(async () => {
    if (!hasMore || loadingMore) return;

    setLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const skip = nextPage * TRANSACTIONS_PER_PAGE;
      const apiUrl = getApiUrl();
      
      const retirosResponse = await fetch(
        `${apiUrl}/api/transacciones/retiros?limit=${TRANSACTIONS_PER_PAGE}&skip=${skip}`,
        { headers: getHeaders() }
      );
      
      if (retirosResponse.ok) {
        const data = await retirosResponse.json();
        const newRetiros = data.retiros || data;
        const retirosArray = Array.isArray(newRetiros) ? newRetiros : [];
        
        setTransacciones(prev => [...prev, ...retirosArray]);
        setHasMore(data.paginacion?.hasMore || (retirosArray.length === TRANSACTIONS_PER_PAGE));
        setCurrentPage(nextPage);
      }
    } catch (err) {
      console.error('Error cargando más retiros:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [currentPage, hasMore, loadingMore]);

  // Observer para scroll infinito
  const lastTransactionElementRef = useCallback((node: HTMLTableRowElement | null) => {
    if (loadingMore || loadingRetiros) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreRetiros();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loadingMore, loadingRetiros, hasMore, loadMoreRetiros]);

  // Obtener datos del usuario al abrir modal
  const obtenerDatosUsuario = useCallback(async (usuarioId: string, transaccion: any) => {
    try {
      setLoadingUsuario(true);
      if (!usuarioId || usuarioId === 'N/A') {
        throw new Error('ID de usuario no válido');
      }

      const apiUrl = getApiUrl();
      const usuarioResponse = await fetch(`${apiUrl}/usuarios/${usuarioId}`, { headers: getHeaders() });
      
      if (usuarioResponse.ok) {
        const usuarioData = await usuarioResponse.json();
        setUsuarioSeleccionado(usuarioData);
        setTransaccionSeleccionada(transaccion);
        setModalVisible(true);
        setError('');
      } else {
        const errorData = await usuarioResponse.json().catch(() => ({ message: 'Error al obtener usuario' }));
        throw new Error(errorData.message);
      }
    } catch (err: any) {
      console.error('Error cargando usuario:', err);
      alert(`Error al cargar datos del usuario: ${err.message}`);
    } finally {
      setLoadingUsuario(false);
    }
  }, []);

  const getUsuarioId = (transaccion: any) => {
    if (!transaccion || !transaccion.usuario_id) return 'N/A';
    if (typeof transaccion.usuario_id === 'object') {
      return transaccion.usuario_id._id || 'N/A';
    }
    return transaccion.usuario_id || 'N/A';
  };

  // Filtrar transacciones
  const transaccionesFiltradas = useMemo(() => {
    if (!busqueda.trim()) return transacciones;

    const searchTerm = busqueda.toLowerCase();
    return transacciones.filter(transaccion => {
      const usuarioId = getUsuarioId(transaccion);
      const descripcion = transaccion.descripcion || '';
      const estado = transaccion.estado || '';
      
      return (
        usuarioId.toString().toLowerCase().includes(searchTerm) ||
        descripcion.toLowerCase().includes(searchTerm) ||
        estado.toLowerCase().includes(searchTerm)
      );
    });
  }, [busqueda, transacciones]);

  const cerrarModal = () => {
    setModalVisible(false);
    setUsuarioSeleccionado(null);
    setTransaccionSeleccionada(null);
  };

  const copiarAlPortapapeles = (texto: string, key: string) => {
    if (!texto) return;
    navigator.clipboard.writeText(texto.toString()).then(() => {
      setIsCopied(prev => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setIsCopied(prev => ({ ...prev, [key]: false }));
      }, 2000);
    });
  };

  const cambiarEstadoTransaccion = async (nuevoEstado: string) => {
    if (!transaccionSeleccionada) return;

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(
        `${apiUrl}/api/transacciones/transacciones/${transaccionSeleccionada._id}`, 
        {
          method: 'PATCH',
          headers: getHeaders(),
          body: JSON.stringify({ estado: nuevoEstado }),
        }
      );

      if (response.ok) {
        setTransacciones(prev =>
          prev.map(t =>
            t._id === transaccionSeleccionada._id
              ? { ...t, estado: nuevoEstado }
              : t
          )
        );
        cerrarModal();
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Error' }));
        throw new Error(errorData.message);
      }
    } catch (err: any) {
      console.error('Error actualizando estado:', err);
      alert(`Error al actualizar estado: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#06110D] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      <Background />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex-grow w-full">
        {/* Banner Superior Administrativo */}
        <div className="relative rounded-3xl p-6 sm:p-8 mb-8 overflow-hidden border border-emerald-500/25 bg-gradient-to-r from-[#0B251B] via-[#091F17] to-[#071711] shadow-2xl shadow-emerald-950/40">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-3">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Panel de Control Administrativo</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-heading">
                Granja Raíz de Vida
              </h1>
              <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
                Supervisa el estado global de la co-inversión, valida aportes de nuevos socios, gestiona retiros y monitorea la matriz de 12 niveles.
              </p>
            </div>

            <div className="glass-card bg-[#06140F]/80 border border-emerald-500/30 p-4 sm:p-5 rounded-2xl flex items-center gap-4 shrink-0 shadow-lg">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/30">
                <Sprout className="h-8 w-8" />
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-emerald-400">Estado del Sistema</span>
                <p className="text-lg font-extrabold text-white font-heading">
                  Operativo al 100%
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Recarga diaria 7:00 AM Activa
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 6 Tarjetas de Métricas KPI */}
        {loadingRetiros && totalUsuarios === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={`skel-kpi-${i}`} className="glass-card p-5 rounded-2xl border border-emerald-500/10 bg-[#0A1812]/50 animate-pulse">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-3 w-16 bg-emerald-500/15 rounded-md"></div>
                  <div className="h-8 w-8 bg-emerald-500/15 rounded-xl"></div>
                </div>
                <div className="h-7 w-20 bg-emerald-500/20 rounded-lg mb-2"></div>
                <div className="h-2.5 w-14 bg-emerald-500/10 rounded-md"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            {/* 1. Total Usuarios */}
            <Link
              to="/BV/usuarios"
              className="glass-card p-5 rounded-2xl border border-emerald-500/20 bg-[#0A1812]/80 hover:border-emerald-500/40 hover:bg-[#0D2018] transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Inversionistas</span>
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
                  <Users className="h-4 w-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-white font-heading">{totalUsuarios}</p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-emerald-500/10 text-[11px] text-emerald-400">
                <span>Ver listado</span>
                <ArrowUpRight className="h-3 w-3" />
              </div>
            </Link>

          {/* 2. Total Aportes */}
          <Link
            to="/BV/aportes"
            className="glass-card p-5 rounded-2xl border border-emerald-500/20 bg-[#0A1812]/80 hover:border-emerald-500/40 hover:bg-[#0D2018] transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Aportes Validados</span>
              <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-white font-heading">{totalAportes}</p>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-emerald-500/10 text-[11px] text-emerald-400">
              <span>Ver aprobados</span>
              <ArrowUpRight className="h-3 w-3" />
            </div>
          </Link>

          {/* 3. Códigos Creados */}
          <Link
            to="/BV/codes"
            className="glass-card p-5 rounded-2xl border border-emerald-500/20 bg-[#0A1812]/80 hover:border-emerald-500/40 hover:bg-[#0D2018] transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Códigos Invitación</span>
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
                <QrCode className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-white font-heading">{totalReferralCodes}</p>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-emerald-500/10 text-[11px] text-emerald-400">
              <span>Ver todos</span>
              <ArrowUpRight className="h-3 w-3" />
            </div>
          </Link>

          {/* 4. Solicitudes de Retiro */}
          <Link
            to="/BV/retiros"
            className="glass-card p-5 rounded-2xl border border-emerald-500/20 bg-[#0A1812]/80 hover:border-emerald-500/40 hover:bg-[#0D2018] transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total Retiros</span>
              <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400 group-hover:scale-110 transition-transform">
                <Wallet className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-white font-heading">{totalWithdrawals}</p>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-emerald-500/10 text-[11px] text-emerald-400">
              <span>Gestionar</span>
              <ArrowUpRight className="h-3 w-3" />
            </div>
          </Link>

          {/* 5. Billeteras Activas */}
          <Link
            to="/BV/recarga"
            className="glass-card p-5 rounded-2xl border border-emerald-500/20 bg-[#0A1812]/80 hover:border-emerald-500/40 hover:bg-[#0D2018] transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Billeteras</span>
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
                <Layers className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-white font-heading">{totalBilleteras}</p>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-emerald-500/10 text-[11px] text-emerald-400">
              <span>Recargas</span>
              <ArrowUpRight className="h-3 w-3" />
            </div>
          </Link>

          {/* 6. Publicaciones */}
          <Link
            to="/BV/post"
            className="glass-card p-5 rounded-2xl border border-emerald-500/20 bg-[#0A1812]/80 hover:border-emerald-500/40 hover:bg-[#0D2018] transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Avisos y Posts</span>
              <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400 group-hover:scale-110 transition-transform">
                <FileText className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-white font-heading">{totalPublicaciones}</p>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-emerald-500/10 text-[11px] text-emerald-400">
              <span>Publicar</span>
              <ArrowUpRight className="h-3 w-3" />
            </div>
          </Link>
        </div>
      )}

        {/* Accesos Rápidos de Administración */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 font-heading">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block"></span>
            Módulos de Gestión Administrativa
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              to="/BV/validar"
              className="p-5 rounded-2xl bg-[#0A1812]/80 border border-emerald-500/25 hover:border-emerald-500/50 hover:bg-[#0D2018] transition-all flex items-center justify-between group shadow-lg"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">Validar Aportes Iniciales</p>
                  <p className="text-xs text-slate-400">Aprobar comprobantes de co-inversión</p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
            </Link>

            <Link
              to="/BV/recarga-masiva"
              className="p-5 rounded-2xl bg-[#0A1812]/80 border border-emerald-500/25 hover:border-emerald-500/50 hover:bg-[#0D2018] transition-all flex items-center justify-between group shadow-lg"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">Recarga Masiva Diaria</p>
                  <p className="text-xs text-slate-400">Abonos programados y rendimientos</p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
            </Link>

            <Link
              to="/BV/red"
              className="p-5 rounded-2xl bg-[#0A1812]/80 border border-emerald-500/25 hover:border-emerald-500/50 hover:bg-[#0D2018] transition-all flex items-center justify-between group shadow-lg"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">Red Global de Inversión</p>
                  <p className="text-xs text-slate-400">Árbol y matriz de 12 niveles</p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
            </Link>

            <Link
              to="/BV/comisiones"
              className="p-5 rounded-2xl bg-[#0A1812]/80 border border-emerald-500/25 hover:border-emerald-500/50 hover:bg-[#0D2018] transition-all flex items-center justify-between group shadow-lg"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform">
                  <DollarSign className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">Planes y Comisiones</p>
                  <p className="text-xs text-slate-400">Configurar pagos por rango</p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
            </Link>

            <Link
              to="/BV/descargar-datos"
              className="p-5 rounded-2xl bg-[#0A1812]/80 border border-emerald-500/25 hover:border-emerald-500/50 hover:bg-[#0D2018] transition-all flex items-center justify-between group shadow-lg"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform">
                  <Download className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">Descargar Reportes</p>
                  <p className="text-xs text-slate-400">Exportar Excel / CSV del sistema</p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
            </Link>

            <Link
              to="/BV/restaurar-password"
              className="p-5 rounded-2xl bg-[#0A1812]/80 border border-emerald-500/25 hover:border-emerald-500/50 hover:bg-[#0D2018] transition-all flex items-center justify-between group shadow-lg"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform">
                  <KeyRound className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">Restaurar Claves</p>
                  <p className="text-xs text-slate-400">Soporte y desbloqueo de usuarios</p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
            </Link>
          </div>
        </div>

        {/* Tabla Principal de Solicitudes de Retiro */}
        <div className="glass-card rounded-3xl border border-emerald-500/20 bg-[#0A1812]/80 overflow-hidden shadow-xl">
          <div className="p-6 sm:p-7 border-b border-emerald-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white font-heading">
                  Solicitudes de Retiro Bancario
                </h2>
                <p className="text-xs text-slate-400">
                  {transaccionesFiltradas.length} transacciones cargadas para revisión
                </p>
              </div>
            </div>

            {/* Buscador en Tiempo Real */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por ID de usuario o estado..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-emerald-500/20 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {loadingRetiros && transacciones.length === 0 ? (
              <div className="space-y-3 py-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={`skel-row-${i}`} className="p-4 rounded-2xl bg-slate-900/60 border border-emerald-500/10 flex items-center justify-between gap-4 animate-pulse">
                    <div className="h-4 w-28 bg-emerald-500/15 rounded-md font-mono"></div>
                    <div className="h-5 w-32 bg-emerald-500/20 rounded-md"></div>
                    <div className="h-6 w-20 bg-emerald-500/10 rounded-full"></div>
                    <div className="h-4 w-28 bg-slate-800 rounded-md"></div>
                    <div className="h-8 w-32 bg-emerald-500/15 rounded-xl"></div>
                  </div>
                ))}
              </div>
            ) : transaccionesFiltradas.length > 0 ? (
              <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                <table className="min-w-full divide-y divide-emerald-500/10">
                  <thead>
                    <tr className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
                      <th className="px-4 py-3 text-left">ID Usuario</th>
                      <th className="px-4 py-3 text-left">Monto</th>
                      <th className="px-4 py-3 text-left">Estado</th>
                      <th className="px-4 py-3 text-left">Fecha</th>
                      <th className="px-4 py-3 text-left">Descripción</th>
                      <th className="px-4 py-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-500/10">
                    {transaccionesFiltradas.map((transaccion, index) => {
                      const isLastItem = index === transaccionesFiltradas.length - 1;
                      const usuarioId = getUsuarioId(transaccion);
                      const isAprobado = transaccion.estado === 'aprobado';
                      const isPendiente = transaccion.estado === 'pendiente';

                      return (
                        <tr 
                          key={transaccion._id} 
                          className="hover:bg-emerald-500/5 transition-colors group"
                          ref={isLastItem ? lastTransactionElementRef : null}
                        >
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="font-mono text-emerald-300 font-bold text-xs">
                              {usuarioId}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="font-mono font-extrabold text-white text-sm">
                              COP ${transaccion.monto ? Number(transaccion.monto).toLocaleString('es-CO', { minimumFractionDigits: 2 }) : '0.00'}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                              isAprobado 
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                                : isPendiente
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}>
                              {isAprobado && <CheckCircle2 className="h-3 w-3" />}
                              {isPendiente && <Clock className="h-3 w-3" />}
                              {!isAprobado && !isPendiente && <XCircle className="h-3 w-3" />}
                              <span className="capitalize">{transaccion.estado}</span>
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-xs text-slate-400 font-mono">
                            {transaccion.fecha ? new Date(transaccion.fecha).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : 'N/A'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-xs text-slate-300">
                            {transaccion.descripcion || 'Retiro a cuenta bancaria'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-right">
                            <button
                              onClick={() => obtenerDatosUsuario(usuarioId, transaccion)}
                              disabled={loadingUsuario || usuarioId === 'N/A'}
                              className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs transition-all active:scale-95 disabled:opacity-50"
                            >
                              Ver Datos Bancarios
                            </button>
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
                  {busqueda ? 'No se encontraron retiros con ese criterio de búsqueda.' : 'No hay solicitudes de retiro registradas.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* MODAL: Datos del Usuario y Aprobación de Retiro */}
      {modalVisible && usuarioSeleccionado && transaccionSeleccionada && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0A1812] border border-emerald-500/30 rounded-3xl max-w-lg w-full shadow-2xl p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-emerald-500/20">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-heading">
                    {usuarioSeleccionado.nombre_completo || 'Datos de Inversionista'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    ID: <span className="font-mono text-emerald-300">{usuarioSeleccionado._id}</span>
                  </p>
                </div>
              </div>
              <button 
                onClick={cerrarModal}
                className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm mb-6">
              {/* Tarjeta de Retiro Solicitado */}
              <div className="p-4 rounded-2xl bg-[#0D2018] border border-emerald-500/25 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400">Monto del Retiro:</span>
                  <p className="text-2xl font-extrabold text-white font-mono">
                    COP ${Number(transaccionSeleccionada.monto || 0).toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 capitalize">
                  {transaccionSeleccionada.estado}
                </span>
              </div>

              {/* Datos Bancarios */}
              <div className="p-4 rounded-2xl bg-[#07130E] border border-emerald-500/20 space-y-3">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Cuenta de Destino
                </h4>
                
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Banco:</span>
                  <span className="font-bold text-white">{usuarioSeleccionado.banco || 'Bancolombia / Nequi'}</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Número de Cuenta:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-300">{usuarioSeleccionado.cuenta_numero || 'No especificada'}</span>
                    <button
                      onClick={() => copiarAlPortapapeles(usuarioSeleccionado.cuenta_numero, 'modal-acc')}
                      className="text-slate-400 hover:text-emerald-300"
                    >
                      {isCopied['modal-acc'] ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Clipboard className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Titular:</span>
                  <span className="font-medium text-white">{usuarioSeleccionado.titular_cuenta || usuarioSeleccionado.nombre_completo}</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Documento / Cédula:</span>
                  <span className="font-mono text-white">{usuarioSeleccionado.dni || 'No registrado'}</span>
                </div>
              </div>

              {/* Datos de Contacto */}
              <div className="p-4 rounded-2xl bg-[#07130E] border border-emerald-500/20 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">WhatsApp:</span>
                  <a 
                    href={`https://wa.me/${usuarioSeleccionado.linea_whatsapp || usuarioSeleccionado.linea_llamadas}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-400 hover:underline font-mono"
                  >
                    {usuarioSeleccionado.linea_whatsapp || usuarioSeleccionado.linea_llamadas || 'No registrado'}
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Correo:</span>
                  <span className="text-white">{usuarioSeleccionado.correo_electronico || 'No registrado'}</span>
                </div>
              </div>
            </div>

            {/* Acciones de Aprobación */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => cambiarEstadoTransaccion('rechazado')}
                className="py-3 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 font-bold text-xs transition-colors text-center"
              >
                Rechazar Retiro
              </button>
              <button
                onClick={() => cambiarEstadoTransaccion('aprobado')}
                className="py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs transition-all shadow-lg shadow-emerald-500/20 text-center"
              >
                Aprobar y Transferido
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