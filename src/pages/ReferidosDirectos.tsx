import React, { useEffect, useState } from 'react';
import { Background } from '../components/Background';
import { FaUserPlus, FaCheck, FaTimes, FaPaperPlane, FaUsers, FaCheckDouble, FaExclamationTriangle, FaWallet } from 'react-icons/fa';
import { MobileNav } from '../components/MobileNav';
import axios from 'axios';

const Message = ({ message, type, onClose }) => {
  if (!message) return null;

  const baseClasses = 'p-4 rounded-md mb-4 flex justify-between items-center';
  const typeClasses = {
    success: 'bg-green-100 border border-green-400 text-green-700',
    error: 'bg-red-100 border border-red-400 text-red-700',
    warning: 'bg-yellow-100 border border-yellow-400 text-yellow-700',
  };

  return (
    <div className={`${baseClasses} ${typeClasses[type]}`}>
      <span>{message}</span>
      <button onClick={onClose} className="ml-4">
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
};

export const ReferidosDirectos = () => {
  const [activeTab, setActiveTab] = useState('recibidas');
  const [solicitudesRecibidas, setSolicitudesRecibidas] = useState([]);
  const [solicitudesEnviadas, setSolicitudesEnviadas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [referidoId, setReferidoId] = useState('');
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [selectedSolicitudes, setSelectedSolicitudes] = useState([]);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [billeteraActiva, setBilleteraActiva] = useState(false);
  const [verificandoBilletera, setVerificandoBilletera] = useState(true);

  useEffect(() => {
    const usuario = localStorage.getItem('usuario');
    if (usuario) {
      const user = JSON.parse(usuario);
      setUserId(user._id);
      setUserData(user);
      verificarBilleteraUsuario(user._id);
      fetchSolicitudes(user._id);
    }
  }, []);

  // Función para verificar el estado de la billetera del usuario
  const verificarBilleteraUsuario = async (usuarioId) => {
    try {
      setVerificandoBilletera(true);
      const response = await axios.get(`${import.meta.env.VITE_URL_LOCAL}/api/billetera/estado/${usuarioId}`);
      setBilleteraActiva(response.data.activa);
    } catch (error) {
      console.error('Error al verificar billetera:', error);
      setBilleteraActiva(false);
      setMessage({ 
        text: 'No se pudo verificar el estado de tu billetera', 
        type: 'error' 
      });
    } finally {
      setVerificandoBilletera(false);
    }
  };

  const fetchSolicitudes = async (userId) => {
    try {
      setIsLoading(true);
      const [recibidas, enviadas] = await Promise.all([
        axios.get(`${import.meta.env.VITE_URL_LOCAL}/api/referralRequests/recibidas/${userId}`),
        axios.get(`${import.meta.env.VITE_URL_LOCAL}/api/referralRequests/enviadas/${userId}`)
      ]);
      
      setSolicitudesRecibidas(recibidas.data || []);
      setSolicitudesEnviadas(enviadas.data || []);
    } catch (error) {
      console.error('Error al cargar solicitudes:', error);
      setMessage({ 
        text: 'Error al cargar solicitudes: ' + (error.response?.data?.message || error.message), 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCambiarEstado = async (solicitudId, nuevoEstado) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_URL_LOCAL}/api/referralRequests/${solicitudId}`,
        { estado: nuevoEstado }
      );

      setMessage({ text: `Solicitud ${nuevoEstado}`, type: 'success' });
      fetchSolicitudes(userId);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al actualizar estado';
      setMessage({ text: errorMessage, type: 'error' });
      console.error('Error al cambiar estado:', error);
    }
  };

  // Función para aceptar múltiples solicitudes (máximo 20)
  const handleAceptarPorLote = async () => {
    if (selectedSolicitudes.length === 0) {
      setMessage({ text: 'Selecciona al menos una solicitud para aceptar', type: 'error' });
      return;
    }

    // Verificar billetera activa
    if (!billeteraActiva) {
      setMessage({ 
        text: 'Debes activar tu billetera primero para poder aceptar referidos.', 
        type: 'error' 
      });
      return;
    }

    // Limitar a máximo 20 solicitudes por lote
    const solicitudesAProcesar = selectedSolicitudes.slice(0, 20);
    
    if (selectedSolicitudes.length > 20) {
      setMessage({ 
        text: `Máximo 20 solicitudes por lote. Se procesarán las primeras 20.`, 
        type: 'warning' 
      });
    }

    setIsProcessingBatch(true);
    try {
      const usuarioString = localStorage.getItem('usuario');
      if (!usuarioString) {
        setMessage({ text: 'No se encontró el usuario en localStorage.', type: 'error' });
        return;
      }

      const usuario = JSON.parse(usuarioString);
      const userResponse = await axios.get(`${import.meta.env.VITE_URL_LOCAL}/usuarios/${usuario._id}`);
      const nivel = userResponse.data.nivel;

      let procesadasExitosamente = 0;
      let errores = 0;
      let erroresDetalles = [];

      // Procesar cada solicitud seleccionada (máximo 20)
      for (const solicitudId of solicitudesAProcesar) {
        const solicitud = solicitudesRecibidas.find(s => s._id === solicitudId);
        if (solicitud && solicitud.estado === 'pendiente') {
          try {
            // El usuario actual (que acepta) es el patrocinador
            const solicitanteId = usuario._id;
            
            // 1. Cambiar estado de la solicitud
            await axios.patch(
              `${import.meta.env.VITE_URL_LOCAL}/api/referralRequests/${solicitudId}`,
              { estado: 'aceptado' }
            );

            // 2. Realizar la recarga al PATROCINADOR (usuario actual)
            await axios.post(`${import.meta.env.VITE_URL_LOCAL}/api/billetera/recarga-referido`, {
              usuarioId: solicitanteId,
              nivel: nivel,
              referido_id: solicitud.referido_id?._id || solicitud.referido_id
            });

            procesadasExitosamente++;
          } catch (error) {
            console.error(`Error procesando solicitud ${solicitudId}:`, error);
            const errorMsg = error.response?.data?.message || 'Error desconocido';
            erroresDetalles.push(`Solicitud ${solicitudId}: ${errorMsg}`);
            errores++;
          }
        }
      }

      if (errores > 0) {
        setMessage({ 
          text: `Procesadas ${procesadasExitosamente} solicitudes exitosamente, ${errores} fallaron. ${erroresDetalles.join('; ')}`, 
          type: 'warning'
        });
      } else {
        setMessage({ 
          text: `Todas las ${procesadasExitosamente} solicitudes procesadas exitosamente`, 
          type: 'success'
        });
      }
      
      setSelectedSolicitudes([]);
      fetchSolicitudes(userId);
    } catch (error) {
      setMessage({ 
        text: 'Error al procesar solicitudes por lote: ' + error.message, 
        type: 'error' 
      });
    } finally {
      setIsProcessingBatch(false);
    }
  };

  const handleCrearSolicitud = async (e) => {
    e.preventDefault();
    try {
      if (!referidoId) {
        setMessage({ text: 'Por favor ingresa un ID de usuario válido', type: 'error' });
        return;
      }

      if (userId === referidoId) {
        setMessage({ text: 'No puedes referirte a ti mismo', type: 'error' });
        return;
      }

      await axios.post(`${import.meta.env.VITE_URL_LOCAL}/api/referralRequests/`, {
        solicitante_id: userId,
        referido_id: referidoId
      });

      setMessage({ text: 'Solicitud creada exitosamente', type: 'success' });
      setShowModal(false);
      setReferidoId('');
      fetchSolicitudes(userId);
    } catch (error) {
      setMessage({ 
        text: error.response?.data?.message || 'Error al crear solicitud', 
        type: 'error' 
      });
      console.error('Error al crear solicitud:', error.response?.data || error);
    }
  };

  const handleCloseMessage = () => {
    setMessage({ text: '', type: '' });
  };

  // Función para seleccionar/deseleccionar solicitudes
  const toggleSeleccionSolicitud = (solicitudId) => {
    setSelectedSolicitudes(prev => 
      prev.includes(solicitudId) 
        ? prev.filter(id => id !== solicitudId)
        : [...prev, solicitudId]
    );
  };

  // Función para seleccionar todas las solicitudes pendientes (máximo 20)
  const seleccionarTodasPendientes = () => {
    const pendientesIds = solicitudesRecibidas
      .filter(s => s.estado === 'pendiente')
      .slice(0, 20)
      .map(s => s._id);
    setSelectedSolicitudes(pendientesIds);
  };

  // Función para limpiar selección
  const limpiarSeleccion = () => {
    setSelectedSolicitudes([]);
  };

  // Función para activar billetera
  const handleActivarBilletera = async () => {
    try {
      const usuarioString = localStorage.getItem('usuario');
      if (!usuarioString) {
        setMessage({ text: 'No se encontró el usuario en localStorage.', type: 'error' });
        return;
      }

      const usuario = JSON.parse(usuarioString);
      const token = localStorage.getItem('token');
      
      await axios.post(`${import.meta.env.VITE_URL_LOCAL}/api/billetera/activar`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage({ text: 'Billetera activada exitosamente', type: 'success' });
      setBilleteraActiva(true);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Error al activar billetera';
      setMessage({ text: errorMsg, type: 'error' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-white pb-20">
      <Background />

      {/* Contenedor principal */}
      <div className="max-w-4xl mx-auto px-4 py-8 w-full">
        {/* Encabezado con gradiente */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-xl">
          <h1 className="text-3xl font-bold text-center flex items-center justify-center gap-2">
            <FaUsers /> Referidos Directos
          </h1>
        </div>

        {/* Contenido principal */}
        <div className="bg-gray-800 bg-opacity-80 p-6 rounded-b-xl">
          <Message message={message.text} type={message.type} onClose={handleCloseMessage} />
          
          {/* Estado de la billetera */}
          {verificandoBilletera ? (
            <div className="mb-6 bg-gray-700 border border-gray-600 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
                <span className="text-gray-300">Verificando estado de la billetera...</span>
              </div>
            </div>
          ) : !billeteraActiva ? (
            <div className="mb-6 bg-red-600 bg-opacity-20 border border-red-500 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaExclamationTriangle className="w-5 h-5 text-red-400" />
                  <div>
                    <span className="text-red-300 font-medium">Billetera Inactiva</span>
                    <p className="text-red-200 text-sm mt-1">
                      Debes activar tu billetera para poder aceptar referidos y recibir comisiones.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleActivarBilletera}
                  className="bg-green-600 hover:bg-green-500 text-white py-2 px-4 rounded-lg transition duration-200 flex items-center gap-2"
                >
                  <FaWallet />
                  Activar Billetera
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-6 bg-green-600 bg-opacity-20 border border-green-500 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <FaWallet className="w-5 h-5 text-green-400" />
                <div>
                  <span className="text-green-300 font-medium">Billetera Activa</span>
                  <p className="text-green-200 text-sm mt-1">
                    Tu billetera está activa y lista para recibir comisiones por referidos.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Tabs */}
          <div className="flex border-b border-gray-700 mb-6">
            <button
              className={`py-2 px-4 font-medium flex items-center gap-2 ${activeTab === 'recibidas' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
              onClick={() => setActiveTab('recibidas')}
            >
              <FaPaperPlane /> Recibidas
            </button>
            <button
              className={`py-2 px-4 font-medium flex items-center gap-2 ${activeTab === 'enviadas' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
              onClick={() => setActiveTab('enviadas')}
            >
              <FaPaperPlane /> Enviadas
            </button>
          </div>

          {/* Botón para nueva solicitud */}
          <button
            onClick={() => setShowModal(true)}
            className="mb-6 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition duration-200 flex items-center gap-2"
          >
            <FaUserPlus /> Nueva Solicitud
          </button>

          {/* Contenido de las tabs */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : activeTab === 'recibidas' ? (
            <SolicitudesRecibidas 
              solicitudes={solicitudesRecibidas} 
              onCambiarEstado={handleCambiarEstado}
              setMessage={setMessage}
              selectedSolicitudes={selectedSolicitudes}
              onToggleSeleccion={toggleSeleccionSolicitud}
              onSeleccionarTodas={seleccionarTodasPendientes}
              onLimpiarSeleccion={limpiarSeleccion}
              onAceptarPorLote={handleAceptarPorLote}
              isProcessingBatch={isProcessingBatch}
              billeteraActiva={billeteraActiva}
            />
          ) : (
            <SolicitudesEnviadas solicitudes={solicitudesEnviadas} />
          )}

          {/* Modal para nueva solicitud */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <FaUserPlus /> Nueva Solicitud de Referido
                </h2>
                <form onSubmit={handleCrearSolicitud}>
                  <div className="mb-4">
                    <label className="block text-gray-300 mb-2">ID del usuario a referir</label>
                    <input
                      type="text"
                      value={referidoId}
                      onChange={(e) => setReferidoId(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                      placeholder="Ingresa el ID del usuario"
                      required
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Ingresa el ID del usuario que deseas agregar como referido directo
                    </p>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition duration-200"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition duration-200"
                    >
                      Enviar Solicitud
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
      <MobileNav />
    </div>
  );
};

// Componente para mostrar solicitudes recibidas
const SolicitudesRecibidas = ({ 
  solicitudes, 
  onCambiarEstado, 
  setMessage,
  selectedSolicitudes,
  onToggleSeleccion,
  onSeleccionarTodas,
  onLimpiarSeleccion,
  onAceptarPorLote,
  isProcessingBatch,
  billeteraActiva
}) => {
  const solicitudesPendientes = solicitudes.filter(s => s.estado === 'pendiente');
  const solicitudesProcesadas = solicitudes.filter(s => s.estado !== 'pendiente');

  if (solicitudes.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-700 bg-opacity-50 rounded-lg">
        <p className="text-gray-400">No tienes solicitudes recibidas.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controles de lote para solicitudes pendientes */}
      {solicitudesPendientes.length > 0 && (
        <div className="bg-gray-700 p-4 rounded-lg border-l-4 border-green-500">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-gray-300 block">
                  {selectedSolicitudes.length} de {Math.min(solicitudesPendientes.length, 20)} seleccionadas
                </span>
                <span className="text-gray-400 text-sm">
                  Máximo 20 solicitudes por lote
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onSeleccionarTodas}
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  Seleccionar todas
                </button>
                <button
                  onClick={onLimpiarSeleccion}
                  className="text-gray-400 hover:text-gray-300 text-sm"
                >
                  Limpiar
                </button>
              </div>
            </div>
            <button
              onClick={onAceptarPorLote}
              disabled={selectedSolicitudes.length === 0 || isProcessingBatch || !billeteraActiva}
              className="bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition duration-200 flex items-center gap-2"
            >
              <FaCheckDouble />
              {isProcessingBatch ? 'Procesando...' : `Aceptar ${selectedSolicitudes.length} seleccionadas`}
            </button>
          </div>
          {!billeteraActiva && (
            <p className="text-red-400 text-sm mt-2 text-center">
              ⚠️ Activa tu billetera para poder aceptar referidos
            </p>
          )}
        </div>
      )}

      {/* Solicitudes pendientes */}
      {solicitudesPendientes.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-4 text-gray-300">
            Solicitudes Pendientes ({solicitudesPendientes.length})
          </h3>
          <div className="space-y-4">
            {solicitudesPendientes.map((solicitud) => (
              <div key={solicitud._id} className="bg-gray-700 p-4 rounded-lg border-l-4 border-yellow-500">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedSolicitudes.includes(solicitud._id)}
                      onChange={() => onToggleSeleccion(solicitud._id)}
                      className="mt-1 text-blue-500 rounded focus:ring-blue-400"
                      disabled={selectedSolicitudes.length >= 20 && !selectedSolicitudes.includes(solicitud._id) || !billeteraActiva}
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-lg">
                        {solicitud.referido_id?.nombre_completo || solicitud.referido_id?.nombre_usuario || 'Usuario referido'}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        @{solicitud.referido_id?.nombre_usuario || 'ID: ' + (solicitud.referido_id?._id || solicitud.referido_id)}
                      </p>
                      <div className="mt-2 flex items-center">
                        <span className="text-gray-300 mr-2">Estado:</span>
                        <span className="px-2 py-1 rounded-full text-xs bg-yellow-500 text-white">
                          {solicitud.estado}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mt-1">
                        {new Date(solicitud.fecha || solicitud.createdAt).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="w-full sm:w-auto flex gap-2">
                    <button
                      onClick={async () => {
                        if (!billeteraActiva) {
                          setMessage({ 
                            text: 'Debes activar tu billetera primero para poder aceptar referidos.', 
                            type: 'error' 
                          });
                          return;
                        }

                        try {
                          const usuarioString = localStorage.getItem('usuario');
                          if (!usuarioString) {
                            setMessage({ text: 'No se encontró el usuario en localStorage.', type: 'error' });
                            return;
                          }
                          
                          const usuario = JSON.parse(usuarioString);
                          const userResponse = await axios.get(`${import.meta.env.VITE_URL_LOCAL}/usuarios/${usuario._id}`);
                          const nivel = userResponse.data.nivel;
                          
                          // El usuario actual (que acepta) es el patrocinador
                          const solicitanteId = usuario._id;
                          
                          await onCambiarEstado(solicitud._id, 'aceptado');
                          
                          await axios.post(`${import.meta.env.VITE_URL_LOCAL}/api/billetera/recarga-referido`, {
                            usuarioId: solicitanteId,
                            nivel: nivel,
                            referido_id: solicitud.referido_id?._id || solicitud.referido_id
                          });
                          
                          setMessage({ text: 'Solicitud aceptada y recarga procesada correctamente.', type: 'success' });
                        } catch (error) {
                          console.error('Error al procesar solicitud individual:', error);
                          const errorMsg = error.response?.data?.message || 'Error al aceptar la solicitud.';
                          setMessage({ text: errorMsg, type: 'error' });
                        }
                      }}
                      disabled={!billeteraActiva}
                      className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium text-sm sm:text-base"
                    >
                      <FaCheck className="text-lg" />
                      <span className="whitespace-nowrap">Aceptar</span>
                    </button>
                    <button
                      onClick={() => onCambiarEstado(solicitud._id, 'rechazado')}
                      className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium text-sm sm:text-base"
                    >
                      <FaTimes className="text-lg" />
                      <span className="whitespace-nowrap">Rechazar</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Solicitudes procesadas */}
      {solicitudesProcesadas.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-4 text-gray-300">
            Solicitudes Procesadas ({solicitudesProcesadas.length})
          </h3>
          <div className="space-y-4">
            {solicitudesProcesadas.map((solicitud) => (
              <div key={solicitud._id} className="bg-gray-700 p-4 rounded-lg border-l-4 border-gray-500">
                <div>
                  <h3 className="font-medium">
                    {solicitud.referido_id?.nombre_completo || solicitud.referido_id?.nombre_usuario || 'Usuario referido'}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    @{solicitud.referido_id?.nombre_usuario || 'ID: ' + (solicitud.referido_id?._id || solicitud.referido_id)}
                  </p>
                  <div className="mt-2 flex items-center">
                    <span className="text-gray-300 mr-2">Estado:</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      solicitud.estado === 'aceptado' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-red-500 text-white'
                    }`}>
                      {solicitud.estado}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mt-1">
                    {new Date(solicitud.fecha || solicitud.createdAt).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Componente para mostrar solicitudes enviadas
const SolicitudesEnviadas = ({ solicitudes }) => {
  if (solicitudes.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-700 bg-opacity-50 rounded-lg">
        <p className="text-gray-400">No has enviado solicitudes de referido.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {solicitudes.map((solicitud) => (
        <div key={solicitud._id} className="bg-gray-700 p-4 rounded-lg border-l-4 border-purple-500">
          <div>
            <h3 className="font-medium">
              {solicitud.referido_id?.nombre_completo || solicitud.referido_id?.nombre_usuario || 'Usuario referido'}
            </h3>
            <p className="text-gray-400 text-sm">
              @{solicitud.referido_id?.nombre_usuario || 'ID: ' + (solicitud.referido_id?._id || solicitud.referido_id)}
            </p>
            <div className="mt-2 flex items-center">
              <span className="text-gray-300 mr-2">Estado:</span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                solicitud.estado === 'aceptado' 
                  ? 'bg-green-500 text-white' 
                  : solicitud.estado === 'rechazado' 
                    ? 'bg-red-500 text-white'
                    : 'bg-yellow-500 text-white'
              }`}>
                {solicitud.estado}
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-1">
              {new Date(solicitud.fecha || solicitud.createdAt).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReferidosDirectos;