import React, { useEffect, useState } from 'react';
import { Background } from '../components/Background';
import { MobileNav } from '../components/MobileNav';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { User } from 'lucide-react';
import { NivelAlcanzadoComponent } from '../components/NIvelAlcanzado';

export const Red = () => {
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  const [nivelUsuario, setNivelUsuario] = useState(0);
  const [nivelesCompletados, setNivelesCompletados] = useState(0);
  const [openAcordeon, setOpenAcordeon] = useState({});
  const [loading, setLoading] = useState(true);
  const [nivelesOrganizados, setNivelesOrganizados] = useState({});

  useEffect(() => {
    const usuario = localStorage.getItem('usuario');
    if (usuario) {
      const userData = JSON.parse(usuario);
      setUsername(userData.nombre_completo);
      setUserId(userData._id);
      setNivelUsuario(userData.nivel || 0);
      fetchPiramideData(userData._id);
    }
  }, []);

  const fetchPiramideData = async (userId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/usuarios/piramide-completa/${userId}`);
      if (response.ok) {
        const data = await response.json();
        organizarPiramidePorNivel(data.usuarios);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const organizarPiramidePorNivel = (usuarios) => {
    // Ordenar todos los usuarios por su nivel de registro (de menor a mayor)
    const usuariosOrdenados = [...usuarios].sort((a, b) => a.nivel - b.nivel);
    
    // Omitir el primer usuario (raíz)
    const usuariosSinRaiz = usuariosOrdenados.slice(1); // Eliminar el usuario raíz

    const niveles = {};
    let indiceUsuario = 0;
    const totalUsuarios = usuariosSinRaiz.length;

    // Organizar en niveles piramidales (3^1=3, 3^2=9, ...)
    for (let nivelPiramide = 1; nivelPiramide <= 12; nivelPiramide++) {
      const cantidadEsperada = Math.pow(3, nivelPiramide);
      niveles[nivelPiramide] = [];

      // Tomar los siguientes usuarios hasta completar el nivel
      while (niveles[nivelPiramide].length < cantidadEsperada && indiceUsuario < totalUsuarios) {
        niveles[nivelPiramide].push(usuariosSinRaiz[indiceUsuario]);
        indiceUsuario++;
      }
    }

    // Calcular niveles completados
    let completados = 0;
    for (let nivel = 1; nivel <= 12; nivel++) {
      if (niveles[nivel].length >= Math.pow(3, nivel)) {
        completados++;
      }
    }

    setNivelesOrganizados(niveles);
    setNivelesCompletados(completados);
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
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    usuario.nivel <= 5 ? 'bg-blue-500' : 
                    usuario.nivel <= 10 ? 'bg-purple-500' : 'bg-yellow-500'
                  }`}>
                    <span className="text-xs">{usuario.nivel}</span>
                  </div>
                  <div className="truncate">
                    <p className="text-sm">{usuario.nombre_usuario || `Usuario ${index+1}`}</p>
                    <p className="text-xs text-gray-400">ID: {usuario._id.toString().slice(-4)}</p>
                  </div>
                </div>
              ))}
              
              {/* Mostrar espacios vacíos para niveles incompletos */}
              {Array.from({ length: cantidadEsperada - data.length }).map((_, index) => (
                <div 
                  key={`empty-${index}`}
                  className="p-2 bg-gray-800 bg-opacity-30 rounded flex items-center gap-2"
                >
                  <div className="w-6 h-6 rounded-full flex items-center justify-center bg-gray-600">
                    <span className="text-xs">-</span>
                  </div>
                  <div className="truncate text-gray-500">
                    <p className="text-sm">Vacío</p>
                  </div>
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
            <div className="flex items-center gap-2">
              <span className="text-sm bg-blue-500 px-2 py-1 rounded">Nivel: {nivelesCompletados}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <NivelAlcanzadoComponent nivelActual={nivelesCompletados} />
          <div className="bg-gray-800 bg-opacity-50 p-4 rounded-lg">
            <h3 className="text-gray-400 text-sm">Niveles completados</h3>
            <p className="text-2xl font-bold">{nivelesCompletados} <span className="text-sm font-normal">de 12</span></p>
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
