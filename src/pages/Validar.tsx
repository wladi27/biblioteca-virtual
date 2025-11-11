import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Background } from '../components/Background';
import { AdminNav } from '../components/AdminNav';
import Modal from '../components/Modal';
import { Trash, CheckCircle } from 'lucide-react';
import debounce from 'lodash/debounce';

export const Validar = () => {
    const [publicaciones, setPublicaciones] = useState([]);
    const [filter, setFilter] = useState('');
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | null }>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isValidateModalOpen, setIsValidateModalOpen] = useState(false);
    const [validateUserId, setValidateUserId] = useState('');
    const [validateUser, setValidateUser] = useState(null);
    const [validateLoading, setValidateLoading] = useState(false);
    const [validateError, setValidateError] = useState('');
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 20;

    const observer = useRef();
    const navigate = useNavigate();

    useEffect(() => {
        fetchPublicacionesNoValidadas(1, true);
    }, []);

    const fetchPublicacionesNoValidadas = async (page = 1, isInitialLoad = false, search = '') => {
        try {
            if (isInitialLoad) {
                setLoading(true);
                setPublicaciones([]);
            } else {
                setLoadingMore(true);
            }

            // USAR EL NUEVO ENDPOINT ESPECÍFICO PARA NO VALIDADOS
            const url = `${import.meta.env.VITE_URL_LOCAL}/api/aportes/admin/no-validados?page=${page}&limit=${itemsPerPage}${search ? `&search=${encodeURIComponent(search)}` : ''}`;
            
            console.log('🔍 Llamando a API de no validados:', url);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            console.log(`📊 Respuesta API - Página ${page}, Búsqueda: "${search}"`);
            console.log(`   - Aportes recibidos: ${data.aportes.length}`);
            console.log(`   - Total items: ${data.pagination.totalItems}`);
            console.log(`   - Tiene más páginas: ${data.pagination.hasNext}`);
            
            // TODOS los aportes que vienen son NO VALIDADOS, no necesitamos filtrar
            if (isInitialLoad) {
                setPublicaciones(data.aportes);
            } else {
                setPublicaciones(prev => [...prev, ...data.aportes]);
            }
            
            setTotalItems(data.pagination.totalItems);
            setCurrentPage(data.pagination.currentPage);
            setHasMore(data.pagination.hasNext && data.aportes.length > 0);
            
        } catch (error) {
            console.error('❌ Error cargando aportes no validados:', error);
            setMessage({ text: 'Error al conectar con el servidor', type: 'error' });
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleFilterChange = useCallback(
        debounce((value) => {
            console.log('🎯 Aplicando filtro:', value);
            setFilter(value);
            setPublicaciones([]);
            setCurrentPage(1);
            setHasMore(true);
            fetchPublicacionesNoValidadas(1, true, value);
        }, 500),
        []
    );

    const loadMorePublicaciones = useCallback(() => {
        if (hasMore && !loadingMore && !loading) {
            console.log('⬇️ Cargando más publicaciones...');
            fetchPublicacionesNoValidadas(currentPage + 1, false, filter);
        }
    }, [hasMore, loadingMore, loading, currentPage, filter]);

    // Observer para scroll infinito
    const lastPublicacionElementRef = useCallback(node => {
        if (loadingMore) return;
        
        if (observer.current) observer.current.disconnect();
        
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                loadMorePublicaciones();
            }
        }, {
            threshold: 0.1,
            rootMargin: '100px'
        });
        
        if (node) observer.current.observe(node);
    }, [loadingMore, hasMore, loadMorePublicaciones]);

    const handleValidate = async (id) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/api/aportes/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ aporte: true }),
            });

            if (response.ok) {
                setMessage({ text: 'Aporte validado exitosamente', type: 'success' });
                // Remover el aporte validado de la lista localmente
                setPublicaciones(prev => prev.filter(pub => pub._id !== id));
            } else {
                const errorData = await response.json();
                setMessage({ text: errorData.message || 'Error al validar el aporte', type: 'error' });
            }
        } catch (error) {
            console.error('Error:', error);
            setMessage({ text: 'Error al conectar con el servidor', type: 'error' });
        }
    };

    const handleDelete = async (id) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/api/aportes/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setMessage({ text: 'Aporte eliminado exitosamente', type: 'success' });
                // Remover el aporte eliminado de la lista localmente
                setPublicaciones(prev => prev.filter(pub => pub._id !== id));
            } else {
                const errorData = await response.json();
                setMessage({ text: errorData.message || 'Error al eliminar el aporte', type: 'error' });
            }
        } catch (error) {
            console.error('Error:', error);
            setMessage({ text: 'Error al conectar con el servidor', type: 'error' });
        }
    };

    // Buscar usuario por ID
    const handleSearchUser = async () => {
        setValidateError('');
        setValidateUser(null);
        setValidateLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/usuarios/${validateUserId}`);
            if (!response.ok) {
                setValidateError('Usuario no encontrado');
                setValidateLoading(false);
                return;
            }
            const user = await response.json();
            setValidateUser(user);
        } catch (e) {
            setValidateError('Error al buscar usuario');
        }
        setValidateLoading(false);
    };

    // Validar aporte por usuario
    const handleValidateByUser = async () => {
        setValidateError('');
        setValidateLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/api/aportes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    usuarioId: validateUserId,
                    aporte: true
                }),
            });
            if (response.ok) {
                setMessage({ text: 'Aporte validado exitosamente', type: 'success' });
                setIsValidateModalOpen(false);
                // Recargar la lista para reflejar el cambio
                fetchPublicacionesNoValidadas(1, true, filter);
            } else {
                const errorData = await response.json();
                setValidateError(errorData.message || 'Error al validar el aporte');
            }
        } catch (e) {
            setValidateError('Error al conectar con el servidor');
        }
        setValidateLoading(false);
    };

    // Ocultar mensaje después de 3 segundos
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                setMessage(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 text-white">
            <Background />

            <div className="max-w-4xl mx-auto px-4 py-16">
                <h2 className="text-3xl font-extrabold mb-8 text-center text-blue-400 drop-shadow">
                    Aportes Sin Validar
                    {totalItems > 0 && (
                        <span className="block text-sm text-blue-200 mt-2 font-normal">
                            Pendientes: {totalItems} aportes
                        </span>
                    )}
                </h2>

                {message && (
                    <div className={`mb-6 p-4 rounded-lg text-center font-semibold shadow-lg ${message.type === 'success' ? 'bg-green-600/80 text-white' : 'bg-red-600/80 text-white'}`}>
                        {message.text}
                    </div>
                )}

                {/* Botón para abrir el modal de validación por ID */}
                <button
                    className="mb-6 w-full bg-gradient-to-r from-blue-700 to-blue-900 text-white py-3 px-4 rounded-lg font-bold shadow-lg hover:from-blue-800 hover:to-blue-600 transition-all"
                    onClick={() => {
                        setIsValidateModalOpen(true);
                        setValidateUserId('');
                        setValidateUser(null);
                        setValidateError('');
                    }}
                >
                    Validar aporte por ID de usuario
                </button>

                <div className="mb-8 flex items-center bg-gray-800 rounded-lg px-4 py-2 border border-blue-700 shadow">
                    <input
                        type="text"
                        placeholder="Buscar por ID, nombre, usuario o DNI..."
                        value={filter}
                        onChange={(e) => {
                            const value = e.target.value;
                            setFilter(value);
                            handleFilterChange(value);
                        }}
                        className="w-full bg-transparent text-white rounded-md py-2 px-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    {(loading || loadingMore) && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-300 ml-2"></div>
                    )}
                </div>

                {/* Información de búsqueda */}
                {filter && (
                    <div className="mb-4 text-sm text-blue-300">
                        🔍 Buscando: "{filter}"
                    </div>
                )}

                {/* Información de carga */}
                <div className="flex justify-between items-center mb-4 text-sm text-blue-200">
                    <div>
                        {publicaciones.length > 0 && (
                            <>
                                Mostrando {publicaciones.length} de {totalItems} aportes pendientes
                                {hasMore && ' (carga automática al hacer scroll)'}
                            </>
                        )}
                    </div>
                    {loading && (
                        <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-300 mr-2"></div>
                            Cargando...
                        </div>
                    )}
                </div>

                {loading && publicaciones.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mr-2"></div>
                            <p className="text-gray-400">
                                {filter ? `Buscando "${filter}"...` : 'Cargando aportes pendientes...'}
                            </p>
                        </div>
                    </div>
                ) : publicaciones.length === 0 ? (
                    <div className="bg-gray-800 p-8 rounded-xl shadow-lg text-center text-blue-200 border border-blue-700">
                        {filter ? `No se encontraron aportes pendientes para "${filter}"` : '🎉 No hay aportes pendientes de validación.'}
                    </div>
                ) : (
                    <>
                        <ul className="space-y-6 mb-6">
                            {publicaciones.map((pub, index) => {
                                const isLastItem = index === publicaciones.length - 1;
                                
                                return (
                                    <li 
                                        key={`${pub._id}-${index}`}
                                        ref={isLastItem ? lastPublicacionElementRef : null}
                                        className="bg-gradient-to-r from-blue-800 to-blue-600 p-6 rounded-xl shadow-lg border border-blue-700 flex flex-col gap-2"
                                    >
                                        <div className="flex items-center gap-4 mb-2">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-lg text-white">
                                                    {pub.usuario?.nombre_completo || 'Usuario no encontrado'}
                                                </span>
                                                <span className="text-blue-200 font-mono text-sm">
                                                    @{pub.usuario?.nombre_usuario || '---'}
                                                </span>
                                                <span className="text-xs text-blue-100 mt-1">
                                                    ID: <span className="font-mono">{pub.usuarioId}</span>
                                                </span>
                                                {pub.usuario?.dni && (
                                                    <span className="text-xs text-blue-100">
                                                        DNI: <span className="font-mono">{pub.usuario.dni}</span>
                                                    </span>
                                                )}
                                                {pub.usuario?.nivel && (
                                                    <span className="text-xs text-blue-100">
                                                        Nivel: <span className="font-mono">{pub.usuario.nivel}</span>
                                                    </span>
                                                )}
                                            </div>
                                            <span className="ml-auto px-3 py-1 rounded-full bg-yellow-600 text-yellow-200 text-xs font-semibold">
                                                Pendiente
                                            </span>
                                        </div>
                                        <hr className="border-blue-700 my-2" />
                                        {pub.usuario?.padre && (
                                            <div className="flex flex-col md:flex-row md:items-center md:gap-8 gap-2">
                                                <div>
                                                    <span className="text-xs text-blue-100">ID Padre: </span>
                                                    <span className="font-mono text-blue-200">{pub.usuario.padre.id}</span>
                                                </div>
                                                <div>
                                                    <span className="text-xs text-blue-100">Nombre Padre: </span>
                                                    <span className="font-mono text-blue-200">{pub.usuario.padre.nombre}</span>
                                                </div>
                                            </div>
                                        )}
                                        {pub.aporte && typeof pub.aporte === 'string' && (
                                            <p className="text-xs text-blue-200 mt-2">
                                                Descripción: {pub.aporte}
                                            </p>
                                        )}
                                        <div className="flex gap-4 mt-4">
                                            <button
                                                onClick={() => handleValidate(pub._id)}
                                                className="flex-1 bg-gradient-to-r from-green-600 to-green-500 text-white py-2 px-4 rounded-lg hover:from-green-700 hover:to-green-600 transition-all font-bold shadow-md flex items-center justify-center"
                                            >
                                                <CheckCircle className="mr-2" /> Validar
                                            </button>
                                            <button
                                                onClick={() => handleDelete(pub._id)}
                                                className="flex-1 bg-gradient-to-r from-red-600 to-red-500 text-white py-2 px-4 rounded-lg hover:from-red-700 hover:to-red-600 transition-all font-bold shadow-md flex items-center justify-center"
                                            >
                                                <Trash className="mr-2" /> Eliminar
                                            </button>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>

                        {/* Indicador de carga de más elementos */}
                        {loadingMore && (
                            <div className="text-center py-4">
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400 mr-2"></div>
                                    <p className="text-blue-200">Cargando más aportes pendientes...</p>
                                </div>
                            </div>
                        )}

                        {/* Mensaje cuando no hay más elementos */}
                        {!hasMore && publicaciones.length > 0 && (
                            <div className="text-center py-4">
                                <p className="text-blue-300">
                                    ✅ Se han cargado todos los {totalItems} aportes pendientes
                                </p>
                            </div>
                        )}
                    </>
                )}

                {/* Botón para cargar más manualmente */}
                {hasMore && publicaciones.length > 0 && !loadingMore && (
                    <div className="text-center mt-6">
                        <button
                            onClick={loadMorePublicaciones}
                            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg transition-colors flex items-center justify-center mx-auto"
                        >
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Cargar más aportes
                        </button>
                    </div>
                )}

                {/* Modal para validar por ID */}
                <Modal isOpen={isValidateModalOpen} onClose={() => setIsValidateModalOpen(false)}>
                    <div className="p-4">
                        <h3 className="text-xl font-bold mb-4 text-blue-400">Validar aporte por ID de usuario</h3>
                        <input
                            type="text"
                            placeholder="ID de usuario"
                            value={validateUserId}
                            onChange={e => setValidateUserId(e.target.value)}
                            className="w-full mb-3 p-2 rounded bg-gray-700 text-white border border-blue-600"
                        />
                        <button
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-bold mb-3"
                            onClick={handleSearchUser}
                            disabled={validateLoading || !validateUserId}
                        >
                            {validateLoading ? 'Buscando...' : 'Buscar usuario'}
                        </button>
                        {validateError && (
                            <div className="mb-2 text-red-400 font-semibold">{validateError}</div>
                        )}
                        {validateUser && (
                            <div className="mb-4 p-3 rounded bg-blue-900 text-blue-100">
                                <div><span className="font-bold">Nombre:</span> {validateUser.nombre_completo}</div>
                                <div><span className="font-bold">Usuario:</span> @{validateUser.nombre_usuario}</div>
                                <div><span className="font-bold">ID:</span> <span className="font-mono">{validateUser._id}</span></div>
                                {validateUser.dni && (
                                    <div><span className="font-bold">DNI:</span> {validateUser.dni}</div>
                                )}
                                <button
                                    className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-bold"
                                    onClick={handleValidateByUser}
                                    disabled={validateLoading}
                                >
                                    {validateLoading ? 'Validando...' : 'Validar aporte'}
                                </button>
                            </div>
                        )}
                    </div>
                </Modal>

                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                    {/* Contenido del modal para crear o editar publicaciones */}
                </Modal>
            </div>
            <AdminNav />
        </div>
    );
};