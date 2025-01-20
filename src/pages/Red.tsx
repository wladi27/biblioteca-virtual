import React, { useEffect, useState } from 'react';
import { Background } from '../components/Background';
import { MobileNav } from '../components/MobileNav';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { User } from 'lucide-react';

export const Red = () => {
  const [username, setUsername] = useState('');
  const [nivelUsuario, setNivelUsuario] = useState(0);
  const [nivelMasAltoCompletado, setNivelMasAltoCompletado] = useState(0);
  const [piramideData, setPiramideData] = useState([]);
  const [openAcordeon, setOpenAcordeon] = useState(null);

  useEffect(() => {
    const usuario = localStorage.getItem('usuario');
    if (usuario) {
      const userData = JSON.parse(usuario);
      setUsername(userData.nombre_completo);
      setNivelUsuario(userData.nivel || 0); // Obtener el nivel del usuario

      // Llamada a la API para obtener la data de la pirámide
      const fetchPiramideData = async () => {
        try {
          const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/usuarios/piramide/${userData._id}`);
          if (response.ok) {
            const data = await response.json();
            setPiramideData(data.niveles); // Guardar la data de la pirámide
          } else {
            console.error('Error al obtener la data de la pirámide');
          }
        } catch (error) {
          console.error('Error:', error);
        }
      };

      fetchPiramideData();
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

  // Calcular la diferencia entre el nivel más alto y el nivel del usuario
  const diferenciaNivel = nivelMasAltoCompletado - nivelUsuario;
  const nivelMostrado = Math.max(diferenciaNivel, 0); // Asegurarse de que sea 0 si es negativo

  const toggleAcordeon = (id) => {
    setOpenAcordeon(openAcordeon === id ? null : id);
  };

  // Función para mezclar un array
  const mezclarArray = (array) => {
    return array.sort(() => Math.random() - 0.5);
  };

  return (
    <div className="min-h-screen flex flex-col text-white">
      <Background />
      
      <div className="max-w-7xl mx-auto px-4 py-16 flex-grow bg-opacity-65 bg-gray-800 rounded-2xl shadow-lg">
        <h1 className="text-4xl font-bold mb-4">
          Red de Usuarios
        </h1>
        <hr />

        <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div className="bg-gray-700 bg-opacity-30 p-6 rounded-lg shadow-md flex items-center">
            <div>
              <h2 className="text-xl font-semibold">Nivel alcanzado</h2>
              <p className="text-gray-400">{nivelMostrado}</p>
            </div>
          </div>
          <div className="bg-gray-700 bg-opacity-30 p-6 rounded-lg shadow-md flex items-center">
            <div>
              <h2 className="text-xl font-semibold">Nivel Máximo</h2>
              <p className="text-gray-400">12</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-700 bg-opacity-30 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Pirámide de Usuarios</h2>
          {piramideData.length > 0 ? (
            piramideData.map((nivel, index) => {
              const maxUsuariosRequeridos = 3 ** (index + 1); // Calcular 3^(n+1) para el índice n
              const usuariosAleatorios = mezclarArray(nivel.usuarios); // Mezclar usuarios
              const usuariosMostrar = usuariosAleatorios.slice(0, maxUsuariosRequeridos); // Mostrar solo los necesarios

              return (
                <div key={index} className="mb-4">
                  <div
                    className="bg-gray-800 p-4 rounded-lg flex justify-between items-center cursor-pointer"
                    onClick={() => toggleAcordeon(index)}
                  >
                    <h3 className="text-lg font-semibold">Nivel {index + 1}</h3>
                    {openAcordeon === index ? <FaChevronUp /> : <FaChevronDown />}
                  </div>
                  {openAcordeon === index && (
                    <div className="bg-gray-900 p-4 rounded-lg mt-2">
                      <ul>
                        {usuariosMostrar.length > 0 ? (
                          usuariosMostrar.map((usuario, idx) => (
                            <React.Fragment key={usuario._id}>
                              <li className="mb-2 flex items-center">
                                <User className="mr-2" />
                                {usuario.nombre_usuario}
                              </li>
                              {idx < usuariosMostrar.length - 1 && (
                                <hr className="w-full border-gray-700 my-2" />
                              )}
                            </React.Fragment>
                          ))
                        ) : (
                          <p className="text-gray-400">No hay usuarios en este nivel.</p>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-gray-400">No hay datos disponibles.</p>
          )}
        </div>
      </div>

      <MobileNav />
    </div>
  );
};