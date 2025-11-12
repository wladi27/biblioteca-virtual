"use client";

import React, { useEffect, useState } from "react";
import { apiGet, apiPost } from "../lib/api";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Clipboard,
  Loader2,
  Filter,
  Search,
  RefreshCw,
} from "lucide-react";
import { Background } from "../components/Background";
import { MobileNav } from "../components/MobileNav";
import { EnviarDineroModal } from "../components/EnviarDinero";
import { RetirarDineroModal } from "../components/RetirarDinero";

export default function WalletApp() {
  const [balance, setBalance] = useState(0);
  const [billeteraActiva, setBilleteraActiva] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState("");
  const [walletId, setWalletId] = useState("");
  const [copied, setCopied] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [filtro, setFiltro] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [showEnviarModal, setShowEnviarModal] = useState(false);
  const [showRetirarModal, setShowRetirarModal] = useState(false);
  const [tasaCambio, setTasaCambio] = useState(0);
  const [loadingTasa, setLoadingTasa] = useState(true);

  // Nuevos estados para la paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalTransacciones, setTotalTransacciones] = useState(0);
  const [transaccionesPorPagina] = useState(20); // O el número que prefieras


  // Función para obtener la tasa de cambio
  const obtenerTasaCambio = async () => {
    setLoadingTasa(true);
    try {
      const data = await apiGet(`${import.meta.env.VITE_URL_LOCAL}/api/dolar`);
      if (data && data.value) setTasaCambio(data.value);
    } catch (error) {
      console.error("Error al obtener tasa de cambio:", error);
    } finally {
      setLoadingTasa(false);
    }
  };

  // Convertir el saldo a dólares
  const convertirADolares = (saldo) => {
    if (tasaCambio === 0) return 0;
    return saldo / tasaCambio;
  };

  // Formatear el saldo según la moneda seleccionada
  const formatearSaldo = (saldo) => {
    const dolares = convertirADolares(saldo);
    return dolares.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  useEffect(() => {
    const usuario = localStorage.getItem("usuario");
    if (usuario) {
      const userData = JSON.parse(usuario);
      setUserId(userData._id);
      verificarBilletera(userData._id);
      obtenerSaldoUsuario(userData._id);
      obtenerHistorialTransacciones(userData._id, 1); // Carga la primera página
      obtenerTasaCambio();
    } else {
      setLoading(false);
    }
  }, []);

  const verificarBilletera = async (usuarioId) => {
    try {
      const data = await apiGet(`${import.meta.env.VITE_URL_LOCAL}/api/billetera/estado/${usuarioId}`);
      setBilleteraActiva(data.activa);
      if (data.activa) {
        obtenerDatosBilletera(usuarioId);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const obtenerDatosBilletera = async (usuarioId) => {
    try {
      const data = await apiGet(`${import.meta.env.VITE_URL_LOCAL}/api/billetera/wallet/${usuarioId}`);
      if (data) setWalletId(data._id);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const obtenerSaldoUsuario = async (usuarioId) => {
    try {
      const data = await apiGet(`${import.meta.env.VITE_URL_LOCAL}/usuarios/saldo/${usuarioId}`);
      if (data && typeof data.saldo !== 'undefined') setBalance(data.saldo);
    } catch (error) {
      console.error("Error al obtener el saldo:", error);
    }
  };

  const obtenerHistorialTransacciones = async (usuarioId, pagina = 1) => {
    try {
      const skip = (pagina - 1) * transaccionesPorPagina;
      const url = `${import.meta.env.VITE_URL_LOCAL}/api/transacciones/transacciones/${usuarioId}?limit=${transaccionesPorPagina}&skip=${skip}`;
      const data = await apiGet(url);
      
      if (data && data.transacciones) {
        // Si es la primera página, reemplaza el historial. Si no, añade las nuevas.
        setHistorial(pagina === 1 ? data.transacciones : [...historial, ...data.transacciones]);
        setTotalTransacciones(data.total);
        setPaginaActual(pagina); // Actualiza la página actual
      }
    } catch (error) {
      console.error("Error al obtener el historial de transacciones:", error);
    }
  };

  const activarBilletera = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await apiPost(`${import.meta.env.VITE_URL_LOCAL}/api/billetera/activar`);
      // Si no hubo error el backend devuelve 201 y la billetera creada
      const userData = JSON.parse(localStorage.getItem("usuario"));
      setBilleteraActiva(true);
      obtenerDatosBilletera(userData._id);
    } catch (error) {
      setError("Error al activar la billetera. Inténtalo de nuevo.");
      console.error("Error al activar la billetera:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnviarDinero = async ({ destinatarioId, monto, notas }) => {
    try {
      const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
      await apiPost(`${import.meta.env.VITE_URL_LOCAL}/api/billetera/enviar`, { destinatario_id: destinatarioId, monto, notas });
      await obtenerSaldoUsuario(usuario._id);
      setPaginaActual(1); // Resetea la paginación
      await obtenerHistorialTransacciones(usuario._id, 1); // Recarga el historial
    } catch (error) {
      // Si el helper detecta 401 ya habrá forzado logout
      throw error;
    }
  };

  const handleRetirarDinero = async ({ monto, notas }) => {
    try {
      const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
      await apiPost(`${import.meta.env.VITE_URL_LOCAL}/api/billetera/retirar`, { monto, notas });
      await obtenerSaldoUsuario(usuario._id);
      setPaginaActual(1); // Resetea la paginación
      await obtenerHistorialTransacciones(usuario._id, 1); // Recarga el historial
    } catch (error) {
      throw error;
    }
  };

  const copiarAlPortapapeles = () => {
    if (userId) {
      navigator.clipboard
        .writeText(userId)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch((err) => {
          console.error("Error al copiar: ", err);
        });
    }
  };

  const obtenerTamañoFuenteSaldo = (saldo) => {
    const longitud = saldo.toString().length;
    return `${Math.max(2.5 - longitud * 0.1, 1.2)}rem`;
  };

  const filtrarTransacciones = () => {
    let transaccionesFiltradas = [...historial];

    if (filtro !== "todos") {
      transaccionesFiltradas = transaccionesFiltradas.filter((t) => {
        if (filtro === "ingresos") {
          return t.tipo === "recarga" || t.tipo === "recibido";
        }
        if (filtro === "gastos") {
          return t.tipo === "retiro" || t.tipo === "envio";
        }
        return true;
      });
    }

    if (busqueda) {
      const termino = busqueda.toLowerCase();
      transaccionesFiltradas = transaccionesFiltradas.filter((t) =>
        t.descripcion.toLowerCase().includes(termino)
      );
    }

    return transaccionesFiltradas;
  };

  const formatearFecha = (fechaISO) => {
    const opciones = { day: "2-digit", month: "short", year: "numeric" };
    return new Date(fechaISO).toLocaleDateString("es-ES", opciones);
  };

  const formatearHora = (fechaISO) => {
    return new Date(fechaISO).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading || loadingTasa) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-500" />
          <p className="mt-4">Cargando información de tu billetera...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col text-white">
      <Background />

      <main className="flex-grow container max-w-md mx-auto px-4 py-8">
        {/* Encabezado */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Mi Billetera</h1>
            <p className="text-gray-400">
              Administra tus fondos y transacciones
            </p>
          </div>
          <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
            <CreditCard className="h-5 w-5" />
          </div>
        </div>

        {!billeteraActiva ? (
          /* Tarjeta de activación */
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl overflow-hidden border border-gray-700 mb-6">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Activa tu billetera</h2>
                  <p className="text-gray-400 text-sm">
                    Para comenzar a realizar transacciones
                  </p>
                </div>
              </div>

              <p className="text-gray-300 mb-6">
                Tu billetera no está activada. Actívala ahora para empezar a
                enviar y recibir pagos.
              </p>

              <button
                onClick={activarBilletera}
                disabled={loading}
                className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Activando...
                  </>
                ) : (
                  "Activar Billetera"
                )}
              </button>

              {error && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Billetera activa */
          <>
            {/* Tarjeta de balance - Mejorada */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl overflow-hidden border border-gray-700 mb-6 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/10 opacity-30"></div>
              <div className="relative z-10 p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-gray-400 text-sm">Balance disponible</p>
                    <div className="flex items-center gap-2">
                      <h2
                        className="font-bold mt-1"
                        style={{ fontSize: obtenerTamañoFuenteSaldo(balance) }}
                      >
                        {formatearSaldo(balance)}
                      </h2>
                    </div>
                    {tasaCambio > 0 && (
                      <p className="text-gray-400 text-xs mt-1">
                        Tasa: 1 USD = {tasaCambio.toLocaleString("es-CO")} COP
                      </p>
                    )}
                  </div>
                  <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-green-400" />
                  </div>
                </div>

                {/* ID de usuario - Mejorado */}
                <div className="bg-gray-800/50 rounded-lg p-4 mb-6 border border-gray-700/50">
                  <p className="text-gray-400 text-sm mb-2">ID de tu Wallet</p>
                  <div className="flex items-center justify-between bg-gray-900/30 rounded px-3 py-2">
                    <p className="font-mono text-sm truncate">{userId}</p>
                    <button
                      onClick={copiarAlPortapapeles}
                      className="text-blue-400 hover:text-blue-300 transition-colors ml-2 flex items-center"
                      title="Copiar ID"
                    >
                      {copied ? (
                        <span className="text-green-400 text-xs">¡Copiado!</span>
                      ) : (
                        <>
                          <Clipboard className="h-4 w-4" />
                          <span className="sr-only">Copiar ID</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Botones de acción - Mejorados */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setShowEnviarModal(true)}
                    className="bg-blue-600/90 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors shadow-md"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                    Enviar
                  </button>
                  <button
                    onClick={() => setShowRetirarModal(true)}
                    className="bg-purple-600/90 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors shadow-md"
                  >
                    <ArrowDownLeft className="h-4 w-4" />
                    Retirar
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <ArrowUpRight className="h-5 w-5 text-gray-400" />
                  Historial de transacciones
                </h3>
                <div className="relative">
                  <button
                    onClick={() =>
                      setFiltro(
                        filtro === "todos"
                          ? "ingresos"
                          : filtro === "ingresos"
                          ? "gastos"
                          : "todos"
                      )
                    }
                    className="flex items-center gap-1 text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-full transition-colors"
                  >
                    <Filter className="h-4 w-4" />
                    <span>
                      {filtro === "todos"
                        ? "Todos"
                        : filtro === "ingresos"
                        ? "Ingresos"
                        : "Gastos"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Barra de búsqueda */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar transacciones..."
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>

              {/* Lista de transacciones - Diseño mejorado */}
              <div className="space-y-3">
                {filtrarTransacciones().length === 0 ? (
                  <div className="text-center py-8 text-gray-500 bg-gray-700/30 rounded-lg">
                    <p>No se encontraron transacciones</p>
                  </div>
                ) : (
                  filtrarTransacciones().map((transaccion) => (
                    <div
                      key={transaccion._id}
                      className="bg-gray-700/50 hover:bg-gray-700/70 rounded-lg p-4 border border-gray-600/30 transition-colors"
                    >
                      <div className="flex flex-col">
                        <h4 className="font-medium">
                          {transaccion.descripcion}
                        </h4>
                        <p className="text-gray-400 text-xs mt-1">
                          {formatearFecha(transaccion.fecha)} ·{" "}
                          {formatearHora(transaccion.fecha)}
                        </p>
                        <p
                          className={`font-semibold text-lg ${
                            transaccion.tipo === "retiro" ||
                            transaccion.tipo === "envio"
                              ? "text-red-400"
                              : "text-green-400"
                          }`}
                        >
                          {transaccion.tipo === "retiro" ||
                          transaccion.tipo === "envio"
                            ? "-"
                            : "+"}{" "}
                          COP{" "}
                          {transaccion.monto.toLocaleString("es-CO", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                      {transaccion.notas && (
                        <p className="text-gray-400 text-sm mt-2 italic">
                          "{transaccion.notas}"
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Botón para cargar más transacciones */}
              {historial.length < totalTransacciones && (
                <div className="mt-6 text-center">
                  <button
                    onClick={() => obtenerHistorialTransacciones(userId, paginaActual + 1)}
                    disabled={loading}
                    className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors shadow-md disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Cargando...
                      </>
                    ) : (
                      "Cargar más"
                    )}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Modales */}
      {showEnviarModal && (
        <EnviarDineroModal
          walletId={walletId}
          balance={balance}
          onClose={() => setShowEnviarModal(false)}
          onEnviar={handleEnviarDinero}
        />
      )}

      {showRetirarModal && (
        <RetirarDineroModal
          walletId={walletId}
          balance={balance}
          onClose={() => setShowRetirarModal(false)}
          onRetirar={handleRetirarDinero}
        />
      )}
      <br />
      <br />
      <MobileNav billeteraActiva={billeteraActiva} />
    </div>
  );
}