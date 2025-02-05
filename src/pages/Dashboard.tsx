import React, { useEffect, useState } from 'react';
import { Background } from '../components/Background';
import { MobileNav } from '../components/MobileNav';
import { FaDollarSign, FaCode, FaHistory } from 'react-icons/fa';
import { NivelAlcanzadoComponet } from '../components/NivelAlcanzado';

export const Dashboard = () => {
  const [comisiones, setComisiones] = useState(0);
  const [nivelMasAltoCompletado, setNivelMasAltoCompletado] = useState(0);
  const [codigosCreados, setCodigosCreados] = useState(0);
  const [retiros, setRetiros] = useState([]);

  useEffect(() => {
    const usuario = localStorage.getItem('usuario');
    if (usuario) {
      const userData = JSON.parse(usuario);
      setComisiones(userData.comisiones || 0);

      // Llamada a la API para obtener los retiros del usuario
      const fetchRetiros = async () => {
        try {
          const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/withdrawals/usuario/${userData._id}`);
          if (response.ok) {
            const data = await response.json();
            setRetiros(data.length > 0 ? data : []); // Actualiza la lista de retiros
          } else {
            console.error('Error al obtener los retiros');
            setRetiros([]); // Asegúrate de establecer en vacío si hay un error
          }
        } catch (error) {
          console.error('Error:', error);
          setRetiros([]); // Asegúrate de establecer en vacío si hay un error
        }
      };

      fetchRetiros();

      // Llamada a la API para obtener el número total de códigos creados por el usuario
      const fetchCodigosCreados = async () => {
        try {
          const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/api/referralCodes/user/${userData._id}`);
          if (response.ok) {
            const data = await response.json();
            setCodigosCreados(data.length); // Guardar el número total de códigos
          } else {
            console.error('Error al obtener los códigos creados');
          }
        } catch (error) {
          console.error('Error:', error);
        }
      };

      fetchCodigosCreados();
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col text-white">
      <Background />
      
      <div className="max-w-7xl px-4 py-16 flex-grow bg-opacity-65 bg-gray-800 rounded-2xl shadow-lg">
        <h1 className="text-4xl font-bold mb-4">Home</h1>
        <hr />

        <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <NivelAlcanzadoComponet />


          <div className="bg-gray-700 bg-opacity-30 p-6 rounded-lg shadow-md flex items-center">
            <FaCode className="text-3xl mr-4" />
            <div>
              <h2 className="text-xl font-semibold">Códigos Creados</h2>
              <p className="text-gray-400">{codigosCreados}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-700 bg-opacity-30 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <FaHistory className="mr-2" /> Lista de Retiros
          </h2>
          {retiros.length > 0 ? (
            <ul className="list-none space-y-4">
              {retiros.map((retiro) => (
                <li key={retiro._id} className="flex justify-between items-center p-4 bg-gray-900 rounded-md shadow-sm">
                  <span className="text-gray-300">Monto: ${retiro.monto}</span>
                  <span className="text-gray-300">{retiro.status}</span>
                  <span className="text-gray-300">{new Date(retiro.fecha).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">No hay retiros disponibles.</p>
          )}
        </div>
      </div>

      <MobileNav />
    </div>
  );
};
