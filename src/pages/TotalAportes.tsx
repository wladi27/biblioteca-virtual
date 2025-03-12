import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Background } from '../components/Background';
import { AdminNav } from '../components/AdminNav';
import { FaSearch } from 'react-icons/fa';
import debounce from 'lodash/debounce'; // Importación de debounce

export const TotalApprovedContributions = () => {
  const [contributions, setContributions] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | null }>(null);

  // Cargar aportes aprobados al montar el componente
  useEffect(() => {
    fetchContributions();
  }, []);

  // Función para obtener los aportes aprobados
  const fetchContributions = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/api/aportes`);
      if (response.ok) {
        const data = await response.json();

        // Filtrar solo los aportes aprobados
        const approvedContributions = data.filter(contribution => contribution.aporte);

        // Obtener información de los usuarios en una sola solicitud
        const usuariosResponse = await fetch(`${import.meta.env.VITE_URL_LOCAL}/usuarios`);
        const usuariosData = await usuariosResponse.json();

        // Mapear los usuarios a un objeto para acceso rápido por ID
        const usuariosMap = usuariosData.reduce((acc, usuario) => {
          acc[usuario._id] = usuario;
          return acc;
        }, {});

        // Combinar aportes con información de usuarios
        const contributionsWithUserInfo = approvedContributions.map(contribution => ({
          ...contribution,
          usuario: usuariosMap[contribution.usuarioId] || null,
        }));

        setContributions(contributionsWithUserInfo);
      } else {
        throw new Error('Error al obtener los aportes');
      }
    } catch (error) {
      console.error(error);
      setMessage({ text: 'Error al conectar con el servidor', type: 'error' });
    }
  };

  // Función de filtrado con debounce
  const handleFiltroChange = useCallback(
    debounce((value: string) => {
      setFiltro(value);
    }, 300),
    []
  );

  // Filtrar aportes usando useMemo para evitar recalculos innecesarios
  const contributionsFiltradas = useMemo(() => {
    return contributions.filter(contribution =>
      contribution.usuarioId.toLowerCase().includes(filtro.toLowerCase())
    );
  }, [contributions, filtro]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Background />

      <div className="max-w-2xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold mb-6 text-center">Total de Aportes Aprobados</h2>

        {message && (
          <div
            className={`mb-4 p-4 rounded-md ${
              message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="mb-4 flex items-center">
          <FaSearch className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Filtrar por ID de usuario..."
            onChange={(e) => handleFiltroChange(e.target.value)}
            className="w-full bg-gray-700 text-white rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <ul className="space-y-4">
          {contributionsFiltradas.map((contribution) => (
            <li key={contribution._id} className="bg-gray-800 p-4 rounded-md">
              <h3 className="text-lg font-bold">Usuario ID: {contribution.usuarioId}</h3>
              <p>Nombre Usuario: {contribution.usuario?.nombre_completo || 'No disponible'}</p>
              <p>Aporte Aprobado: {contribution.aporte ? 'Sí' : 'No'}</p>
              {contribution.usuario?.padre && (
                <>
                  <br />
                  <hr />
                  <br />
                  <p>ID Padre: {contribution.usuario.padre.id || 'No disponible'}</p>
                  <p>Nombre Padre: {contribution.usuario.padre.nombre || 'No disponible'}</p>
                </>
              )}
            </li>
          ))}
        </ul>

        {contributionsFiltradas.length === 0 && (
          <p className="text-gray-400 text-center mt-4">No se encontraron aportes aprobados.</p>
        )}
      </div>
      <br /><br />

      <AdminNav />
    </div>
  );
};