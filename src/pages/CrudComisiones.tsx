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
    // Ordenar del nivel 1 al 12
    const ordenados = data.sort((a, b) => Number(a.numero_nivel) - Number(b.numero_nivel));
    setNiveles(ordenados);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nivelData = {
      numero_nivel: formData.numero_nivel,
      comision: { $numberDecimal: formData.comision.toString() },
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
      comision: nivel.comision.$numberDecimal,
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 text-white">
      <Background />

      <div className="max-w-3xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-extrabold mb-8 text-center text-blue-400 drop-shadow">Gestión de Niveles y Comisiones</h2>

        {message && (
          <div className={`mb-6 p-4 rounded-lg text-center font-semibold shadow-lg ${message.type === 'success' ? 'bg-green-600/80 text-white' : 'bg-red-600/80 text-white'}`}>
            {message.text}
          </div>
        )}

        <div className="flex justify-end mb-6">
          <button
            onClick={() => { setIsModalOpen(true); setIsEdit(false); }}
            className="bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all font-bold shadow-lg"
          >
            Crear Nuevo Nivel
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {niveles.map((nivel) => (
            <div key={nivel._id} className="bg-gray-800 rounded-2xl shadow-xl border border-blue-700 p-6 flex flex-col justify-between hover:scale-[1.02] transition-transform">
              <div>
                <h3 className="text-xl font-bold text-blue-300 mb-2 flex items-center gap-2">
                  <span className="text-white">Nivel</span>
                  <span className="bg-blue-700 text-white px-3 py-1 rounded-full text-lg font-mono">{nivel.numero_nivel}</span>
                </h3>
                <p className="text-lg text-blue-200 mb-2">
                  Comisión: <span className="font-mono text-white">{nivel.comision.$numberDecimal}</span>
                </p>
              </div>
              <div className="flex gap-4 mt-4">
                <button
                  onClick={() => handleEdit(nivel)}
                  className="flex-1 bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors shadow-md flex items-center justify-center font-bold"
                >
                  <Edit className="mr-2" /> Editar
                </button>
                <button
                  onClick={() => handleDelete(nivel._id)}
                  className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors shadow-md flex items-center justify-center font-bold"
                >
                  <Trash className="mr-2" /> Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <h2 className="text-2xl font-extrabold mb-6 text-center text-blue-400">{isEdit ? 'Editar Nivel' : 'Crear Nivel'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-semibold text-blue-300 mb-2">Número de Nivel</label>
              <input
                type="number"
                required
                className="w-full px-4 py-3 bg-gray-700 border border-blue-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-white"
                value={formData.numero_nivel}
                onChange={(e) => setFormData({ ...formData, numero_nivel: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-blue-300 mb-2">Comisión</label>
              <input
                type="number"
                step="0.01"
                required
                className="w-full px-4 py-3 bg-gray-700 border border-blue-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-white"
                value={formData.comision}
                onChange={(e) => setFormData({ ...formData, comision: e.target.value })}
              />
            </div>

            <div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all font-bold shadow-lg"
              >
                {isEdit ? 'Actualizar Nivel' : 'Crear Nivel'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
      <div className="mt-20 w-full">
        <AdminNav />
      </div>
    </div>
  );
};