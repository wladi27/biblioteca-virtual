import React, { useEffect, useState } from 'react';
import { Background } from '../components/Background';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { User } from 'lucide-react';
import { AdminNav } from '../components/AdminNav';

interface Usuario {
  _id: string;
  nombre_usuario: string;
  nivel: number;
}

interface NivelesOrganizados {
  [key: number]: Usuario[];
}

export const RedAdmin = () => {
  const [usuarioRaiz, setUsuarioRaiz] = useState<Usuario | null>(null);
  const [nivelesOrganizados, setNivelesOrganizados] = useState<NivelesOrganizados>({});
  const [openAcordeon, setOpenAcordeon] = useState<{[key: number]: boolean}>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [usuarioIdInput, setUsuarioIdInput] = useState('');
  const [loadingNivel, setLoadingNivel] = useState<{[key: number]: boolean}>({});
  const [nivelCache, setNivelCache] = useState<{[key: string]: Usuario[]}>({});

  const fetchUsuarioInicial = async (usuarioId: string) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/usuarios/${usuarioId}`);
      if (response.ok) {
        const data = await response.json();
        setUsuarioRaiz(data);
        
        // Inicializa los niveles como vacíos (niveles 0-11)
        const nivelesVacios: NivelesOrganizados = {};
        for (let i = 0; i <= 11; i++) {
          nivelesVacios[i] = [];
        }
        setNivelesOrganizados(nivelesVacios);
        
        // Limpiar caché cuando cambia el usuario raíz
        setNivelCache({});
        setOpenAcordeon({});
        
        // Precargar el nivel 0 (usuario raíz)
        await fetchNivelData(data._id, 0);
        
        // Precargar también el nivel 1 para mostrar inmediatamente
        await fetchNivelData(data._id, 1);
        
      } else {
        const errorData = await response.json();
        setError(`Error: ${errorData.message || 'No se pudo obtener el usuario.'}`);
        setUsuarioRaiz(null);
        setNivelesOrganizados({});
      }
    } catch (error) {
      setError('Error en la conexión. Por favor, verifica el ID del usuario.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNivelData = async (usuarioId: string, nivel: number) => {
    // Verificar caché primero
    const cacheKey = `${usuarioId}-${nivel}`;
    if (nivelCache[cacheKey]) {
      setNivelesOrganizados(prev => ({
        ...prev,
        [nivel]: nivelCache[cacheKey],
      }));
      return;
    }

    setLoadingNivel(prev => ({ ...prev, [nivel]: true }));
    try {
      console.log(`Cargando nivel ${nivel} para usuario ${usuarioId}`);
      const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/usuarios/piramide-nivel/${usuarioId}/${nivel}`);
      if (response.ok) {
        const data = await response.json();
        console.log(`Nivel ${nivel} cargado:`, data.usuarios);
        
        setNivelesOrganizados(prev => ({
          ...prev,
          [nivel]: data.usuarios,
        }));
        
        // Guardar en caché
        setNivelCache(prev => ({
          ...prev,
          [cacheKey]: data.usuarios
        }));
      } else {
        console.error(`Error fetching level ${nivel}`);
        setNivelesOrganizados(prev => ({
          ...prev,
          [nivel]: [],
        }));
      }
    } catch (error) {
      console.error(`Error fetching data for level ${nivel}:`, error);
      setNivelesOrganizados(prev => ({
        ...prev,
        [nivel]: [],
      }));
    } finally {
      setLoadingNivel(prev => ({ ...prev, [nivel]: false }));
    }
  };

  const toggleAcordeon = (nivel: number) => {
    const isOpening = !openAcordeon[nivel];
    setOpenAcordeon(prev => ({ ...prev, [nivel]: isOpening }));

    if (isOpening && usuarioRaiz && nivelesOrganizados[nivel]?.length === 0) {
      fetchNivelData(usuarioRaiz._id, nivel);
    }
  };

  const calcularCantidadEsperada = (nivel: number): number => {
    return nivel === 0 ? 1 : Math.pow(3, nivel);
  };

  const renderAcordeon = (nivel: number) => {
    const data = nivelesOrganizados[nivel] || [];
    const cantidadEsperada = calcularCantidadEsperada(nivel);
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
              completado ? 'bg-green-500' : nivel === 0 ? 'bg-blue-500' : 'bg-gray-600'
            }`}>
              <span className="text-sm font-medium">{nivel}</span>
            </div>
            <div>
              <h3 className="font-medium">
                {nivel === 0 ? 'Usuario Raíz' : `Nivel ${nivel}`}
              </h3>
              <p className="text-xs text-gray-300">
                {data.length} de {cantidadEsperada} usuarios
                {nivel === 0 && " "}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded ${
              completado ? 'bg-green-500 text-white' : 
              nivel === 0 ? 'bg-blue-500 text-white' : 'bg-gray-600 text-gray-200'
            }`}>
              {completado ? 'Completo' : nivel === 0 ? 'Activo' : 'Pendiente'}
            </span>
            {nivel > 0 && (openAcordeon[nivel] ? <FaChevronUp /> : <FaChevronDown />)}
          </div>
        </div>
        
        {openAcordeon[nivel] && nivel > 0 && (
          <div className="mt-2 pl-10">
            {loadingNivel[nivel] ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                <span className="ml-2">Cargando usuarios...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {data.map((usuario, index) => (
                  <div 
                    key={`${usuario._id}-${index}`}
                    className="p-2 bg-gray-800 rounded flex items-center gap-2 hover:bg-gray-700 transition-colors"
                  >
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="truncate">{usuario.nombre_usuario || `Usuario ${index+1}`}</span>
                  </div>
                ))}
                {data.length === 0 && (
                  <div className="p-2 text-gray-400 text-sm">
                    No hay usuarios en este nivel
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderTodosLosNiveles = () => {
    if (!usuarioRaiz) return null;
    
    return Array.from({ length: 12 }, (_, i) => i).map(nivel => renderAcordeon(nivel));
  };

  const handleBuscarPiramide = () => {
    if (usuarioIdInput.trim()) {
      fetchUsuarioInicial(usuarioIdInput.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBuscarPiramide();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
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
          <p className="text-gray-400">Estructura piramidal: 1 → 3 → 9 → 27 → ...</p>
          <div className="mt-2">
            <span className="text-sm text-yellow-500 font-medium">Nota:</span>{' '}
            <span className="text-sm text-gray-400">
              Debe hacer clic en cada nivel para cargar y visualizar los usuarios correspondientes.
            </span>
          </div>
        </div>

        <div className="mb-6 p-4 bg-gray-800 rounded-lg">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={usuarioIdInput}
              onChange={(e) => setUsuarioIdInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ingrese ID del usuario raíz"
              className="flex-1 p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
            <button
              onClick={handleBuscarPiramide}
              disabled={!usuarioIdInput.trim()}
              className="bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              Buscar Red
            </button>
          </div>
          <p className="text-sm text-gray-400 mt-2">
            Ingresa el ID del usuario para visualizar su red completa (12 niveles: 0-11)
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900 bg-opacity-30 border border-red-700 rounded-md">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {usuarioRaiz && (
          <div className="mb-4 p-3 bg-blue-900 bg-opacity-30 rounded-lg">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-blue-400" />
              <div>
                <span className="font-medium">Usuario raíz: {usuarioRaiz.nombre_usuario}</span>
                <p className="text-sm text-blue-300">ID: {usuarioRaiz._id}</p>
              </div>
            </div>
          </div>
        )}

        {usuarioRaiz && (
          <div className="space-y-3">
            {renderTodosLosNiveles()}
          </div>
        )}

        {!usuarioRaiz && !loading && (
          <div className="text-center py-12 text-gray-400">
            <User className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>Ingresa un ID de usuario para visualizar la estructura piramidal</p>
            <p className="text-sm mt-2">Nivel 0: Usuario raíz | Nivel 1: 3 usuarios | Nivel 2: 9 usuarios | etc.</p>
          </div>
        )}
      </div>
      <br /><br />
      <AdminNav />
    </div>
  );
};