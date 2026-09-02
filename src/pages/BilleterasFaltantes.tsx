import React, { useState } from 'react';
import { Background } from '../components/Background';
import { AdminNav } from '../components/AdminNav';
import { 
  Layers, 
  Search, 
  Zap, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  Wallet,
  FileSpreadsheet
} from 'lucide-react';

export const BilleterasFaltantes = () => {
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [monto, setMonto] = useState('40');
  const [fechaConsulta, setFechaConsulta] = useState('');
  const [tipoTransaccion, setTipoTransaccion] = useState('recarga');
  const [incluirInactivas, setIncluirInactivas] = useState(false);
  const [billeterasFaltantes, setBilleterasFaltantes] = useState<any[]>([]);
  const [estadisticas, setEstadisticas] = useState<any>(null);
  const [paginacion, setPaginacion] = useState<any>(null);
  const [mostrarDetalles, setMostrarDetalles] = useState(false);

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

  const tiposTransaccion = [
    { value: 'recarga', label: 'Recarga Diaria' },
    { value: 'envio', label: 'Envío entre Socios' },
    { value: 'retiro', label: 'Retiro Bancario' },
    { value: 'recibido', label: 'Recibido' },
    { value: 'comision_referido', label: 'Comisión de Referido' },
    { value: 'recarga_masiva', label: 'Recarga Masiva' }
  ];

  const buscarBilleterasFaltantes = async (page = 1) => {
    if (!fechaConsulta) {
      setError('Seleccione una fecha para consultar');
      return;
    }

    setLoading(true);
    setMensaje('');
    setError('');
    
    try {
      const params = new URLSearchParams({
        fecha: fechaConsulta,
        tipo_transaccion: tipoTransaccion,
        incluir_inactivas: incluirInactivas.toString(),
        limit: '50',
        page: page.toString()
      });

      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/transacciones/billeteras-faltantes?${params}`, {
        headers: getHeaders()
      });
      const data = await response.json();

      if (response.ok) {
        setBilleterasFaltantes(data.billeterasFaltantes || []);
        setEstadisticas(data.estadisticas);
        setPaginacion(data.paginacion);
        setMostrarDetalles(true);
        
        if ((data.billeterasFaltantes || []).length === 0) {
          setMensaje('✅ ¡Excelente! Todas las billeteras tienen transacciones registradas para esta fecha.');
        } else {
          setMensaje(`📊 Se encontraron ${data.estadisticas?.billeteras_sin_transaccion || data.billeterasFaltantes.length} billeteras faltantes`);
        }
      } else {
        setError(data.mensaje || 'Error al buscar billeteras faltantes');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleRecargaFaltantes = async () => {
    if (!fechaConsulta || !monto) {
      setError('Fecha y monto son requeridos');
      return;
    }

    if (billeterasFaltantes.length === 0) {
      setError('Primero busca las billeteras faltantes');
      return;
    }

    setLoading(true);
    setMensaje('');
    setError('');
    
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/billetera/recarga-faltantes`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          monto: parseFloat(monto),
          fecha: fechaConsulta,
          tipo_transaccion: tipoTransaccion,
          incluir_inactivas: incluirInactivas
        }),
      });
      const data = await response.json();

      if (response.ok) {
        setMensaje(
          `✅ Recarga masiva para billeteras faltantes completada • Afectadas: ${data.billeterasAfectadas} • Individual: COP $${data.montoIndividual} • Total: COP $${data.montoTotal}`
        );
        setBilleterasFaltantes([]);
        setMostrarDetalles(false);
      } else {
        setError(data.mensaje || 'Error al realizar la recarga');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const descargarReporte = () => {
    if (billeterasFaltantes.length === 0) return;

    const headers = ['Usuario', 'Email', 'Documento', 'Teléfono', 'Saldo', 'Estado'];
    const csvData = billeterasFaltantes.map(b => [
      b.usuario?.nombre || 'N/A',
      b.usuario?.email || 'N/A',
      b.usuario?.documento || 'N/A',
      b.usuario?.telefono || 'N/A',
      `$${b.saldo}`,
      b.activa ? 'ACTIVA' : 'INACTIVA'
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `billeteras-faltantes-${fechaConsulta}-${tipoTransaccion}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#06110D] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      <Background />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex-grow w-full">
        {/* Banner Superior */}
        <div className="relative rounded-3xl p-6 sm:p-8 mb-8 overflow-hidden border border-emerald-500/25 bg-gradient-to-r from-[#0B251B] via-[#091F17] to-[#071711] shadow-2xl shadow-emerald-950/40">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-3">
                <Layers className="h-3.5 w-3.5" />
                <span>Auditoría y Conciliación de Billeteras</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-heading">
                Billeteras Faltantes
              </h1>
              <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
                Detecta y regulariza aquellas billeteras que no recibieron su rendimiento diario o abono en fechas específicas.
              </p>
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

        {/* Panel de Configuración */}
        <div className="glass-card rounded-3xl border border-emerald-500/20 bg-[#0A1812]/85 p-6 sm:p-7 shadow-xl mb-8">
          <h2 className="text-base font-bold text-white font-heading mb-4 flex items-center gap-2">
            <Search className="h-4 w-4 text-emerald-400" />
            <span>Parámetros de Consulta</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Fecha a Consultar</label>
              <input
                type="date"
                value={fechaConsulta}
                onChange={e => setFechaConsulta(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-emerald-500/20 text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tipo de Transacción</label>
              <select
                value={tipoTransaccion}
                onChange={e => setTipoTransaccion(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-emerald-500/20 text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {tiposTransaccion.map(tipo => (
                  <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={incluirInactivas}
                  onChange={e => setIncluirInactivas(e.target.checked)}
                  className="w-4 h-4 text-emerald-500 bg-slate-900 border-slate-700 rounded focus:ring-emerald-500"
                />
                <span>Incluir inactivas</span>
              </label>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => buscarBilleterasFaltantes(1)}
                disabled={loading || !fechaConsulta}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                <span>Buscar Faltantes</span>
              </button>
            </div>
          </div>

          {/* Estadísticas de la Consulta */}
          {estadisticas && (
            <div className="p-4 rounded-2xl bg-[#07130E] border border-emerald-500/15 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400">Total Billeteras:</span>
                <p className="font-extrabold text-white text-base font-mono">{estadisticas.total_billeteras}</p>
              </div>
              <div>
                <span className="text-slate-400">Con Transacción:</span>
                <p className="font-extrabold text-emerald-400 text-base font-mono">{estadisticas.billeteras_con_transaccion}</p>
              </div>
              <div>
                <span className="text-slate-400">Sin Transacción (Faltantes):</span>
                <p className="font-extrabold text-amber-400 text-base font-mono">{estadisticas.billeteras_sin_transaccion}</p>
              </div>
              <div>
                <span className="text-slate-400">Porcentaje Cobertura:</span>
                <p className="font-extrabold text-teal-300 text-base font-mono">{estadisticas.porcentaje_cobertura}%</p>
              </div>
            </div>
          )}
        </div>

        {/* Acciones de Recarga sobre Faltantes */}
        {billeterasFaltantes.length > 0 && (
          <div className="glass-card rounded-3xl border border-amber-500/30 bg-[#0E2018] p-6 sm:p-7 shadow-xl mb-8">
            <h3 className="font-bold text-white text-base font-heading mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-400" />
              <span>Regularizar Billeteras Faltantes ({billeterasFaltantes.length})</span>
            </h3>

            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <input
                type="number"
                value={monto}
                onChange={e => setMonto(e.target.value)}
                placeholder="Monto individual (COP)..."
                className="w-full sm:w-60 p-2.5 rounded-xl bg-slate-900 border border-emerald-500/20 text-white text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <button
                onClick={handleRecargaFaltantes}
                disabled={loading}
                className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                <span>Recargar Solo Faltantes</span>
              </button>

              <button
                onClick={descargarReporte}
                className="w-full sm:w-auto px-4 py-2.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>Descargar CSV</span>
              </button>
            </div>
          </div>
        )}
      </main>

      <br /><br />
      <AdminNav />
    </div>
  );
};