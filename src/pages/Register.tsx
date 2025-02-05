import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Background } from '../components/Background';
import type { RegisterData } from '../types/auth';

export const Register = () => {
  const [formData, setFormData] = useState<RegisterData>({
    nombre_completo: '',
    linea_llamadas: '',
    linea_whatsapp: '',
    cuenta_numero: '',
    banco: '',
    titular_cuenta: '',
    correo_electronico: '',
    nivel: 0,
    dni: '',
    nombre_usuario: '',
    contraseña: '',
    codigo_referido: '',
  });

  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | null }>(null);
  const navigate = useNavigate(); // Hook para redireccionar

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage({ text: 'Registro exitoso', type: 'success' });
        setTimeout(() => {
          setMessage(null); // Ocultar mensaje
          navigate('/login'); // Redirigir al login
        }, 3000); // Duración del mensaje
      } else {
        const errorData = await response.json();
        setMessage({ text: errorData.message || 'Error en el registro', type: 'error' });
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
        <Link to="/" className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al inicio
        </Link>

        <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700">
          <h2 className="text-2xl font-bold mb-6 text-center">Registro</h2>

          {message && (
            <div className={`mb-4 p-4 rounded-md ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
              {message.text}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Campos del formulario */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Nombre Completo</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.nombre_completo}
                onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">CC</label>
              <input
                type="text"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.dni}
                onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Línea de Llamadas</label>
              <input
                type="text"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.linea_llamadas}
                onChange={(e) => setFormData({ ...formData, linea_llamadas: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">WhatsApp</label>
              <input
                type="text"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.linea_whatsapp}
                onChange={(e) => setFormData({ ...formData, linea_whatsapp: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Número de Cuenta</label>
              <input
                type="text"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.cuenta_numero}
                onChange={(e) => setFormData({ ...formData, cuenta_numero: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Banco</label>
              <input
                type="text"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.banco}
                onChange={(e) => setFormData({ ...formData, banco: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Titular de la Cuenta</label>
              <input
                type="text"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.titular_cuenta}
                onChange={(e) => setFormData({ ...formData, titular_cuenta: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Correo Electrónico</label>
              <input
                type="email"
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.correo_electronico}
                onChange={(e) => setFormData({ ...formData, correo_electronico: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Nombre de Usuario</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.nombre_usuario}
                onChange={(e) => setFormData({ ...formData, nombre_usuario: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Contraseña</label>
              <input
                type="password"
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.contraseña}
                onChange={(e) => setFormData({ ...formData, contraseña: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Código de Referido</label>
              <input
                type="text"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.codigo_referido}
                onChange={(e) => setFormData({ ...formData, codigo_referido: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Registrarse
              </button>
            </div>
          </form>

          <p className="text-center text-gray-400 mt-4">
            ¿Ya tienes una cuenta? <Link to="/login" className="text-blue-400 hover:text-blue-300">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
