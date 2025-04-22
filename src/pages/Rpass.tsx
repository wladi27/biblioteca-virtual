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
      setMensajeColor('text-red-400'); // Color rojo para error
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
        setMensajeColor('text-green-400'); // Color verde para éxito
      } else {
        setMensaje('Error al actualizar la contraseña.');
        setMensajeColor('text-red-400'); // Color rojo para error
      }
    } catch (error) {
      setMensaje('Error en la conexión.');
      setMensajeColor('text-blue-400'); // Color azul para error de conexión
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
    <div className="min-h-screen flex items-center justify-center bg-gray-800 text-white p-4">
      <form
        className="bg-gray-700 p-8 rounded-lg shadow-lg w-full max-w-md"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Cambiar Contraseña</h2>
        {mensaje && <p className={`mb-4 ${mensajeColor} text-center`}>{mensaje}</p>}
        
        {/* Campo para ID de usuario */}
        <div className="mb-4">
          <label className="block mb-2" htmlFor="userId">
            ID del Usuario
          </label>
          <input
            type="text"
            id="userId"
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="w-full p-2 rounded-md bg-gray-600 text-white"
            required
          />
        </div>

        {/* Mostrar información del usuario */}
        {usuarioInfo && (
          <div className="mb-4">
            <h3 className="font-medium">Información del Usuario:</h3>
            <p>Nombre Completo: {usuarioInfo.nombre_completo}</p>
            <p>Nombre de Usuario: {usuarioInfo.nombre_usuario}</p>
            <p>Número de regristro: {usuarioInfo.nivel}</p>
          </div>
        )}

        {/* Campo para Nueva Contraseña */}
        <div className="mb-4">
          <label className="block mb-2" htmlFor="nuevaContrasena">
            Nueva Contraseña
          </label>
          <div className="relative">
            <input
              type={mostrarContrasena ? 'text' : 'password'}
              id="nuevaContrasena"
              value={nuevaContrasena}
              onChange={(e) => setNuevaContrasena(e.target.value)}
              className="w-full p-2 rounded-md bg-gray-600 text-white"
              required
            />
            <span
              className="absolute right-2 top-2 cursor-pointer"
              onClick={() => setMostrarContrasena(!mostrarContrasena)}
            >
              {mostrarContrasena ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>

        {/* Campo para Confirmar Nueva Contraseña */}
        <div className="mb-6">
          <label className="block mb-2" htmlFor="confirmarContrasena">
            Confirmar Nueva Contraseña
          </label>
          <div className="relative">
            <input
              type={mostrarContrasena ? 'text' : 'password'}
              id="confirmarContrasena"
              value={confirmarContrasena}
              onChange={(e) => setConfirmarContrasena(e.target.value)}
              className="w-full p-2 rounded-md bg-gray-600 text-white"
              required
            />
            <span
              className="absolute right-2 top-2 cursor-pointer"
              onClick={() => setMostrarContrasena(!mostrarContrasena)}
            >
              {mostrarContrasena ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded-md w-full hover:bg-blue-700 transition-colors"
        >
          Cambiar Contraseña
        </button>
      </form>
      <AdminNav />
    </div>
  );
};
