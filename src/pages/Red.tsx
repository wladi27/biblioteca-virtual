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
  const [nivelesCompletos, setNivelesCompletos] = useState([]);

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
        prepararNivelesCompletos(data.hijos || []);
        calcularNivelesCompletados(data.hijos || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const prepararNivelesCompletos = (data) => {
    const niveles = [];
    let currentData = data;
    let nextLevelData = currentData.flatMap(usuario => usuario.hijos || []);

    for (let nivel = 1; nivel <= 12; nivel++) {
      const cantidadEsperada = Math.pow(3, nivel);
      
      // Tomar usuarios del siguiente nivel si es necesario
      if (currentData.length < cantidadEsperada && nextLevelData.length > 0) {
        const usuariosFaltantes = cantidadEsperada - currentData.length;
        const usuariosParaTomar = Math.min(usuariosFaltantes, nextLevelData.length);
        currentData = [...currentData, ...nextLevelData.slice(0, usuariosParaTomar)];
        nextLevelData = nextLevelData.slice(usuariosParaTomar);
      }

      niveles[nivel] = currentData.slice(0, cantidadEsperada);
      currentData = currentData.flatMap(usuario => usuario.hijos || []);
      nextLevelData = currentData.flatMap(usuario => usuario.hijos || []);
    }

    setNivelesCompletos(niveles);
  };

  const calcularNivelesCompletados = (data) => {
    let nivelesCompletados = 0;
    let currentNivelData = data;

    for (let nivel = 1; nivel <= 12; nivel++) {
      const cantidadEsperada = Math.pow(3, nivel);
      if (currentNivelData.length >= cantidadEsperada) {
        nivelesCompletados++;
      } else {
        break;
      }
      currentNivelData = currentNivelData.flatMap((usuario) => usuario.hijos || []);
    }

    setNivelesCompletados(nivelesCompletados);
  };

  const toggleAcordeon = (nivel) => {
    setOpenAcordeon(prev => ({ ...prev, [nivel]: !prev[nivel] }));
  };

  const renderAcordeon = (nivel) => {
    if (nivel > 12) return null;

    const data = nivelesCompletos[nivel] || [];
    const completado = data.length === Math.pow(3, nivel);
    const cantidadEsperada = Math.pow(3, nivel);

    return (
      <div className="mb-3" key={`nivel-${nivel}`}>
        <div
          className={`p-3 rounded-lg flex justify-between items-center cursor-pointer ${
            completado ? 'bg-green-900 bg-opacity-30' : 'bg-gray-800'
          } hover:bg-opacity-70 transition-all`}
          onClick={() => toggleAcordeon(nivel)}
        >
          <div className="flex items-center gap-3">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
              completado ? 'bg-green-500' : 'bg-gray-600'
            }`}>
              <span className="text-sm font-medium">{nivel}</span>
            </div>
            <div>
              <h3 className="font-medium">Nivel {nivel}</h3>
              <p className="text-xs text-gray-300">
                {data.length} de {cantidadEsperada} usuarios
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded ${
              completado ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-200'
            }`}>
              {completado ? 'Completo' : 'Pendiente'}
            </span>
            {openAcordeon[nivel] ? <FaChevronUp /> : <FaChevronDown />}
          </div>
        </div>
        
        {openAcordeon[nivel] && (
          <div className="mt-2 pl-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {data.map((usuario, index) => (
                <div 
                  key={`${usuario._id}-${index}`}
                  className="p-2 bg-gray-800 rounded flex items-center gap-2 hover:bg-gray-700"
                >
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="truncate">{usuario.nombre_usuario || `Usuario ${index+1}`}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTodosLosNiveles = () => {
    return Array.from({ length: 12 }, (_, i) => i + 1).map(nivel => renderAcordeon(nivel));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Cargando tu red...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col text-white">
      <Background />
      <div className="max-w-6xl mx-auto px-4 py-12 flex-grow">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Mi Red</h1>
          <div className="flex items-center gap-4 text-gray-300">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <span>{username}</span>
            </div>
            <span className="text-sm bg-gray-700 px-2 py-1 rounded">
              Nivel actual: {nivelesCompletados}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-800 bg-opacity-50 p-4 rounded-lg">
            <h3 className="text-gray-400 text-sm">Nivel alcanzado</h3>
            <p className="text-2xl font-bold">{nivelesCompletados}</p>
          </div>
          <div className="bg-gray-800 bg-opacity-50 p-4 rounded-lg">
            <h3 className="text-gray-400 text-sm">Nivel máximo</h3>
            <p className="text-2xl font-bold">12</p>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold mb-3">Estructura de la red</h2>
          {renderTodosLosNiveles()}
        </div>
      </div>
      <br /><br />
      <MobileNav />
    </div>
  );
};