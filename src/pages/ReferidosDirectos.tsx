import React, { useEffect, useState } from 'react';
import { Background } from '../components/Background';
import { FaUserPlus, FaCheck, FaTimes, FaPaperPlane, FaUsers } from 'react-icons/fa';
import { MobileNav } from '../components/MobileNav';
import axios from 'axios';

const Message = ({ message, type, onClose }) => {
  if (!message) return null;

  const baseClasses = 'p-4 rounded-md mb-4 flex justify-between items-center';
  const typeClasses = {
    success: 'bg-green-100 border border-green-400 text-green-700',
    error: 'bg-red-100 border border-red-400 text-red-700',
  };

  return (
    <div className={`${baseClasses} ${typeClasses[type]}`}>
      <span>{message}</span>
      <button onClick={onClose}>
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

  useEffect(() => {
    const usuario = localStorage.getItem('usuario');
    if (usuario) {
      const user = JSON.parse(usuario);
      setUserId(user._id);
      setUserData(user);
      fetchSolicitudes(user._id);
    }
  }, []);

  const fetchSolicitudes = async (userId) => {
    try {
      setIsLoading(true);
      const [recibidas, enviadas] = await Promise.all([
        axios.get(`${import.meta.env.VITE_URL_LOCAL}/api/referralRequests/recibidas/${userId}`),
        axios.get(`${import.meta.env.VITE_URL_LOCAL}/api/referralRequests/enviadas/${userId}`)
      ]);
      setSolicitudesRecibidas(recibidas.data);
      setSolicitudesEnviadas(enviadas.data);
    } catch (error) {
      setMessage({ text: 'Error al cargar solicitudes', type: 'error' });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCambiarEstado = async (solicitudId, nuevoEstado) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_URL_LOCAL}/api/referralRequests/${solicitudId}`,
        {
          estado: nuevoEstado,
          usuarioId: userId
        }
      );

      setMessage({ text: `Solicitud ${nuevoEstado}`, type: 'success' });
      fetchSolicitudes(userId);
      return true; // Success
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al actualizar estado';
      setMessage({ text: errorMessage, type: 'error' });
      console.error('Error al cambiar estado:', error);
      return false; // Failure
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
      setMessage({ text: error.response?.data?.message || 'Error al crear solicitud', type: 'error' });
      console.error(error);
    }
  };

  const handleAceptarTodas = async () => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_URL_LOCAL}/api/referralRequests/aceptar-todas`, { userId });
      const { resultados } = response.data;

      for (const aceptada of resultados.aceptadas) {
        await axios.post(`${import.meta.env.VITE_URL_LOCAL}/api/billetera/recarga-referido`, {
          usuarioId: aceptada.referrerUserId,
          nivel: aceptada.referredUserLevel
        });
      }

      setMessage({ text: response.data.message, type: 'success' });
      fetchSolicitudes(userId);
    } catch (error) {
      setMessage({ text: error.response?.data?.message || 'Error al aceptar todas las solicitudes', type: 'error' });
      console.error(error);
    }
  };

  const handleCloseMessage = () => {
    setMessage({ text: '', type: '' });
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
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition duration-200 flex items-center gap-2"
            >
              <FaUserPlus /> Nueva Solicitud
            </button>
            <button
              onClick={handleAceptarTodas}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition duration-200 flex items-center gap-2"
            >
              <FaCheck /> Aceptar Todas
            </button>
          </div>

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
                    <p className="text-xs text-gray-400 mt-1">Debes ingresar el ID del usuario que deseas referir</p>
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
const SolicitudesRecibidas = ({ solicitudes, onCambiarEstado, setMessage }) => {
  if (solicitudes.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-700 bg-opacity-50 rounded-lg">
        <p className="text-gray-400">No tienes solicitudes recibidas.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {solicitudes.map((solicitud) => (
        <div key={solicitud._id} className="bg-gray-700 p-4 rounded-lg border-l-4 border-blue-500">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="flex-1">
              <h3 className="font-medium text-lg">
                {solicitud.solicitante_id?.nombre_completo || 'Usuario desconocido'}
              </h3>
              <p className="text-gray-400 text-sm">
                @{solicitud.solicitante_id?.nombre_usuario || 'desconocido'}
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
                {new Date(solicitud.fecha).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            {solicitud.estado === 'pendiente' && (
              <div className="w-full sm:w-auto flex sm:flex-col gap-2">
                <button
                  onClick={async () => {
                    try {
                      const usuarioString = localStorage.getItem('usuario');
                      if (!usuarioString) {
                        setMessage({ text: 'No se encontró el usuario en localStorage.', type: 'error' });
                        return;
                      }
                      const usuario = JSON.parse(usuarioString); // Current user (the one accepting/rejecting)

                      // Determine who is the 'referred' user (the one whose aporte is checked)
                      // and who is the 'referrer' (the one who gets the recarga)
                      let referredUserIdForAporte;
                      let referrerUserIdForRecarga;
                      let referredUserLevel; // Level of the user who made the aporte

                      if (solicitud.requestType === 'referred_initiated') {
                        // New flow: referred user (solicitante_id) sent request to sponsor (referido_id)
                        referredUserIdForAporte = solicitud.solicitante_id?._id || solicitud.solicitante_id;
                        referrerUserIdForRecarga = solicitud.referido_id?._id || solicitud.referido_id; // Current user (sponsor)
                      } else {
                        // Old flow: referrer (solicitante_id) sent request to referred user (referido_id)
                        referredUserIdForAporte = solicitud.referido_id?._id || solicitud.referido_id;
                        referrerUserIdForRecarga = solicitud.solicitante_id?._id || solicitud.solicitante_id; // Current user (referrer)
                      }

                      // Get the level of the referred user (the one whose aporte was checked) and who is the referrer
                      const referredUserResponse = await axios.get(`${import.meta.env.VITE_URL_LOCAL}/usuarios/${referredUserIdForAporte}`);
                      referredUserLevel = referredUserResponse.data.nivel;
                      
                      // 1. Cambiar estado de la solicitud
                      const success = await onCambiarEstado(solicitud._id, 'aceptado');
                      if (success) {
                        // 2. Realizar la recarga con el nivel del usuario referido para el referente
                        await axios.post(`${import.meta.env.VITE_URL_LOCAL}/api/billetera/recarga-referido`, {
                          usuarioId: referrerUserIdForRecarga, // The user who receives the commission
                          nivel: referredUserLevel // The level of the user who made the aporte
                        });
                        setMessage({ text: 'Solicitud aceptada y recarga procesada.', type: 'success' });
                      }
                    } catch (error) {
                      console.error('Error al procesar la solicitud:', error);
                      setMessage({ text: error.response?.data?.message || 'Error al aceptar la solicitud.', type: 'error' });
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium text-sm sm:text-base active:scale-95 transform hover:shadow-lg hover:shadow-green-500/20 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50"
                >
                  <FaCheck className="text-lg" />
                  <span className="whitespace-nowrap">Aceptar</span>
                </button>
                <button
                  onClick={() => onCambiarEstado(solicitud._id, 'rechazado')}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium text-sm sm:text-base
                  active:scale-95 transform hover:shadow-lg hover:shadow-red-500/20
                  focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50"
                >
                  <FaTimes className="text-lg" />
                  <span className="whitespace-nowrap">Rechazar</span>
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Componente para mostrar solicitudes enviadas
const SolicitudesEnviadas = ({ solicitudes }) => {
  if (solicitudes.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-700 bg-opacity-50 rounded-lg">
        <p className="text-gray-400">No tienes solicitudes recibidas.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {solicitudes.map((solicitud) => (
        <div key={solicitud._id} className="bg-gray-700 p-4 rounded-lg border-l-4 border-purple-500">
          <div>
            <h3 className="font-medium">
              {solicitud.referido_id?.nombre_completo || 'Usuario desconocido'}
            </h3>
            <p className="text-gray-400 text-sm">
              @{solicitud.referido_id?.nombre_usuario || 'desconocido'}
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
              {new Date(solicitud.fecha).toLocaleDateString('es-ES', {
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