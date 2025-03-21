import React, { useEffect, useState } from 'react';
import { Background } from '../components/Background';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { User } from 'lucide-react';
import { AdminNav } from '../components/AdminNav';

export const RedAdmin = () => {
  const [usuarioRaiz, setUsuarioRaiz] = useState(null);
  const [piramideData, setPiramideData] = useState([]);
  const [openAcordeon, setOpenAcordeon] = useState({});
  const [loading, setLoading] = useState(true);
  const [nivelesCompletos, setNivelesCompletos] = useState([]);

  useEffect(() => {
    const fetchPrimerUsuario = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/usuarios`);
        if (response.ok) {
          const usuarios = await response.json();
          if (usuarios.length > 0) {
            const primerUsuario = usuarios[0];
            setUsuarioRaiz(primerUsuario);
            fetchPiramideData(primerUsuario._id);
          }
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
          prepararNivelesCompletos(data.hijos || []);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrimerUsuario();
  }, []);

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
          className={`p-3 rounded-lg flex justify-between items-center cursor-pointer transition-colors ${
            completado ? 'bg-green-900 bg-opacity-30' : 'bg-gray-800 hover:bg-gray-700'
          }`}
          onClick={() => toggleAcordeon(nivel)}
        >
          <div className="flex items-center gap-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              completado ? 'bg-green-500' : 'bg-gray-600'
            }`}>
              <span className="font-medium">{nivel}</span>
            </div>
            <div>
              <h3 className="font-medium">Nivel {nivel}</h3>
              <span className="text-sm text-gray-300">
                {data.length} de {cantidadEsperada} usuarios
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              completado ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-200'
            }`}>
              {completado ? 'Completo' : 'Incompleto'}
            </span>
            {openAcordeon[nivel] ? <FaChevronUp /> : <FaChevronDown />}
          </div>
        </div>
        
        {openAcordeon[nivel] && (
          <div className="mt-2 pl-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {data.map((usuario, index) => (
                <div 
                  key={`${usuario._id}-${index}`}
                  className="p-2 bg-gray-800 rounded flex items-center gap-2"
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
          <div className="loader animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Cargando estructura de red...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col text-white">
      <Background />
      <div className="max-w-6xl mx-auto px-4 py-12 flex-grow">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Red de Usuarios</h1>
          {usuarioRaiz && (
            <div className="flex items-center gap-3 text-gray-300">
              <User className="h-5 w-5" />
              <span>Usuario raíz: {usuarioRaiz.nombre_completo}</span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {renderTodosLosNiveles()}
        </div>
      </div>
      <br /><br />
      <AdminNav />
    </div>
  );
};