"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Clipboard,
  Loader2,
  Filter,
  Search,
  Plus,
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
  const [pagina, setPagina] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  // Nuevo estado para el modal de restricción
  const [showRestriccionModal, setShowRestriccionModal] = useState(false);

  // ... (el resto de tus funciones y useEffects permanecen igual)

  // Función para manejar el clic en retirar
  const handleRetirarClick = () => {
    setShowRestriccionModal(true);
  };

  // Función para cerrar el modal de restricción
  const closeRestriccionModal = () => {
    setShowRestriccionModal(false);
  };

  // ... (el resto del código permanece igual)

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
                  {/* Cambio aquí: usar handleRetirarClick en lugar de setShowRetirarModal */}
                  <button
                    onClick={handleRetirarClick}
                    className="bg-purple-600/90 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors shadow-md"
                  >
                    <ArrowDownLeft className="h-4 w-4" />
                    Retirar
                  </button>
                </div>
              </div>
            </div>

            {/* ... (el resto del código del historial permanece igual) */}
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

      {/* Nuevo Modal de Restricción */}
      {showRestriccionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-sm w-full p-6 border border-gray-700">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-500/20 mb-4">
                <svg 
                  className="h-6 w-6 text-yellow-500" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" 
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Función No Disponible
              </h3>
              <p className="text-gray-300 mb-6">
                Esta opción solo está habilitada para comercios registrados.
              </p>
              <button
                onClick={closeRestriccionModal}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      <br />
      <br />
      <MobileNav billeteraActiva={billeteraActiva} />
    </div>
  );
}
