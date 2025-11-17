import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AdminNav } from '../components/AdminNav';
import { PlusCircle, Trash2, Eye, UserCircle2, Search } from 'lucide-react';

const LIMITE = 10;

export const RecargarBilletera = () => {
  // Estado para el formulario de recarga
  const [monto, setMonto] = useState('');
  const [usuarioId, setUsuarioId] = useState('');
  const [usuarioInfo, setUsuarioInfo] = useState(null);
  const [loadingUsuario, setLoadingUsuario] = useState(false);

  // Estado para la lista y filtro de transacciones
  const [transacciones, setTransacciones] = useState([]);
  const [filtroUsuarioId, setFiltroUsuarioId] = useState('');
  const [loadingTransacciones, setLoadingTransacciones] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalTransacciones, setTotalTransacciones] = useState(0);

  // Estado para UI general
  const [mensaje, setMensaje] = useState('');
  const [mensajeColor, setMensajeColor] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [transaccionSeleccionada, setTransaccionSeleccionada] = useState(null);

  const listRef = useRef<HTMLDivElement>(null);

  // Buscar usuario por ID (para el formulario de recarga)
  useEffect(() => {
    if (!usuarioId) {
      setUsuarioInfo(null);
      return;
    }
    setLoadingUsuario(true);
    fetch(`${import.meta.env.VITE_URL_LOCAL}/usuarios/${usuarioId}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => setUsuarioInfo(data))
      .catch(() => setUsuarioInfo(null))
      .finally(() => setLoadingUsuario(false));
  }, [usuarioId]);

  // Obtener transacciones de recarga con paginación y filtro
  const fetchTransacciones = useCallback(async (page = 0, isInitialLoad = false) => {
    if (isInitialLoad) {
      setLoadingTransacciones(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const skip = page * LIMITE;
      
      // Construir URL según si hay filtro o no
      let url;
      if (filtroUsuarioId) {
        url = `${import.meta.env.VITE_URL_LOCAL}/api/transacciones/recargas/${filtroUsuarioId}?limit=${LIMITE}&skip=${skip}`;
      } else {
        url = `${import.meta.env.VITE_URL_LOCAL}/api/transacciones/recargas?limit=${LIMITE}&skip=${skip}`;
      }
      
      console.log(`📥 Cargando recargas - Página ${page}, Skip: ${skip}, URL:`, url);
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Respuesta del backend:', data);
        
        // Manejar tanto el formato antiguo como el nuevo
        const recargasData = data.recargas || data;
        const recargasArray = Array.isArray(recargasData) ? recargasData : [];
        
        if (isInitialLoad) {
          setTransacciones(recargasArray);
        } else {
          setTransacciones(prev => [...prev, ...recargasArray]);
        }
        
        setHasMore(data.paginacion?.hasMore || (recargasArray.length === LIMITE));
        setCurrentPage(page);
        setTotalTransacciones(data.paginacion?.totalRecargas || recargasArray.length);
        
        console.log(`✅ Recargas cargadas: ${recargasArray.length}, HasMore: ${data.paginacion?.hasMore || (recargasArray.length === LIMITE)}`);
      } else {
        throw new Error('Error en la respuesta del servidor');
      }
    } catch (error) {
      console.error('❌ Error cargando recargas:', error);
      setMensaje('Error al obtener transacciones.');
      setMensajeColor('text-red-400');
      if (isInitialLoad) {
        setTransacciones([]);
        setHasMore(false);
      }
    } finally {
      setLoadingTransacciones(false);
      setLoadingMore(false);
    }
  }, [filtroUsuarioId]);

  // Cargar transacciones al montar y cuando cambia el filtro
  useEffect(() => {
    setCurrentPage(0);
    fetchTransacciones(0, true);
  }, [filtroUsuarioId]);

  // Scroll infinito
  useEffect(() => {
    const handleScroll = () => {
      if (!listRef.current || loadingMore || loadingTransacciones || !hasMore) return;
      const { scrollTop, scrollHeight, clientHeight } = listRef.current;
      if (scrollHeight - scrollTop <= clientHeight + 100) {
        fetchTransacciones(currentPage + 1, false);
      }
    };
    
    const refCurrent = listRef.current;
    if (refCurrent) {
      refCurrent.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (refCurrent) {
        refCurrent.removeEventListener('scroll', handleScroll);
      }
    };
  }, [fetchTransacciones, currentPage, loadingMore, loadingTransacciones, hasMore]);

  // Función para cargar más manualmente
  const loadMoreTransacciones = () => {
    if (!loadingMore && hasMore) {
      fetchTransacciones(currentPage + 1, false);
    }
  };

  // Validación y recarga
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setMensajeColor('');
    if (!usuarioInfo) {
      setMensaje('Usuario no encontrado para la recarga.');
      setMensajeColor('text-red-400');
      return;
    }
    const montoNum = parseFloat(monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      setMensaje('Por favor, ingresa un monto válido.');
      setMensajeColor('text-red-400');
      return;
    }
    try {
      const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/api/billetera/recargar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monto: montoNum, usuarioId }),
      });
      if (response.ok) {
        setMensaje('Billetera recargada exitosamente.');
        setMensajeColor('text-green-400');
        setMonto('');
        // Refrescar la lista de transacciones después de una recarga exitosa
        setCurrentPage(0);
        fetchTransacciones(0, true);
      } else {
        const errorData = await response.json();
        setMensaje(`Error: ${errorData.message || 'No se pudo recargar la billetera.'}`);
        setMensajeColor('text-red-400');
      }
    } catch {
      setMensaje('Error en la conexión.');
      setMensajeColor('text-blue-400');
    }
  };

  // Eliminar transacción
  const eliminarTransaccion = async (id) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/api/transacciones/transacciones/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setMensaje('Transacción eliminada correctamente.');
        setMensajeColor('text-green-400');
        // Refrescar la lista
        setCurrentPage(0);
        fetchTransacciones(0, true);
      } else {
        const errorData = await response.json();
        setMensaje(`Error: ${errorData.message}`);
        setMensajeColor('text-red-400');
      }
    } catch {
      setMensaje('Error en la conexión.');
      setMensajeColor('text-blue-400');
    }
  };

  const handleOpenModal = (transaccion) => {
    setTransaccionSeleccionada(transaccion);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setTransaccionSeleccionada(null);
  };

  // Función para obtener el ID del usuario de diferentes formas
  const getUsuarioId = (transaccion) => {
    if (!transaccion || !transaccion.usuario_id) return 'N/A';
    
    if (typeof transaccion.usuario_id === 'object') {
      return transaccion.usuario_id._id || 'N/A';
    }
    return transaccion.usuario_id || 'N/A';
  };

  // Función para obtener el nombre del usuario si está disponible
  const getUsuarioNombre = (transaccion) => {
    if (typeof transaccion.usuario_id === 'object') {
      return transaccion.usuario_id.nombre || 'N/A';
    }
    return 'N/A';
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 text-white p-4">
      <form className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-lg border border-blue-700" onSubmit={handleSubmit}>
        <h2 className="text-3xl font-extrabold mb-6 text-center flex items-center justify-center text-blue-400 drop-shadow">
          <PlusCircle className="mr-2 w-8 h-8" /> Recargar Billetera
        </h2>
        {mensaje && <p className={`mb-4 ${mensajeColor} text-center font-semibold`}>{mensaje}</p>}
        
        <div className="mb-6">
          <label className="block mb-2 font-semibold text-blue-300" htmlFor="monto">Monto a Recargar</label>
          <input
            type="number" id="monto" value={monto} onChange={(e) => setMonto(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-700 text-white border border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required min="1" placeholder="Ej: 100" />
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-semibold text-blue-300" htmlFor="userId">ID del Usuario a Recargar</label>
          <input
            type="text" id="userId" value={usuarioId} onChange={(e) => setUsuarioId(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-700 text-white border border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required placeholder="Ingresa el ID del usuario" />
        </div>

        {usuarioId && (
          <div className="mb-6">
            {loadingUsuario ? (
              <div className="bg-blue-700 text-white rounded-lg p-3 text-center font-semibold shadow">Cargando usuario...</div>
            ) : usuarioInfo ? (
              <div className="flex items-center gap-4 bg-gradient-to-r from-blue-800 to-blue-600 rounded-xl p-4 shadow-lg border border-blue-400">
                <UserCircle2 className="w-12 h-12 text-white drop-shadow" />
                <div>
                  <div className="font-bold text-lg text-white">{usuarioInfo.nombre_completo}</div>
                  <div className="text-blue-200 font-mono">@{usuarioInfo.nombre_usuario}</div>
                  <div className="text-xs text-blue-100 mt-1">ID: <span className="font-mono">{usuarioInfo._id}</span></div>
                </div>
              </div>
            ) : (
              <div className="bg-red-700 text-white rounded-lg p-3 text-center font-semibold shadow">Usuario no encontrado</div>
            )}
          </div>
        )}

        <button type="submit"
          className="bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 px-4 rounded-lg w-full hover:from-blue-700 hover:to-blue-600 transition-all font-bold shadow-lg mt-2"
          disabled={loadingUsuario || !usuarioInfo}>
          {loadingUsuario ? 'Cargando...' : 'Recargar Billetera'}
        </button>
      </form>

      {/* SECCIÓN DE LISTA Y FILTRO */}
      <div className="w-full max-w-lg mt-12">
        <h2 className="text-2xl font-bold text-center text-blue-300 drop-shadow">
          Transacciones de Recarga
          <span className="ml-2 text-sm text-gray-300">
            ({transacciones.length} de {totalTransacciones} recargas cargadas)
          </span>
        </h2>
        
        {/* Input para filtrar */}
        <div className="mt-4 mb-4 relative">
          <label htmlFor="filtroUsuario" className="sr-only">Filtrar por ID de Usuario</label>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 w-5 h-5"/>
          <input
            id="filtroUsuario"
            type="text"
            value={filtroUsuarioId}
            onChange={(e) => setFiltroUsuarioId(e.target.value)}
            placeholder="Filtrar por ID de usuario..."
            className="w-full p-3 pl-10 rounded-lg bg-gray-700 text-white border border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div
          className="w-full h-[400px] overflow-y-auto"
          ref={listRef}
          style={{ borderRadius: '1rem', border: '1px solid #2563eb', background: '#1f2937' }}
        >
          {loadingTransacciones && transacciones.length === 0 ? (
            <div className="p-4 text-center text-blue-200">Cargando transacciones...</div>
          ) : (
            <ul className="divide-y divide-blue-900/50">
              {transacciones.length === 0 ? (
                <li className="p-4 text-center text-blue-200">
                  {filtroUsuarioId ? 'No se encontraron recargas para este usuario.' : 'No hay transacciones de recarga.'}
                </li>
              ) : (
                transacciones.map((transaccion, index) => {
                  const isLastItem = index === transacciones.length - 1;
                  const usuarioId = getUsuarioId(transaccion);

                  return (
                    <li 
                      key={transaccion._id} 
                      className="flex justify-between items-center p-4 hover:bg-blue-900/30 transition-colors"
                    >
                      <div className="flex-1 overflow-hidden">
                        <p className="font-semibold text-blue-200 truncate">{transaccion.descripcion}</p>
                        <p className="text-sm text-gray-400 font-mono break-words">ID Usuario: {usuarioId}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {transaccion.fecha ? new Date(transaccion.fecha).toLocaleString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'N/A'}
                        </p>
                      </div>
                      <div className="flex items-center ml-4">
                        <button onClick={() => handleOpenModal(transaccion)} className="text-green-400 hover:text-green-300 mr-2 transition">
                          <Eye className="w-5 h-5" />
                        </button>
                        <button onClick={() => eliminarTransaccion(transaccion._id)} className="text-red-400 hover:text-red-300 transition">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </li>
                  );
                })
              )}
              
              {/* Indicadores de carga y estado */}
              {loadingMore && (
                <li className="p-4 text-center text-blue-200">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400 mr-2"></div>
                    Cargando más recargas...
                  </div>
                </li>
              )}
              
              {!hasMore && transacciones.length > 0 && (
                <li className="p-4 text-center text-blue-400 font-semibold">Fin de los resultados</li>
              )}
            </ul>
          )}
        </div>

        {/* Botón para cargar más manualmente */}
        {!loadingMore && hasMore && transacciones.length > 0 && (
          <div className="mt-4 text-center">
            <button
              onClick={loadMoreTransacciones}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg transition-colors"
            >
              Cargar más recargas
            </button>
          </div>
        )}
      </div>

      {modalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-8 rounded-2xl w-11/12 max-w-md border-2 border-blue-700 shadow-2xl relative">
            <h3 className="text-xl font-bold mb-4 text-blue-300">Detalles de la Transacción</h3>
            {transaccionSeleccionada && (
              <div className="space-y-2 text-white">
                <p><span className="font-semibold text-blue-200">ID Transacción:</span> <span className="font-mono break-all">{transaccionSeleccionada._id}</span></p>
                <p><span className="font-semibold text-blue-200">ID Usuario:</span> <span className="font-mono break-all">{getUsuarioId(transaccionSeleccionada)}</span></p>
                <p><span className="font-semibold text-blue-200">Nombre Usuario:</span> {getUsuarioNombre(transaccionSeleccionada)}</p>
                <p><span className="font-semibold text-blue-200">Descripción:</span> {transaccionSeleccionada.descripcion}</p>
                <p><span className="font-semibold text-blue-200">Monto:</span> <span className="font-mono text-green-400">${transaccionSeleccionada.monto?.toFixed(2) || '0.00'}</span></p>
                <p><span className="font-semibold text-blue-200">Fecha:</span> {transaccionSeleccionada.fecha ? new Date(transaccionSeleccionada.fecha).toLocaleString('es-ES', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 'N/A'}</p>
              </div>
            )}
            <button onClick={handleCloseModal} className="mt-6 bg-gradient-to-r from-blue-600 to-blue-500 text-white py-2 px-6 rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all font-bold shadow-lg w-full">
              Cerrar
            </button>
          </div>
        </div>
      )}

      <div className="mt-20 w-full">
        <AdminNav />
      </div>
    </div>
  );
};