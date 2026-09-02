"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Clipboard,
  CheckCircle2,
  Loader2,
  Filter,
  Search,
  Wallet,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  MessageCircle,
} from "lucide-react";
import { Background } from "../components/Background";
import { MobileNav } from "../components/MobileNav";
import { RetirarDineroModal } from "../components/RetirarDinero";

export default function WalletApp() {
  const [balance, setBalance] = useState(0);
  const [billeteraActiva, setBilleteraActiva] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [walletId, setWalletId] = useState("");
  const [copied, setCopied] = useState(false);
  const [historial, setHistorial] = useState<any[]>([]);
  const [filtro, setFiltro] = useState<"todos" | "ingresos" | "gastos">("todos");
  const [busqueda, setBusqueda] = useState("");
  const [showRetirarModal, setShowRetirarModal] = useState(false);
  const [tasaCambio, setTasaCambio] = useState(0);
  const [loadingTasa, setLoadingTasa] = useState(true);
  const [pagina, setPagina] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  // Obtener tasa de cambio USD/COP
  const obtenerTasaCambio = async () => {
    setLoadingTasa(true);
    try {
      const apiUrl = import.meta.env.VITE_URL_LOCAL || import.meta.env.VITE_API_URL || 'http://localhost:5005';
      const response = await fetch(`${apiUrl}/api/dolar`);
      if (response.ok) {
        const data = await response.json();
        setTasaCambio(data.value || 0);
      }
    } catch (error) {
      console.error("Error al obtener tasa de cambio:", error);
    } finally {
      setLoadingTasa(false);
    }
  };

  const convertirADolares = (saldo: number) => {
    if (tasaCambio === 0) return 0;
    return saldo / tasaCambio;
  };

  const formatearSaldoUSD = (saldo: number) => {
    const dolares = convertirADolares(saldo);
    return dolares.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const obtenerHistorialTransacciones = async (usuarioId: string, page = 1, isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoadingHistorial(true);
    }

    try {
      const token = localStorage.getItem("token");
      const apiUrl = import.meta.env.VITE_URL_LOCAL || import.meta.env.VITE_API_URL || 'http://localhost:5005';
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: "10"
      });

      if (busqueda) {
        queryParams.append("search", busqueda);
      }

      const response = await fetch(
        `${apiUrl}/api/transacciones/transacciones/${usuarioId}?${queryParams}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        const nuevasTransacciones = data.transacciones || [];
        
        if (isLoadMore) {
          setHistorial(prev => [...prev, ...nuevasTransacciones]);
        } else {
          setHistorial(nuevasTransacciones);
        }

        setHasMore(data.paginacion?.hasMore || false);
        setPagina(page);
      }
    } catch (error) {
      console.error("Error al obtener historial:", error);
    } finally {
      setLoadingHistorial(false);
      setLoadingMore(false);
    }
  };

  const obtenerDatosBilletera = async (usuarioId: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const apiUrl = import.meta.env.VITE_URL_LOCAL || import.meta.env.VITE_API_URL || 'http://localhost:5005';
      const response = await fetch(`${apiUrl}/api/billetera/wallet/${usuarioId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setBalance(data.billetera?.saldo || data.saldo || 0);
        setBilleteraActiva(data.billetera?.activa !== false);
        setWalletId(data.billetera?._id || "");
      } else {
        setError("Error al cargar la información de la billetera");
      }
    } catch (err) {
      console.error("Error al conectar con el servidor:", err);
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleBuscar = async (e: React.FormEvent) => {
    e.preventDefault();
    setPagina(1);
    setHasMore(true);
    setHistorial([]);
    await obtenerHistorialTransacciones(userId, 1, false);
  };

  const copiarAlPortapapeles = () => {
    if (userId) {
      navigator.clipboard.writeText(userId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const transaccionesFiltradas = historial.filter((t) => {
    if (filtro === "ingresos") return t.tipo !== "retiro" && t.tipo !== "envio";
    if (filtro === "gastos") return t.tipo === "retiro" || t.tipo === "envio";
    return true;
  });

  const formatearFecha = (fechaISO: string) => {
    try {
      return new Date(fechaISO).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
    } catch {
      return fechaISO;
    }
  };

  const formatearHora = (fechaISO: string) => {
    try {
      return new Date(fechaISO).toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  useEffect(() => {
    const raw = localStorage.getItem("usuario");
    if (raw) {
      try {
        const user = JSON.parse(raw);
        setUserId(user._id);
        setUserName(user.nombre_completo || user.nombre_usuario || "Inversionista");
        obtenerDatosBilletera(user._id);
        obtenerHistorialTransacciones(user._id, 1, false);
      } catch (e) {
        console.error(e);
      }
    }
    obtenerTasaCambio();
  }, []);

  return (
    <div className="min-h-screen bg-[#06110D] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      <Background />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow w-full">
        {/* Cabecera de Billetera con Skeleton */}
        {loading ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-pulse">
            <div className="space-y-2">
              <div className="h-5 w-44 bg-emerald-500/20 rounded-full"></div>
              <div className="h-8 w-64 bg-slate-700 rounded-xl"></div>
              <div className="h-4 w-80 max-w-full bg-slate-800 rounded"></div>
            </div>
            <div className="h-8 w-36 bg-emerald-500/20 rounded-full"></div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Billetera Agro-Digital</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-heading">
                Mi Billetera y Fondos
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Gestiona tus rendimientos acumulados, solicita retiros bancarios y consulta tus movimientos.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Billetera Activa
              </span>
            </div>
          </div>
        )}

        {/* Tarjeta Principal de Balance con Skeleton */}
        {loading ? (
          <div className="relative rounded-3xl p-6 sm:p-8 mb-8 overflow-hidden border border-emerald-500/20 bg-gradient-to-br from-[#0B251B] via-[#091F17] to-[#071711] shadow-2xl animate-pulse">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-6">
              <div className="space-y-3">
                <div className="h-4 w-40 bg-emerald-500/20 rounded"></div>
                <div className="h-12 w-64 bg-slate-700 rounded-xl"></div>
                <div className="h-4 w-52 bg-slate-800 rounded"></div>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-emerald-500/20"></div>
            </div>
            <div className="pt-6 border-t border-emerald-500/15 flex justify-between items-center">
              <div className="h-8 w-48 bg-slate-800 rounded-xl"></div>
              <div className="h-10 w-44 bg-emerald-500/20 rounded-xl"></div>
            </div>
          </div>
        ) : (
          <div className="relative rounded-3xl p-6 sm:p-8 mb-8 overflow-hidden border border-emerald-500/30 bg-gradient-to-br from-[#0B251B] via-[#091F17] to-[#071711] shadow-2xl shadow-emerald-950/50">
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>

            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-6">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300 block mb-1">
                    Saldo Total Disponible
                  </span>
                  <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-mono tracking-tight">
                    COP ${balance.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h2>
                  {tasaCambio > 0 && (
                    <p className="text-slate-300 text-xs sm:text-sm mt-2 font-medium">
                      ≈ {formatearSaldoUSD(balance)} USD • <span className="text-slate-400">TRM Ref: 1 USD = ${tasaCambio.toLocaleString("es-CO")} COP</span>
                    </p>
                  )}
                </div>

                <div className="h-14 w-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <Wallet className="h-7 w-7" />
                </div>
              </div>

              {/* Fila inferior: ID de cuenta y Botón de Retiro */}
              <div className="pt-6 border-t border-emerald-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 bg-[#05110D]/70 border border-emerald-500/20 rounded-xl px-3.5 py-2">
                  <span className="text-xs text-slate-400">ID de Cuenta:</span>
                  <span className="font-mono text-xs font-bold text-white truncate max-w-[140px] sm:max-w-[200px]">{userId}</span>
                  <button
                    onClick={copiarAlPortapapeles}
                    className="p-1 rounded text-emerald-400 hover:text-emerald-300 hover:bg-white/5 transition-colors ml-1"
                    title="Copiar ID"
                  >
                    {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <Clipboard className="h-3.5 w-3.5" />}
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowRetirarModal(true)}
                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/25"
                  >
                    <ArrowDownLeft className="h-4 w-4" />
                    <span>Solicitar Retiro Bancario</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Historial de Transacciones */}
        <div className="glass-card rounded-3xl border border-emerald-500/20 bg-[#0A1812]/80 overflow-hidden shadow-xl">
          <div className="p-6 sm:p-7 border-b border-emerald-500/15 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white font-heading">
                Movimientos de Cuenta
              </h2>
              <p className="text-xs text-slate-400">
                Historial de rendimientos, recargas y retiros
              </p>
            </div>

            {/* Filtros de Ingresos / Gastos */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setFiltro("todos")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filtro === "todos"
                    ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                    : "bg-slate-900/80 text-slate-400 hover:text-white border border-emerald-500/10"
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFiltro("ingresos")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filtro === "ingresos"
                    ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                    : "bg-slate-900/80 text-slate-400 hover:text-white border border-emerald-500/10"
                }`}
              >
                Rendimientos
              </button>
              <button
                onClick={() => setFiltro("gastos")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filtro === "gastos"
                    ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                    : "bg-slate-900/80 text-slate-400 hover:text-white border border-emerald-500/10"
                }`}
              >
                Retiros
              </button>
            </div>
          </div>

          {/* Lista de Transacciones con Skeletons */}
          <div className="p-4 sm:p-6">
            {loadingHistorial || loading ? (
              <div className="space-y-3 py-2 animate-pulse">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={`skel-tx-${i}`} className="p-4 rounded-2xl bg-[#07130E] border border-emerald-500/10 flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20"></div>
                      <div className="space-y-1.5">
                        <div className="h-4 w-40 bg-emerald-500/20 rounded"></div>
                        <div className="h-3 w-28 bg-slate-800 rounded"></div>
                      </div>
                    </div>
                    <div className="h-6 w-24 bg-slate-700 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : transaccionesFiltradas.length > 0 ? (
              <div className="space-y-3">
                {transaccionesFiltradas.map((t) => {
                  const esIngreso = t.tipo !== "retiro" && t.tipo !== "envio";
                  const monto = Number(t.monto?.$numberDecimal || t.monto || 0);

                  return (
                    <div
                      key={t._id}
                      className="p-4 rounded-2xl bg-[#0D2018]/60 border border-emerald-500/15 hover:border-emerald-500/30 transition-all flex items-center justify-between gap-4 group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 ${
                          esIngreso
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        }`}>
                          {esIngreso ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                        </div>
                        <div className="truncate">
                          <p className="font-bold text-white text-sm truncate group-hover:text-emerald-300 transition-colors">
                            {t.descripcion || (esIngreso ? "Rendimiento acreditado" : "Retiro bancario")}
                          </p>
                          <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5 font-mono">
                            <span>{formatearFecha(t.fecha || t.createdAt)}</span>
                            <span>•</span>
                            <span>{formatearHora(t.fecha || t.createdAt)}</span>
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`text-base sm:text-lg font-extrabold font-mono ${
                          esIngreso ? "text-emerald-400" : "text-amber-400"
                        }`}>
                          {esIngreso ? "+" : "-"}COP ${monto.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">
                          {t.estado || "Completado"}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {hasMore && (
                  <div className="pt-4 text-center">
                    <button
                      onClick={() => obtenerHistorialTransacciones(userId, pagina + 1, true)}
                      disabled={loadingMore}
                      className="px-5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs transition-colors"
                    >
                      {loadingMore ? "Cargando más..." : "Cargar más transacciones"}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-400 text-sm">No hay transacciones registradas en este filtro.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal de Retiro */}
      {showRetirarModal && (
        <RetirarDineroModal
          saldoDisponible={balance}
          onClose={() => setShowRetirarModal(false)}
          onSuccess={() => {
            setShowRetirarModal(false);
            if (userId) {
              obtenerDatosBilletera(userId);
              obtenerHistorialTransacciones(userId, 1, false);
            }
          }}
        />
      )}

      <br /><br />
      <MobileNav />
    </div>
  );
}
