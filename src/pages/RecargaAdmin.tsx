import React, { useState, useEffect } from 'react';
import { AdminNav } from '../components/AdminNav';

export const RecargarBilletera = () => {
  const [monto, setMonto] = useState('');
  const [usuarioId, setUsuarioId] = useState('');
  const [usuarioInfo, setUsuarioInfo] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [mensajeColor, setMensajeColor] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Verificar que el monto sea un número positivo
    if (isNaN(monto) || monto <= 0) {
      setMensaje('Por favor, ingresa un monto válido.');
      setMensajeColor('text-red-400');
      return;
    }

    try {
      const token = localStorage.getItem('token'); // Obtener el token del localStorage

      const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/api/billetera/recargar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Pasar el token en las cabeceras
        },
        body: JSON.stringify({ monto: parseFloat(monto), usuarioId }),
      });

      if (response.ok) {
        setMensaje('Billetera recargada exitosamente.');
        setMensajeColor('text-green-400');
      } else {
        const errorData = await response.json();
        setMensaje(`Error: ${errorData.message || 'No se pudo recargar la billetera.'}`);
        setMensajeColor('text-red-400');
      }
    } catch (error) {
      setMensaje('Error en la conexión.');
      setMensajeColor('text-blue-400');
    }
  };

  const fetchUsuarioInfo = async (userId) => {
    if (!userId) {
      setUsuarioInfo(null);
      return;
    }

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
    fetchUsuarioInfo(usuarioId);
  }, [usuarioId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-800 text-white p-4">
      <form
        className="bg-gray-700 p-8 rounded-lg shadow-lg w-full max-w-md"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Recargar Billetera</h2>
        {mensaje && <p className={`mb-4 ${mensajeColor} text-center`}>{mensaje}</p>}
        
        {/* Campo para Monto */}
        <div className="mb-4">
          <label className="block mb-2" htmlFor="monto">
            Monto a Recargar
          </label>
          <input
            type="number"
            id="monto"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            className="w-full p-2 rounded-md bg-gray-600 text-white"
            required
            min="1"
          />
        </div>

        {/* Campo para ID de Usuario */}
        <div className="mb-4">
          <label className="block mb-2" htmlFor="userId">
            ID del Usuario
          </label>
          <input
            type="text"
            id="userId"
            value={usuarioId}
            onChange={(e) => setUsuarioId(e.target.value)}
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
          </div>
        )}

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded-md w-full hover:bg-blue-700 transition-colors"
        >
          Recargar Billetera
        </button>
      </form>
      <AdminNav />
    </div>
  );
};
