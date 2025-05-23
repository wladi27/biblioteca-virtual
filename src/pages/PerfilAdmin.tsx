import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Background } from '../components/Background';
import { MobileNav } from '../components/MobileNav';
import { FaSignOutAlt, FaMoneyBillWave, FaKey, FaDownload } from 'react-icons/fa'; // Importar icono de descarga
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
    <div className="min-h-screen flex flex-col text-white">
      <Background />
      <AdminNav />

      <div className="w-full max-w-7xl mx-auto px-4 py-16 flex-grow bg-opacity-65 bg-gray-800 rounded-2xl shadow-lg md:min-w-[600px]">
        <h1 className="text-4xl font-bold mb-4">Perfil Admin</h1>
        <hr />
        <div className="pt-6 flex flex-col items-center gap-8 mb-8">
          
          {/* Tarjeta de Comisiones */}
          <div
            className="bg-gray-700 bg-opacity-30 p-6 rounded-lg shadow-md flex items-center cursor-pointer w-full max-w-md"
            onClick={() => navigate('/BV/comisiones')}
          >
            <FaMoneyBillWave className="text-3xl mr-4" />
            <div>
              <h2 className="text-xl font-semibold">Comisiones</h2>
            </div>
          </div>

          {/* Tarjeta de Recarga */}
          <div
            className="bg-gray-700 bg-opacity-30 p-6 rounded-lg shadow-md flex items-center cursor-pointer w-full max-w-md"
            onClick={() => navigate('/BV/recarga')}
          >
            <FaMoneyBillWave className="text-3xl mr-4" />
            <div>
              <h2 className="text-xl font-semibold">Recargar Billetera</h2>
            </div>
          </div>

          {/* Tarjeta de Resetear contraseña de usuario */}
          <div
            className="bg-gray-700 bg-opacity-30 p-6 rounded-lg shadow-md flex items-center cursor-pointer w-full max-w-md"
            onClick={() => navigate('/BV/restaurar-password')} // Cambiar la ruta a la correcta
          >
            <FaKey className="text-3xl mr-4" /> {/* Icono de llave */}
            <div>
              <h2 className="text-xl font-semibold">Restaurar Contraseña a Usuario</h2>
            </div>
          </div>

          {/* Tarjeta de Descargar Datos */}
          <div
            className="bg-gray-700 bg-opacity-30 p-6 rounded-lg shadow-md flex items-center cursor-pointer w-full max-w-md"
            onClick={() => navigate('/BV/descargar-datos')} // Cambiar la ruta a la correcta
          >
            <FaDownload className="text-3xl mr-4" /> {/* Icono de descarga */}
            <div>
              <h2 className="text-xl font-semibold">Descargar Datos</h2>
            </div>
          </div>

          {/* Tarjeta de Cerrar Sesión */}
          <div
            className="bg-gray-700 bg-opacity-30 p-6 rounded-lg shadow-md flex items-center cursor-pointer w-full max-w-md"
            onClick={() => setShowLogoutModal(true)}
          >
            <FaSignOutAlt className="text-3xl mr-4" />
            <div>
              <h2 className="text-xl font-semibold">Cerrar Sesión</h2>
            </div>
          </div>
        </div>

        {showLogoutModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center">
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
