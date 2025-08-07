import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Background } from '../components/Background';
import { AdminNav } from '../components/AdminNav';
import Modal from '../components/Modal';
import { Trash, CheckCircle } from 'lucide-react';
import debounce from 'lodash/debounce';

export const Validar = () => {
    const [publicaciones, setPublicaciones] = useState([]);
    const [usuarios, setUsuarios] = useState({});
    const [filter, setFilter] = useState('');
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | null }>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isValidateModalOpen, setIsValidateModalOpen] = useState(false);
    const [validateUserId, setValidateUserId] = useState('');
    const [validateUser, setValidateUser] = useState(null);
    const [validateLoading, setValidateLoading] = useState(false);
    const [validateError, setValidateError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchPublicaciones();
        fetchUsuarios();
    }, []);

    const fetchPublicaciones = async () => {
        const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/api/aportes`);
        const data = await response.json();
        setPublicaciones(data);
    };

    const fetchUsuarios = async () => {
        const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/usuarios`);
        const data = await response.json();
        const usuariosMap = data.reduce((acc, usuario) => {
            acc[usuario._id] = usuario;
            return acc;
        }, {});
        setUsuarios(usuariosMap);
    };

    const handleFilterChange = useCallback(debounce((value) => {
        setFilter(value);
    }, 300), []);

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
                fetchPublicaciones();
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
                fetchPublicaciones();
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
            // POST para crear y validar el aporte
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
                fetchPublicaciones();
            } else {
                const errorData = await response.json();
                setValidateError(errorData.message || 'Error al validar el aporte');
            }
        } catch (e) {
            setValidateError('Error al conectar con el servidor');
        }
        setValidateLoading(false);
    };

    const publicacionesSinValidar = useMemo(() => publicaciones.filter(pub => !pub.aporte), [publicaciones]);

    const filteredPublicaciones = useMemo(() => publicacionesSinValidar.filter(pub => {
        const usuarioIdMatch = pub.usuarioId.toString().includes(filter);
        const nombreMatch = usuarios[pub.usuarioId]?.nombre_completo?.toLowerCase().includes(filter.toLowerCase());
        return usuarioIdMatch || nombreMatch;
    }), [publicacionesSinValidar, filter, usuarios]);

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

            <div className="max-w-2xl mx-auto px-4 py-16">
                <h2 className="text-3xl font-extrabold mb-8 text-center text-blue-400 drop-shadow">Aportes Sin Validar</h2>

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
                <br />

                <input
                    type="text"
                    placeholder="Filtrar por ID de usuario o nombre"
                    onChange={(e) => handleFilterChange(e.target.value)}
                    className="w-full mb-6 p-3 rounded-lg bg-gray-700 text-white border border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />

                <ul className="space-y-6">
                    {filteredPublicaciones.length === 0 && (
                        <li className="bg-gray-800 p-6 rounded-xl shadow-lg text-center text-blue-200 border border-blue-700">
                            No hay aportes pendientes de validación.
                        </li>
                    )}
                    {filteredPublicaciones.map((pub) => (
                        <li key={pub._id} className="bg-gradient-to-r from-blue-800 to-blue-600 p-6 rounded-xl shadow-lg border border-blue-700 flex flex-col gap-2">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="flex flex-col">
                                    <span className="font-bold text-lg text-white">{usuarios[pub.usuarioId]?.nombre_completo || 'Usuario no encontrado'}</span>
                                    <span className="text-blue-200 font-mono text-sm">@{usuarios[pub.usuarioId]?.nombre_usuario || '---'}</span>
                                    <span className="text-xs text-blue-100 mt-1">ID: <span className="font-mono">{pub.usuarioId}</span></span>
                                </div>
                                <span className="ml-auto px-3 py-1 rounded-full bg-blue-900 text-blue-200 text-xs font-semibold">
                                    {pub.aporte ? 'Validado' : 'No Validado'}
                                </span>
                            </div>
                            <hr className="border-blue-700 my-2" />
                            <div className="flex flex-col md:flex-row md:items-center md:gap-8 gap-2">
                                <div>
                                    <span className="text-xs text-blue-100">ID Padre: </span>
                                    <span className="font-mono text-blue-200">{usuarios[pub.usuarioId]?.padre?.id || 'No disponible'}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-blue-100">Nombre Padre: </span>
                                    <span className="font-mono text-blue-200">{usuarios[pub.usuarioId]?.padre?.nombre || 'No disponible'}</span>
                                </div>
                            </div>
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
                    ))}
                </ul>

                

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