"use client";

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowDownLeft, 
  Loader2, 
  X, 
  Hourglass, 
  AlertCircle, 
  CheckCircle2, 
  ShieldAlert,
  Users,
  Building2,
  Wallet,
  ArrowRight,
  ShieldCheck
} from "lucide-react";

const MONTO_MINIMO_RETIRO = 10000;

interface RetirarDineroModalProps {
  saldoDisponible?: number;
  onClose: () => void;
  onSuccess?: () => void;
  onRetirar?: (data: { monto: number; notas: string }) => Promise<void>;
}

export function RetirarDineroModal({ saldoDisponible, onClose, onSuccess, onRetirar }: RetirarDineroModalProps) {
  const [monto, setMonto] = useState("");
  const [notas, setNotas] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingValidacion, setLoadingValidacion] = useState(true);
  const [error, setError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");
  const [validacionData, setValidacionData] = useState<any>(null);
  const [modalEsperaVisible, setModalEsperaVisible] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState("");
  
  const navigate = useNavigate();

  // Generar clave de idempotencia única por sesión de modal
  useEffect(() => {
    const key = `wd_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    setIdempotencyKey(key);
  }, []);

  const formatearSaldo = (saldo: number): string => {
    return saldo.toLocaleString("es-CO", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const cargarValidaciones = async () => {
    setLoadingValidacion(true);
    setError("");
    try {
      const rawUser = localStorage.getItem("usuario");
      if (!rawUser) {
        navigate('/login');
        return;
      }
      const user = JSON.parse(rawUser);
      const userId = user._id || user.id;
      const token = localStorage.getItem("token");
      const apiUrl = import.meta.env.VITE_URL_LOCAL || import.meta.env.VITE_API_URL || 'http://localhost:5005';

      const res = await fetch(`${apiUrl}/api/withdrawals/validacion/${userId}`, {
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        }
      });

      if (res.ok) {
        const data = await res.json();
        setValidacionData(data);
      } else {
        const errData = await res.json();
        setError(errData.message || "Error al verificar requisitos de retiro");
      }
    } catch (err) {
      console.error("Error al cargar validaciones de retiro:", err);
      setError("Error de conexión al consultar requisitos");
    } finally {
      setLoadingValidacion(false);
    }
  };

  useEffect(() => {
    cargarValidaciones();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMensajeExito("");

    if (!monto) {
      setError("Por favor ingresa el monto a retirar");
      return;
    }

    const montoNum = parseFloat(monto);

    if (isNaN(montoNum) || montoNum <= 0) {
      setError("El monto debe ser un número válido mayor que cero");
      return;
    }

    if (montoNum < MONTO_MINIMO_RETIRO) {
      setError(`El monto mínimo de retiro es COP $${formatearSaldo(MONTO_MINIMO_RETIRO)}`);
      return;
    }

    const saldoReal = validacionData?.saldoDisponible ?? saldoDisponible ?? 0;
    if (montoNum > saldoReal) {
      setError(`Saldo insuficiente. Tu saldo disponible es: COP $${formatearSaldo(saldoReal)}`);
      return;
    }

    if (validacionData && !validacionData.puedeRetirar) {
      setError("No cumples con todos los requisitos necesarios para retirar fondos.");
      return;
    }

    setLoading(true);
    try {
      if (onRetirar) {
        await onRetirar({ monto: montoNum, notas });
      } else {
        const rawUser = localStorage.getItem("usuario");
        const user = JSON.parse(rawUser || "{}");
        const token = localStorage.getItem("token");
        const apiUrl = import.meta.env.VITE_URL_LOCAL || import.meta.env.VITE_API_URL || 'http://localhost:5005';

        const res = await fetch(`${apiUrl}/api/withdrawals`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Idempotency-Key': idempotencyKey,
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            usuarioId: user._id || user.id,
            monto: montoNum,
            notas,
            idempotencyKey
          })
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Error al procesar el retiro");
        }
      }

      setMensajeExito(`Solicitud de retiro registrada por COP $${formatearSaldo(montoNum)}`);
      setMonto("");
      setNotas("");
      setModalEsperaVisible(true);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "Error al solicitar el retiro");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModalEspera = () => {
    setModalEsperaVisible(false);
    if (onSuccess) onSuccess();
    onClose();
  };

  const saldoMostrado = validacionData?.saldoDisponible ?? saldoDisponible ?? 0;
  const reqs = validacionData?.requisitos || {};

  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
        <div className="bg-[#0A1812] border border-emerald-500/30 rounded-3xl max-w-lg w-full shadow-2xl shadow-emerald-950/60 overflow-hidden max-h-[92vh] flex flex-col">
          <div className="p-5 sm:p-6 overflow-y-auto flex-1">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <ArrowDownLeft className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white font-heading">
                    Solicitar Retiro Bancario
                  </h2>
                  <p className="text-[11px] sm:text-xs text-slate-400">Fondos directos a tu cuenta bancaria</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Checklist de Requisitos de Retiro */}
            <div className="p-4 bg-[#071711] border border-emerald-500/25 rounded-2xl mb-4 space-y-2.5 shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 font-heading">
                  <ShieldCheck className="h-4 w-4" /> Requisitos de Retiro
                </span>
                {loadingValidacion && <Loader2 className="h-3.5 w-3.5 text-emerald-400 animate-spin" />}
              </div>

              {loadingValidacion ? (
                <div className="space-y-2 animate-pulse py-1">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={`skel-req-${i}`} className="h-4 bg-emerald-500/15 rounded w-full"></div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2 text-xs">
                  {/* 1. Usuario Verificado */}
                  <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#0D261C]/50 border border-emerald-500/10">
                    <div className="flex items-center gap-2 min-w-0">
                      {reqs.usuarioVerificado?.cumple ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
                      )}
                      <span className="text-slate-300 truncate">1. Aporte propio verificado</span>
                    </div>
                    <span className={`font-bold text-[10px] px-2 py-0.5 rounded-full ${
                      reqs.usuarioVerificado?.cumple 
                        ? 'bg-emerald-500/20 text-emerald-300' 
                        : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {reqs.usuarioVerificado?.cumple ? 'Aprobado' : 'Pendiente'}
                    </span>
                  </div>

                  {/* 2. Mínimo 3 Referidos Directos Validados */}
                  <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#0D261C]/50 border border-emerald-500/10">
                    <div className="flex items-center gap-2 min-w-0">
                      {reqs.referidosValidados?.cumple ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
                      )}
                      <span className="text-slate-300 truncate">2. Mínimo 3 referidos directos validados</span>
                    </div>
                    <span className={`font-bold text-[10px] px-2 py-0.5 rounded-full ${
                      reqs.referidosValidados?.cumple 
                        ? 'bg-emerald-500/20 text-emerald-300' 
                        : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {reqs.referidosValidados?.actual || 0} / 3
                    </span>
                  </div>

                  {/* 3. Saldo Mínimo */}
                  <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#0D261C]/50 border border-emerald-500/10">
                    <div className="flex items-center gap-2 min-w-0">
                      {reqs.saldoSuficiente?.cumple ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
                      )}
                      <span className="text-slate-300 truncate">3. Saldo mínimo: COP $10,000</span>
                    </div>
                    <span className={`font-bold text-[10px] px-2 py-0.5 rounded-full ${
                      reqs.saldoSuficiente?.cumple 
                        ? 'bg-emerald-500/20 text-emerald-300' 
                        : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {reqs.saldoSuficiente?.cumple ? 'Cumplido' : 'Insuficiente'}
                    </span>
                  </div>

                  {/* 4. Datos Bancarios */}
                  <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#0D261C]/50 border border-emerald-500/10">
                    <div className="flex items-center gap-2 min-w-0">
                      {reqs.datosBancarios?.cumple ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
                      )}
                      <span className="text-slate-300 truncate">
                        4. Cuenta bancaria ({validacionData?.usuario?.banco || 'Sin cuenta'})
                      </span>
                    </div>
                    <span className={`font-bold text-[10px] px-2 py-0.5 rounded-full ${
                      reqs.datosBancarios?.cumple 
                        ? 'bg-emerald-500/20 text-emerald-300' 
                        : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {reqs.datosBancarios?.cumple ? 'Configurada' : 'Falta en Perfil'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Monto a retirar (COP)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold text-xs sm:text-sm">
                    COP $
                  </span>
                  <input
                    type="number"
                    value={monto}
                    onChange={(e) => setMonto(e.target.value.replace(/[^0-9.]/g, ''))}
                    className="w-full pl-16 pr-4 py-2.5 sm:py-3 bg-slate-900/90 border border-emerald-500/30 rounded-xl text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm sm:text-base"
                    placeholder={`Mínimo: ${formatearSaldo(MONTO_MINIMO_RETIRO)}`}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5">
                  <span>Disponible para retiro:</span>
                  <strong className="text-emerald-400 font-mono font-bold">
                    COP ${formatearSaldo(saldoMostrado)}
                  </strong>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Notas de retiro / Referencia (opcional)
                </label>
                <textarea
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  className="w-full p-2.5 sm:p-3 bg-slate-900/90 border border-emerald-500/20 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none placeholder-slate-500"
                  placeholder="Detalle de transferencia..."
                  rows={2}
                />
              </div>

              {error && (
                <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-start gap-2 animate-fade-in leading-relaxed">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {mensajeExito && (
                <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{mensajeExito}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-1/3 py-2.5 sm:py-3 bg-slate-900 border border-slate-700 text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={loading || loadingValidacion || (validacionData && !validacionData.puedeRetirar)}
                  className="w-full sm:w-2/3 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Procesando...</span>
                    </>
                  ) : (
                    "Confirmar Retiro"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Modal de Espera / Aprobación */}
      {modalEsperaVisible && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0A1812] border border-emerald-500/30 rounded-3xl max-w-md w-full shadow-2xl p-6 sm:p-7 text-center animate-scale-up">
            <div className="h-14 w-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-3.5">
              <Hourglass className="h-7 w-7 animate-pulse" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-heading">
              Retiro en Trámite
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
              Tu solicitud ha sido registrada exitosamente. El equipo administrativo validará la transferencia a tu cuenta en un plazo de <strong className="text-emerald-400">24 a 72 horas hábiles</strong>.
            </p>
            <button
              onClick={handleCloseModalEspera}
              className="mt-5 w-full py-2.5 sm:py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-emerald-500/20"
            >
              Entendido y Volver
            </button>
          </div>
        </div>
      )}
    </>
  );
}
