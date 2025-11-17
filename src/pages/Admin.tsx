import React, { useEffect, useState, useCallback } from 'react';
import { Background } from '../components/Background';
import { FaHistory, FaUsers, FaCode, FaClipboard, FaDollarSign, FaWallet, FaBook, FaSync } from 'react-icons/fa';
import { AdminNav } from '../components/AdminNav';
import { Link } from 'react-router-dom';

export const Admin = () => {
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [totalAportes, setTotalAportes] = useState(0);
  const [totalReferralCodes, setTotalReferralCodes] = useState(0);
  const [totalWithdrawals, setTotalWithdrawals] = useState(0);
  const [totalBilleteras, setTotalBilleteras] = useState(0);
  const [totalPublicaciones, setTotalPublicaciones] = useState(0);
  const [transacciones, setTransacciones] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingRetiros, setLoadingRetiros] = useState(true);
  const TRANSACTIONS_PER_PAGE = 10;
  const [busqueda, setBusqueda] = useState('');
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [transaccionSeleccionada, setTransaccionSeleccionada] = useState(null);
  const [loadingUsuario, setLoadingUsuario] = useState(false);
  const [error, setError] = useState('');

  // 1. Cargar solo los retiros inmediatamente
  useEffect(() => {
    const fetchRetirosIniciales = async () => {
      try {
        setLoadingRetiros(true);
        console.log('🚀 Cargando retiros inmediatamente...');
        
        const retirosResponse = await fetch(
          `${import.meta.env.VITE_URL_LOCAL}/api/transacciones/retiros?limit=${TRANSACTIONS_PER_PAGE}&skip=0`
        );
        
        if (retirosResponse.ok) {
          const data = await retirosResponse.json();
          console.log('✅ Respuesta del backend:', data);
          
          // Manejar tanto el formato antiguo como el nuevo
          const retirosData = data.retiros || data;
          const retirosArray = Array.isArray(retirosData) ? retirosData : [];
          
          setTransacciones(retirosArray);
          setHasMore(data.paginacion?.hasMore || (retirosArray.length === TRANSACTIONS_PER_PAGE));
          setTotalWithdrawals(data.paginacion?.totalRetiros || retirosArray.length);
          console.log('✅ Retiros cargados:', retirosArray.length);
        } else {
          throw new Error('Error en la respuesta del servidor');
        }
      } catch (error) {
        console.error('❌ Error cargando retiros:', error);
        setError(error.message);
        setTransacciones([]);
      } finally {
        setLoadingRetiros(false);
      }
    };

    fetchRetirosIniciales();
  }, []);

  // 2. Cargar solo el summary (sin usuarios)
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        console.log('📊 Cargando summary...');

        const summaryResponse = await fetch(`${import.meta.env.VITE_URL_LOCAL}/api/summary`);
        if (summaryResponse.ok) {
          const summaryData = await summaryResponse.json();
          setTotalUsuarios(summaryData.totalUsuarios || 0);
          setTotalAportes(summaryData.totalAportes || 0);
          setTotalReferralCodes(summaryData.totalReferralCodes || 0);
          setTotalBilleteras(summaryData.totalBilleteras || 0);
          setTotalPublicaciones(summaryData.totalPublicaciones || 0);
        }
      } catch (error) {
        console.error('❌ Error cargando summary:', error);
      }
    };

    // Esperar un poco para que primero se muestren los retiros
    const timer = setTimeout(() => {
      fetchSummary();
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // 3. Cargar más retiros cuando sea necesario
  const loadMoreRetiros = useCallback(async () => {
    if (!hasMore || loadingMore) return;

    setLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const skip = nextPage * TRANSACTIONS_PER_PAGE;
      
      console.log(`📥 Cargando página ${nextPage}, skip: ${skip}`);
      
      const retirosResponse = await fetch(
        `${import.meta.env.VITE_URL_LOCAL}/api/transacciones/retiros?limit=${TRANSACTIONS_PER_PAGE}&skip=${skip}`
      );
      
      if (retirosResponse.ok) {
        const data = await retirosResponse.json();
        const newRetiros = data.retiros || data;
        const retirosArray = Array.isArray(newRetiros) ? newRetiros : [];
        
        console.log(`✅ Nuevos retiros cargados: ${retirosArray.length}`);
        
        setTransacciones(prev => [...prev, ...retirosArray]);
        setHasMore(data.paginacion?.hasMore || (retirosArray.length === TRANSACTIONS_PER_PAGE));
        setCurrentPage(nextPage);
      } else {
        throw new Error('Error cargando más retiros');
      }
    } catch (err) {
      console.error('Error cargando más retiros:', err);
      setError('Error cargando más retiros');
    } finally {
      setLoadingMore(false);
    }
  }, [currentPage, hasMore, loadingMore]);

  // Observer para scroll infinito
  const observer = React.useRef();
  const lastTransactionElementRef = useCallback(node => {
    if (loadingMore || loadingRetiros) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        console.log('🔄 Cargando más retiros automáticamente...');
        loadMoreRetiros();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loadingMore, loadingRetiros, hasMore, loadMoreRetiros]);

  // Obtener datos del usuario SOLO cuando se abre el modal - CORREGIDO
  const obtenerDatosUsuario = useCallback(async (usuarioId, transaccion) => {
    try {
      setLoadingUsuario(true);
      console.log('📞 Cargando datos del usuario...', usuarioId);

      // Verificar que el usuarioId sea válido
      if (!usuarioId || usuarioId === 'N/A') {
        throw new Error('ID de usuario no válido');
      }

      const usuarioResponse = await fetch(`${import.meta.env.VITE_URL_LOCAL}/usuarios/${usuarioId}`);
      
      console.log('🔍 Respuesta del servidor:', usuarioResponse.status);

      if (usuarioResponse.ok) {
        const usuarioData = await usuarioResponse.json();
        console.log('✅ Datos del usuario cargados:', usuarioData);
        
        setUsuarioSeleccionado(usuarioData);
        setTransaccionSeleccionada(transaccion);
        setModalVisible(true);
        setError(''); // Limpiar error anterior
      } else {
        const errorData = await usuarioResponse.json().catch(() => ({ message: 'Error desconocido' }));
        throw new Error(errorData.message || `Error ${usuarioResponse.status} al cargar usuario`);
      }
    } catch (error) {
      console.error('❌ Error cargando datos del usuario:', error);
      setError(`Error al cargar datos del usuario: ${error.message}`);
      // Mostrar un alert temporal para debug
      alert(`Error al cargar usuario: ${error.message}`);
    } finally {
      setLoadingUsuario(false);
    }
  }, []);

  // Filtrar transacciones por ID de usuario y descripción
  const transaccionesFiltradas = React.useMemo(() => {
    if (!busqueda.trim()) return transacciones;

    const searchTerm = busqueda.toLowerCase();
    return transacciones.filter(transaccion => {
      const usuarioId = getUsuarioId(transaccion);
      const descripcion = transaccion.descripcion || '';
      
      return (
        usuarioId.toString().toLowerCase().includes(searchTerm) ||
        descripcion.toLowerCase().includes(searchTerm)
      );
    });
  }, [busqueda, transacciones]);

  const cerrarModal = () => {
    setModalVisible(false);
    setUsuarioSeleccionado(null);
    setTransaccionSeleccionada(null);
    setError(''); // Limpiar errores al cerrar
  };

  const copiarAlPortapapeles = (texto) => {
    if (!texto) return;
    navigator.clipboard.writeText(texto.toString())
      .then(() => alert('Datos copiados al portapapeles'))
      .catch(err => console.error('Error al copiar:', err));
  };

  const cambiarEstadoTransaccion = async (nuevoEstado) => {
    if (!transaccionSeleccionada) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_URL_LOCAL}/api/transacciones/transacciones/${transaccionSeleccionada._id}`, 
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ estado: nuevoEstado }),
        }
      );

      if (response.ok) {
        setTransacciones(prev =>
          prev.map(t =>
            t._id === transaccionSeleccionada._id
              ? { ...t, estado: nuevoEstado }
              : t
          )
        );
        cerrarModal();
        alert(`Retiro ${nuevoEstado} correctamente`);
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
        throw new Error(errorData.message || `Error ${response.status}`);
      }
    } catch (error) {
      console.error('Error actualizando estado:', error);
      setError('Error al actualizar estado: ' + error.message);
      alert(`Error al actualizar estado: ${error.message}`);
    }
  };

  // Función para formatear el estado con colores
  const getEstadoBadge = (estado) => {
    const estados = {
      'pendiente': { color: 'bg-yellow-500 text-yellow-900', texto: 'Pendiente' },
      'aprobado': { color: 'bg-green-500 text-green-900', texto: 'Aprobado' },
      'rechazado': { color: 'bg-red-500 text-red-900', texto: 'Rechazado' },
      'completado': { color: 'bg-blue-500 text-blue-900', texto: 'Completado' }
    };
    
    const estadoConfig = estados[estado] || { color: 'bg-gray-500 text-gray-900', texto: estado };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${estadoConfig.color}`}>
        {estadoConfig.texto}
      </span>
    );
  };

  // Función para obtener el ID del usuario de diferentes formas
  const getUsuarioId = (transaccion) => {
    if (!transaccion || !transaccion.usuario_id) return 'N/A';
    
    if (typeof transaccion.usuario_id === 'object') {
      return transaccion.usuario_id._id || 'N/A';
    }
    return transaccion.usuario_id || 'N/A';
  };

  return (
    <div className="min-h-screen flex flex-col text-white">
      <Background />
      
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12 w-full">
        <div className="bg-gray-800 bg-opacity-80 rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
            <h1 className="text-3xl font-bold text-center">Administración</h1>
          </div>

          <div className="p-6">
            {/* Tarjetas de resumen */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              <Link to="/BV/usuarios" className="bg-gray-700 bg-opacity-50 p-6 rounded-xl border-l-4 border-blue-400 transition-all hover:shadow-lg">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-500 rounded-full mr-4">
                    <FaUsers className="text-xl" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Total Usuarios</h2>
                    <p className="text-2xl font-bold">{totalUsuarios}</p>
                  </div>
                </div>
              </Link>
              
              <Link to="/BV/codes" className="bg-gray-700 bg-opacity-50 p-6 rounded-xl border-l-4 border-green-400 transition-all hover:shadow-lg">
                <div className="flex items-center">
                  <div className="p-3 bg-green-500 rounded-full mr-4">
                    <FaCode className="text-xl" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Códigos Creados</h2>
                    <p className="text-2xl font-bold">{totalReferralCodes}</p>
                  </div>
                </div>
              </Link>

              <Link to="/BV/aportes" className="bg-gray-700 bg-opacity-50 p-6 rounded-xl border-l-4 border-yellow-400 transition-all hover:shadow-lg">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-500 rounded-full mr-4">
                    <FaClipboard className="text-xl" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Total Aportes</h2>
                    <p className="text-2xl font-bold">{totalAportes}</p>
                  </div>
                </div>
              </Link>

              <div className="bg-gray-700 bg-opacity-50 p-6 rounded-xl border-l-4 border-pink-400 transition-all hover:shadow-lg">
                <div className="flex items-center">
                  <div className="p-3 bg-pink-500 rounded-full mr-4">
                    <FaWallet className="text-xl" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Total Retiros</h2>
                    <p className="text-2xl font-bold">{transacciones.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-700 bg-opacity-50 p-6 rounded-xl border-l-4 border-orange-400 transition-all hover:shadow-lg">
                <div className="flex items-center">
                  <div className="p-3 bg-orange-500 rounded-full mr-4">
                    <FaBook className="text-xl" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Total Publicaciones</h2>
                    <p className="text-2xl font-bold">{totalPublicaciones}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabla de retiros - SIN NOMBRE DE USUARIO */}
            <div className="bg-gray-700 bg-opacity-50 p-6 rounded-xl">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FaHistory className="mr-2" /> Historial de Retiros
                <span className="ml-2 text-sm text-gray-300">
                  ({transaccionesFiltradas.length} retiros cargados)
                </span>
              </h2>
              
              <input
                type="text"
                placeholder="Buscar por ID de usuario o descripción"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="mb-4 p-2 rounded bg-gray-600 text-white w-full"
              />
              
              {loadingRetiros && transacciones.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">Cargando retiros...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-500">{error}</p>
                </div>
              ) : transaccionesFiltradas.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">
                    {busqueda ? 'No se encontraron retiros con ese criterio' : 'No hay retiros registrados'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-600">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID Usuario</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Monto</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Estado</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Fecha</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Descripción</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-600">
                      {transaccionesFiltradas.map((transaccion, index) => {
                        const isLastItem = index === transaccionesFiltradas.length - 1;
                        const usuarioId = getUsuarioId(transaccion);

                        return (
                          <tr 
                            key={transaccion._id} 
                            className="hover:bg-gray-700 transition-colors"
                            ref={isLastItem ? lastTransactionElementRef : null}
                          >
                            <td className="px-4 py-3 whitespace-nowrap text-blue-300 font-mono text-sm">
                              {usuarioId}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-green-400 font-semibold">
                              COP {transaccion.monto ? transaccion.monto.toLocaleString() : 0}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {getEstadoBadge(transaccion.estado)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-gray-300 text-sm">
                              {transaccion.fecha ? new Date(transaccion.fecha).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : 'N/A'}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-gray-300 text-sm">
                              {transaccion.descripcion || 'Sin descripción'}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <button
                                onClick={() => obtenerDatosUsuario(usuarioId, transaccion)}
                                className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded text-sm transition-colors"
                                disabled={loadingUsuario || usuarioId === 'N/A'}
                              >
                                {loadingUsuario ? 'Cargando...' : 'Ver Usuario'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  
                  {loadingMore && (
                    <div className="text-center py-4">
                      <div className="flex items-center justify-center">
                        <FaSync className="animate-spin text-xl text-blue-400 mr-2" />
                        <p className="text-gray-400">Cargando más retiros...</p>
                      </div>
                    </div>
                  )}
                  
                  {!hasMore && transaccionesFiltradas.length > 0 && (
                    <div className="text-center py-4">
                      <p className="text-gray-400">No hay más retiros para mostrar</p>
                    </div>
                  )}
                  
                  {hasMore && !loadingMore && (
                    <div className="text-center py-4">
                      <button
                        onClick={loadMoreRetiros}
                        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg transition-colors"
                      >
                        Cargar más retiros
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal - Solo se carga cuando se necesita */}
      {modalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden">
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              {loadingUsuario ? (
                <div className="text-center py-8">
                  <div className="flex items-center justify-center">
                    <FaSync className="animate-spin text-2xl text-blue-400 mr-2" />
                    <p className="text-gray-400">Cargando datos del usuario...</p>
                  </div>
                </div>
              ) : usuarioSeleccionado ? (
                <>
                  <h2 className="text-2xl font-bold mb-4">Detalles del Usuario</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {['nombre_completo', 'dni', 'linea_llamadas', 'linea_whatsapp', 'banco', 'cuenta_numero', 'titular_cuenta', 'correo_electronico'].map((field, index) => (
                      <div key={index} className="bg-gray-700 p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">
                            {field === 'dni' ? 'CC' : 
                             field === 'linea_llamadas' ? 'Teléfono' :
                             field === 'linea_whatsapp' ? 'WhatsApp' :
                             field === 'banco' ? 'Banco' :
                             field === 'cuenta_numero' ? 'N° Cuenta' :
                             field === 'titular_cuenta' ? 'Titular' :
                             field === 'correo_electronico' ? 'Correo' :
                             field.replace('_', ' ').toUpperCase()}
                          </span>
                          <FaClipboard 
                            className="cursor-pointer text-blue-400 hover:text-blue-300"
                            onClick={() => copiarAlPortapapeles(usuarioSeleccionado[field])}
                          />
                        </div>
                        <p className="font-medium mt-1">{usuarioSeleccionado[field] || 'N/A'}</p>
                      </div>
                    ))}
                  </div>
                  
                  {transaccionSeleccionada && (
                    <>
                      <hr className="border-gray-700 my-4" />
                      <h3 className="text-xl font-semibold mb-3">Detalles del Retiro</h3>
                      <div className="bg-gray-700 p-4 rounded-lg mb-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-400">Monto</p>
                            <p className="font-medium text-green-400">${transaccionSeleccionada.monto ? transaccionSeleccionada.monto.toLocaleString() : 0}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Fecha</p>
                            <p className="font-medium">
                              {transaccionSeleccionada.fecha ? 
                                new Date(transaccionSeleccionada.fecha).toLocaleDateString('es-ES', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                }) : 
                                'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Estado</p>
                            <div className="font-medium">{getEstadoBadge(transaccionSeleccionada.estado)}</div>
                          </div>
                          <div className="col-span-2">
                            <p className="text-sm text-gray-400">Descripción</p>
                            <p className="font-medium">{transaccionSeleccionada.descripcion || 'Sin descripción'}</p>
                          </div>
                        </div>
                      </div>

                      {transaccionSeleccionada.estado === 'pendiente' && (
                        <div className="grid grid-cols-2 gap-3">
                          <button 
                            onClick={() => cambiarEstadoTransaccion('aprobado')}
                            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors"
                          >
                            Aprobar Retiro
                          </button>
                          <button
                            onClick={() => cambiarEstadoTransaccion('rechazado')}
                            className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors"
                          >
                            Rechazar Retiro
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-red-500">Error al cargar datos del usuario</p>
                </div>
              )}

              <div className="mt-6">
                <button 
                  onClick={cerrarModal}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <AdminNav />
    </div>
  );
};