import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Background } from '../components/Background';
import { AdminNav } from '../components/AdminNav';
import Modal from '../components/Modal';
import { Trash } from 'lucide-react';

export const Validar = () => {
    const [publicaciones, setPublicaciones] = useState([]);
    const [filter, setFilter] = useState('');
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | null }>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchPublicaciones();
    }, []);

    const fetchPublicaciones = async () => {
        const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/api/aportes`);
        const data = await response.json();

        const publicacionesConUsuarios = await Promise.all(data.map(async (pub) => {
            const usuarioResponse = await fetch(`${import.meta.env.VITE_URL_LOCAL}/usuarios/${pub.usuarioId}`);
            const usuarioData = await usuarioResponse.json();
            return { ...pub, usuario: usuarioData };
        }));

        setPublicaciones(publicacionesConUsuarios);
    };

    const handleFilterChange = (e) => {
        const value = e.target.value;
        setFilter(value);
    };

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

    // Filtrar solo los aportes que están sin validar
    const publicacionesSinValidar = publicaciones.filter(pub => !pub.aporte);

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Background />

            <div className="max-w-2xl mx-auto px-4 py-16">
                <h2 className="text-2xl font-bold mb-6 text-center">Aportes Sin Validar</h2>

                {message && (
                    <div className={`mb-4 p-4 rounded-md ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                        {message.text}
                    </div>
                )}

                <input
                    type="text"
                    placeholder="Filtrar por ID de usuario o nombre"
                    value={filter}
                    onChange={handleFilterChange}
                    className="w-full mb-4 p-2 rounded-md bg-gray-800 text-white"
                />

                <ul className="space-y-4">
                    {publicacionesSinValidar
                        .filter(pub => {
                            const usuarioIdMatch = pub.usuarioId.toString().includes(filter);
                            const nombreMatch = pub.usuario?.nombre_completo.toLowerCase().includes(filter.toLowerCase());
                            return usuarioIdMatch || nombreMatch;
                        })
                        .map((pub) => (
                            <li key={pub._id} className="bg-gray-800 p-4 rounded-md">
                                <p>ID Usuario: {pub.usuarioId}</p>
                                <p>Nombre Usuario: {pub.usuario?.nombre_completo || 'Usuario no encontrado'}</p>
                                <p>Status: {pub.aporte ? 'Validado' : 'No Validado'}</p>
                                <br />
                                <hr />
                                <br />
                                <p>ID Padre: {pub.usuario?.padre?.id || 'No disponible'}</p>
                                <p>Nombre Padre: {pub.usuario?.padre?.nombre || 'No disponible'}</p>
                                <div className="flex justify-between mt-4">
                                    <button
                                        onClick={() => handleValidate(pub._id)}
                                        className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors shadow-md flex items-center"
                                    >
                                        Validar
                                    </button>
                                    <button
                                        onClick={() => handleDelete(pub._id)}
                                        className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors shadow-md flex items-center"
                                    >
                                        <Trash className="mr-2" /> Eliminar
                                    </button>
                                </div>
                            </li>
                        ))}
                </ul>

                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                    {/* Contenido del modal para crear o editar publicaciones */}
                </Modal>
            </div>
            <AdminNav />
        </div>
    );
};
