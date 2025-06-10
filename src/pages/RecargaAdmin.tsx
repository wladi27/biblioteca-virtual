import React, { useState, useEffect } from 'react';
import { AdminNav } from '../components/AdminNav';
import { PlusCircle, Trash2, Eye, UserCircle2 } from 'lucide-react';

export const RecargarBilletera = () => {
  const [monto, setMonto] = useState('');
  const [usuarioId, setUsuarioId] = useState('');
  const [usuarioInfo, setUsuarioInfo] = useState(null);
  const [transacciones, setTransacciones] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [mensajeColor, setMensajeColor] = useState('');
  const [filtro, setFiltro] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [transaccionSeleccionada, setTransaccionSeleccionada] = useState(null);

  useEffect(() => {
    const fetchUsuario = async () => {
      if (!usuarioId) {
        setUsuarioInfo(null);
        return;
      }
      try {
        const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/usuarios/${usuarioId}`);
        if (response.ok) {
          const data = await response.json();
          setUsuarioInfo(data);
        } else {
          setUsuarioInfo(null);
        }
      } catch {
        setUsuarioInfo(null);
      }
    };
    fetchUsuario();
  }, [usuarioId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isNaN(monto) || monto <= 0) {
      setMensaje('Por favor, ingresa un monto válido.');
      setMensajeColor('text-red-400');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/api/billetera/recargar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ monto: parseFloat(monto), usuarioId }),
      });

      if (response.ok) {
        setMensaje('Billetera recargada exitosamente.');
        setMensajeColor('text-green-400');
        fetchTransacciones();
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

  const fetchTransacciones = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/api/transacciones/transacciones`);
      if (response.ok) {
        const data = await response.json();
        const recargas = data.filter(transaccion => transaccion.tipo === 'recarga');
        setTransacciones(recargas);
      } else {
        setMensaje('Error al obtener transacciones.');
        setMensajeColor('text-red-400');
      }
    } catch (error) {
      setMensaje('Error en la conexión.');
      setMensajeColor('text-blue-400');
    }
  };

  const eliminarTransaccion = async (id) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/api/transacciones/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMensaje('Transacción eliminada correctamente.');
        setMensajeColor('text-green-400');
        fetchTransacciones();
      } else {
        const errorData = await response.json();
        setMensaje(`Error: ${errorData.message}`);
        setMensajeColor('text-red-400');
      }
    } catch (error) {
      setMensaje('Error en la conexión.');
      setMensajeColor('text-blue-400');
    }
  };

  const handleOpenModal = (transaccion) => {
    setTransaccionSeleccionada(transaccion);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setTransaccionSeleccionada(null);
  };

  useEffect(() => {
    fetchTransacciones();
  }, [usuarioId]);

  const transaccionesFiltradas = transacciones.filter(transaccion =>
    transaccion.descripcion.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 text-white p-4">
      <form className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-lg border border-blue-700" onSubmit={handleSubmit}>
        <h2 className="text-3xl font-extrabold mb-6 text-center flex items-center justify-center text-blue-400 drop-shadow">
          <PlusCircle className="mr-2 w-8 h-8" /> Recargar Billetera
        </h2>
        {mensaje && <p className={`mb-4 ${mensajeColor} text-center font-semibold`}>{mensaje}</p>}
        
        <div className="mb-6">
          <label className="block mb-2 font-semibold text-blue-300" htmlFor="monto">Monto a Recargar</label>
          <input
            type="number"
            id="monto"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-700 text-white border border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
            min="1"
            placeholder="Ej: 100"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-semibold text-blue-300" htmlFor="userId">ID del Usuario</label>
          <input
            type="text"
            id="userId"
            value={usuarioId}
            onChange={(e) => setUsuarioId(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-700 text-white border border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
            placeholder="Ingresa el ID del usuario"
          />
        </div>

        {/* Card de usuario */}
        {usuarioId && (
          <div className="mb-6">
            {usuarioInfo ? (
              <div className="flex items-center gap-4 bg-gradient-to-r from-blue-800 to-blue-600 rounded-xl p-4 shadow-lg border border-blue-400">
                <UserCircle2 className="w-12 h-12 text-white drop-shadow" />
                <div>
                  <div className="font-bold text-lg text-white">{usuarioInfo.nombre_completo}</div>
                  <div className="text-blue-200 font-mono">@{usuarioInfo.nombre_usuario}</div>
                  <div className="text-xs text-blue-100 mt-1">ID: <span className="font-mono">{usuarioInfo._id}</span></div>
                </div>
              </div>
            ) : (
              <div className="bg-red-700 text-white rounded-lg p-3 text-center font-semibold shadow">Usuario no encontrado</div>
            )}
          </div>
        )}

        <button
          type="submit"
          className="bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 px-4 rounded-lg w-full hover:from-blue-700 hover:to-blue-600 transition-all font-bold shadow-lg mt-2"
        >
          Recargar Billetera
        </button>
      </form>

      <h2 className="text-2xl font-bold mt-12 text-center text-blue-300 drop-shadow">Transacciones de Recarga</h2>
      <div className="mt-8 w-full max-w-lg">
        <input
          type="text"
          placeholder="Filtrar transacciones..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="w-full p-3 rounded-lg bg-gray-700 text-white mb-4 border border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <ul className="bg-gray-800 rounded-xl shadow-lg border border-blue-700 divide-y divide-blue-900">
          {transaccionesFiltradas.map(transaccion => (
            <li key={transaccion._id} className="flex justify-between items-center p-4 hover:bg-blue-900/30 transition">
              <div>
                <p className="font-semibold text-blue-200">{transaccion.descripcion}</p>
                <p className="text-xs text-gray-400">{new Date(transaccion.fecha).toLocaleString()}</p>
              </div>
              <div className="flex items-center">
                <button onClick={() => handleOpenModal(transaccion)} className="text-green-400 hover:text-green-300 mr-2 transition">
                  <Eye className="w-5 h-5" />
                </button>
                <button onClick={() => eliminarTransaccion(transaccion._id)} className="text-red-400 hover:text-red-300 transition">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Modal para detalles de la transacción */}
      {modalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-8 rounded-2xl w-11/12 max-w-md border-2 border-blue-700 shadow-2xl relative">
            <h3 className="text-xl font-bold mb-4 text-blue-300">Detalles de la Transacción</h3>
            {transaccionSeleccionada && (
              <div className="space-y-2">
                <p><span className="font-semibold text-blue-200">ID:</span> <span className="font-mono">{transaccionSeleccionada._id}</span></p>
                <p><span className="font-semibold text-blue-200">Usuario que recibe:</span> <span className="font-mono">{transaccionSeleccionada.usuario_id}</span></p>
                <p><span className="font-semibold text-blue-200">Descripción:</span> {transaccionSeleccionada.descripcion}</p>
                <p><span className="font-semibold text-blue-200">Monto:</span> <span className="font-mono">${transaccionSeleccionada.monto}</span></p>
                <p><span className="font-semibold text-blue-200">Fecha:</span> {new Date(transaccionSeleccionada.fecha).toLocaleString()}</p>
              </div>
            )}
            <button onClick={handleCloseModal} className="mt-6 bg-gradient-to-r from-blue-600 to-blue-500 text-white py-2 px-6 rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all font-bold shadow-lg w-full">
              Cerrar
            </button>
          </div>
        </div>
      )}

      <div className="mt-20 w-full">
        <AdminNav />
      </div>
    </div>
  );
};