import React, { useState, useEffect } from 'react';
import { Background } from '../components/Background';
import { AdminNav } from '../components/AdminNav';
import { FaSearch } from 'react-icons/fa';

export const TotalWithdrawals = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | null }>(null);

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/withdrawals`);
      if (response.ok) {
        const data = await response.json();
        setWithdrawals(data);
      } else {
        throw new Error('Error al obtener los retiros');
      }
    } catch (error) {
      console.error(error);
      setMessage({ text: 'Error al conectar con el servidor', type: 'error' });
    }
  };

  const handleFiltroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiltro(e.target.value);
  };

  const withdrawalsFiltrados = withdrawals.filter(withdrawal =>
    withdrawal.usuarioId.nombre_completo.toLowerCase().includes(filtro.toLowerCase()) ||
    withdrawal.monto.toString().includes(filtro)
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Background />

      <div className="max-w-2xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold mb-6 text-center">Total de Retiros</h2>

        {message && (
          <div className={`mb-4 p-4 rounded-md ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
            {message.text}
          </div>
        )}

        <div className="mb-4 flex items-center">
          <FaSearch className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Filtrar por nombre o monto..."
            value={filtro}
            onChange={handleFiltroChange}
            className="w-full bg-gray-700 text-white rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <ul className="space-y-4">
          {withdrawalsFiltrados.map((withdrawal) => (
            <li key={withdrawal._id} className="bg-gray-800 p-4 rounded-md">
              <h3 className="text-lg font-bold">Usuario: {withdrawal.usuarioId.nombre_completo}</h3>
              <p>Monto: ${withdrawal.monto}</p>
              <p>Status: {withdrawal.status}</p>
              <p>Fecha: {new Date(withdrawal.fecha).toLocaleDateString()}</p>
            </li>
          ))}
        </ul>

        {withdrawalsFiltrados.length === 0 && (
          <p className="text-gray-400 text-center mt-4">No se encontraron retiros.</p>
        )}
      </div>

      <AdminNav />
    </div>
  );
};
