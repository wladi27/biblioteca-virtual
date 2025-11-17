import React, { useEffect, useState } from 'react';
import { Background } from '../components/Background';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { User } from 'lucide-react';
import { MobileNav } from '../components/MobileNav';

export const Red = () => {
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  const [nivelUsuario, setNivelUsuario] = useState(0);
  const [nivelesCompletados, setNivelesCompletados] = useState(0);
  const [openAcordeon, setOpenAcordeon] = useState({});
  const [loading, setLoading] = useState(true);
  const [nivelesOrganizados, setNivelesOrganizados] = useState({});
  const [loadingNivel, setLoadingNivel] = useState({});
  const [nivelCache, setNivelCache] = useState({});

  useEffect(() => {
    const usuario = localStorage.getItem('usuario');
    if (usuario) {
      const userData = JSON.parse(usuario);
      setUsername(userData.nombre_completo);
      setUserId(userData._id);
      setNivelUsuario(userData.nivel || 0);
      
      // Inicializar niveles vacíos
      const nivelesVacios = {};
      for (let i = 1; i <= 12; i++) {
        nivelesVacios[i] = [];
      }
      setNivelesOrganizados(nivelesVacios);
      setNivelCache({});
      setOpenAcordeon({});
      
      setLoading(false);
    }
  }, []);

  const fetchNivelData = async (nivel) => {
    if (!userId) return;

    // Verificar caché primero
    const cacheKey = `${userId}-${nivel}`;
    if (nivelCache[cacheKey]) {
      setNivelesOrganizados(prev => ({
        ...prev,
        [nivel]: nivelCache[cacheKey],
      }));
      return;
    }

    setLoadingNivel(prev => ({ ...prev, [nivel]: true }));
    try {
      const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/usuarios/piramide-nivel/${userId}/${nivel}`);
      if (response.ok) {
        const data = await response.json();
        
        setNivelesOrganizados(prev => ({
          ...prev,
          [nivel]: data.usuarios,
        }));
        
        // Guardar en caché
        setNivelCache(prev => ({
          ...prev,
          [cacheKey]: data.usuarios
        }));

        // Recalcular niveles completados
        setNivelesOrganizados(prev => {
          const nuevosNiveles = { ...prev, [nivel]: data.usuarios };
          calcularNivelesCompletados(nuevosNiveles);
          return nuevosNiveles;
        });
        
      } else {
        console.error(`Error fetching level ${nivel}`);
      }
    } catch (error) {
      console.error(`Error fetching data for level ${nivel}:`, error);
    } finally {
      setLoadingNivel(prev => ({ ...prev, [nivel]: false }));
    }
  };

  const calcularNivelesCompletados = (niveles) => {
    let completados = 0;
    for (let nivel = 1; nivel <= 12; nivel++) {
      const cantidadEsperada = Math.pow(3, nivel);
      if (niveles[nivel] && niveles[nivel].length >= cantidadEsperada) {
        completados++;
      } else {
        break;
      }
    }
    setNivelesCompletados(completados);
  };

  const toggleAcordeon = (nivel) => {
    const isOpening = !openAcordeon[nivel];
    setOpenAcordeon(prev => ({ ...prev, [nivel]: isOpening }));

    if (isOpening && userId && nivelesOrganizados[nivel]?.length === 0) {
      fetchNivelData(nivel);
    }
  };

  const renderAcordeon = (nivel) => {
    const data = nivelesOrganizados[nivel] || [];
    const cantidadEsperada = Math.pow(3, nivel);
    const completado = data.length >= cantidadEsperada;

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
            {loadingNivel[nivel] ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                <span className="ml-2">Cargando usuarios del nivel {nivel}...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {data.map((usuario, index) => (
                  <div 
                    key={`${usuario._id}-${index}`}
                    className="p-2 bg-gray-800 rounded flex items-center gap-2 hover:bg-gray-700 transition-colors"
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      usuario.nivel <= 5 ? 'bg-blue-500' : 
                      usuario.nivel <= 10 ? 'bg-purple-500' : 'bg-yellow-500'
                    }`}>
                      <span className="text-xs text-white font-medium">
                        {usuario.nivel}
                      </span>
                    </div>
                    <div className="truncate flex-1">
                      <p className="text-sm font-medium">
                        {usuario.nombre_usuario || `Usuario ${index+1}`}
                      </p>
                      <p className="text-xs text-gray-400">
                        ID: {usuario._id?.toString().slice(-4) || 'N/A'}
                      </p>
                    </div>
                  </div>
                ))}
                
                {/* Mostrar espacios vacíos para niveles incompletos */}
                {Array.from({ length: Math.max(0, cantidadEsperada - data.length) }).map((_, index) => (
                  <div 
                    key={`empty-${nivel}-${index}`}
                    className="p-2 bg-gray-800 bg-opacity-30 rounded flex items-center gap-2 border border-dashed border-gray-600"
                  >
                    <div className="w-6 h-6 rounded-full flex items-center justify-center bg-gray-700">
                      <span className="text-xs text-gray-400">-</span>
                    </div>
                    <div className="truncate text-gray-500">
                      <p className="text-sm">Espacio disponible</p>
                      <p className="text-xs">Vacío</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
            <div className="flex items-center gap-2">
              <span className="text-sm bg-blue-500 px-2 py-1 rounded">Nivel: {nivelUsuario}</span>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-yellow-500 font-medium">Nota:</span>{' '}
            <span className="text-sm text-gray-400">
              Haz clic en cada nivel para cargar y visualizar los usuarios correspondientes.
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-900 to-blue-700 p-4 rounded-lg">
            <h3 className="text-blue-200 text-sm mb-2">Tu Progreso</h3>
            <p className="text-2xl font-bold text-white">
              {nivelesCompletados} <span className="text-sm font-normal text-blue-200">de 12 niveles completados</span>
            </p>
            <div className="w-full bg-blue-800 rounded-full h-3 mt-3">
              <div 
                className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(nivelesCompletados / 12) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-blue-300 mt-2">
              {nivelesCompletados === 12 ? '¡Red completa!' : `Faltan ${12 - nivelesCompletados} niveles`}
            </p>
          </div>
          <div className="bg-gray-800 bg-opacity-50 p-4 rounded-lg">
            <h3 className="text-gray-400 text-sm">Información de Red</h3>
            <p className="text-2xl font-bold text-white">{nivelesCompletados} <span className="text-sm font-normal text-gray-300">niveles</span></p>
            <p className="text-xs text-gray-400 mt-2">Estructura: 3 → 9 → 27 → 81 → ...</p>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold mb-3">Estructura de la Red</h2>
          <div className="mb-4 p-3 bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-300">
              <span className="text-yellow-400">💡</span> Expande cada nivel para ver los usuarios. 
              Los espacios vacíos están disponibles para nuevos miembros.
            </p>
          </div>
          {renderTodosLosNiveles()}
        </div>
      </div>
      <br /><br />
     <MobileNav />
    </div>
  );
};