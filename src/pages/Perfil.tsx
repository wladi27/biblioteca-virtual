import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Background } from '../components/Background';
import { MobileNav } from '../components/MobileNav';
import { FaUserEdit, FaCode, FaSignOutAlt } from 'react-icons/fa';
import { Trash2, Clipboard, CheckCircle } from 'lucide-react';
import ChangePasswordModal from '../components/ChangePasswordModal';

export const Perfil = () => {
  const [username, setUsername] = useState('');
  const [userData, setUserData] = useState({});
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showCodesModal, setShowCodesModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  const [codes, setCodes] = useState([]);
  const [copyMessage, setCopyMessage] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [aporteVerificado, setAporteVerificado] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const usuario = localStorage.getItem('usuario');
    if (usuario) {
      const userData = JSON.parse(usuario);
      setUsername(userData.nombre_completo);
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
      } else {
        console.error('Error al verificar el aporte');
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
        } else {
          console.error('Error al obtener los códigos');
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
        } else {
          console.error('Error al crear el código');
        }
      } catch (error) {
        console.error('Error:', error);
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
      } else {
        console.error('Error al eliminar el código');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleCopyToClipboard = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopyMessage('Código copiado al portapapeles');
      setIsCopied(true);
      setTimeout(() => {
        setCopyMessage('');
        setIsCopied(false);
      }, 2000);
    }).catch((error) => {
      console.error('Error al copiar el código:', error);
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
      } else {
        setUpdateMessage('Error al actualizar el perfil.');
      }
    } catch (error) {
      setUpdateMessage('Error al actualizar el perfil.');
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
        setSuccessMessage('Contraseña actualizada exitosamente.'); // Establecer el mensaje de éxito
        setShowChangePasswordModal(false); // Cerrar el modal

        // Ocultar el mensaje después de 5 segundos
        setTimeout(() => {
          setSuccessMessage('');
        }, 5000);
      } else {
        setUpdateMessage('Error al actualizar la contraseña.');
      }
    } catch (error) {
      setUpdateMessage('Error al actualizar la contraseña.');
    }
  };
  

  return (
    <div className="min-h-screen flex flex-col text-white">
      <Background />
      
      <MobileNav />

      <div className="w-full max-w-7xl mx-auto px-4 py-16 flex-grow bg-opacity-65 bg-gray-800 rounded-2xl shadow-lg md:min-w-[600px]">
        <h1 className="text-4xl font-bold mb-4">Perfil</h1>
        <hr />

        <div className="bg-gray-700 bg-opacity-30 p-6 rounded-lg shadow-md flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">ID de Usuario</h2>
            <span className="text-gray-300">{userData._id}</span>
            <p className={`text-lg ${aporteVerificado ? 'text-green-500' : 'text-red-500'}`}>
              {aporteVerificado ? 'Verificado' : 'Sin Verificar'}
            </p>
          </div>
          {isCopied ? (
            <CheckCircle className="text-green-500" size={24} />
          ) : (
            <Clipboard
              className="text-blue-500 hover:text-blue-400 transition-colors cursor-pointer"
              size={24}
              onClick={() => handleCopyToClipboard(userData._id)}
            />
          )}
        </div>

        {/* Mostrar mensaje de éxito */}
      {successMessage && (
        <div className="bg-green-500 text-white p-4 rounded-md fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          {successMessage}
        </div>
      )}

        <div className="pt-6 flex flex-col items-center gap-8 mb-8">
          <div className="bg-gray-700 bg-opacity-30 p-6 rounded-lg shadow-md flex items-center cursor-pointer w-full max-w-md" onClick={() => setShowUpdateModal(true)}>
            <FaUserEdit className="text-3xl mr-4" />
            <div>
              <h2 className="text-xl font-semibold">Editar Perfil</h2>
            </div>
          </div>

          <div className="bg-gray-700 bg-opacity-30 p-6 rounded-lg shadow-md flex items-center cursor-pointer w-full max-w-md" onClick={handleGenerateCode}>
            <FaCode className="text-3xl mr-4" />
            <div>
              <h2 className="text-xl font-semibold">Código de Referido</h2>
            </div>
          </div>

          <div className="bg-gray-700 bg-opacity-30 p-6 rounded-lg shadow-md flex items-center cursor-pointer w-full max-w-md" onClick={() => setShowChangePasswordModal(true)}>
            <FaUserEdit className="text-3xl mr-4" />
            <div>
              <h2 className="text-xl font-semibold">Cambiar Contraseña</h2>
            </div>
          </div>

          <div className="bg-gray-700 bg-opacity-30 p-6 rounded-lg shadow-md flex items-center cursor-pointer w-full max-w-md" onClick={() => setShowLogoutModal(true)}>
            <FaSignOutAlt className="text-3xl mr-4" />
            <div>
              <h2 className="text-xl font-semibold">Cerrar Sesión</h2>
            </div>
          </div>
        </div>

        {/* Modal para actualizar perfil */}
        {showUpdateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-gray-800 p-4 rounded-lg shadow-lg text-center max-h-[80vh] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">Actualizar Perfil</h2>
              {updateMessage && <div className="mb-4 text-green-400">{updateMessage}</div>}
              <form onSubmit={handleUpdateProfile} className="flex flex-col items-center">
                <label className="text-left w-full mb-1" htmlFor="nombreCompleto">Nombre Completo</label>
                <input
                  id="nombreCompleto"
                  type="text"
                  placeholder="Nombre Completo"
                  value={userData.nombre_completo || ''}
                  onChange={(e) => setUserData({ ...userData, nombre_completo: e.target.value })}
                  className="mb-4 p-2 rounded-md bg-gray-700 text-white w-full"
                  required
                />

                <label className="text-left w-full mb-1" htmlFor="correoElectronico">Correo Electrónico</label>
                <input
                  id="correoElectronico"
                  type="email"
                  placeholder="Correo Electrónico"
                  value={userData.correo_electronico || ''}
                  onChange={(e) => setUserData({ ...userData, correo_electronico: e.target.value })}
                  className="mb-4 p-2 rounded-md bg-gray-700 text-white w-full"
                  required
                />

                <label className="text-left w-full mb-1" htmlFor="lineaLlamadas">Número de Línea de Llamadas</label>
                <input
                  id="lineaLlamadas"
                  type="text"
                  placeholder="Número de Línea de Llamadas"
                  value={userData.linea_llamadas || ''}
                  onChange={(e) => setUserData({ ...userData, linea_llamadas: e.target.value })}
                  className="mb-4 p-2 rounded-md bg-gray-700 text-white w-full"
                />

                <label className="text-left w-full mb-1" htmlFor="lineaWhatsApp">Número de Línea de WhatsApp</label>
                <input
                  id="lineaWhatsApp"
                  type="text"
                  placeholder="Número de Línea de WhatsApp"
                  value={userData.linea_whatsapp || ''}
                  onChange={(e) => setUserData({ ...userData, linea_whatsapp: e.target.value })}
                  className="mb-4 p-2 rounded-md bg-gray-700 text-white w-full"
                />

                <label className="text-left w-full mb-1" htmlFor="dni">CC</label>
                <input
                  id="dni"
                  type="text"
                  placeholder="DNI"
                  value={userData.dni || ''}
                  onChange={(e) => setUserData({ ...userData, dni: e.target.value })}
                  className="mb-4 p-2 rounded-md bg-gray-700 text-white w-full"
                  required
                />

                <label className="text-left w-full mb-1" htmlFor="nombreUsuario">Nombre de Usuario</label>
                <input
                  id="nombreUsuario"
                  type="text"
                  placeholder="Nombre de Usuario"
                  value={userData.nombre_usuario || ''}
                  onChange={(e) => setUserData({ ...userData, nombre_usuario: e.target.value })}
                  className="mb-4 p-2 rounded-md bg-gray-700 text-white w-full"
                  required
                />

                <button
                  type="submit"
                  className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Actualizar
                </button>
              </form>
              <button
                className="mt-4 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
                onClick={() => setShowUpdateModal(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

        {/* Modal para cambiar contraseña */}
        {showChangePasswordModal && (
          <ChangePasswordModal
            show={showChangePasswordModal}
            onClose={() => setShowChangePasswordModal(false)}
            onChangePassword={handleChangePassword}
          />
        )}

        {/* Modal para códigos referidos */}
        {showCodesModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-gray-800 p-4 rounded-lg shadow-lg text-center max-h-[80vh] overflow-y-auto">
              <h2 className="text-2xl font-semibold mb-4">Códigos de Referido</h2>
              <button
                className="mb-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                onClick={handleCreateCode}
              >
                Crear Código
              </button>
              <div className="flex flex-col gap-4">
                {codes.length > 0 ? (
                  codes.map((code) => (
                    <div key={code._id} className="flex justify-between items-center bg-gray-700 p-4 rounded-md">
                      <div className="flex flex-col items-start">
                        <span className="text-gray-300">{code.code}</span>
                        <span className="text-gray-400 text-sm">{code.used ? 'Usado' : 'No usado'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clipboard
                          className="text-blue-500 hover:text-blue-400 transition-colors cursor-pointer"
                          size={20}
                          onClick={() => handleCopyToClipboard(code.code)}
                        />
                        {!code.used && (
                          <Trash2
                            className="text-red-500 hover:text-red-400 transition-colors cursor-pointer"
                            size={20}
                            onClick={() => handleDeleteCode(code._id)}
                          />
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-300">No tienes códigos generados.</div>
                )}
              </div>
              {copyMessage && <div className="mt-2 text-green-400">{copyMessage}</div>}
              <button
                className="mt-4 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
                onClick={() => setShowCodesModal(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

        {/* Modal para cerrar sesión */}
        {showLogoutModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-gray-800 p-4 rounded-lg shadow-lg text-center">
              <h2 className="text-xl font-semibold mb-4">¿Estás seguro de que deseas cerrar sesión?</h2>
              <div className="flex justify-center gap-4">
                <button
                  className="bg-red-600 text-white py-2 px-6 rounded-md hover:bg-red-700 transition-colors"
                  onClick={handleLogout}
                >
                  Sí, cerrar sesión
                </button>
                <button
                  className="bg-gray-600 text-white py-2 px-6 rounded-md hover:bg-gray-700 transition-colors"
                  onClick={() => setShowLogoutModal(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
