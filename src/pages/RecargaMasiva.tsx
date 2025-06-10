import React, { useState } from 'react';
import { Background } from '../components/Background';
import { AdminNav } from '../components/AdminNav';

export const RecargaMasiva = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [monto, setMonto] = useState('');
  const [activadas, setActivadas] = useState(null);

  // Paso 1: Activar todas las billeteras
  const handleActivarBilleteras = async () => {
    setLoading(true);
    setMensaje('');
    setError('');
    try {
      const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/api/billetera/activar-todas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (response.ok) {
        setMensaje(data.mensaje || 'Billeteras activadas correctamente');
        setActivadas(data.mensaje);
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

  // Paso 2: Recarga masiva
  const handleRecarga = async () => {
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
        setMensaje(data.mensaje || 'Recarga masiva realizada con éxito');
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

  return (
    <div className="min-h-screen flex flex-col text-white">
      <Background />
      <div className="max-w-lg mx-auto px-4 py-12 flex-grow">
        <h1 className="text-3xl font-bold mb-8 text-center">Recarga Masiva de Billeteras</h1>
        <div className="bg-gray-800 rounded-lg shadow-lg p-8">
          {/* Paso 1 */}
          {step === 1 && (
            <>
              <h2 className="text-xl font-semibold mb-4 text-center">Paso 1: Activar todas las billeteras</h2>
              <p className="mb-6 text-gray-300 text-center">
                Este paso activará billeteras para todos los usuarios que aún no la tengan activa.
              </p>
              <button
                onClick={handleActivarBilleteras}
                className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors w-full"
                disabled={loading}
              >
                {loading ? 'Procesando...' : 'Activar billeteras'}
              </button>
              {mensaje && <p className="mt-4 text-green-400 text-center">{mensaje}</p>}
              {error && <p className="mt-4 text-red-400 text-center">{error}</p>}
            </>
          )}

          {/* Paso 2 */}
          {step === 2 && (
            <>
              <h2 className="text-xl font-semibold mb-4 text-center">Paso 2: Recarga masiva</h2>
              <p className="mb-6 text-gray-300 text-center">
                Ahora puedes recargar un monto a todas las billeteras activas.
              </p>
              <div className="mb-4">
                <label className="block mb-2 text-gray-300">Monto a recargar:</label>
                <input
                  type="number"
                  min="1"
                  value={monto}
                  onChange={e => setMonto(e.target.value)}
                  className="p-2 rounded-md bg-gray-600 text-white w-full"
                  placeholder="Ingrese el monto"
                  disabled={loading}
                />
              </div>
              <button
                onClick={handleRecarga}
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors w-full"
                disabled={loading}
              >
                {loading ? 'Procesando...' : 'Recargar a todos'}
              </button>
              <button
                onClick={() => { setStep(1); setMensaje(''); setError(''); }}
                className="mt-3 text-sm text-gray-400 hover:underline w-full"
                disabled={loading}
              >
                &larr; Volver al paso anterior
              </button>
              {mensaje && <p className="mt-4 text-green-400 text-center">{mensaje}</p>}
              {error && <p className="mt-4 text-red-400 text-center">{error}</p>}
            </>
          )}
        </div>
      </div>
      <AdminNav />
    </div>
  );
};