import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Background } from '../components/Background';
import { AdminNav } from '../components/AdminNav';
import Modal from '../components/Modal';
import { FaSearch, FaUserCircle } from 'react-icons/fa';
import debounce from 'lodash/debounce';

export const TotalUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | null }>(null);

  useEffect(() => {
    fetchUsuarios();
  }, []);

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

  const handleFiltroChange = useCallback(
    debounce((value: string) => {
      setFiltro(value);
    }, 300),
    []
  );

  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter(
      (usuario) =>
        (usuario.nombre_completo &&
          usuario.nombre_completo.toLowerCase().includes(filtro.toLowerCase())) ||
        (usuario._id && usuario._id.includes(filtro))
    );
  }, [usuarios, filtro]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 text-white">
      <Background />

      <div className="max-w-3xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-extrabold mb-8 text-center text-blue-400 drop-shadow">Lista de Usuarios</h2>

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
            placeholder="Filtrar por ID o nombre..."
            onChange={(e) => handleFiltroChange(e.target.value)}
            className="w-full bg-transparent text-white rounded-md py-2 px-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <ul className="space-y-4">
          {usuariosFiltrados.length === 0 && (
            <li className="bg-gray-800 p-6 rounded-xl shadow-lg text-center text-blue-200 border border-blue-700">
              No se encontraron usuarios.
            </li>
          )}
          {usuariosFiltrados.map((usuario) => (
            <li
              key={usuario._id}
              className="bg-gradient-to-r from-blue-800 to-blue-600 p-5 rounded-xl shadow-lg border border-blue-700 flex items-center gap-4 hover:scale-[1.01] transition-transform"
            >
              <FaUserCircle className="text-4xl text-blue-200" />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white">{usuario.nombre_completo}</h3>
                <p className="text-blue-200 font-mono text-sm break-all">ID: {usuario._id}</p>
                <p className="text-xs text-blue-100 mt-1">Usuario: <span className="font-mono">@{usuario.nombre_usuario}</span></p>
                <p className="text-xs text-blue-100 mt-1">Nivel: <span className="font-mono">{usuario.nivel}</span></p>
              </div>
              
            </li>
          ))}
        </ul>
        <br />
      </div>

      <AdminNav />
    </div>
  );
};