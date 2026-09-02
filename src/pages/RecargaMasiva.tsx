import React, { useState } from 'react';
import { Background } from '../components/Background';
import { AdminNav } from '../components/AdminNav';
import { 
  Zap, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  Layers, 
  DollarSign, 
  Wallet 
} from 'lucide-react';

export const RecargaMasiva = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [monto, setMonto] = useState('40');
  const [activadas, setActivadas] = useState<number | null>(null);
  const [recargaMasivaId, setRecargaMasivaId] = useState<string | null>(null);

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

  // Paso 1: Activar SOLO billeteras inactivas
  const handleActivarBilleteras = async () => {
    setLoading(true);
    setMensaje('');
    setError('');
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/billetera/activar-inactivas`, {
        method: 'POST',
        headers: getHeaders(),
      });
      const data = await response.json();
      if (response.ok) {
        setMensaje(data.mensaje || 'Billeteras verificadas y activadas correctamente.');
        setActivadas(data.activadas);
        setStep(2);
      } else {
        setError(data.mensaje || 'Error al activar billeteras');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  // Recarga ULTRA RÁPIDA
  const handleRecargaUltraRapida = async () => {
    setMensaje('');
    setError('');
    if (!monto || isNaN(parseFloat(monto)) || parseFloat(monto) <= 0) {
      setError('Ingrese un monto válido mayor que 0');
      return;
    }
    setLoading(true);
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/billetera/recarga-ultra-rapida`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ monto }),
      });
      const data = await response.json();
      if (response.ok) {
        setMensaje(
          `✅ ${data.mensaje} • Billeteras abonadas: ${data.billeterasAfectadas} • Monto individual: COP $${data.montoIndividual} • Monto total: COP $${data.montoTotal}`
        );
        setRecargaMasivaId(data.recarga_masiva_id);
      } else {
        setError(data.mensaje || 'Error al realizar la recarga masiva');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06110D] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      <Background />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex-grow w-full">
        {/* Banner Superior */}
        <div className="relative rounded-3xl p-6 sm:p-8 mb-8 overflow-hidden border border-emerald-500/25 bg-gradient-to-r from-[#0B251B] via-[#091F17] to-[#071711] shadow-2xl shadow-emerald-950/40">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-3">
                <Zap className="h-3.5 w-3.5" />
                <span>Rendimiento Programado de Cultivo</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-heading">
                Recarga Masiva Diaria
              </h1>
              <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
                Ejecuta el abono diario de rendimientos a todas las billeteras activas de la plataforma en segundos con control de duplicados.
              </p>
            </div>

            <div className="glass-card bg-[#06140F]/80 border border-emerald-500/30 p-4 sm:p-5 rounded-2xl flex items-center gap-4 shrink-0 shadow-lg">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-500 to-emerald-500 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20">
                <Clock className="h-7 w-7" />
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-amber-400">Cron Automático</span>
                <p className="text-base font-extrabold text-white font-heading">
                  Todos los días 7:00 AM
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Valor estándar: COP $40 / día
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mensajes */}
        {mensaje && (
          <div className="mb-6 p-4 rounded-2xl bg-[#0E241C] border border-emerald-500 text-emerald-300 text-sm font-bold shadow-2xl flex items-center gap-2.5 animate-fade-in">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span>{mensaje}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-[#2A0E12] border border-rose-500 text-rose-300 text-sm font-bold shadow-2xl flex items-center gap-2.5 animate-fade-in">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Flujo en 2 Pasos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Paso 1: Activar Billeteras Inactivas */}
          <div className={`glass-card p-6 sm:p-7 rounded-3xl border transition-all shadow-xl flex flex-col justify-between ${
            step === 1 ? 'border-emerald-500/40 bg-[#0A1812]' : 'border-emerald-500/20 bg-[#07130E]/60 opacity-80'
          }`}>
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold font-mono">
                  1
                </div>
                <div>
                  <h3 className="font-bold text-white text-base font-heading">Paso 1: Sincronizar Billeteras</h3>
                  <p className="text-xs text-slate-400">Verifica que todos los socios tengan su billetera lista</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-6">
                Busca usuarios nuevos o pendientes y activa sus billeteras automáticamente antes de dispersar los rendimientos diarios.
              </p>
            </div>

            <button
              onClick={handleActivarBilleteras}
              disabled={loading}
              className="w-full py-3.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-extrabold text-xs rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading && step === 1 ? <Loader2 className="h-4 w-4 animate-spin" /> : <Layers className="h-4 w-4" />}
              <span>Verificar y Activar Billeteras</span>
            </button>
          </div>

          {/* Paso 2: Ejecutar Recarga Masiva */}
          <div className={`glass-card p-6 sm:p-7 rounded-3xl border transition-all shadow-xl flex flex-col justify-between ${
            step === 2 ? 'border-emerald-500/50 bg-[#0E261D]' : 'border-emerald-500/20 bg-[#0A1812]'
          }`}>
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-slate-950 flex items-center justify-center font-bold font-mono shadow-md">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-white text-base font-heading">Paso 2: Dispersión Diaria</h3>
                  <p className="text-xs text-slate-400">Abono masivo ultra-rápido</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Monto Individual por Socio (COP)</label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    className="w-full p-3 bg-slate-900 border border-emerald-500/30 rounded-xl text-white text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="Ej: 40"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Valor estándar: COP $40 / día</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleRecargaUltraRapida}
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs rounded-2xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading && step === 2 ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              <span>Ejecutar Recarga Masiva Ahora</span>
            </button>
          </div>
        </div>
      </main>

      <br /><br />
      <AdminNav />
    </div>
  );
};