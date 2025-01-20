import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Background } from '../components/Background';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

export const Login = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    nombre_usuario: '',
    contraseña: '',
  });
  const [message, setMessage] = useState({ text: '', type: '' }); // Cambiado a un objeto
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre_usuario: credentials.nombre_usuario,
          contraseña: credentials.contraseña,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        setMessage({ text: 'Inicio de sesión exitoso. Redirigiendo...', type: 'success' });

        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } else {
        const errorData = await response.json();
        setMessage({ text: `Error al iniciar sesión: ${errorData.message || 'Error desconocido'}`, type: 'error' });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ text: 'Error al conectar con el servidor', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Background />
      
      <div className="max-w-md mx-auto px-4 py-16">
        <Link to="/" className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al inicio
        </Link>

        <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700">
          <h2 className="text-2xl font-bold mb-6 text-center">Iniciar Sesión</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Nombre de Usuario
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={credentials.nombre_usuario}
                onChange={(e) => setCredentials({ ...credentials, nombre_usuario: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={credentials.contraseña}
                  onChange={(e) => setCredentials({ ...credentials, contraseña: e.target.value })}
                />
                <div
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="text-gray-400" /> : <Eye className="text-gray-400" />}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-semibold transition-colors"
            >
              Iniciar Sesión
            </button>
          </form>

          {message.text && (
            <p className={`text-center mt-6 text-sm ${message.type === 'success' ? 'text-blue-400' : 'text-red-400'}`}>
              {message.text}
            </p>
          )}

          <p className="text-center mt-6 text-sm text-gray-400">
            ¿No tienes una cuenta? <Link to="/register" className="text-blue-400 hover:text-blue-300">Regístrate</Link>
          </p>

          <div className="text-center mt-4 text-xs text-gray-500">
            v0.1
          </div>
        </div>
      </div>
    </div>
  );
};
