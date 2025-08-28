import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Background } from '../components/Background';
import { MobileNav } from '../components/MobileNav';
import { FaSignOutAlt, FaMoneyBillWave, FaKey, FaDownload, FaUserEdit } from 'react-icons/fa';
import { AdminNav } from '../components/AdminNav';

export const PerfilAdmin = () => {
  const [username, setUsername] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUserId, setEditUserId] = useState('');
  const [editUserData, setEditUserData] = useState<any>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
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

  const handleEditUserSearch = async () => {
    setEditLoading(true);
    setEditError('');
    setEditUserData(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_URL_LOCAL}/usuarios/${editUserId}`);
      if (!res.ok) throw new Error('Usuario no encontrado');
      const data = await res.json();
      setEditUserData(data);
    } catch (err: any) {
      setEditError(err.message || 'Error al buscar usuario');
    }
    setEditLoading(false);
  };

  const handleEditUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditUserData({ ...editUserData, [e.target.name]: e.target.value });
  };

  const handleEditUserSave = async () => {
    setEditLoading(true);
    setEditError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_URL_LOCAL}/api/usuario/${editUserId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editUserData),
      });
      if (!res.ok) throw new Error('Error al guardar cambios');
      setShowEditModal(false);
    } catch (err: any) {
      setEditError(err.message || 'Error al guardar');
    }
    setEditLoading(false);
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
          {/* Tarjeta de Editar Usuario */}
          <div
            className="bg-gradient-to-r from-blue-800 to-blue-600 p-6 rounded-xl shadow-md flex items-center cursor-pointer hover:scale-[1.03] transition-transform border border-blue-500"
            onClick={() => setShowEditModal(true)}
          >
            <FaUserEdit className="text-3xl mr-4 text-blue-200" />
            <div>
              <h2 className="text-xl font-semibold text-white">Editar Usuario</h2>
              <p className="text-blue-200 text-sm">Modifica la información de un usuario</p>
            </div>
          </div>

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

        {/* Modal de edición */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-gray-900 p-8 rounded-2xl shadow-2xl text-center border-2 border-blue-700 w-full max-w-lg max-h-[90vh] flex flex-col">
              <h2 className="text-xl font-semibold mb-4 text-blue-200">Editar Usuario</h2>
              {!editUserData ? (
                <>
                  <input
                    className="w-full mb-4 p-2 rounded bg-gray-800 text-white border border-blue-500"
                    placeholder="ID del usuario"
                    value={editUserId}
                    onChange={e => setEditUserId(e.target.value)}
                    disabled={editLoading}
                  />
                  <button
                    className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors font-bold"
                    onClick={handleEditUserSearch}
                    disabled={editLoading || !editUserId}
                  >
                    {editLoading ? 'Buscando...' : 'Buscar'}
                  </button>
                  {editError && <p className="text-red-400 mt-2">{editError}</p>}
                </>
              ) : (
                <form
                  className="flex flex-col gap-3 overflow-y-auto"
                  style={{ maxHeight: '60vh' }}
                  onSubmit={e => {
                    e.preventDefault();
                    handleEditUserSave();
                  }}
                >
                  <label className="text-left text-blue-200 font-semibold" htmlFor="nombre_completo">Nombre completo</label>
                  <input
                    id="nombre_completo"
                    className="p-2 rounded bg-gray-800 text-white border border-blue-500"
                    name="nombre_completo"
                    value={editUserData.nombre_completo || ''}
                    onChange={handleEditUserChange}
                    placeholder="Nombre completo"
                  />

                  <label className="text-left text-blue-200 font-semibold" htmlFor="linea_llamadas">Línea de llamadas</label>
                  <input
                    id="linea_llamadas"
                    className="p-2 rounded bg-gray-800 text-white border border-blue-500"
                    name="linea_llamadas"
                    value={editUserData.linea_llamadas || ''}
                    onChange={handleEditUserChange}
                    placeholder="Línea de llamadas"
                  />

                  <label className="text-left text-blue-200 font-semibold" htmlFor="linea_whatsapp">Línea WhatsApp</label>
                  <input
                    id="linea_whatsapp"
                    className="p-2 rounded bg-gray-800 text-white border border-blue-500"
                    name="linea_whatsapp"
                    value={editUserData.linea_whatsapp || ''}
                    onChange={handleEditUserChange}
                    placeholder="Línea WhatsApp"
                  />

                  <label className="text-left text-blue-200 font-semibold" htmlFor="cuenta_numero">Cuenta número</label>
                  <input
                    id="cuenta_numero"
                    className="p-2 rounded bg-gray-800 text-white border border-blue-500"
                    name="cuenta_numero"
                    value={editUserData.cuenta_numero || ''}
                    onChange={handleEditUserChange}
                    placeholder="Cuenta número"
                  />

                  <label className="text-left text-blue-200 font-semibold" htmlFor="banco">Banco</label>
                  <input
                    id="banco"
                    className="p-2 rounded bg-gray-800 text-white border border-blue-500"
                    name="banco"
                    value={editUserData.banco || ''}
                    onChange={handleEditUserChange}
                    placeholder="Banco"
                  />

                  <label className="text-left text-blue-200 font-semibold" htmlFor="titular_cuenta">Titular de la cuenta</label>
                  <input
                    id="titular_cuenta"
                    className="p-2 rounded bg-gray-800 text-white border border-blue-500"
                    name="titular_cuenta"
                    value={editUserData.titular_cuenta || ''}
                    onChange={handleEditUserChange}
                    placeholder="Titular de la cuenta"
                  />

                  <label className="text-left text-blue-200 font-semibold" htmlFor="correo_electronico">Correo electrónico</label>
                  <input
                    id="correo_electronico"
                    className="p-2 rounded bg-gray-800 text-white border border-blue-500"
                    name="correo_electronico"
                    value={editUserData.correo_electronico || ''}
                    onChange={handleEditUserChange}
                    placeholder="Correo electrónico"
                  />

                  <label className="text-left text-blue-200 font-semibold" htmlFor="dni">DNI</label>
                  <input
                    id="dni"
                    className="p-2 rounded bg-gray-800 text-white border border-blue-500"
                    name="dni"
                    value={editUserData.dni || ''}
                    onChange={handleEditUserChange}
                    placeholder="DNI"
                  />

                  <label className="text-left text-blue-200 font-semibold" htmlFor="nombre_usuario">Nombre de usuario</label>
                  <input
                    id="nombre_usuario"
                    className="p-2 rounded bg-gray-800 text-white border border-blue-500"
                    name="nombre_usuario"
                    value={editUserData.nombre_usuario || ''}
                    onChange={handleEditUserChange}
                    placeholder="Nombre de usuario"
                  />

                  <button
                    className="bg-green-600 text-white py-2 px-6 rounded-md hover:bg-green-700 transition-colors font-bold mt-2"
                    type="submit"
                    disabled={editLoading}
                  >
                    {editLoading ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                  {editError && <p className="text-red-400 mt-2">{editError}</p>}
                </form>
              )}
              <button
                className="mt-4 bg-gray-600 text-white py-2 px-6 rounded-md hover:bg-gray-700 transition-colors font-bold"
                onClick={() => {
                  setShowEditModal(false);
                  setEditUserId('');
                  setEditUserData(null);
                  setEditError('');
                }}
                disabled={editLoading}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};