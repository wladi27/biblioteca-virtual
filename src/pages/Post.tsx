import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import { Background } from '../components/Background';
import { AdminNav } from '../components/AdminNav';
import { Edit, Trash } from 'lucide-react';

export const CreatePublication = () => {
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    file: null,
    status: 'activo',
  });

  const [message, setMessage] = useState(null);
  const [publicaciones, setPublicaciones] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentPubId, setCurrentPubId] = useState(null);

  useEffect(() => {
    fetchPublicaciones();
  }, []);

  const fetchPublicaciones = async () => {
    const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/api/publicaciones`);
    const data = await response.json();
    setPublicaciones(data);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, file: e.target.files[0] });
    }
  };

  const handleSubmit = async (e) => {
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
        fetchPublicaciones();
        setIsModalOpen(false);
        setFormData({ titulo: '', descripcion: '', file: null, status: 'activo' });
        setIsEdit(false);
      } else {
        const errorData = await response.json();
        setMessage({ text: errorData.message || 'Error al guardar la publicación', type: 'error' });
      }
    } catch (error) {
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
        fetchPublicaciones();
      } else {
        const errorData = await response.json();
        setMessage({ text: errorData.message || 'Error al eliminar la publicación', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Error al conectar con el servidor', type: 'error' });
    }
  };

  const renderFile = (file) => {
    if (!file) return null;
    const fileExtension = file.split('.').pop().toLowerCase();

    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension)) {
      return <img src={file} alt="Publicación" className="w-full h-auto max-h-64 object-contain my-2" />;
    } else if (['mp4', 'webm', 'ogg'].includes(fileExtension)) {
      return (
        <video controls className="w-full h-auto max-h-64 my-2">
          <source src={file} type={`video/${fileExtension}`} />
          Tu navegador no soporta la etiqueta de video.
        </video>
      );
    } else if (['pdf'].includes(fileExtension)) {
      return (
        <a href={file} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline my-2 block">
          Ver PDF
        </a>
      );
    } else {
      return <p className="my-2">Archivo no soportado</p>;
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
              {renderFile(pub.file)}
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
                accept="image/*,video/*,application/pdf"
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