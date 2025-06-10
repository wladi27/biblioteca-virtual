import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Background } from '../components/Background';
import { AdminNav } from '../components/AdminNav';
import { FaSearch, FaUserCircle, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import debounce from 'lodash/debounce';

export const TotalReferralCodes = () => {
  const [referralCodes, setReferralCodes] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | null }>(null);

  useEffect(() => {
    fetchReferralCodes();
  }, []);

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

  const handleFiltroChange = useCallback(
    debounce((value: string) => {
      setFiltro(value);
    }, 300),
    []
  );

  const referralCodesFiltrados = useMemo(() => {
    return referralCodes.filter(
      (code) =>
        code.code.toLowerCase().includes(filtro.toLowerCase()) ||
        code.userId.nombre_completo.toLowerCase().includes(filtro.toLowerCase())
    );
  }, [referralCodes, filtro]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 text-white">
      <Background />

      <div className="max-w-2xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-extrabold mb-8 text-center text-blue-400 drop-shadow">Códigos de Referencia</h2>

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
            placeholder="Filtrar por código o nombre..."
            onChange={(e) => handleFiltroChange(e.target.value)}
            className="w-full bg-transparent text-white rounded-md py-2 px-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <ul className="space-y-4">
          {referralCodesFiltrados.length === 0 && (
            <li className="bg-gray-800 p-6 rounded-xl shadow-lg text-center text-blue-200 border border-blue-700">
              No se encontraron códigos de referencia.
            </li>
          )}
          {referralCodesFiltrados.map((code) => (
            <li
              key={code._id}
              className="bg-gradient-to-r from-blue-800 to-blue-600 p-5 rounded-xl shadow-lg border border-blue-700 flex items-center gap-4 hover:scale-[1.01] transition-transform"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-700 mr-3">
                <FaUserCircle className="text-2xl text-blue-200" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white">{code.code}</h3>
                <p className="text-blue-200 font-mono text-sm break-all">
                  Usuario: {code.userId.nombre_completo}
                </p>
                <p className="text-xs text-blue-100 mt-1">
                  Fecha de Creación:{' '}
                  <span className="font-mono">
                    {new Date(code.createdAt).toLocaleDateString()}
                  </span>
                </p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                    code.used
                      ? 'bg-green-700 text-green-200'
                      : 'bg-gray-700 text-blue-200'
                  }`}
                >
                  {code.used ? (
                    <>
                      <FaCheckCircle className="text-green-300" /> Utilizado
                    </>
                  ) : (
                    <>
                      <FaTimesCircle className="text-blue-300" /> Sin usar
                    </>
                  )}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <AdminNav />
    </div>
  );
};