import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Background } from '../components/Background';
import { AdminNav } from '../components/AdminNav';
import { FaSearch, FaUserCircle, FaUserFriends, FaSync } from 'react-icons/fa';
import debounce from 'lodash/debounce';

export const TotalApprovedContributions = () => {
  const [contributions, setContributions] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | null }>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [usuariosMap, setUsuariosMap] = useState({});
  const itemsPerPage = 20;

  const observer = useRef();

  useEffect(() => {
    fetchUsuariosMap();
    fetchContributionsPaginados(1, true);
  }, []);

  // Cargar mapa de usuarios para búsqueda rápida
  const fetchUsuariosMap = async () => {
    try {
      const usuariosResponse = await fetch(`${import.meta.env.VITE_URL_LOCAL}/usuarios`);
      if (usuariosResponse.ok) {
        const usuariosData = await usuariosResponse.json();
        const map = usuariosData.reduce((acc, usuario) => {
          acc[usuario._id] = usuario;
          return acc;
        }, {});
        setUsuariosMap(map);
      }
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    }
  };

  const fetchContributionsPaginados = async (page = 1, isInitialLoad = false, search = '') => {
    try {
      if (isInitialLoad) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const url = `${import.meta.env.VITE_URL_LOCAL}/api/aportes/admin/paginados?page=${page}&limit=${itemsPerPage}${search ? `&search=${encodeURIComponent(search)}` : ''}`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        
        // Combinar aportes con información de usuarios
        const contributionsWithUserInfo = data.aportes.map(aporte => ({
          ...aporte,
          usuario: usuariosMap[aporte.usuarioId] || null,
        }));

        if (isInitialLoad) {
          setContributions(contributionsWithUserInfo);
        } else {
          setContributions(prev => [...prev, ...contributionsWithUserInfo]);
        }
        
        setTotalItems(data.pagination.totalItems);
        setCurrentPage(data.pagination.currentPage);
        setHasMore(data.pagination.hasNext);
        
        console.log(`✅ Página ${page} cargada: ${data.aportes.length} aportes`);
      } else {
        throw new Error('Error al obtener los aportes');
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
      setContributions([]);
      setCurrentPage(1);
      setHasMore(true);
      fetchContributionsPaginados(1, true, value);
    }, 500),
    [usuariosMap]
  );

  const loadMoreContributions = useCallback(() => {
    if (hasMore && !loadingMore && !loading) {
      fetchContributionsPaginados(currentPage + 1, false, filtro);
    }
  }, [hasMore, loadingMore, loading, currentPage, filtro, usuariosMap]);

  // Observer para scroll infinito
  const lastContributionElementRef = useCallback(node => {
    if (loadingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreContributions();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loadingMore, hasMore, loadMoreContributions]);

  const contributionsFiltradas = useMemo(() => {
    // Si estamos usando búsqueda en tiempo real con la API, no necesitamos filtrar localmente
    return contributions;
  }, [contributions]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 text-white">
      <Background />

      <div className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-extrabold mb-8 text-center text-blue-400 drop-shadow">
          Aportes Aprobados
          {totalItems > 0 && (
            <span className="block text-sm text-blue-200 mt-2 font-normal">
              Total: {totalItems} aportes
            </span>
          )}
        </h2>

        {message && (
          <div
            className={`mb-4 p-4 rounded-lg text-center font-semibold shadow-lg ${
              message.type === 'success' ? 'bg-green-600/80 text-white' : 'bg-red-600/80 text-white'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="mb-8 flex items-center bg-gray-800 rounded-lg px-4 py-2 border border-blue-700 shadow">
          <FaSearch className="text-blue-300 mr-3 text-xl" />
          <input
            type="text"
            placeholder="Buscar por ID de usuario o descripción..."
            onChange={(e) => handleFiltroChange(e.target.value)}
            className="w-full bg-transparent text-white rounded-md py-2 px-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {(loading || loadingMore) && (
            <FaSync className="animate-spin text-blue-300 ml-2" />
          )}
        </div>

        {/* Información de carga */}
        <div className="flex justify-between items-center mb-4 text-sm text-blue-200">
          <div>
            {contributions.length > 0 && (
              <>
                Mostrando {contributions.length} de {totalItems} aportes
                {hasMore && ' (carga automática al hacer scroll)'}
              </>
            )}
          </div>
          {loading && (
            <div className="flex items-center">
              <FaSync className="animate-spin mr-2" />
              Cargando...
            </div>
          )}
        </div>

        {loading && contributions.length === 0 ? (
          <div className="text-center py-8">
            <div className="flex items-center justify-center">
              <FaSync className="animate-spin text-2xl text-blue-400 mr-2" />
              <p className="text-gray-400">Cargando aportes...</p>
            </div>
          </div>
        ) : contributionsFiltradas.length === 0 ? (
          <div className="bg-gray-800 p-8 rounded-xl shadow-lg text-center text-blue-200 border border-blue-700">
            {filtro ? 'No se encontraron aportes con ese criterio de búsqueda.' : 'No hay aportes registrados.'}
          </div>
        ) : (
          <>
            <ul className="space-y-4 mb-6">
              {contributionsFiltradas.map((contribution, index) => {
                const isLastItem = index === contributionsFiltradas.length - 1;
                
                return (
                  <li
                    key={`${contribution._id}-${index}`}
                    ref={isLastItem ? lastContributionElementRef : null}
                    className="bg-gradient-to-r from-blue-800 to-blue-600 p-5 rounded-xl shadow-lg border border-blue-700 flex items-center gap-4 hover:scale-[1.01] transition-transform"
                  >
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-700 flex-shrink-0">
                      <FaUserCircle className="text-2xl text-blue-200" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white truncate">
                        {contribution.usuario?.nombre_completo || 'Usuario no disponible'}
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                        <p className="text-blue-200 font-mono text-sm break-all">
                          <span className="text-blue-100">ID Usuario:</span> {contribution.usuarioId}
                        </p>
                        <p className="text-blue-200 text-sm col-span-2">
                          <span className="text-blue-100">Aporte:</span> {contribution.aporte}
                        </p>
                        <p className="text-xs text-green-300 font-semibold col-span-2">
                          ✓ Aprobado
                        </p>
                      </div>

                      {contribution.usuario?.padre && (
                        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-blue-500">
                          <span className="flex items-center gap-2 text-xs text-blue-100">
                            <FaUserFriends className="text-blue-300" /> 
                            <span className="text-blue-100">ID Padre:</span> 
                            <span className="font-mono">{contribution.usuario.padre.id || 'No disponible'}</span>
                          </span>
                          <span className="flex items-center gap-2 text-xs text-blue-100">
                            <FaUserCircle className="text-blue-300" /> 
                            <span className="text-blue-100">Nombre Padre:</span> 
                            <span className="font-mono">{contribution.usuario.padre.nombre || 'No disponible'}</span>
                          </span>
                        </div>
                      )}
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
                  <p className="text-blue-200">Cargando más aportes...</p>
                </div>
              </div>
            )}

            {/* Mensaje cuando no hay más elementos */}
            {!hasMore && contributions.length > 0 && (
              <div className="text-center py-4">
                <p className="text-blue-300">
                  ✅ Se han cargado todos los aportes{totalItems > 0 && ` (${totalItems} total)`}
                </p>
              </div>
            )}
          </>
        )}

        {/* Botón para cargar más manualmente (opcional) */}
        {hasMore && contributions.length > 0 && !loadingMore && (
          <div className="text-center mt-6">
            <button
              onClick={loadMoreContributions}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg transition-colors flex items-center justify-center mx-auto"
            >
              <FaSync className="mr-2" />
              Cargar más aportes
            </button>
          </div>
        )}
      </div>
      
      <AdminNav />
    </div>
  );
};