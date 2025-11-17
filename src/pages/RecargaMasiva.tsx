import React, { useState } from 'react';
import { Background } from '../components/Background';
import { AdminNav } from '../components/AdminNav';

export const RecargaMasiva = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [monto, setMonto] = useState('');
  const [activadas, setActivadas] = useState<number | null>(null);
  const [recargaMasivaId, setRecargaMasivaId] = useState<string | null>(null);
  const [modoRecarga, setModoRecarga] = useState<'ultra-rapida' | 'con-transacciones'>('ultra-rapida');

  // Paso 1: Activar SOLO billeteras inactivas
  const handleActivarBilleteras = async () => {
    setLoading(true);
    setMensaje('');
    setError('');
    try {
      const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/api/billetera/activar-inactivas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (response.ok) {
        setMensaje(data.mensaje || 'Billeteras activadas correctamente');
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

  // Recarga ULTRA RÁPIDA (con tipo recarga_masiva)
  const handleRecargaUltraRapida = async () => {
    setMensaje('');
    setError('');
    if (!monto || isNaN(parseFloat(monto)) || parseFloat(monto) <= 0) {
      setError('Ingrese un monto válido mayor que 0');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/api/billetera/recarga-ultra-rapida`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ monto }),
      });
      const data = await response.json();
      if (response.ok) {
        setMensaje(
          `✅ ${data.mensaje} 
          
          📊 Detalles:
          • ID Recarga: ${data.recarga_masiva_id}
          • Billeteras afectadas: ${data.billeterasAfectadas}
          • Monto individual: $${data.montoIndividual}
          • Monto total: $${data.montoTotal}
          • Ejecutado por: Sistema Administrativo
          • Tiempo: ${data.tiempo}
          
          Las transacciones individuales se están creando en segundo plano.`
        );
        setRecargaMasivaId(data.recarga_masiva_id);
        setMonto('');
      } else {
        setError(data.mensaje || 'Error al realizar la recarga');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  // Recarga CON transacciones individuales (método lento)
  const handleRecargaConTransacciones = async () => {
    setMensaje('');
    setError('');
    if (!monto || isNaN(parseFloat(monto)) || parseFloat(monto) <= 0) {
      setError('Ingrese un monto válido mayor que 0');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/api/billetera/recarga-general`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monto }),
      });
      const data = await response.json();
      if (response.ok) {
        setMensaje(
          `📊 ${data.mensaje}
          
          ⚠️ Este método es más lento pero crea transacciones individuales inmediatamente.`
        );
        setMonto('');
      } else {
        setError(data.mensaje || 'Error al realizar la recarga');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleRecarga = modoRecarga === 'ultra-rapida' 
    ? handleRecargaUltraRapida 
    : handleRecargaConTransacciones;

  const verDetallesRecarga = () => {
    if (recargaMasivaId) {
      window.open(`/admin/recargas-masivas/${recargaMasivaId}`, '_blank');
    }
  };

  const verHistorialRecargas = () => {
    window.open('/admin/recargas-masivas', '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col text-white">
      <Background />
      <div className="max-w-2xl mx-auto px-4 py-12 flex-grow">
        <h1 className="text-3xl font-bold mb-8 text-center">Recarga Masiva de Billeteras</h1>
        
        {/* Selector de modo de recarga */}
        <div className="mb-6 bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3 text-center">Modo de Recarga</h3>
          <div className="flex space-x-4">
            <button
              onClick={() => setModoRecarga('ultra-rapida')}
              className={`flex-1 py-3 px-4 rounded-md transition-colors ${
                modoRecarga === 'ultra-rapida' 
                  ? 'bg-purple-600 text-white shadow-lg' 
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              🚀 Ultra Rápida
            </button>
            <button
              onClick={() => setModoRecarga('con-transacciones')}
              className={`flex-1 py-3 px-4 rounded-md transition-colors ${
                modoRecarga === 'con-transacciones' 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              📊 Con Transacciones
            </button>
          </div>
          <div className="mt-3 p-3 bg-gray-800 rounded-md">
            <p className="text-sm text-gray-300">
              {modoRecarga === 'ultra-rapida' 
                ? '• 🚀 1 transacción general (tipo: recarga_masiva)' +
                  '\n• ⚡ 2-3 segundos máximo' +
                  '\n• 📊 Transacciones individuales en segundo plano' +
                  '\n• ✅ Ideal para producción'
                : '• 📊 1 transacción por usuario (tipo: recarga)' +
                  '\n• ⏳ Puede tomar varios minutos' +
                  '\n• 🔍 Auditoría inmediata' +
                  '\n• 🧪 Ideal para testing'
              }
            </p>
          </div>
        </div>

        {/* Botón para ver historial */}
        <div className="mb-6 text-center">
          <button
            onClick={verHistorialRecargas}
            className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
          >
            📋 Ver Historial de Recargas Masivas
          </button>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-lg p-8">
          {/* Paso 1 */}
          {step === 1 && (
            <>
              <h2 className="text-xl font-semibold mb-4 text-center">Paso 1: Activar billeteras inactivas</h2>
              <p className="mb-6 text-gray-300 text-center">
                Activa SOLO las billeteras que no estén activas o no existan.
                Es más rápido y eficiente.
              </p>
              <button
                onClick={handleActivarBilleteras}
                className="bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors w-full text-lg font-semibold"
                disabled={loading}
              >
                {loading ? '⏳ Procesando...' : '✅ Activar billeteras inactivas'}
              </button>
              {mensaje && <p className="mt-4 text-green-400 text-center whitespace-pre-line">{mensaje}</p>}
              {error && <p className="mt-4 text-red-400 text-center">{error}</p>}
            </>
          )}

          {/* Paso 2 */}
          {step === 2 && (
            <>
              <h2 className="text-xl font-semibold mb-4 text-center">
                Paso 2: Recarga Masiva {modoRecarga === 'ultra-rapida' ? '(🚀 Ultra Rápida)' : '(📊 Con Transacciones)'}
              </h2>
              <p className="mb-6 text-gray-300 text-center">
                {modoRecarga === 'ultra-rapida' 
                  ? 'Actualización instantánea con trazabilidad completa usando tipo: recarga_masiva'
                  : 'Recarga tradicional con transacción individual por usuario'
                }
                {activadas && <span className="block mt-2 text-green-400 font-semibold">Billeteras activas listas: {activadas}</span>}
              </p>
              
              <div className="mb-6">
                <label className="block mb-2 text-gray-300 text-lg font-semibold">Monto a recargar por billetera:</label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={monto}
                  onChange={e => setMonto(e.target.value)}
                  className="p-3 rounded-md bg-gray-600 text-white w-full text-lg border border-gray-500 focus:border-purple-500 focus:outline-none"
                  placeholder="Ej: 100.00"
                  disabled={loading}
                />
                <p className="text-sm text-gray-400 mt-1">Este monto se aplicará a cada billetera activa individualmente</p>
              </div>
              
              <button
                onClick={handleRecarga}
                className={`text-white py-3 px-4 rounded-md transition-colors w-full text-lg font-semibold ${
                  modoRecarga === 'ultra-rapida' 
                    ? 'bg-purple-600 hover:bg-purple-700 shadow-lg' 
                    : 'bg-blue-600 hover:bg-blue-700 shadow-lg'
                }`}
                disabled={loading}
              >
                {loading ? '⏳ Procesando...' : 
                  modoRecarga === 'ultra-rapida' ? '🚀 Ejecutar Recarga Ultra Rápida' : '📊 Ejecutar Recarga con Transacciones'
                }
              </button>
              
              {/* Botón para ver detalles de recarga masiva */}
              {recargaMasivaId && (
                <button
                  onClick={verDetallesRecarga}
                  className="mt-4 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors w-full"
                >
                  📊 Ver Detalles de esta Recarga Masiva
                </button>
              )}
              
              <button
                onClick={() => { 
                  setStep(1); 
                  setMensaje(''); 
                  setError(''); 
                  setRecargaMasivaId(null);
                }}
                className="mt-3 text-sm text-gray-400 hover:text-white hover:underline w-full py-2"
                disabled={loading}
              >
                &larr; Volver al paso anterior
              </button>
              
              {mensaje && (
                <div className={`mt-4 text-center whitespace-pre-line p-4 rounded-md ${
                  modoRecarga === 'ultra-rapida' ? 'bg-purple-900 text-purple-100' : 'bg-blue-900 text-blue-100'
                }`}>
                  {mensaje}
                </div>
              )}
              {error && (
                <div className="mt-4 text-red-400 text-center bg-red-900 p-3 rounded-md">
                  {error}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <AdminNav />
    </div>
  );
};