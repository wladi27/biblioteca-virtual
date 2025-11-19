import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Background } from '../components/Background';
import { AdminNav } from '../components/AdminNav';
import { FaSearch, FaUserCircle, FaSync, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import debounce from 'lodash/debounce';

export const TotalUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | null }>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [sortConfig, setSortConfig] = useState({ key: 'nivel', direction: 'asc' });
  
  const itemsPerPage = 20;

  const observer = useRef();

  useEffect(() => {
    fetchUsuariosPaginados(1, true);
  }, []);

  const fetchUsuariosPaginados = async (page = 1, isInitialLoad = false, search = '') => {
    try {
      if (isInitialLoad) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const url = `${import.meta.env.VITE_URL_LOCAL}/usuarios/admin/paginados?page=${page}&limit=${itemsPerPage}${search ? `&search=${encodeURIComponent(search)}` : ''}`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        
        if (isInitialLoad) {
          setUsuarios(data.usuarios);
        } else {
          setUsuarios(prev => [...prev, ...data.usuarios]);
        }
        
        setTotalItems(data.pagination.totalItems);
        setCurrentPage(data.pagination.currentPage);
        setHasMore(data.pagination.hasNext);
        
        console.log(`✅ Página ${page} cargada: ${data.usuarios.length} usuarios`);
      } else {
        throw new Error('Error al obtener usuarios');
      }
    } catch (error) {
      console.error(error);
      setMessage({ text: 'Error al conectar con el servidor', type: 'error' });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleFiltroChange = useCallback(
    debounce((value: string) => {
      setFiltro(value);
      setUsuarios([]);
      setCurrentPage(1);
      setHasMore(true);
      fetchUsuariosPaginados(1, true, value);
    }, 500),
    []
  );

  const loadMoreUsuarios = useCallback(() => {
    if (hasMore && !loadingMore && !loading) {
      fetchUsuariosPaginados(currentPage + 1, false, filtro);
    }
  }, [hasMore, loadingMore, loading, currentPage, filtro]);

  // Observer para scroll infinito
  const lastUsuarioElementRef = useCallback(node => {
    if (loadingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreUsuarios();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loadingMore, hasMore, loadMoreUsuarios]);

  // Función para ordenar usuarios
  const handleSort = (key) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="text-gray-400" />;
    return sortConfig.direction === 'asc' ? 
      <FaSortUp className="text-blue-400" /> : 
      <FaSortDown className="text-blue-400" />;
  };

  // Ordenar usuarios
  const usuariosOrdenados = useMemo(() => {
    const sorted = [...usuarios];
    sorted.sort((a, b) => {
      // Ordenar por nivel como prioridad principal
      if (sortConfig.key === 'nivel') {
        if (a.nivel !== b.nivel) {
          return sortConfig.direction === 'asc' ? a.nivel - b.nivel : b.nivel - a.nivel;
        }
        // Si mismo nivel, ordenar por nombre
        return a.nombre_completo?.localeCompare(b.nombre_completo);
      }
      
      // Ordenar por otros campos
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    return sorted;
  }, [usuarios, sortConfig]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 text-white">
      <Background />

      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-16">
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-6 sm:mb-8 text-center text-blue-400 drop-shadow">
          Lista de Usuarios
          {totalItems > 0 && (
            <span className="block text-xs sm:text-sm text-blue-200 mt-1 sm:mt-2 font-normal">
              Total: {totalItems} usuarios
            </span>
          )}
        </h2>

        {message && (
          <div
            className={`mb-4 p-3 sm:p-4 rounded-lg text-center font-semibold shadow-lg text-sm sm:text-base ${
              message.type === 'success' ? 'bg-green-600/80 text-white' : 'bg-red-600/80 text-white'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Barra de búsqueda */}
        <div className="mb-6 sm:mb-8 flex items-center bg-gray-800 rounded-lg px-3 sm:px-4 py-2 border border-blue-700 shadow">
          <FaSearch className="text-blue-300 mr-2 sm:mr-3 text-lg sm:text-xl" />
          <input
            type="text"
            placeholder="Buscar por nombre, ID, DNI o correo..."
            onChange={(e) => handleFiltroChange(e.target.value)}
            className="w-full bg-transparent text-white rounded-md py-1 sm:py-2 px-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
          />
          {(loading || loadingMore) && (
            <FaSync className="animate-spin text-blue-300 ml-2" />
          )}
        </div>

        {/* Controles de ordenamiento - Responsivos */}
        <div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
          <div className="text-xs sm:text-sm text-blue-200">
            {usuarios.length > 0 && (
              <>
                Mostrando {usuarios.length} de {totalItems} usuarios
                {hasMore && ' (carga automática al hacer scroll)'}
              </>
            )}
          </div>
          
          {/* Selector de ordenamiento para móviles */}
          <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg p-2">
            <span className="text-xs text-blue-200 whitespace-nowrap">Ordenar por:</span>
            <select 
              onChange={(e) => handleSort(e.target.value)}
              value={sortConfig.key}
              className="bg-gray-700 text-white text-xs rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
            >
              <option value="nivel">Nivel</option>
              <option value="nombre_completo">Nombre</option>
              <option value="nombre_usuario">Usuario</option>
            </select>
            <button 
              onClick={() => handleSort(sortConfig.key)}
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              {getSortIcon(sortConfig.key)}
            </button>
          </div>

          {loading && (
            <div className="flex items-center text-xs sm:text-sm">
              <FaSync className="animate-spin mr-2" />
              Cargando...
            </div>
          )}
        </div>

        {loading && usuarios.length === 0 ? (
          <div className="text-center py-8">
            <div className="flex items-center justify-center">
              <FaSync className="animate-spin text-xl sm:text-2xl text-blue-400 mr-2" />
              <p className="text-gray-400 text-sm sm:text-base">Cargando usuarios...</p>
            </div>
          </div>
        ) : usuariosOrdenados.length === 0 ? (
          <div className="bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg text-center text-blue-200 border border-blue-700 text-sm sm:text-base">
            {filtro ? 'No se encontraron usuarios con ese criterio de búsqueda.' : 'No hay usuarios registrados.'}
          </div>
        ) : (
          <>
            <ul className="space-y-3 sm:space-y-4 mb-6">
              {usuariosOrdenados.map((usuario, index) => {
                const isLastItem = index === usuariosOrdenados.length - 1;
                
                return (
                  <li
                    key={`${usuario._id}-${index}`}
                    ref={isLastItem ? lastUsuarioElementRef : null}
                    className="bg-gradient-to-r from-blue-800 to-blue-600 p-3 sm:p-5 rounded-xl shadow-lg border border-blue-700 flex items-start sm:items-center gap-3 sm:gap-4 hover:scale-[1.01] transition-transform"
                  >
                    {/* Badge de nivel */}
                    <div className="flex flex-col items-center gap-2 flex-shrink-0">
                      <FaUserCircle className="text-2xl sm:text-4xl text-blue-200" />
                      <span className="bg-blue-900 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[2rem] text-center">
                        N{usuario.nivel}
                      </span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 mb-2">
                        <h3 className="text-base sm:text-lg font-bold text-white truncate">
                          {usuario.nombre_completo || 'Nombre no disponible'}
                        </h3>
                        <span className="text-xs sm:text-sm text-blue-200 bg-blue-900/50 px-2 py-1 rounded">
                          @{usuario.nombre_usuario}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-2 text-xs sm:text-sm">
                        <div className="flex flex-wrap gap-2">
                          <p className="text-blue-200 font-mono break-all bg-blue-900/30 px-2 py-1 rounded">
                            <span className="text-blue-100 font-semibold">ID:</span> {usuario._id}
                          </p>
                          {usuario.dni && (
                            <p className="text-blue-200 bg-blue-900/30 px-2 py-1 rounded">
                              <span className="text-blue-100 font-semibold">DNI:</span> {usuario.dni}
                            </p>
                          )}
                        </div>
                        
                        {usuario.correo_electronico && (
                          <p className="text-blue-200 truncate bg-blue-900/30 px-2 py-1 rounded">
                            <span className="text-blue-100 font-semibold">Email:</span> {usuario.correo_electronico}
                          </p>
                        )}
                        
                        <div className="flex flex-wrap gap-2">
                          {usuario.linea_llamadas && (
                            <p className="text-blue-200 bg-blue-900/30 px-2 py-1 rounded">
                              <span className="text-blue-100 font-semibold">Tel:</span> {usuario.linea_llamadas}
                            </p>
                          )}
                          {usuario.linea_whatsapp && (
                            <p className="text-blue-200 bg-blue-900/30 px-2 py-1 rounded">
                              <span className="text-blue-100 font-semibold">WhatsApp:</span> {usuario.linea_whatsapp}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* Indicador de carga de más elementos */}
            {loadingMore && (
              <div className="text-center py-4">
                <div className="flex items-center justify-center">
                  <FaSync className="animate-spin text-blue-400 mr-2" />
                  <p className="text-blue-200 text-sm">Cargando más usuarios...</p>
                </div>
              </div>
            )}

            {/* Mensaje cuando no hay más elementos */}
            {!hasMore && usuarios.length > 0 && (
              <div className="text-center py-4">
                <p className="text-blue-300 text-sm">
                  ✅ Se han cargado todos los usuarios{totalItems > 0 && ` (${totalItems} total)`}
                </p>
              </div>
            )}
          </>
        )}

        {/* Botón para cargar más manualmente (opcional) */}
        {hasMore && usuarios.length > 0 && !loadingMore && (
          <div className="text-center mt-6">
            <button
              onClick={loadMoreUsuarios}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 sm:px-6 rounded-lg transition-colors flex items-center justify-center mx-auto text-sm sm:text-base"
            >
              <FaSync className="mr-2" />
              Cargar más usuarios
            </button>
          </div>
        )}
        
        <br />
      </div>

      <AdminNav />
    </div>
  );
};