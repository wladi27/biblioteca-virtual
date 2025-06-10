import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Background } from '../components/Background';
import { MobileNav } from '../components/MobileNav';
import { FaUserEdit, FaCode, FaSignOutAlt } from 'react-icons/fa';
import { Trash2, Clipboard, CheckCircle, Lock, User, Mail, Phone, CreditCard } from 'lucide-react';
import ChangePasswordModal from '../components/ChangePasswordModal';

export const Perfil = () => {
  const [userData, setUserData] = useState({});
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showCodesModal, setShowCodesModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  const [codes, setCodes] = useState([]);
  const [isCopied, setIsCopied] = useState({ id: null, status: false });
  const [aporteVerificado, setAporteVerificado] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState('');
  const [notification, setNotification] = useState({ message: '', type: '' });

  useEffect(() => {
    const usuario = localStorage.getItem('usuario');
    if (usuario) {
      const userData = JSON.parse(usuario);
      setUserData(userData);
      checkAporte(userData._id);
    }
  }, []);

  const checkAporte = async (userId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/api/aportes/`);
      if (response.ok) {
        const data = await response.json();
        const existeAporte = data.some(aporte => aporte.usuarioId === userId && aporte.aporte === true);
        setAporteVerificado(existeAporte);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleGenerateCode = async () => {
    const usuario = localStorage.getItem('usuario');
    if (usuario) {
      const userData = JSON.parse(usuario);
      try {
        const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/api/referralCodes/user/${userData._id}`);
        if (response.ok) {
          const data = await response.json();
          setCodes(data);
          setShowCodesModal(true);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const handleCreateCode = async () => {
    const usuario = localStorage.getItem('usuario');
    if (usuario) {
      const userData = JSON.parse(usuario);
      try {
        const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/api/referralCodes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: userData._id }),
        });
        if (response.ok) {
          const newCode = await response.json();
          setCodes([...codes, newCode]);
          showNotification('Código creado exitosamente', 'success');
        }
      } catch (error) {
        console.error('Error:', error);
        showNotification('Error al crear código', 'error');
      }
    }
  };

  const handleDeleteCode = async (codeId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/api/referralCodes/${codeId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setCodes(codes.filter(code => code._id !== codeId));
        showNotification('Código eliminado', 'success');
      }
    } catch (error) {
      console.error('Error:', error);
      showNotification('Error al eliminar código', 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleCopyToClipboard = (text, id = null) => {
    navigator.clipboard.writeText(text).then(() => {
      setIsCopied({ id, status: true });
      showNotification('Copiado al portapapeles', 'success');
      
      setTimeout(() => {
        setIsCopied({ id: null, status: false });
      }, 2000);
    }).catch((error) => {
      console.error('Error al copiar:', error);
      showNotification('Error al copiar', 'error');
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/auth/usuario/${userData._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (response.ok) {
        const updatedUser = await response.json();
        localStorage.setItem('usuario', JSON.stringify(updatedUser.usuario));
        setUserData(updatedUser.usuario);
        setUpdateMessage('Perfil actualizado exitosamente.');
        showNotification('Perfil actualizado', 'success');
      } else {
        setUpdateMessage('Error al actualizar el perfil.');
        showNotification('Error al actualizar perfil', 'error');
      }
    } catch (error) {
      setUpdateMessage('Error al actualizar el perfil.');
      showNotification('Error al actualizar perfil', 'error');
    }
  };

  const handleChangePassword = async (newPassword) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/auth/password/${userData._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nuevaContraseña: newPassword }),
      });
      if (response.ok) {
        setSuccessMessage('Contraseña actualizada exitosamente.');
        setShowChangePasswordModal(false);
        showNotification('Contraseña actualizada', 'success');
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        showNotification('Error al actualizar contraseña', 'error');
      }
    } catch (error) {
      showNotification('Error al actualizar contraseña', 'error');
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 3000);
  };

  return (
    <div className="min-h-screen flex flex-col text-white">
      <Background />
      
      <div className="max-w-4xl mx-auto px-4 py-8 w-full">
        {/* Notificaciones */}
        {notification.message && (
          <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in ${
            notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}>
            {notification.message}
          </div>
        )}

        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Mi Perfil</h1>
            <p className="text-gray-400">Administra tu información personal</p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center gap-2">
            <div className={`px-3 py-1 rounded-full text-sm ${
              aporteVerificado ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
            }`}>
              {aporteVerificado ? 'Verificado' : 'Sin verificar'}
            </div>
          </div>
        </div>

        {/* Tarjeta de información */}
        <div className="bg-gray-800/70 rounded-xl p-6 shadow-lg border border-gray-700 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-4">Información Personal</h2>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500/20 p-2 rounded-full">
                    <User className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Nombre completo</p>
                    <p className="font-medium">{userData.nombre_completo || 'No especificado'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-purple-500/20 p-2 rounded-full">
                    <Mail className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Correo electrónico</p>
                    <p className="font-medium">{userData.correo_electronico || 'No especificado'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-green-500/20 p-2 rounded-full">
                    <CreditCard className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">ID de usuario</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-sm truncate max-w-[180px]">{userData._id}</p>
                      <button 
                        onClick={() => handleCopyToClipboard(userData._id, 'user-id')} 
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                        aria-label="Copiar ID de usuario"
                      >
                        {isCopied.id === 'user-id' && isCopied.status ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Clipboard className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-4">Información de Contacto</h2>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-yellow-500/20 p-2 rounded-full">
                    <Phone className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Línea de llamadas</p>
                    <p className="font-medium">{userData.linea_llamadas || 'No especificado'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-green-500/20 p-2 rounded-full">
                    <Phone className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">WhatsApp</p>
                    <p className="font-medium">{userData.linea_whatsapp || 'No especificado'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-red-500/20 p-2 rounded-full">
                    <CreditCard className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Documento</p>
                    <p className="font-medium">{userData.dni || 'No especificado'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button 
            onClick={() => setShowUpdateModal(true)}
            className="bg-gray-700 hover:bg-gray-600 p-4 rounded-xl flex items-center gap-3 transition-colors"
          >
            <div className="bg-blue-500/20 p-3 rounded-full">
              <FaUserEdit className="h-5 w-5 text-blue-400" />
            </div>
            <span>Editar perfil</span>
          </button>

          <button 
            onClick={handleGenerateCode}
            className="bg-gray-700 hover:bg-gray-600 p-4 rounded-xl flex items-center gap-3 transition-colors"
          >
            <div className="bg-purple-500/20 p-3 rounded-full">
              <FaCode className="h-5 w-5 text-purple-400" />
            </div>
            <span>Códigos de referido</span>
          </button>

          <button 
            onClick={() => setShowChangePasswordModal(true)}
            className="bg-gray-700 hover:bg-gray-600 p-4 rounded-xl flex items-center gap-3 transition-colors"
          >
            <div className="bg-green-500/20 p-3 rounded-full">
              <Lock className="h-5 w-5 text-green-400" />
            </div>
            <span>Cambiar contraseña</span>
          </button>
        </div>

        <button 
          onClick={() => setShowLogoutModal(true)}
          className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 p-4 rounded-xl flex items-center justify-center gap-3 transition-colors"
        >
          <FaSignOutAlt className="h-5 w-5" />
          <span>Cerrar sesión</span>
        </button>

        {/* Modal de edición de perfil */}
        {showUpdateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Editar perfil</h2>
                
                {updateMessage && (
                  <div className={`mb-4 p-3 rounded-lg ${
                    updateMessage.includes('éxito') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {updateMessage}
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-gray-400 mb-1">Nombre completo</label>
                    <input
                      type="text"
                      value={userData.nombre_completo || ''}
                      onChange={(e) => setUserData({ ...userData, nombre_completo: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1">Correo electrónico</label>
                    <input
                      type="email"
                      value={userData.correo_electronico || ''}
                      onChange={(e) => setUserData({ ...userData, correo_electronico: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1">Línea de llamadas</label>
                    <input
                      type="text"
                      value={userData.linea_llamadas || ''}
                      onChange={(e) => setUserData({ ...userData, linea_llamadas: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1">WhatsApp</label>
                    <input
                      type="text"
                      value={userData.linea_whatsapp || ''}
                      onChange={(e) => setUserData({ ...userData, linea_whatsapp: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1">Documento</label>
                    <input
                      type="text"
                      value={userData.dni || ''}
                      onChange={(e) => setUserData({ ...userData, dni: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1">Nombre de usuario</label>
                    <input
                      type="text"
                      value={userData.nombre_usuario || ''}
                      onChange={(e) => setUserData({ ...userData, nombre_usuario: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowUpdateModal(false)}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
                    >
                      Guardar cambios
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal de códigos de referido */}
        {showCodesModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Códigos de referido</h2>
                  <button
                    onClick={handleCreateCode}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <FaCode className="h-4 w-4" />
                    <span>Nuevo código</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {codes.length > 0 ? (
                    codes.map((code) => (
                      <div key={code._id} className="bg-gray-700/50 p-4 rounded-lg flex justify-between items-center">
                        <div>
                          <p className="font-mono">{code.code}</p>
                          <p className={`text-xs ${
                            code.used ? 'text-red-400' : 'text-green-400'
                          }`}>
                            {code.used ? 'Usado' : 'Disponible'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleCopyToClipboard(code.code, code._id)}
                            className="p-2 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg transition-colors"
                            aria-label={`Copiar código ${code.code}`}
                          >
                            {isCopied.id === code._id && isCopied.status ? (
                              <CheckCircle className="h-4 w-4 text-green-400" />
                            ) : (
                              <Clipboard className="h-4 w-4" />
                            )}
                          </button>
                          {!code.used && (
                            <button
                              onClick={() => handleDeleteCode(code._id)}
                              className="p-2 bg-red-600/20 hover:bg-red-600/30 rounded-lg transition-colors"
                              aria-label="Eliminar código"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      No tienes códigos generados
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowCodesModal(false)}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de cambio de contraseña */}
        {showChangePasswordModal && (
          <ChangePasswordModal
            show={showChangePasswordModal}
            onClose={() => setShowChangePasswordModal(false)}
            onChangePassword={handleChangePassword}
          />
        )}

        {/* Modal de cierre de sesión */}
        {showLogoutModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
              <h2 className="text-2xl font-bold mb-4">Cerrar sesión</h2>
              <p className="text-gray-400 mb-6">¿Estás seguro de que deseas salir de tu cuenta?</p>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg transition-colors flex items-center gap-2"
                >
                  <FaSignOutAlt className="h-4 w-4" />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <br /><br /><br />

      <MobileNav />
    </div>
  );
};