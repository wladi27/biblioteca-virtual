import React, { useEffect, useState } from 'react';
import { Background } from '../components/Background';
import { MobileNav } from '../components/MobileNav';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { User } from 'lucide-react';
import { AdminNav } from '../components/AdminNav';

export const RedAdmin = () => {
  const [usuarioRaiz, setUsuarioRaiz] = useState(null);
  const [piramideData, setPiramideData] = useState([]);
  const [openAcordeon, setOpenAcordeon] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrimerUsuario = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/usuarios`);
        if (response.ok) {
          const usuarios = await response.json();
          if (usuarios.length > 0) {
            const primerUsuario = usuarios[0];
            setUsuarioRaiz(primerUsuario); // Guardar el usuario raíz
            fetchPiramideData(primerUsuario._id);
          }
        } else {
          console.error('Error al obtener los usuarios');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    const fetchPiramideData = async (usuarioId) => {
      try {
        const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/usuarios/piramide/${usuarioId}`);
        if (response.ok) {
          const data = await response.json();
          setPiramideData(data.hijos || []);
        } else {
          console.error('Error al obtener la data de la pirámide');
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrimerUsuario();
  }, []);

  const toggleAcordeon = (nivel) => {
    setOpenAcordeon((prev) => ({ ...prev, [nivel]: !prev[nivel] }));
  };

  const calcularCompletitud = (nivel, cantidadActual) => {
    const cantidadEsperada = Math.pow(3, nivel); // 3^n
    return cantidadActual === cantidadEsperada;
  };

  const renderAcordeon = (data, nivel) => {
    if (nivel > 12 || !data.length) return null;

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
                  {usuario._id} | {usuario.nombre_completo}
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
        <div className="max-w-7xl px-4 py-16 flex-grow bg-opacity-65 bg-gray-800 rounded-2xl shadow-lg">
          <h1 className="text-4xl font-bold mb-4">Red Global</h1>
          <hr />

          {/* Mostrar el usuario raíz */}
          {usuarioRaiz && (
            <div className="mt-4 bg-gray-700 bg-opacity-30 p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-2">Usuario Raíz</h2>
              <div className="flex items-center">
                <User className="mr-2" />
                <span>{usuarioRaiz.nombre_completo}</span>
              </div>
            </div>
          )}

          <div className="mt-4 bg-gray-700 bg-opacity-30 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Red de Usuarios</h2>
            {renderTodosLosNiveles(piramideData)}
          </div>
        </div>
      )}
      <AdminNav />
    </div>
  );
};
