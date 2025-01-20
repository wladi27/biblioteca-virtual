import React, { useEffect, useState } from 'react';
import { Background } from '../components/Background';
import { MobileNav } from '../components/MobileNav';
import { FaDollarSign, FaUser, FaCode, FaHistory } from 'react-icons/fa';

export const Dashboard = () => {
  const [username, setUsername] = useState('');
  const [comisiones, setComisiones] = useState(0);
  const [nivelUsuario, setNivelUsuario] = useState(0);
  const [nivelMasAltoCompletado, setNivelMasAltoCompletado] = useState(0);
  const [codigosCreados, setCodigosCreados] = useState(0);
  const [retiros, setRetiros] = useState([]);

  useEffect(() => {
    const usuario = localStorage.getItem('usuario');
    if (usuario) {
      const userData = JSON.parse(usuario);
      setUsername(userData.nombre_completo);
      setComisiones(userData.comisiones || 0);
      setNivelUsuario(userData.nivel || 0); // Obtener el nivel del usuario
      setRetiros(userData.retiros || generateSampleWithdrawals());

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

    // Llamada a la API para obtener el nivel más alto completado
    const fetchUserLevel = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/usuarios/nivel`);
        if (response.ok) {
          const data = await response.json();
          setNivelMasAltoCompletado(data.nivelMasAltoCompletado); // Guardar el nivel más alto
        } else {
          console.error('Error al obtener el nivel del usuario');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchUserLevel();
  }, []);

  const generateSampleWithdrawals = () => {
    return [
      { monto: 100, fecha: '2024-12-01' },
      { monto: 150, fecha: '2024-12-15' },
      { monto: 200, fecha: '2024-12-20' },
    ];
  };

  // Calcular la diferencia entre el nivel más alto y el nivel del usuario
  const diferenciaNivel = nivelMasAltoCompletado - nivelUsuario;
  const nivelMostrado = Math.max(diferenciaNivel, 0); // Asegurarse de que sea 0 si es negativo

  return (
    <div className="min-h-screen flex flex-col text-white">
      {/* Fondo del dashboard */}
      <Background />
      
      <div className="max-w-7xl mx-auto px-4 py-16 flex-grow bg-opacity-65 bg-gray-800 rounded-2xl shadow-lg">
        <h1 className="text-4xl font-bold mb-4">
          Home
        </h1>
        <hr />

        <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div className="bg-gray-700 bg-opacity-30 p-6 rounded-lg shadow-md flex items-center">
            <FaUser className="text-3xl mr-4" />
            <div>
              <h2 className="text-xl font-semibold">Nivel alcanzado</h2>
              <p className="text-gray-400">{nivelMostrado}</p>
            </div>
          </div>

          <div className="bg-gray-700 bg-opacity-30 p-6 rounded-lg shadow-md flex items-center">
            <FaDollarSign className="text-3xl mr-4" />
            <div>
              <h2 className="text-xl font-semibold">Comisiones Generadas</h2>
              <p className="text-gray-400">${comisiones}</p>
            </div>
          </div>

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
              {retiros.map((retiro, index) => (
                <li key={index} className="flex justify-between items-center p-4 bg-gray-900 rounded-md shadow-sm">
                  <span className="text-gray-300">Monto: ${retiro.monto}</span>
                  <span className="text-gray-300">{retiro.fecha}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">No hay retiros disponibles.</p>
          )}
        </div>
      </div>
      <br /><br />

      {/* Barra de navegación móvil */}
      <MobileNav />
    </div>
  );
};
