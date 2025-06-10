"use client";

import React, { useState, useEffect } from "react";
import { ArrowUpRight, Loader2, X, User } from "lucide-react";

interface EnviarDineroModalProps {
  walletId: string;
  balance: number;
  onClose: () => void;
  onEnviar: (data: { destinatarioId: string; monto: number; notas: string }) => Promise<void>;
}

interface UsuarioInfo {
  _id: string;
  nombre_usuario: string;
  nombre_completo?: string;
  email?: string;
  // Agrega otros campos según lo que devuelva tu API
}

export function EnviarDineroModal({ walletId, balance, onClose, onEnviar }: EnviarDineroModalProps) {
  const [destinatarioId, setDestinatarioId] = useState("");
  const [monto, setMonto] = useState("");
  const [notas, setNotas] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [usuarioInfo, setUsuarioInfo] = useState<UsuarioInfo | null>(null);
  const [loadingUsuario, setLoadingUsuario] = useState(false);

  // Efecto para buscar información del usuario cuando cambia el ID
  useEffect(() => {
    const buscarUsuario = async () => {
      if (destinatarioId.trim().length === 0) {
        setUsuarioInfo(null);
        return;
      }

      try {
        setLoadingUsuario(true);
        const response = await fetch(
          `${import.meta.env.VITE_URL_LOCAL}/usuarios/${destinatarioId}`
        );
        
        if (response.ok) {
          const data = await response.json();
          setUsuarioInfo(data);
          setError("");
        } else {
          setUsuarioInfo(null);
          setError("Usuario no encontrado");
        }
      } catch (err) {
        setUsuarioInfo(null);
        setError("Error al buscar el usuario");
        console.error("Error:", err);
      } finally {
        setLoadingUsuario(false);
      }
    };

    // Debounce para evitar muchas llamadas mientras escribe
    const timer = setTimeout(() => {
      buscarUsuario();
    }, 500);

    return () => clearTimeout(timer);
  }, [destinatarioId]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!destinatarioId || !monto) {
      setError("Por favor completa todos los campos requeridos");
      return;
    }

    if (!usuarioInfo) {
      setError("Por favor verifica que el ID del usuario receptor sea válido");
      return;
    }

    try {
      const saldoActual = await obtenerSaldoActual();
      const montoNum = parseFloat(monto);
      
      if (isNaN(montoNum)) {
        setError("El monto debe ser un número válido");
        return;
      }

      if (montoNum <= 0) {
        setError("El monto debe ser mayor que cero");
        return;
      }

      if (montoNum > saldoActual) {
        setError(`Saldo insuficiente. Tu saldo actual es: COP ${formatearSaldo(saldoActual)}`);
        return;
      }

      setLoading(true);
      await onEnviar({
        destinatarioId,
        monto: montoNum,
        notas
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar el dinero");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-md w-full border border-gray-700 shadow-xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ArrowUpRight className="h-5 w-5 text-blue-400" />
              Enviar Dinero
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  ID del Usuario Receptor
                </label>
                <input
                  type="text"
                  value={destinatarioId}
                  onChange={(e) => setDestinatarioId(e.target.value)}
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  placeholder="ID del Usuario Receptor"
                />
                
                {/* Contenedor de información del usuario */}
                {destinatarioId && (
                  <div className="mt-2">
                    {loadingUsuario ? (
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Buscando usuario...
                      </div>
                    ) : usuarioInfo ? (
                      <div className="p-3 bg-gray-700/30 rounded-lg border border-gray-600/50">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-500/20 p-2 rounded-full">
                            <User className="h-5 w-5 text-blue-400" />
                          </div>
                          <div>
                            <h3 className="font-medium">{usuarioInfo.nombre_completo || usuarioInfo.nombre_usuario}</h3>
                            <p className="text-xs text-gray-400">@{usuarioInfo.nombre_usuario}</p>
                            {usuarioInfo.email && (
                              <p className="text-xs text-gray-400 mt-1">{usuarioInfo.email}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-red-400">
                        {error || "Introduce un ID de usuario válido"}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Monto a enviar (COP)
                </label>
                <input
                  type="number"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Saldo disponible: COP {formatearSaldo(balance)}
                </p>
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

              {error && !destinatarioId && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || !usuarioInfo}
                  className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    "Confirmar Envío"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
