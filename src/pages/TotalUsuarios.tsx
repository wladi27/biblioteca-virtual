import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Background } from '../components/Background';
import { AdminNav } from '../components/AdminNav';
import Modal from '../components/Modal';
import { FaSearch } from 'react-icons/fa';
import debounce from 'lodash/debounce'; // Importación de debounce

export const TotalUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | null }>(null);

  // Cargar usuarios al montar el componente
  useEffect(() => {
    fetchUsuarios();
  }, []);

  // Función para obtener los usuarios
  const fetchUsuarios = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/usuarios`);
      if (response.ok) {
        const data = await response.json();
        setUsuarios(data);
      } else {
        throw new Error('Error al obtener usuarios');
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

  // Filtrar usuarios usando useMemo para evitar recalculos innecesarios
  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter(
      (usuario) =>
        (usuario.nombre_completo &&
          usuario.nombre_completo.toLowerCase().includes(filtro.toLowerCase())) ||
        (usuario._id && usuario._id.includes(filtro))
    );
  }, [usuarios, filtro]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Background />

      <div className="max-w-2xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold mb-6 text-center">Lista de Usuarios</h2>

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
            placeholder="Filtrar por ID o nombre..."
            onChange={(e) => handleFiltroChange(e.target.value)}
            className="w-full bg-gray-700 text-white rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <ul className="space-y-4">
          {usuariosFiltrados.map((usuario) => (
            <li key={usuario._id} className="bg-gray-800 p-4 rounded-md">
              <h3 className="text-lg font-bold">{usuario.nombre_completo}</h3>
              <p>ID: {usuario._id}</p>
            </li>
          ))}
        </ul>
        <br />
      </div>

      <AdminNav />
    </div>
  );
};