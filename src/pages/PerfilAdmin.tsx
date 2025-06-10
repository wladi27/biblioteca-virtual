import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Background } from '../components/Background';
import { MobileNav } from '../components/MobileNav';
import { FaSignOutAlt, FaMoneyBillWave, FaKey, FaDownload } from 'react-icons/fa';
import { AdminNav } from '../components/AdminNav';

export const PerfilAdmin = () => {
  const [username, setUsername] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const usuario = localStorage.getItem('usuario');
    if (usuario) {
      const userData = JSON.parse(usuario);
      setUsername(userData.nombre_completo);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    navigate('/BV/auth/login');
  };

  return (
    <div className="min-h-screen flex flex-col text-white bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900">
      <Background />
      <AdminNav />

      <div className="w-full max-w-3xl mx-auto px-4 py-16 flex-grow bg-opacity-80 bg-gray-900 rounded-2xl shadow-2xl md:min-w-[400px]">
        <div className="flex flex-col items-center mb-10">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center shadow-lg mb-4">
            <span className="text-4xl font-bold text-white">{username ? username[0] : '?'}</span>
          </div>
          <h1 className="text-3xl font-extrabold mb-1 text-blue-300 drop-shadow">{username || 'Perfil Admin'}</h1>
          <span className="text-blue-100 text-lg">Administrador</span>
        </div>
        <hr className="mb-8 border-blue-700" />

        <div className="grid grid-cols-1 gap-6">
          {/* Tarjeta de Comisiones */}
          <div
            className="bg-gradient-to-r from-blue-800 to-blue-600 p-6 rounded-xl shadow-md flex items-center cursor-pointer hover:scale-[1.03] transition-transform border border-blue-500"
            onClick={() => navigate('/BV/comisiones')}
          >
            <FaMoneyBillWave className="text-3xl mr-4 text-blue-200" />
            <div>
              <h2 className="text-xl font-semibold text-white">Comisiones</h2>
              <p className="text-blue-200 text-sm">Gestiona los niveles y comisiones</p>
            </div>
          </div>

          {/* Tarjeta de Recarga */}
          <div
            className="bg-gradient-to-r from-blue-800 to-blue-600 p-6 rounded-xl shadow-md flex items-center cursor-pointer hover:scale-[1.03] transition-transform border border-blue-500"
            onClick={() => navigate('/BV/recarga')}
          >
            <FaMoneyBillWave className="text-3xl mr-4 text-blue-200" />
            <div>
              <h2 className="text-xl font-semibold text-white">Recargar Billetera</h2>
              <p className="text-blue-200 text-sm">Recarga saldo a usuarios</p>
            </div>
          </div>

          {/* Tarjeta de Recarga Masiva*/}
          <div
            className="bg-gradient-to-r from-blue-800 to-blue-600 p-6 rounded-xl shadow-md flex items-center cursor-pointer hover:scale-[1.03] transition-transform border border-blue-500"
            onClick={() => navigate('/BV/recarga-masiva')}
          >
            <FaMoneyBillWave className="text-3xl mr-4 text-blue-200" />
            <div>
              <h2 className="text-xl font-semibold text-white">Recarga Masiva</h2>
              <p className="text-blue-200 text-sm">Recarga múltiple de billeteras</p>
            </div>
          </div>

          {/* Tarjeta de Resetear contraseña de usuario */}
          <div
            className="bg-gradient-to-r from-blue-800 to-blue-600 p-6 rounded-xl shadow-md flex items-center cursor-pointer hover:scale-[1.03] transition-transform border border-blue-500"
            onClick={() => navigate('/BV/restaurar-password')}
          >
            <FaKey className="text-3xl mr-4 text-blue-200" />
            <div>
              <h2 className="text-xl font-semibold text-white">Restaurar Contraseña</h2>
              <p className="text-blue-200 text-sm">Restablece la contraseña de un usuario</p>
            </div>
          </div>

          {/* Tarjeta de Descargar Datos */}
          <div
            className="bg-gradient-to-r from-blue-800 to-blue-600 p-6 rounded-xl shadow-md flex items-center cursor-pointer hover:scale-[1.03] transition-transform border border-blue-500"
            onClick={() => navigate('/BV/descargar-datos')}
          >
            <FaDownload className="text-3xl mr-4 text-blue-200" />
            <div>
              <h2 className="text-xl font-semibold text-white">Descargar Datos</h2>
              <p className="text-blue-200 text-sm">Exporta información relevante</p>
            </div>
          </div>

          {/* Tarjeta de Cerrar Sesión */}
          <div
            className="bg-gradient-to-r from-blue-800 to-blue-600 p-6 rounded-xl shadow-md flex items-center cursor-pointer hover:scale-[1.03] transition-transform border border-blue-500"
            onClick={() => setShowLogoutModal(true)}
          >
            <FaSignOutAlt className="text-3xl mr-4 text-blue-200" />
            <div>
              <h2 className="text-xl font-semibold text-white">Cerrar Sesión</h2>
              <p className="text-blue-200 text-sm">Salir del panel de administración</p>
            </div>
          </div>
        </div>
        <br /><br />

        {showLogoutModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-gray-900 p-8 rounded-2xl shadow-2xl text-center border-2 border-blue-700">
              <h2 className="text-xl font-semibold mb-4 text-blue-200">¿Estás seguro de que deseas cerrar sesión?</h2>
              <div className="flex justify-center gap-4">
                <button
                  className="bg-red-600 text-white py-2 px-6 rounded-md hover:bg-red-700 transition-colors font-bold"
                  onClick={handleLogout}
                >
                  Sí, cerrar sesión
                </button>
                <button
                  className="bg-gray-600 text-white py-2 px-6 rounded-md hover:bg-gray-700 transition-colors font-bold"
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