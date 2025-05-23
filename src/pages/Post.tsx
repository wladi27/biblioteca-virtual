import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash } from 'lucide-react';
import { Background } from '../components/Background';
import { AdminNav } from '../components/AdminNav';
import Modal from '../components/Modal';

export const CreatePublication = () => {
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    file: null,
    status: 'activo',
  });

  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | null }>(null);
  const [publicaciones, setPublicaciones] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentPubId, setCurrentPubId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPublicaciones();
  }, []);

  const fetchPublicaciones = async () => {
    const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/api/publicaciones`);
    const data = await response.json();
    setPublicaciones(data);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, file: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formDataToSend = new FormData();
    formDataToSend.append('titulo', formData.titulo);
    formDataToSend.append('descripcion', formData.descripcion);
    formDataToSend.append('file', formData.file);
    formDataToSend.append('status', formData.status);

    try {
      const response = isEdit 
        ? await fetch(`${import.meta.env.VITE_URL_LOCAL}/api/publicaciones/${currentPubId}`, {
            method: 'PUT',
            body: formDataToSend,
          })
        : await fetch(`${import.meta.env.VITE_URL_LOCAL}/api/publicaciones`, {
            method: 'POST',
            body: formDataToSend,
          });

      if (response.ok) {
        setMessage({ text: isEdit ? 'Publicación actualizada exitosamente' : 'Publicación creada exitosamente', type: 'success' });
        fetchPublicaciones(); // Actualiza la lista de publicaciones
        setIsModalOpen(false); // Cierra el modal
        setFormData({ titulo: '', descripcion: '', file: null, status: 'activo' }); // Resetea el formulario
        setIsEdit(false); // Resetea el estado de edición
      } else {
        const errorData = await response.json();
        setMessage({ text: errorData.message || 'Error al guardar la publicación', type: 'error' });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ text: 'Error al conectar con el servidor', type: 'error' });
    }
  };

  const handleEdit = (pub) => {
    setFormData({
      titulo: pub.titulo,
      descripcion: pub.descripcion,
      file: null, // No se puede editar el archivo directamente
      status: pub.status,
    });
    setCurrentPubId(pub._id);
    setIsEdit(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/api/publicaciones/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage({ text: 'Publicación eliminada exitosamente', type: 'success' });
        fetchPublicaciones(); // Actualiza la lista de publicaciones
      } else {
        const errorData = await response.json();
        setMessage({ text: errorData.message || 'Error al eliminar la publicación', type: 'error' });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ text: 'Error al conectar con el servidor', type: 'error' });
    }
  };

  const renderFile = (file) => {
    const fileExtension = file.split('.').pop().toLowerCase();
    const fileUrl = `${import.meta.env.VITE_URL_LOCAL}/${file}`;

    if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
      return <img src={fileUrl} alt="Publicación" className="w-full h-auto" />;
    } else if (['mp4', 'webm', 'ogg'].includes(fileExtension)) {
      return (
        <video controls className="w-full h-auto">
          <source src={fileUrl} type={`video/${fileExtension}`} />
          Tu navegador no soporta la etiqueta de video.
        </video>
      );
    } else {
      return <p>Archivo no soportado</p>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Background />
      
      <div className="max-w-2xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold mb-6 text-center">Lista de Publicaciones</h2>
        
        {message && (
          <div className={`mb-4 p-4 rounded-md ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
            {message.text}
          </div>
        )}

        <button
          onClick={() => { setIsModalOpen(true); setIsEdit(false); }}
          className="mb-4 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors shadow-lg"
        >
          Crear Nueva Publicación
        </button>

        <ul className="space-y-4">
          {publicaciones.map((pub) => (
            <li key={pub._id} className="bg-gray-800 p-4 rounded-md">
              <h3 className="text-lg font-bold">{pub.titulo}</h3>
              <p>{pub.descripcion}</p>
              <p>Status: {pub.status}</p>
              {renderFile(pub.file)} {/* Llama a la función renderFile */}
              <div className="flex justify-between mt-4">
                <button
                  onClick={() => handleEdit(pub)}
                  className="bg-yellow-500 text-white py-2 px-4 rounded-md hover:bg-yellow-600 transition-colors shadow-md flex items-center"
                >
                  <Edit className="mr-2" /> Editar
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
          <h2 className="text-2xl font-bold mb-6 text-center">{isEdit ? 'Editar Publicación' : 'Crear Publicación'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Título</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Descripción</label>
              <textarea
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Archivo</label>
              <input
                type="file"
                accept="*/*"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={handleFileChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Estado</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>

            <div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors shadow-lg"
              >
                {isEdit ? 'Actualizar Publicación' : 'Crear Publicación'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
      <AdminNav />
    </div>
  );
};
