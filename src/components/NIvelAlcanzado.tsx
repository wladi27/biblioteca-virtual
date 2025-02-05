import React, { useEffect, useState } from 'react';
import { Background } from '../components/Background';
import { MobileNav } from '../components/MobileNav';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { User } from 'lucide-react';

export const NivelAlcanzadoComponet = () => {
  const [username, setUsername] = useState('');
  const [nivelUsuario, setNivelUsuario] = useState(0);
  const [nivelesCompletados, setNivelesCompletados] = useState(0);
  const [piramideData, setPiramideData] = useState([]);
  const [openAcordeon, setOpenAcordeon] = useState({});
  const [loading, setLoading] = useState(true); // Estado para controlar la carga

  useEffect(() => {
    const usuario = localStorage.getItem('usuario');
    if (usuario) {
      const userData = JSON.parse(usuario);
      setUsername(userData.nombre_completo);
      setNivelUsuario(userData.nivel || 0);

      const fetchPiramideData = async () => {
        try {
          const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/usuarios/piramide/${userData._id}`);
          if (response.ok) {
            const data = await response.json();
            setPiramideData(data.hijos || []);
            calcularNivelesCompletados(data.hijos || []);
          } else {
            console.error('Error al obtener la data de la pirámide');
          }
        } catch (error) {
          console.error('Error:', error);
        } finally {
          setLoading(false); // Finaliza la carga al obtener los datos
        }
      };

      fetchPiramideData();
    }
  }, []);

  const calcularNivelesCompletados = (data) => {
    let nivelesCompletados = 0;
    let currentNivelData = data;

    for (let nivel = 1; nivel <= 12; nivel++) {
      const cantidadEsperada = Math.pow(3, nivel); // 3^n
      if (currentNivelData.length === cantidadEsperada) {
        nivelesCompletados++;
      } else {
        break; // Si no se cumple, salimos del bucle
      }
      currentNivelData = currentNivelData.flatMap(usuario => usuario.hijos || []); // Obtener hijos para el siguiente nivel
    }

    setNivelesCompletados(nivelesCompletados);
  };

  const toggleAcordeon = (nivel) => {
    setOpenAcordeon((prev) => ({ ...prev, [nivel]: !prev[nivel] }));
  };

  const calcularCompletitud = (nivel, cantidadActual) => {
    const cantidadEsperada = Math.pow(3, nivel); // 3^n
    return cantidadActual === cantidadEsperada;
  };

  const renderAcordeon = (data, nivel) => {
    if (nivel > 12 || !data.length) return null; // Limitar a 12 niveles

    const completado = calcularCompletitud(nivel, data.length);

    return (
      <div className="mb-4" key={`nivel-${nivel}`}>
        <div
          className="bg-gray-800 p-2 rounded-lg flex justify-between items-center cursor-pointer"
          onClick={() => toggleAcordeon(nivel)}
        >
          <h3 className="text-lg font-semibold">{`Nivel ${nivel}`}</h3>
          <span className={`text-sm ${completado ? 'text-green-500' : 'text-red-500'}`}>
            {completado ? 'Completado' : 'No Completado'}
          </span>
          {openAcordeon[nivel] ? <FaChevronUp /> : <FaChevronDown />}
        </div>
        {openAcordeon[nivel] && (
          <ul className="pl-4 mt-2">
            {data.map((usuario) => (
              <li key={usuario._id} className="mb-2">
                <div className="flex items-center">
                  <User className="mr-2" />
                  {usuario.nombre_completo}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  const renderTodosLosNiveles = (data) => {
    const niveles = [];
    let currentNivelData = data;

    for (let nivel = 1; nivel <= 12; nivel++) {
      niveles.push(renderAcordeon(currentNivelData, nivel));
      currentNivelData = currentNivelData.flatMap(usuario => usuario.hijos || []); // Obtener hijos para el siguiente nivel
    }

    return niveles;
  };

  // Componente de carga
  const Preloader = () => (
    <div className="flex justify-center items-center h-screen">
      <div className="loader">Cargando...</div> {/* Aquí podrías usar un spinner o una animación */}
    </div>
  );

  return (
    <div >
        
          <div className="mt-6 bg-gray-700 bg-opacity-30 p-6 rounded-lg shadow-md flex items-center">
            <User className="text-3xl mr-4" />           
            <div>
              <h2 className="text-xl font-semibold">Nivel alcanzado</h2>
              <p className="text-gray-400">{nivelesCompletados}</p>
            </div>
          </div>
    </div>
  );
};
