import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Background } from '../components/Background';
import { AdminNav } from '../components/AdminNav';
import { FaSearch, FaUserCircle, FaSync } from 'react-icons/fa';
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

  const usuariosFiltrados = useMemo(() => {
    // Si estamos usando búsqueda en tiempo real con la API, no necesitamos filtrar localmente
    return usuarios;
  }, [usuarios]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 text-white">
      <Background />

      <div className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-extrabold mb-8 text-center text-blue-400 drop-shadow">
          Lista de Usuarios
          {totalItems > 0 && (
            <span className="block text-sm text-blue-200 mt-2 font-normal">
              Total: {totalItems} usuarios
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
            placeholder="Buscar por nombre, ID, DNI o correo..."
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
            {usuarios.length > 0 && (
              <>
                Mostrando {usuarios.length} de {totalItems} usuarios
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

        {loading && usuarios.length === 0 ? (
          <div className="text-center py-8">
            <div className="flex items-center justify-center">
              <FaSync className="animate-spin text-2xl text-blue-400 mr-2" />
              <p className="text-gray-400">Cargando usuarios...</p>
            </div>
          </div>
        ) : usuariosFiltrados.length === 0 ? (
          <div className="bg-gray-800 p-8 rounded-xl shadow-lg text-center text-blue-200 border border-blue-700">
            {filtro ? 'No se encontraron usuarios con ese criterio de búsqueda.' : 'No hay usuarios registrados.'}
          </div>
        ) : (
          <>
            <ul className="space-y-4 mb-6">
              {usuariosFiltrados.map((usuario, index) => {
                const isLastItem = index === usuariosFiltrados.length - 1;
                
                return (
                  <li
                    key={`${usuario._id}-${index}`}
                    ref={isLastItem ? lastUsuarioElementRef : null}
                    className="bg-gradient-to-r from-blue-800 to-blue-600 p-5 rounded-xl shadow-lg border border-blue-700 flex items-center gap-4 hover:scale-[1.01] transition-transform"
                  >
                    <FaUserCircle className="text-4xl text-blue-200 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white truncate">
                        {usuario.nombre_completo || 'Nombre no disponible'}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-1 mt-2">
                        <p className="text-blue-200 font-mono text-sm break-all">
                          <span className="text-blue-100">ID:</span> {usuario._id}
                        </p>
                        <p className="text-blue-200 text-sm">
                          <span className="text-blue-100">Usuario:</span> @{usuario.nombre_usuario}
                        </p>
                        {usuario.dni && (
                          <p className="text-blue-200 text-sm">
                            <span className="text-blue-100">DNI:</span> {usuario.dni}
                          </p>
                        )}
                        <p className="text-blue-200 text-sm">
                          <span className="text-blue-100">Nivel:</span> {usuario.nivel}
                        </p>
                        {usuario.correo_electronico && (
                          <p className="text-blue-200 text-sm truncate col-span-2">
                            <span className="text-blue-100">Email:</span> {usuario.correo_electronico}
                          </p>
                        )}
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
                  <p className="text-blue-200">Cargando más usuarios...</p>
                </div>
              </div>
            )}

            {/* Mensaje cuando no hay más elementos */}
            {!hasMore && usuarios.length > 0 && (
              <div className="text-center py-4">
                <p className="text-blue-300">
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
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg transition-colors flex items-center justify-center mx-auto"
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