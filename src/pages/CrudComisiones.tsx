import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Background } from '../components/Background';
import { AdminNav } from '../components/AdminNav';
import Modal from '../components/Modal';
import { Edit, Trash } from 'lucide-react';

export const CrudComisiones = () => {
  const [formData, setFormData] = useState({
    numero_nivel: '',
    comision: '',
  });

  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | null }>(null);
  const [niveles, setNiveles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentNivelId, setCurrentNivelId] = useState(null);

  useEffect(() => {
    fetchNiveles();
  }, []);

  const fetchNiveles = async () => {
    const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/niveles/`);
    const data = await response.json();
    setNiveles(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nivelData = {
      numero_nivel: formData.numero_nivel,
      comision: { $numberDecimal: formData.comision.toString() }, // Asegúrate de enviar como string
    };

    try {
      const response = isEdit
        ? await fetch(`${import.meta.env.VITE_URL_LOCAL}/niveles/${currentNivelId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nivelData),
          })
        : await fetch(`${import.meta.env.VITE_URL_LOCAL}/niveles/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nivelData),
          });

      if (response.ok) {
        setMessage({ text: isEdit ? 'Nivel actualizado exitosamente' : 'Nivel creado exitosamente', type: 'success' });
        fetchNiveles();
        setIsModalOpen(false);
        setFormData({ numero_nivel: '', comision: '' });
        setIsEdit(false);
      } else {
        const errorData = await response.json();
        setMessage({ text: errorData.message || 'Error al guardar el nivel', type: 'error' });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ text: 'Error al conectar con el servidor', type: 'error' });
    }
  };

  const handleEdit = (nivel) => {
    setFormData({
      numero_nivel: nivel.numero_nivel,
      comision: nivel.comision.$numberDecimal, // Extraer el valor de comision
    });
    setCurrentNivelId(nivel._id);
    setIsEdit(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/niveles/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage({ text: 'Nivel eliminado exitosamente', type: 'success' });
        fetchNiveles();
      } else {
        const errorData = await response.json();
        setMessage({ text: errorData.message || 'Error al eliminar el nivel', type: 'error' });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ text: 'Error al conectar con el servidor', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Background />
      
      <div className="max-w-2xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold mb-6 text-center">Lista de Niveles</h2>
        
        {message && (
          <div className={`mb-4 p-4 rounded-md ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
            {message.text}
          </div>
        )}

        <button
          onClick={() => { setIsModalOpen(true); setIsEdit(false); }}
          className="mb-4 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors shadow-lg"
        >
          Crear Nuevo Nivel
        </button>

        <ul className="space-y-4">
          {niveles.map((nivel) => (
            <li key={nivel._id} className="bg-gray-800 p-4 rounded-md">
              <h3 className="text-lg font-bold">Nivel: {nivel.numero_nivel}</h3>
              <p>Comisión: {nivel.comision.$numberDecimal}</p>
              <div className="flex justify-between mt-4">
                <button
                  onClick={() => handleEdit(nivel)}
                  className="bg-yellow-500 text-white py-2 px-4 rounded-md hover:bg-yellow-600 transition-colors shadow-md flex items-center"
                >
                  <Edit className="mr-2" /> Editar
                </button>
                <button
                  onClick={() => handleDelete(nivel._id)}
                  className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors shadow-md flex items-center"
                >
                  <Trash className="mr-2" /> Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <h2 className="text-2xl font-bold mb-6 text-center">{isEdit ? 'Editar Nivel' : 'Crear Nivel'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Número de Nivel</label>
              <input
                type="number"
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.numero_nivel}
                onChange={(e) => setFormData({ ...formData, numero_nivel: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Comisión</label>
              <input
                type="number"
                step="0.01"
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.comision}
                onChange={(e) => setFormData({ ...formData, comision: e.target.value })}
              />
            </div>

            <div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors shadow-lg"
              >
                {isEdit ? 'Actualizar Nivel' : 'Crear Nivel'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
      <br /><br />
      <AdminNav />
    </div>
  );
};
