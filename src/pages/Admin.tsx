import React, { useEffect, useState, useCallback } from 'react';
import { Background } from '../components/Background';
import { FaHistory, FaUsers, FaCode, FaClipboard, FaDollarSign } from 'react-icons/fa';
import { AdminNav } from '../components/AdminNav';
import { Link } from 'react-router-dom';

export const Admin = () => {
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [totalCodigosCreados, setTotalCodigosCreados] = useState(0);
  const [totalRetiros, setTotalRetiros] = useState(0);
  const [totalAportesValidados, setTotalAportesValidados] = useState(0);
  const [transacciones, setTransacciones] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [transaccionSeleccionada, setTransaccionSeleccionada] = useState(null);
  const [usuariosReferidos, setUsuariosReferidos] = useState([]);
  const [todosLosUsuarios, setTodosLosUsuarios] = useState([]);
  const [aportes, setAportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usuariosResponse, codigosResponse, transaccionesResponse, aportesResponse] = await Promise.all([
          fetch(`${import.meta.env.VITE_URL_LOCAL}/usuarios`),
          fetch(`${import.meta.env.VITE_URL_LOCAL}/api/referralCodes`),
          fetch(`${import.meta.env.VITE_URL_LOCAL}/api/transacciones/transacciones/`),
          fetch(`${import.meta.env.VITE_URL_LOCAL}/api/aportes`)
        ]);

        if (!usuariosResponse.ok) throw new Error('Error al cargar usuarios');
        const usuariosData = await usuariosResponse.json();
        setTotalUsuarios(usuariosData.length);
        setTodosLosUsuarios(usuariosData);

        if (!codigosResponse.ok) throw new Error('Error al cargar códigos');
        const codigosData = await codigosResponse.json();
        setTotalCodigosCreados(codigosData.length);

        if (!transaccionesResponse.ok) throw new Error('Error al cargar transacciones');
        const transaccionesData = await transaccionesResponse.json();
        const retiros = transaccionesData.filter(t => t.tipo === 'retiro');
        setTotalRetiros(retiros.length);
        setTransacciones(retiros);

        if (!aportesResponse.ok) throw new Error('Error al cargar aportes');
        const aportesData = await aportesResponse.json();
        setAportes(aportesData);
        const aportesValidados = aportesData.filter(aporte => aporte.aporte);
        setTotalAportesValidados(aportesValidados.length);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const obtenerDatosUsuario = useCallback(async (usuarioId, transaccionId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/usuarios/${usuarioId}`);
      if (!response.ok) throw new Error('Error al obtener los datos del usuario');
      const usuarioData = await response.json();
      setUsuarioSeleccionado(usuarioData);
      
      // Obtener la transacción completa y establecerla
      const transaccionData = transacciones.find(t => t._id === transaccionId);
      setTransaccionSeleccionada(transaccionData);
      
      await obtenerReferidos(usuarioId);
      setModalVisible(true);
    } catch (error) {
      setError(error.message);
    }
  }, [transacciones]);

  const obtenerReferidos = async (usuarioId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/api/referralCodes/user/${usuarioId}`);
      if (!response.ok) throw new Error('Error al obtener los códigos de referido');
      const codigosData = await response.json();
      const codigosReferidos = codigosData.map(codigo => codigo.code);

      if (todosLosUsuarios.length > 0) {
        const usuariosReferidosFiltrados = todosLosUsuarios.filter(usuario =>
          codigosReferidos.includes(usuario.codigo_referido)
        );

        const usuariosReferidosConNombres = usuariosReferidosFiltrados.map(usuario => {
          const aporte = aportes.find(aporte => aporte.usuarioId === usuario._id);
          return {
            id: usuario._id,
            nombre: usuario.nombre_completo,
            validado: aporte ? aporte.aporte : false
          };
        });

        setUsuariosReferidos(usuariosReferidosConNombres);
      } else {
        setUsuariosReferidos([]);
      }
    } catch (error) {
      setError('Error al obtener los referidos');
    }
  };

  const filtrarTransacciones = () => {
    if (!busqueda) return transacciones;
    return transacciones.filter(transaccion => {
      const usuario = todosLosUsuarios.find(u => u._id === transaccion.usuario_id);
      if (!usuario) return false;
      return (
        transaccion.usuario_id.toLowerCase().includes(busqueda.toLowerCase()) || 
        usuario.nombre_completo.toLowerCase().includes(busqueda.toLowerCase())
      );
    });
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setUsuarioSeleccionado(null);
    setTransaccionSeleccionada(null);
    setUsuariosReferidos([]);
  };

  const copiarAlPortapapeles = (texto) => {
    navigator.clipboard.writeText(texto)
      .then(() => alert('Datos copiados al portapapeles'))
      .catch(err => console.error('Error al copiar:', err));
  };

  const cambiarEstadoTransaccion = async () => {
    if (!transaccionSeleccionada) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/api/transacciones/transacciones/${transaccionSeleccionada._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estado: 'aprobado' }),
      });

      if (!response.ok) throw new Error('Error al actualizar el estado de la transacción');

      // Actualizar el estado local
      setTransacciones(prevTransacciones =>
        prevTransacciones.map(transaccion =>
          transaccion._id === transaccionSeleccionada._id
            ? { ...transaccion, estado: 'aprobado' }
            : transaccion
        )
      );

      // Cerrar el modal
      cerrarModal();
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-white">
      <Background />
      
      {/* Contenedor principal */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12 w-full">
        {/* Tarjeta principal con fondo semitransparente */}
        <div className="bg-gray-800 bg-opacity-80 rounded-2xl shadow-xl overflow-hidden">
          {/* Encabezado con gradiente */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
            <h1 className="text-3xl font-bold text-center">Administración</h1>
          </div>

          {/* Contenido principal */}
          <div className="p-6">
            {/* Sección de estadísticas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Tarjeta de usuarios */}
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
              
              {/* Tarjeta de códigos creados */}
              <Link to="/BV/codes" className="bg-gray-700 bg-opacity-50 p-6 rounded-xl border-l-4 border-green-400 transition-all hover:shadow-lg">
                <div className="flex items-center">
                  <div className="p-3 bg-green-500 rounded-full mr-4">
                    <FaCode className="text-xl" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Códigos Creados</h2>
                    <p className="text-2xl font-bold">{totalCodigosCreados}</p>
                  </div>
                </div>
              </Link>

              {/* Tarjeta de retiros */}
              <div className="bg-gray-700 bg-opacity-50 p-6 rounded-xl border-l-4 border-purple-400 transition-all hover:shadow-lg">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-500 rounded-full mr-4">
                    <FaDollarSign className="text-xl" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Total Retiros</h2>
                    <p className="text-2xl font-bold">{totalRetiros}</p>
                  </div>
                </div>
              </div>

              {/* Tarjeta de aportes */}
              <Link to="/BV/aportes" className="bg-gray-700 bg-opacity-50 p-6 rounded-xl border-l-4 border-yellow-400 transition-all hover:shadow-lg">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-500 rounded-full mr-4">
                    <FaClipboard className="text-xl" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Aportes Validados</h2>
                    <p className="text-2xl font-bold">{totalAportesValidados}</p>
                  </div>
                </div>
              </Link>
            </div>

            {/* Sección de retiros */}
            <div className="bg-gray-700 bg-opacity-50 p-6 rounded-xl">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FaHistory className="mr-2" /> Historial de Retiros
              </h2>
              
              <input
                type="text"
                placeholder="Buscar por ID o Nombre"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="mb-4 p-2 rounded bg-gray-600 text-white w-full"
              />
              
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">Cargando datos...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-500">{error}</p>
                </div>
              ) : transacciones.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">No hay retiros registrados</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-600">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID Usuario</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Nombre</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Monto</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Descripción</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Fecha</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-600">
                      {filtrarTransacciones().map((transaccion) => {
                        const usuario = todosLosUsuarios.find(u => u._id === transaccion.usuario_id);
                        const estadoColor = transaccion.estado === 'pendiente' ? 'text-green-500' : 'text-red-500';

                        return (
                          <tr key={transaccion._id} className="hover:bg-gray-700 transition-colors">
                            <td className={`px-4 py-3 whitespace-nowrap ${estadoColor}`}>{transaccion.usuario_id}</td>
                            <td className={`px-4 py-3 whitespace-nowrap ${estadoColor}`}>
                              {usuario ? usuario.nombre_completo : 'Usuario no encontrado'}
                            </td>
                            <td className={`px-4 py-3 whitespace-nowrap ${estadoColor}`}>${transaccion.monto}</td>
                            <td className={`px-4 py-3 whitespace-nowrap ${estadoColor}`}>{transaccion.descripcion}</td>
                            <td className={`px-4 py-3 whitespace-nowrap ${estadoColor}`}>
                              {new Date(transaccion.fecha).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {usuario && (
                                <button
                                  onClick={() => obtenerDatosUsuario(transaccion.usuario_id, transaccion._id)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded text-sm transition-colors"
                                >
                                  Ver
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal para detalles del usuario */}
      {modalVisible && usuarioSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden">
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">Detalles del Usuario</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {['nombre_completo', 'dni', 'linea_llamadas', 'linea_whatsapp', 'banco', 'cuenta_numero', 'titular_cuenta', 'correo_electronico'].map((field, index) => (
                  <div key={index} className="bg-gray-700 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">{field === 'dni' ? 'CC' : field.replace('_', ' ').toUpperCase()}</span>
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
                        <p className="font-medium">${transaccionSeleccionada.monto}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Fecha</p>
                        <p className="font-medium">{new Date(transaccionSeleccionada.fecha).toLocaleDateString()}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-gray-400">Descripción</p>
                        <p className="font-medium">{transaccionSeleccionada.descripcion}</p>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={cambiarEstadoTransaccion}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors mb-4"
                  >
                    Marcar como Aprobado
                  </button>
                </>
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
