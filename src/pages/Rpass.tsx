import React, { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { AdminNav } from '../components/AdminNav';

export const CambiarContrasena = () => {
  const [id, setId] = useState('');
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [mensajeColor, setMensajeColor] = useState('');
  const [usuarioInfo, setUsuarioInfo] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (nuevaContrasena !== confirmarContrasena) {
      setMensaje('Las contraseñas no coinciden.');
      setMensajeColor('text-red-400');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/auth/password/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nuevaContraseña: nuevaContrasena }),
      });

      if (response.ok) {
        setMensaje('Contraseña actualizada exitosamente.');
        setMensajeColor('text-green-400');
      } else {
        setMensaje('Error al actualizar la contraseña.');
        setMensajeColor('text-red-400');
      }
    } catch (error) {
      setMensaje('Error en la conexión.');
      setMensajeColor('text-blue-400');
    }
  };

  const fetchUsuarioInfo = async (userId) => {
    if (!userId) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/usuarios/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUsuarioInfo(data);
      } else {
        setUsuarioInfo(null);
        setMensaje('Usuario no encontrado.');
        setMensajeColor('text-red-400');
      }
    } catch (error) {
      setMensaje('Error en la conexión.');
      setMensajeColor('text-blue-400');
    }
  };

  useEffect(() => {
    fetchUsuarioInfo(id);
  }, [id]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 text-white p-4">
      <form
        className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-lg border border-blue-700"
        onSubmit={handleSubmit}
      >
        <h2 className="text-3xl font-extrabold mb-6 text-center flex items-center justify-center text-blue-400 drop-shadow">
          Cambiar Contraseña
        </h2>
        {mensaje && <p className={`mb-4 ${mensajeColor} text-center font-semibold`}>{mensaje}</p>}

        {/* Campo para ID de usuario */}
        <div className="mb-4">
          <label className="block mb-2 font-semibold text-blue-300" htmlFor="userId">
            ID del Usuario
          </label>
          <input
            type="text"
            id="userId"
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-700 text-white border border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
            placeholder="Ingresa el ID del usuario"
          />
        </div>

        {/* Card de usuario */}
        {id && (
          <div className="mb-6">
            {usuarioInfo ? (
              <div className="flex items-center gap-4 bg-gradient-to-r from-blue-800 to-blue-600 rounded-xl p-4 shadow-lg border border-blue-400">
                <div className="flex flex-col">
                  <span className="font-bold text-lg text-white">{usuarioInfo.nombre_completo}</span>
                  <span className="text-blue-200 font-mono">@{usuarioInfo.nombre_usuario}</span>
                  <span className="text-xs text-blue-100 mt-1">ID: <span className="font-mono">{usuarioInfo._id}</span></span>
                  <span className="text-xs text-blue-100 mt-1">Nivel: <span className="font-mono">{usuarioInfo.nivel}</span></span>
                </div>
              </div>
            ) : (
              <div className="bg-red-700 text-white rounded-lg p-3 text-center font-semibold shadow">Usuario no encontrado</div>
            )}
          </div>
        )}

        {/* Campo para Nueva Contraseña */}
        <div className="mb-4">
          <label className="block mb-2 font-semibold text-blue-300" htmlFor="nuevaContrasena">
            Nueva Contraseña
          </label>
          <div className="relative">
            <input
              type={mostrarContrasena ? 'text' : 'password'}
              id="nuevaContrasena"
              value={nuevaContrasena}
              onChange={(e) => setNuevaContrasena(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
              placeholder="Nueva contraseña"
            />
            <span
              className="absolute right-3 top-3 cursor-pointer text-blue-300"
              onClick={() => setMostrarContrasena(!mostrarContrasena)}
            >
              {mostrarContrasena ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>

        {/* Campo para Confirmar Nueva Contraseña */}
        <div className="mb-6">
          <label className="block mb-2 font-semibold text-blue-300" htmlFor="confirmarContrasena">
            Confirmar Nueva Contraseña
          </label>
          <div className="relative">
            <input
              type={mostrarContrasena ? 'text' : 'password'}
              id="confirmarContrasena"
              value={confirmarContrasena}
              onChange={(e) => setConfirmarContrasena(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
              placeholder="Confirma la nueva contraseña"
            />
            <span
              className="absolute right-3 top-3 cursor-pointer text-blue-300"
              onClick={() => setMostrarContrasena(!mostrarContrasena)}
            >
              {mostrarContrasena ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>

        <button
          type="submit"
          className="bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 px-4 rounded-lg w-full hover:from-blue-700 hover:to-blue-600 transition-all font-bold shadow-lg"
        >
          Cambiar Contraseña
        </button>
      </form>
      <div className="mt-20 w-full">
        <AdminNav />
      </div>
    </div>
  );
};