import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Background } from '../components/Background';
import { AdminNav } from '../components/AdminNav';
import { FaSearch } from 'react-icons/fa';
import debounce from 'lodash/debounce'; // Importación de debounce

export const TotalReferralCodes = () => {
  const [referralCodes, setReferralCodes] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | null }>(null);

  // Cargar códigos de referencia al montar el componente
  useEffect(() => {
    fetchReferralCodes();
  }, []);

  // Función para obtener los códigos de referencia
  const fetchReferralCodes = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/api/referralCodes`);
      if (response.ok) {
        const data = await response.json();
        setReferralCodes(data);
      } else {
        throw new Error('Error al obtener los códigos de referencia');
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

  // Filtrar códigos de referencia usando useMemo para evitar recalculos innecesarios
  const referralCodesFiltrados = useMemo(() => {
    return referralCodes.filter(
      (code) =>
        code.code.toLowerCase().includes(filtro.toLowerCase()) ||
        code.userId.nombre_completo.toLowerCase().includes(filtro.toLowerCase())
    );
  }, [referralCodes, filtro]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Background />

      <div className="max-w-2xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold mb-6 text-center">Total de Códigos de Referencia</h2>

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
            placeholder="Filtrar por código o nombre..."
            onChange={(e) => handleFiltroChange(e.target.value)}
            className="w-full bg-gray-700 text-white rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <ul className="space-y-4">
          {referralCodesFiltrados.map((code) => (
            <li key={code._id} className="bg-gray-800 p-4 rounded-md">
              <h3 className="text-lg font-bold">{code.code}</h3>
              <p>Usuario: {code.userId.nombre_completo}</p>
              <p>Utilizado: {code.used ? 'Sí' : 'No'}</p>
              <p>Fecha de Creación: {new Date(code.createdAt).toLocaleDateString()}</p>
            </li>
          ))}
        </ul>

        {referralCodesFiltrados.length === 0 && (
          <p className="text-gray-400 text-center mt-4">No se encontraron códigos de referencia.</p>
        )}
      </div>

      <AdminNav />
    </div>
  );
};