import React, { useEffect, useState } from 'react';
import { Background } from '../components/Background';
import { MobileNav } from '../components/MobileNav';
import { FaDollarSign, FaCode, FaHistory, FaUsers } from 'react-icons/fa';
import { AdminNav } from '../components/AdminNav';

export const Admin = () => {
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [totalCodigosCreados, setTotalCodigosCreados] = useState(0);
  const [totalRetiros, setTotalRetiros] = useState(0);
  const [listaRetiros, setListaRetiros] = useState([]);

  useEffect(() => {
    const fetchTotalUsuarios = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/usuarios`);
        if (response.ok) {
          const data = await response.json();
          setTotalUsuarios(data.length);
        } else {
          console.error('Error al obtener el total de usuarios:', response.statusText);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    const fetchTotalCodigosCreados = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/api/referralCodes`);
        if (response.ok) {
          const data = await response.json();
          setTotalCodigosCreados(data.length);
        } else {
          console.error('Error al obtener el total de códigos creados:', response.statusText);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    const fetchTotalRetiros = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/withdrawals`);
        if (response.ok) {
          const data = await response.json();
          setTotalRetiros(data.length);
          setListaRetiros(data);
        } else {
          console.error('Error al obtener el total de retiros:', response.statusText);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchTotalUsuarios();
    fetchTotalCodigosCreados();
    fetchTotalRetiros();
  }, []);

  const actualizarEstadoRetiro = async (id, nuevoEstado) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/withdrawals/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: nuevoEstado }),
      });

      if (response.ok) {
        // Actualizar la lista de retiros localmente
        setListaRetiros((prev) =>
          prev.map((retiro) =>
            retiro._id === id ? { ...retiro, status: nuevoEstado } : retiro
          )
        );
      } else {
        console.error('Error al actualizar el estado del retiro:', response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-white">
      <Background />
      
      <div className="max-w-7xl px-4 py-16 flex-grow bg-opacity-65 bg-gray-800 rounded-2xl shadow-lg">
        <h1 className="text-4xl font-bold mb-4">Administración</h1>
        <hr />

        <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div className="bg-gray-700 bg-opacity-30 p-6 rounded-lg shadow-md flex items-center">
            <FaUsers className="text-3xl mr-4" />
            <div>
              <h2 className="text-xl font-semibold">Total de Usuarios</h2>
              <p className="text-gray-400">{totalUsuarios}</p>
            </div>
          </div>

          <div className="bg-gray-700 bg-opacity-30 p-6 rounded-lg shadow-md flex items-center">
            <FaCode className="text-3xl mr-4" />
            <div>
              <h2 className="text-xl font-semibold">Total de Códigos Creados</h2>
              <p className="text-gray-400">{totalCodigosCreados}</p>
            </div>
          </div>

          <div className="bg-gray-700 bg-opacity-30 p-6 rounded-lg shadow-md flex items-center">
            <FaDollarSign className="text-3xl mr-4" />
            <div>
              <h2 className="text-xl font-semibold">Total de Retiros</h2>
              <p className="text-gray-400">{totalRetiros}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-700 bg-opacity-30 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <FaHistory className="mr-2" /> Lista de Retiros
          </h2>
          <ul className="space-y-4">
            {listaRetiros.map((retiro) => (
              <li key={retiro._id} className="bg-gray-600 p-4 rounded-lg flex justify-between items-center">
                <div className="flex-grow">
                  <p className="font-semibold">Monto: ${retiro.monto}</p>
                  <p className="text-gray-400">Estado: {retiro.status}</p>
                  <p className="text-gray-400">Fecha: {new Date(retiro.fecha).toLocaleDateString()}</p>
                </div>
                <div className="flex flex-col space-y-2">
                  <button 
                    onClick={() => actualizarEstadoRetiro(retiro._id, 'completado')}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-200 ease-in-out shadow-md"
                  >
                    Aprobar
                  </button>
                  <button 
                    onClick={() => actualizarEstadoRetiro(retiro._id, 'rechazado')}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-200 ease-in-out shadow-md"
                  >
                    Rechazar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <AdminNav />
    </div>
  );
};
