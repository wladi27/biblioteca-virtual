import React, { useEffect, useState } from 'react';
import { Background } from '../components/Background';
import { FaDollarSign, FaCode, FaHistory, FaWhatsapp } from 'react-icons/fa';
import { NivelAlcanzadoComponent } from '../components/NIvelAlcanzado';
import { MobileNav } from '../components/MobileNav';

export const Dashboard = () => {
  const [comisiones, setComisiones] = useState(0);
  const [codigosCreados, setCodigosCreados] = useState(0);
  const [retiros, setRetiros] = useState([]);
  const [filteredRetiros, setFilteredRetiros] = useState([]);
  const [aporteDado, setAporteDado] = useState(() => {
    return localStorage.getItem('aporteDado') === 'true';
  });
  const [comprobanteSubido, setComprobanteSubido] = useState(() => {
    return localStorage.getItem('comprobanteSubido') === 'true';
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingRetiros, setLoadingRetiros] = useState(true);

  useEffect(() => {
    const usuario = localStorage.getItem('usuario');
    if (usuario) {
      const userData = JSON.parse(usuario);
      setComisiones(userData.comisiones || 0);
      fetchRetiros(userData._id);
      fetchCodigosCreados(userData._id);
    }
  }, []);

  const fetchRetiros = async (userId) => {
    setLoadingRetiros(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/api/transacciones/transacciones`);
      if (response.ok) {
        const data = await response.json();
        // Filtrar solo retiros del usuario actual y ordenar por fecha más reciente
        const userRetiros = data
          .filter(transaccion => 
            transaccion.tipo === 'retiro' && transaccion.usuario_id === userId
          )
          .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        
        setRetiros(userRetiros);
        setFilteredRetiros(userRetiros);
      } else {
        console.error('Error al obtener retiros:', response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoadingRetiros(false);
    }
  };

  const fetchCodigosCreados = async (userId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/api/referralCodes/user/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setCodigosCreados(data.length);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    const filtered = retiros.filter(retiro => 
      retiro.descripcion.toLowerCase().includes(e.target.value.toLowerCase()) ||
      retiro.monto.toString().includes(e.target.value) ||
      retiro.estado.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setFilteredRetiros(filtered);
  };

  // Resto del código permanece igual...
  const handleAporteClick = async () => {
    const usuario = localStorage.getItem('usuario');
    if (usuario) {
      const userData = JSON.parse(usuario);
      const aporteData = { usuarioId: userData._id };

      try {
        const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/api/aportes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(aporteData),
        });

        if (response.ok) {
          setAporteDado(true);
          localStorage.setItem('aporteDado', 'true');
          const mensaje = `Hola!\nMe gustaría hacer una contribución a la biblioteca virtual. ¿Podrías proporcionarme la cuenta para realizar el aporte?`;
          const telefono = "+573137862938";
          const urlWhatsApp = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
          window.open(urlWhatsApp, '_blank');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const handleSubirComprobanteClick = () => {
    const usuario = localStorage.getItem('usuario');
    if (usuario) {
      const userData = JSON.parse(usuario);
      const mensaje = `Hola, aquí está mi comprobante de aporte. Mi ID es: ${userData._id} y mi nombre es: ${userData.nombre_completo}.`;
      const telefono = "+573137862938";
      const urlWhatsApp = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
      window.open(urlWhatsApp, '_blank');

      setComprobanteSubido(true);
      localStorage.setItem('comprobanteSubido', 'true');
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-white">
      <Background />
      
      {/* Contenedor principal */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12 w-full">
        {/* Tarjeta principal con fondo semitransparente */}
        <div className="bg-gray-800 bg-opacity-80 rounded-2xl shadow-xl overflow-hidden">
          {/* Encabezado con gradiente */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
            <h1 className="text-3xl font-bold text-center">Home</h1>
          </div>

          {/* Contenido principal */}
          <div className="p-6">
            {/* Sección de estadísticas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <NivelAlcanzadoComponent />

              {/* Tarjeta de códigos creados */}
              <div className="bg-gray-700 bg-opacity-50 p-6 rounded-xl border-l-4 border-blue-400 transition-all hover:shadow-lg">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-500 rounded-full mr-4">
                    <FaCode className="text-xl" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Códigos Creados</h2>
                    <p className="text-2xl font-bold">{codigosCreados}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sección de acciones */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-200 border-b border-gray-600 pb-2">
                Acciones
              </h2>
              
              <button
                onClick={comprobanteSubido ? null : (aporteDado ? handleSubirComprobanteClick : handleAporteClick)}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6 rounded-lg transition-all ${
                  aporteDado && !comprobanteSubido 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : comprobanteSubido 
                      ? 'bg-gray-600 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                } text-white font-semibold shadow-md`}
                disabled={comprobanteSubido}
              >
                <FaWhatsapp />
                {comprobanteSubido 
                  ? 'Comprobante Enviado' 
                  : aporteDado 
                    ? 'Subir Comprobante' 
                    : 'Realizar Aporte'}
              </button>
            </div>

            {/* Sección de historial de retiros */}
            <div className="bg-gray-700 bg-opacity-50 p-6 rounded-xl">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FaHistory className="mr-2" /> Historial de Retiros
              </h2>

              {/* Campo de búsqueda */}
              <input
                type="text"
                placeholder="Buscar por descripción, monto o estado..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full p-2 mb-4 bg-gray-600 rounded-md text-gray-200"
              />
              
              {loadingRetiros ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">Cargando retiros...</p>
                </div>
              ) : filteredRetiros.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-600">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Monto</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Descripción</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Estado</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Fecha</th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-600">
                      {filteredRetiros.map((retiro) => (
                        <tr key={retiro._id} className="hover:bg-gray-700 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap text-gray-300">${retiro.monto.toFixed(2)}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-gray-300">{retiro.descripcion || 'Sin descripción'}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              retiro.estado === 'aprobado' 
                                ? 'bg-green-500 text-white' 
                                : retiro.estado === 'pendiente'
                                  ? 'bg-yellow-500 text-white'
                                  : 'bg-red-500 text-white'
                            }`}>
                              {retiro.estado}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-gray-300">
                            {new Date(retiro.fecha).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400">
                    {searchTerm ? 'No se encontraron retiros que coincidan con la búsqueda' : 'No hay retiros registrados'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <MobileNav />
    </div>
  );
};