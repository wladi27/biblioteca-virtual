"use client";

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Importar useNavigate
import { ArrowDownLeft, Loader2, X, Hourglass } from "lucide-react";

const MONTO_MINIMO_RETIRO = 10000; // Definir el monto mínimo

interface RetirarDineroModalProps {
  walletId: string;
  onClose: () => void;
  onRetirar: (data: { monto: number; notas: string }) => Promise<void>;
}

export function RetirarDineroModal({ walletId, onClose, onRetirar }: RetirarDineroModalProps) {
  const [monto, setMonto] = useState("");
  const [notas, setNotas] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");
  const [saldoActual, setSaldoActual] = useState<number | null>(null);
  const [usuarioValidado, setUsuarioValidado] = useState(false);
  const [modalEsperaVisible, setModalEsperaVisible] = useState(false);
  
  const navigate = useNavigate(); // Inicializar useNavigate

  const formatearSaldo = (saldo: number): string => {
    return saldo.toLocaleString("es-CO", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const obtenerSaldoActual = async (): Promise<number> => {
    try {
      const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
      const response = await fetch(
        `${import.meta.env.VITE_URL_LOCAL}/usuarios/saldo/${usuario._id}`
      );
      if (response.ok) {
        const data = await response.json();
        return data.saldo;
      }
      throw new Error("Error al obtener el saldo actual");
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  const verificarUsuarioValidado = async (userId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/api/aportes/`);
      if (response.ok) {
        const data = await response.json();
        return data.some(aporte => aporte.usuarioId === userId && aporte.aporte === true);
      }
      return false;
    } catch (error) {
      console.error("Error al verificar usuario:", error);
      return false;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
        const saldo = await obtenerSaldoActual();
        const validado = await verificarUsuarioValidado(usuario._id);

        setSaldoActual(saldo);
        setUsuarioValidado(validado);
      } catch (error) {
        setError("Error al cargar los datos");
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMensajeExito("");

    // Validaciones
    if (!usuarioValidado) {
      setError("El usuario no está validado.");
      return;
    }

    if (!monto) {
      setError("Por favor ingresa el monto a retirar");
      return;
    }

    const montoNum = parseFloat(monto);

    if (isNaN(montoNum)) {
      setError("El monto debe ser un número válido");
      return;
    }

    if (montoNum < MONTO_MINIMO_RETIRO) {
      setError(`El monto mínimo de retiro es ${formatearSaldo(MONTO_MINIMO_RETIRO)} COP`);
      return;
    }

    if (montoNum <= 0) {
      setError("El monto debe ser mayor que cero");
      return;
    }

    if (saldoActual !== null && montoNum > saldoActual) {
      setError(`Saldo insuficiente. Tu saldo actual es: COP ${formatearSaldo(saldoActual)}`);
      return;
    }

    setLoading(true);
    try {
      await onRetirar({
        monto: montoNum,
        notas
      });

      setMensajeExito(`Retiro exitoso por COP ${formatearSaldo(montoNum)}`);
      setMonto("");
      setNotas("");
      setModalEsperaVisible(true); // Mostrar el modal de espera
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al retirar el dinero");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModalEspera = () => {
    setModalEsperaVisible(false);
    navigate('/dashboard'); // Redirigir a /dashboard
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-xl max-w-md w-full border border-gray-700 shadow-xl">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ArrowDownLeft className="h-5 w-5 text-purple-400" />
                Retirar Dinero
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="text-ml bg-gray-700 py-2 px-2 rounded-xl text-yellow-400">
              Para realizar un retiro, debe cumplir con los requisitos mínimos: <br />
              - El monto mínimo de {formatearSaldo(MONTO_MINIMO_RETIRO)} COP. <br />
              - Debe de estar validado como usuario. <br />
              - Debe tener mínimo 3 referidos validados.
            </div>
            <br />

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Monto a retirar (COP)
                  </label>
                  <input
                    type="number"
                    value={monto}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9.]/g, '');
                      setMonto(value);
                    }}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    placeholder={`Mínimo ${formatearSaldo(MONTO_MINIMO_RETIRO)}`}
                  />
                  {saldoActual !== null && (
                    <p className="text-xs text-gray-500 mt-1">
                      Saldo disponible: COP {formatearSaldo(saldoActual)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Notas (opcional)
                  </label>
                  <textarea
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    placeholder="Agrega una descripción..."
                    rows={2}
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    {error}
                  </div>
                )}

                {mensajeExito && (
                  <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
                    {mensajeExito}
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      "Confirmar Retiro"
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Modal de Espera */}
      {modalEsperaVisible && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-md w-full border border-gray-700 shadow-xl p-6">
            <div className="flex items-center mb-4">
              <Hourglass className="h-6 w-6 text-yellow-400 mr-2" />
              <h2 className="text-xl font-bold">Retiro en Proceso</h2>
            </div>
            <p className="text-gray-300">
              Tu solicitud de retiro ha sido procesada. Los retiros se realizan en un lapso de 72 horas hábiles.
            </p>
            <div className="mt-4">
              <button
                onClick={handleCloseModalEspera} // Redirige al cerrar el modal
                className="w-full py-2 px-4 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
