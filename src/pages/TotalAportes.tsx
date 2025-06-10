import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Background } from '../components/Background';
import { AdminNav } from '../components/AdminNav';
import { FaSearch, FaUserCircle, FaUserFriends } from 'react-icons/fa';
import debounce from 'lodash/debounce';

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

  const handleFiltroChange = useCallback(
    debounce((value: string) => {
      setFiltro(value);
    }, 300),
    []
  );

  const contributionsFiltradas = useMemo(() => {
    return contributions.filter(contribution =>
      (contribution.usuario?.nombre_completo?.toLowerCase().includes(filtro.toLowerCase()) ||
        contribution.usuarioId.toLowerCase().includes(filtro.toLowerCase()))
    );
  }, [contributions, filtro]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 text-white">
      <Background />

      <div className="max-w-2xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-extrabold mb-8 text-center text-blue-400 drop-shadow">Aportes Aprobados</h2>

        {message && (
          <div
            className={`mb-4 p-4 rounded-lg text-center font-semibold shadow-lg ${
              message.type === 'success' ? 'bg-green-600/80 text-white' : 'bg-red-600/80 text-white'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="mb-8 flex items-center bg-gray-800 rounded-lg px-4 py-2 border border-blue-700 shadow">
          <FaSearch className="text-blue-300 mr-3 text-xl" />
          <input
            type="text"
            placeholder="Filtrar por nombre o ID de usuario..."
            onChange={(e) => handleFiltroChange(e.target.value)}
            className="w-full bg-transparent text-white rounded-md py-2 px-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <ul className="space-y-4">
          {contributionsFiltradas.length === 0 && (
            <li className="bg-gray-800 p-6 rounded-xl shadow-lg text-center text-blue-200 border border-blue-700">
              No se encontraron aportes aprobados.
            </li>
          )}
          {contributionsFiltradas.map((contribution) => (
            <li
              key={contribution._id}
              className="bg-gradient-to-r from-blue-800 to-blue-600 p-5 rounded-xl shadow-lg border border-blue-700 flex items-center gap-4 hover:scale-[1.01] transition-transform"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-700 mr-3">
                <FaUserCircle className="text-2xl text-blue-200" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white">
                  {contribution.usuario?.nombre_completo || 'Usuario no disponible'}
                </h3>
                <p className="text-blue-200 font-mono text-sm break-all">
                  ID: {contribution.usuarioId}
                </p>
                <p className="text-xs text-blue-100 mt-1">
                  Aporte aprobado: <span className="font-bold text-green-300">Sí</span>
                </p>
                {contribution.usuario?.padre && (
                  <div className="mt-2 flex flex-col md:flex-row md:gap-8 gap-1">
                    <span className="flex items-center gap-2 text-xs text-blue-100">
                      <FaUserFriends className="text-blue-300" /> ID Padre: <span className="font-mono">{contribution.usuario.padre.id || 'No disponible'}</span>
                    </span>
                    <span className="flex items-center gap-2 text-xs text-blue-100">
                      <FaUserCircle className="text-blue-300" /> Nombre Padre: <span className="font-mono">{contribution.usuario.padre.nombre || 'No disponible'}</span>
                    </span>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
      <AdminNav />
    </div>
  );
};