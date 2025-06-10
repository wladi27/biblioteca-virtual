import React, { useEffect, useState } from 'react';
import { Background } from '../components/Background';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { User } from 'lucide-react';
import { AdminNav } from '../components/AdminNav';

export const RedAdmin = () => {
  const [usuarioRaiz, setUsuarioRaiz] = useState(null);
  const [nivelesOrganizados, setNivelesOrganizados] = useState({});
  const [openAcordeon, setOpenAcordeon] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); // Estado para manejar errores
  const [usuarioIdInput, setUsuarioIdInput] = useState(''); // Estado para el ID de usuario ingresado

  useEffect(() => {
    // Se eliminó la llamada para obtener el primer usuario al cargar el componente
  }, []);

  const fetchPiramideData = async (usuarioId) => {
    setLoading(true); // Iniciar carga
    setError(''); // Limpiar errores previos
    try {
      const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/usuarios/piramide-completa/${usuarioId}`);
      if (response.ok) {
        const data = await response.json();
        setUsuarioRaiz(data.usuarios[0]); // Guardar el primer usuario como raíz (puedes cambiar esto si es necesario)
        organizarPiramidePorNivel(data.usuarios.slice(1)); // Omitir el primer usuario
      } else {
        const errorData = await response.json();
        setError(`Error: ${errorData.message || 'No se pudo obtener la pirámide.'}`);
        setNivelesOrganizados({}); // Limpiar niveles si hay un error
      }
    } catch (error) {
      setError('Error en la conexión. Por favor, verifica el ID del usuario.');
      console.error('Error:', error);
    } finally {
      setLoading(false); // Finalizar carga
    }
  };

  const organizarPiramidePorNivel = (usuarios) => {
    const niveles = {};
    let indiceUsuario = 0;
    const totalUsuarios = usuarios.length;

    for (let nivelPiramide = 1; nivelPiramide <= 12; nivelPiramide++) {
      const cantidadEsperada = Math.pow(3, nivelPiramide);
      niveles[nivelPiramide] = [];

      while (niveles[nivelPiramide].length < cantidadEsperada && indiceUsuario < totalUsuarios) {
        niveles[nivelPiramide].push(usuarios[indiceUsuario]);
        indiceUsuario++;
      }
    }

    setNivelesOrganizados(niveles);
  };

  const toggleAcordeon = (nivel) => {
    setOpenAcordeon(prev => ({ ...prev, [nivel]: !prev[nivel] }));
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

  const handleBuscarPiramide = () => {
    fetchPiramideData(usuarioIdInput);
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
              <span>Usuario raíz: {usuarioRaiz.nombre_usuario}</span>
            </div>
          )}
        </div>

        {/* Input para buscar por ID de usuario */}
        <div className="mb-4">
          <input
            type="text"
            value={usuarioIdInput}
            onChange={(e) => setUsuarioIdInput(e.target.value)}
            placeholder="Ingrese ID de usuario"
            className="p-2 rounded-md bg-gray-600 text-white w-full"
          />
          <button
            onClick={handleBuscarPiramide}
            className="mt-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Buscar Pirámide
          </button>
        </div>

        {/* Mostrar mensaje de error si existe */}
        {error && <p className="text-red-400">{error}</p>}

        <div className="space-y-3">
          {renderTodosLosNiveles()}
        </div>
      </div>
      <br /><br />
      <AdminNav />
    </div>
  );
};
