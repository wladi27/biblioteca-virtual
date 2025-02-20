import React, { useEffect, useState } from 'react';
import { Background } from '../components/Background';
import { MobileNav } from '../components/MobileNav';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { User } from 'lucide-react';

export const Red = () => {
  const [username, setUsername] = useState('');
  const [nivelUsuario, setNivelUsuario] = useState(0);
  const [nivelesCompletados, setNivelesCompletados] = useState(0);
  const [piramideData, setPiramideData] = useState([]);
  const [openAcordeon, setOpenAcordeon] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const usuario = localStorage.getItem('usuario');
    if (usuario) {
      const userData = JSON.parse(usuario);
      setUsername(userData.nombre_completo);
      setNivelUsuario(userData.nivel || 0);
      fetchPiramideData(userData._id);
    }
  }, []);

  const fetchPiramideData = async (userId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/usuarios/piramide/${userId}`);
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
      setLoading(false);
    }
  };

  const calcularNivelesCompletados = (data) => {
    let nivelesCompletados = 0;
    let currentNivelData = data;

    for (let nivel = 1; nivel <= 12; nivel++) {
      const cantidadEsperada = Math.pow(3, nivel);
      if (currentNivelData.length === cantidadEsperada) {
        nivelesCompletados++;
      } else {
        break;
      }
      currentNivelData = currentNivelData.flatMap(usuario => usuario.hijos || []);
    }

    setNivelesCompletados(nivelesCompletados);
  };

  const toggleAcordeon = (nivel) => {
    setOpenAcordeon((prev) => ({ ...prev, [nivel]: !prev[nivel] }));
  };

  const calcularCompletitud = (nivel, cantidadActual) => {
    const cantidadEsperada = Math.pow(3, nivel);
    return cantidadActual === cantidadEsperada;
  };

  const renderAcordeon = (data, nivel) => {
    if (nivel > 12 || !data.length) return null;

    const completado = calcularCompletitud(nivel, data.length);
    const cantidadEsperada = Math.pow(3, nivel); // 3^n

    return (
      <div className="mb-4" key={`nivel-${nivel}`}>
        <div
          className="bg-gray-800 p-4 rounded-lg flex justify-between items-center cursor-pointer transition-transform transform hover:scale-105"
          onClick={() => toggleAcordeon(nivel)}
        >
          <div className="flex flex-col">
            <h3 className="text-lg font-semibold">
              {`Nivel ${nivel}`}
            </h3>
            <span className="text-sm text-gray-400">
              {`${data.length} / ${cantidadEsperada} usuarios - ${completado ? 'Completado' : 'No Completado'}`}
            </span>
          </div>
          {openAcordeon[nivel] ? <FaChevronUp /> : <FaChevronDown />}
        </div>
        {openAcordeon[nivel] && (
          <div className="pl-4 mt-2">
            <ul className="mt-2">
              {data.map((usuario) => (
                <li key={usuario._id} className="mb-2 flex items-center transition-colores hover:bg-gray-700 p-2 rounded-md">
                  <User className="mr-2" />
                  {usuario.nombre_completo}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderTodosLosNiveles = (data) => {
    const niveles = [];
    let currentNivelData = data;

    for (let nivel = 1; nivel <= 12; nivel++) {
      niveles.push(renderAcordeon(currentNivelData, nivel));
      currentNivelData = currentNivelData.flatMap(usuario => usuario.hijos || []);
    }

    return niveles;
  };

  const Preloader = () => (
    <div className="flex justify-center items-center h-screen">
      <div className="loader">Cargando...</div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col text-white">
      <Background />
      {loading ? (
        <Preloader />
      ) : (
        <div className="max-w-7xl mx-auto px-4 py-16 flex-grow bg-opacity-65 bg-gray-800 rounded-2xl shadow-lg">
          <h1 className="text-4xl font-bold mb-4">Red de Usuarios</h1>
          <hr className="mb-6" />
          <div className="mt-6 bg-gray-700 bg-opacity-30 p-6 rounded-lg shadow-md flex items-center">
            <div>
              <h2 className="text-xl font-semibold">Nivel alcanzado</h2>
              <p className="text-gray-400">{nivelesCompletados}</p>
            </div>
          </div>
          <div className="mt-4 bg-gray-700 bg-opacity-30 p-6 rounded-lg shadow-md flex items-center">
            <div>
              <h2 className="text-xl font-semibold">Nivel Máximo</h2>
              <p className="text-gray-400">12</p>
            </div>
          </div>
          <div className="mt-4 bg-gray-700 bg-opacity-30 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Red de Usuarios</h2>
            {renderTodosLosNiveles(piramideData)}
          </div>
        </div>
      )}
      <MobileNav />
    </div>
  );
};
