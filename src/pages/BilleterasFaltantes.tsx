// BilleterasFaltantes.tsx
import React, { useState } from 'react';
import { Background } from '../components/Background';
import { AdminNav } from '../components/AdminNav';

export const BilleterasFaltantes = () => {
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [monto, setMonto] = useState('');
  const [fechaConsulta, setFechaConsulta] = useState('');
  const [tipoTransaccion, setTipoTransaccion] = useState('recarga');
  const [incluirInactivas, setIncluirInactivas] = useState(false);
  const [billeterasFaltantes, setBilleterasFaltantes] = useState<any[]>([]);
  const [estadisticas, setEstadisticas] = useState<any>(null);
  const [paginacion, setPaginacion] = useState<any>(null);
  const [mostrarDetalles, setMostrarDetalles] = useState(false);

  // Tipos de transacción disponibles
  const tiposTransaccion = [
    { value: 'recarga', label: 'Recarga', emoji: '💰' },
    { value: 'envio', label: 'Envío', emoji: '📤' },
    { value: 'retiro', label: 'Retiro', emoji: '🏧' },
    { value: 'recibido', label: 'Recibido', emoji: '📥' },
    { value: 'comision_referido', label: 'Comisión Referido', emoji: '👥' },
    { value: 'recarga_masiva', label: 'Recarga Masiva', emoji: '⚡' }
  ];

  // Buscar billeteras faltantes
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

      const response = await fetch(
        `${import.meta.env.VITE_URL_LOCAL}/api/transacciones/billeteras-faltantes?${params}`
      );
      const data = await response.json();

      if (response.ok) {
        setBilleterasFaltantes(data.billeterasFaltantes);
        setEstadisticas(data.estadisticas);
        setPaginacion(data.paginacion);
        setMostrarDetalles(true);
        
        if (data.billeterasFaltantes.length === 0) {
          setMensaje('✅ ¡Excelente! Todas las billeteras tienen transacciones para esta fecha.');
        } else {
          setMensaje(`📊 Se encontraron ${data.estadisticas.billeteras_sin_transaccion} billeteras faltantes`);
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

  // Recargar solo billeteras faltantes
  const handleRecargaFaltantes = async () => {
    if (!fechaConsulta || !monto) {
      setError('Fecha y monto son requeridos');
      return;
    }

    if (billeterasFaltantes.length === 0) {
      setError('Primero busque las billeteras faltantes');
      return;
    }

    setLoading(true);
    setMensaje('');
    setError('');
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_URL_LOCAL}/api/billetera/recarga-faltantes`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            monto: parseFloat(monto),
            fecha: fechaConsulta,
            tipo_transaccion: tipoTransaccion,
            incluir_inactivas: incluirInactivas
          }),
        }
      );
      const data = await response.json();

      if (response.ok) {
        setMensaje(
          `✅ Recarga masiva para billeteras faltantes completada
          
📊 Detalles:
• Billeteras afectadas: ${data.billeterasAfectadas}
• Monto individual: $${data.montoIndividual}
• Total recargado: $${data.montoTotal}
• Fecha consultada: ${fechaConsulta}
• Tipo faltante: ${tipoTransaccion}

💾 ID Recarga: ${data.recarga_masiva_id}`
        );
        
        // Limpiar después de recarga exitosa
        setBilleterasFaltantes([]);
        setMonto('');
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

  // Descargar reporte en CSV
  const descargarReporte = () => {
    if (billeterasFaltantes.length === 0) return;

    const headers = ['Usuario', 'Email', 'Documento', 'Teléfono', 'Saldo', 'Estado'];
    const csvData = billeterasFaltantes.map(b => [
      b.usuario.nombre,
      b.usuario.email,
      b.usuario.documento || 'N/A',
      b.usuario.telefono || 'N/A',
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

  // Formatear fecha para mostrar
  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen flex flex-col text-white">
      <Background />
      <div className="max-w-6xl mx-auto px-4 py-8 flex-grow">
        <h1 className="text-3xl font-bold mb-2 text-center">
          🎯 Billeteras Faltantes
        </h1>
        <p className="text-gray-300 text-center mb-8">
          Identifica y recarga billeteras que no tienen transacciones en fechas específicas
        </p>

        {/* Panel de configuración */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🔍 Configurar Búsqueda</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Fecha */}
            <div>
              <label className="block mb-2 text-gray-300 font-semibold">
                📅 Fecha a Consultar
              </label>
              <input
                type="date"
                value={fechaConsulta}
                onChange={e => setFechaConsulta(e.target.value)}
                className="p-3 rounded-md bg-gray-700 text-white w-full border border-gray-600 focus:border-purple-500 focus:outline-none"
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Tipo de Transacción */}
            <div>
              <label className="block mb-2 text-gray-300 font-semibold">
                🔄 Tipo de Transacción
              </label>
              <select
                value={tipoTransaccion}
                onChange={e => setTipoTransaccion(e.target.value)}
                className="p-3 rounded-md bg-gray-700 text-white w-full border border-gray-600 focus:border-purple-500 focus:outline-none"
              >
                {tiposTransaccion.map(tipo => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.emoji} {tipo.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Incluir Inactivas */}
            <div className="flex items-end">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={incluirInactivas}
                  onChange={e => setIncluirInactivas(e.target.checked)}
                  className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                />
                <span className="text-gray-300">Incluir billeteras inactivas</span>
              </label>
            </div>

            {/* Botón Buscar */}
            <div className="flex items-end">
              <button
                onClick={() => buscarBilleterasFaltantes(1)}
                disabled={loading || !fechaConsulta}
                className="bg-purple-600 text-white py-3 px-6 rounded-md hover:bg-purple-700 transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '🔍 Buscando...' : '🔍 Buscar Faltantes'}
              </button>
            </div>
          </div>

          {/* Estadísticas rápidas */}
          {estadisticas && (
            <div className="bg-gray-900 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-semibold mb-3">📈 Resumen</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {estadisticas.billeteras_con_transaccion}
                  </div>
                  <div className="text-gray-400">Con Transacción</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">
                    {estadisticas.billeteras_sin_transaccion}
                  </div>
                  <div className="text-gray-400">Faltantes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {estadisticas.porcentaje_cobertura}
                  </div>
                  <div className="text-gray-400">Cobertura</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    {estadisticas.transacciones_del_dia.cantidad}
                  </div>
                  <div className="text-gray-400">Transacciones</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Panel de recarga */}
        {mostrarDetalles && billeterasFaltantes.length > 0 && (
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">⚡ Recarga Masiva Faltantes</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block mb-2 text-gray-300 font-semibold">
                  💰 Monto por Billetera
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={monto}
                  onChange={e => setMonto(e.target.value)}
                  className="p-3 rounded-md bg-gray-700 text-white w-full border border-gray-600 focus:border-green-500 focus:outline-none"
                  placeholder="Ej: 100.00"
                  disabled={loading}
                />
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={handleRecargaFaltantes}
                  disabled={loading || !monto}
                  className="bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '⏳ Procesando...' : '🚀 Recargar Faltantes'}
                </button>
              </div>

              <div className="flex items-end">
                <button
                  onClick={descargarReporte}
                  disabled={billeterasFaltantes.length === 0}
                  className="bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  📊 Descargar CSV
                </button>
              </div>
            </div>

            <div className="text-sm text-gray-400">
              <p>
                Se recargarán <strong>{billeterasFaltantes.length} billeteras</strong> que no tienen 
                transacciones de tipo <strong>{tipoTransaccion}</strong> en la fecha{' '}
                <strong>{formatearFecha(fechaConsulta)}</strong>
              </p>
              {monto && (
                <p className="mt-1">
                  Monto total a recargar: <strong>${(parseFloat(monto) * billeterasFaltantes.length).toFixed(2)}</strong>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Lista de billeteras faltantes */}
        {mostrarDetalles && (
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                📋 Billeteras Faltantes ({billeterasFaltantes.length})
              </h2>
              
              {paginacion && paginacion.totalPaginas > 1 && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => buscarBilleterasFaltantes(paginacion.pagina - 1)}
                    disabled={paginacion.pagina <= 1}
                    className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600 disabled:opacity-50"
                  >
                    ← Anterior
                  </button>
                  <span className="px-4 py-2 text-gray-300">
                    Página {paginacion.pagina} de {paginacion.totalPaginas}
                  </span>
                  <button
                    onClick={() => buscarBilleterasFaltantes(paginacion.pagina + 1)}
                    disabled={!paginacion.hasMore}
                    className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600 disabled:opacity-50"
                  >
                    Siguiente →
                  </button>
                </div>
              )}
            </div>

            {billeterasFaltantes.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <div className="text-6xl mb-4">🎉</div>
                <p className="text-xl">¡Todas las billeteras tienen transacciones!</p>
                <p className="text-sm mt-2">No se encontraron billeteras faltantes para los criterios especificados.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-700">
                      <th className="p-3 text-left">Usuario</th>
                      <th className="p-3 text-left">Contacto</th>
                      <th className="p-3 text-right">Saldo</th>
                      <th className="p-3 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billeterasFaltantes.map((billetera, index) => (
                      <tr 
                        key={billetera._id} 
                        className={`border-b border-gray-700 ${index % 2 === 0 ? 'bg-gray-750' : 'bg-gray-800'}`}
                      >
                        <td className="p-3">
                          <div className="font-semibold">{billetera.usuario.nombre}</div>
                          <div className="text-xs text-gray-400">ID: {billetera.usuario_id}</div>
                        </td>
                        <td className="p-3">
                          <div>{billetera.usuario.email}</div>
                          <div className="text-xs text-gray-400">
                            {billetera.usuario.documento && `Doc: ${billetera.usuario.documento}`}
                            {billetera.usuario.telefono && ` • Tel: ${billetera.usuario.telefono}`}
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <span className="font-mono text-green-400">
                            ${billetera.saldo.toFixed(2)}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            billetera.activa 
                              ? 'bg-green-900 text-green-300' 
                              : 'bg-red-900 text-red-300'
                          }`}>
                            {billetera.activa ? 'ACTIVA' : 'INACTIVA'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
        )}

        {/* Mensajes y errores */}
        {mensaje && (
          <div className="mt-4 p-4 bg-green-900 text-green-100 rounded-md whitespace-pre-line">
            {mensaje}
          </div>
        )}
        
        {error && (
          <div className="mt-4 p-4 bg-red-900 text-red-100 rounded-md">
            {error}
          </div>
        )}<br /><br />  <br /><br /> <br /><br />
      </div>
      
      <AdminNav />
    </div>
  );
};