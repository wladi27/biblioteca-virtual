import React, { useState, useEffect } from 'react';
import { AdminNav } from '../components/AdminNav';
import { PlusCircle, Trash2, Eye } from 'lucide-react';

export const RecargarBilletera = () => {
  const [monto, setMonto] = useState('');
  const [usuarioId, setUsuarioId] = useState('');
  const [transacciones, setTransacciones] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [mensajeColor, setMensajeColor] = useState('');
  const [filtro, setFiltro] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [transaccionSeleccionada, setTransaccionSeleccionada] = useState(null);

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
        fetchTransacciones(); // Actualiza la lista de transacciones
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
        fetchTransacciones(); // Actualiza la lista de transacciones
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
    fetchTransacciones(); // Cargar transacciones al inicio
  }, [usuarioId]);

  const transaccionesFiltradas = transacciones.filter(transaccion =>
    transaccion.descripcion.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-800 text-white p-4">
      <form className="bg-gray-700 p-8 rounded-lg shadow-lg w-full max-w-md" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-4 text-center flex items-center justify-center">
          <PlusCircle className="mr-2" /> Recargar Billetera
        </h2>
        {mensaje && <p className={`mb-4 ${mensajeColor} text-center`}>{mensaje}</p>}
        
        {/* Campo para Monto */}
        <div className="mb-4">
          <label className="block mb-2" htmlFor="monto">Monto a Recargar</label>
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
          <label className="block mb-2" htmlFor="userId">ID del Usuario</label>
          <input
            type="text"
            id="userId"
            value={usuarioId}
            onChange={(e) => setUsuarioId(e.target.value)}
            className="w-full p-2 rounded-md bg-gray-600 text-white"
            required
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded-md w-full hover:bg-blue-700 transition-colors"
        >
          Recargar Billetera
        </button>
      </form>

      
        
        <h2 className="text-2xl font-bold mt-10 text-center">Transacciones Recarga</h2>
        {/* Filtro de transacciones */}
      <div className="mt-8 w-full max-w-md">
        <input
          type="text"
          placeholder="Filtrar transacciones..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="w-full p-2 rounded-md bg-gray-600 text-white mb-4"
        />
        <ul className="bg-gray-700 rounded-lg">
          {transaccionesFiltradas.map(transaccion => (
            <li key={transaccion._id} className="flex justify-between items-center p-4 border-b border-gray-600">
              <div>
                <p>{transaccion.descripcion}</p>
                <p className="text-sm text-gray-400">{new Date(transaccion.fecha).toLocaleString()}</p>
              </div>
              <div className="flex items-center">
                <button onClick={() => handleOpenModal(transaccion)} className="text-green-500 hover:text-green-700 mr-2">
                  <Eye className="w-5 h-5" />
                </button>
                <button onClick={() => eliminarTransaccion(transaccion._id)} className="text-red-500 hover:text-red-700">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Modal para detalles de la transacción */}
      {modalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg w-11/12 max-w-md">
            <h3 className="text-xl font-bold mb-2">Detalles de la Transacción</h3>
            {transaccionSeleccionada && (
              <>
                <p><strong>ID:</strong> {transaccionSeleccionada._id}</p>
                <p><strong>Usuario que recibe:</strong> {transaccionSeleccionada.usuario_id}</p>
                <p><strong>Descripción:</strong> {transaccionSeleccionada.descripcion}</p>
                <p><strong>Monto:</strong> ${transaccionSeleccionada.monto}</p>
                <p><strong>Fecha:</strong> {new Date(transaccionSeleccionada.fecha).toLocaleString()}</p>
              </>
            )}
            <button onClick={handleCloseModal} className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
              Cerrar
            </button>
          </div>
        </div>
      )}

      <br/><br/><br/>
      <AdminNav />
    </div>
    
    
  );
};
