import React, { useState, useEffect } from 'react';
import { Background } from '../components/Background';
import { AdminNav } from '../components/AdminNav';
import { FaSearch } from 'react-icons/fa';

export const TotalApprovedContributions = () => {
  const [contributions, setContributions] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | null }>(null);

  useEffect(() => {
    fetchContributions();
  }, []);

  const fetchContributions = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/api/aportes`);
      if (response.ok) {
        const data = await response.json();
        // Filtrar solo los aportes aprobados
        const approvedContributions = data.filter(contribution => contribution.aporte);
        setContributions(approvedContributions);
      } else {
        throw new Error('Error al obtener los aportes');
      }
    } catch (error) {
      console.error(error);
      setMessage({ text: 'Error al conectar con el servidor', type: 'error' });
    }
  };

  const handleFiltroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiltro(e.target.value);
  };

  const contributionsFiltradas = contributions.filter(contribution =>
    contribution.usuarioId.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Background />

      <div className="max-w-2xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold mb-6 text-center">Total de Aportes Aprobados</h2>

        {message && (
          <div className={`mb-4 p-4 rounded-md ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
            {message.text}
          </div>
        )}

        <div className="mb-4 flex items-center">
          <FaSearch className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Filtrar por ID de usuario..."
            value={filtro}
            onChange={handleFiltroChange}
            className="w-full bg-gray-700 text-white rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <ul className="space-y-4">
          {contributionsFiltradas.map((contribution) => (
            <li key={contribution._id} className="bg-gray-800 p-4 rounded-md">
              <h3 className="text-lg font-bold">Usuario ID: {contribution.usuarioId}</h3>
              <p>Aporte Aprobado: {contribution.aporte ? 'Sí' : 'No'}</p>
            </li>
          ))}
        </ul>

        {contributionsFiltradas.length === 0 && (
          <p className="text-gray-400 text-center mt-4">No se encontraron aportes aprobados.</p>
        )}
      </div>

      <AdminNav />
    </div>
  );
};
