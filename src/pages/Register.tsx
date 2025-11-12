import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Background } from '../components/Background';
import type { RegisterData } from '../types/auth';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

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
    confirmar_contraseña: '',
    codigo_referido: '',
  });

  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | null }>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [cantidadCuentas, setCantidadCuentas] = useState(1);
  const [usuariosCreados, setUsuariosCreados] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const usuariosRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setIsLoading(true);

    // Validar contraseñas
    if (formData.contraseña !== formData.confirmar_contraseña) {
      setPasswordError('Las contraseñas no coinciden');
      setIsLoading(false);
      return;
    }

    // Validar que la cantidad de cuentas no exceda el límite
    if (cantidadCuentas > 20) {
      setMessage({ text: 'Máximo 20 cuentas por registro', type: 'error' });
      setIsLoading(false);
      return;
    }

    try {
      // Preparar array de usuarios para el registro masivo
      const usuariosArray = Array.from({ length: cantidadCuentas }, (_, i) => {
        const nombreUsuario = i === 0 
          ? formData.nombre_usuario 
          : `${formData.nombre_usuario}${i}`;

        return {
          nombre_completo: formData.nombre_completo,
          linea_llamadas: formData.linea_llamadas,
          linea_whatsapp: formData.linea_whatsapp,
          cuenta_numero: formData.cuenta_numero,
          banco: formData.banco,
          titular_cuenta: formData.titular_cuenta,
          correo_electronico: formData.correo_electronico,
          dni: formData.dni,
          nombre_usuario: nombreUsuario,
          contraseña: formData.contraseña,
          codigo_referido: formData.codigo_referido || undefined,
        };
      });

      // Enviar petición única al endpoint de registro masivo
      const response = await fetch(`${import.meta.env.VITE_API_URL}/usuarios/bulk-register`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuarios: usuariosArray,
          cantidad: cantidadCuentas
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // Extraer nombres de usuario creados
        const nombresUsuarios = result.usuarios.map((usuario: any) => usuario.nombre_usuario);
        setUsuariosCreados(nombresUsuarios);
        setShowModal(true);
        setMessage({ 
          text: `¡Éxito! ${result.message}`, 
          type: 'success' 
        });
      } else {
        setMessage({ 
          text: result.message || 'Error en el registro', 
          type: 'error' 
        });
      }

    } catch (error) {
      console.error('Error en registro masivo:', error);
      setMessage({ 
        text: 'Error de conexión con el servidor', 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (usuariosRef.current) {
      usuariosRef.current.select();
      document.execCommand('copy');
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(usuariosCreados.join('\n'));
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setMessage(null);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Background />
      
      {/* Modal de usuarios creados */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-xl shadow-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-center">Usuarios creados exitosamente</h3>
            <p className="text-green-400 text-center mb-4">
              Se crearon {usuariosCreados.length} cuenta(s)
            </p>
            <textarea
              ref={usuariosRef}
              readOnly
              value={usuariosCreados.join('\n')}
              className="w-full h-32 bg-gray-700 text-white rounded-md mb-4 p-2 resize-none"
            />
            <div className="flex gap-2 justify-center">
              <button
                onClick={handleCopy}
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Copiar al portapapeles
              </button>
              <button
                onClick={handleCloseModal}
                className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="max-w-2xl mx-auto px-4 py-16">
        <Link to="/" className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al inicio
        </Link>

        <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700">
          <h2 className="text-2xl font-bold mb-6 text-center">Registro Masivo</h2>

          {message && (
            <div className={`mb-4 p-4 rounded-md ${
              message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`}>
              {message.text}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Campo para cantidad de cuentas */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Cantidad de cuentas a crear (máximo 20)
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={cantidadCuentas}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (value >= 1 && value <= 20) {
                    setCantidadCuentas(value);
                  }
                }}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-400 mt-1">
                Se crearán {cantidadCuentas} cuenta(s) con los mismos datos básicos
              </p>
            </div>

            {/* Campos del formulario */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Nombre Completo *</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.nombre_completo}
                onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Documento de Identidad *</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.dni}
                onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Línea de Llamadas *</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.linea_llamadas}
                onChange={(e) => setFormData({ ...formData, linea_llamadas: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">WhatsApp *</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.linea_whatsapp}
                onChange={(e) => setFormData({ ...formData, linea_whatsapp: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Banco o Exchange *</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.banco}
                onChange={(e) => setFormData({ ...formData, banco: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Número de Cuenta *</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.cuenta_numero}
                onChange={(e) => setFormData({ ...formData, cuenta_numero: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Titular de la Cuenta *</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.titular_cuenta}
                onChange={(e) => setFormData({ ...formData, titular_cuenta: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Correo Electrónico *</label>
              <input
                type="email"
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.correo_electronico}
                onChange={(e) => setFormData({ ...formData, correo_electronico: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Nombre de Usuario Base *</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.nombre_usuario}
                onChange={(e) => setFormData({ ...formData, nombre_usuario: e.target.value })}
                placeholder="Ej: usuario"
              />
              <p className="text-sm text-gray-400 mt-1">
                Las cuentas adicionales se numerarán automáticamente
              </p>
            </div>

            {/* Campo de Código de Referido (opcional) */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Código de Referido</label>
              <input
                type="text"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.codigo_referido}
                onChange={(e) => setFormData({ ...formData, codigo_referido: e.target.value })}
                placeholder="Opcional"
              />
            </div>

            {/* Campo de Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Contraseña *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.contraseña}
                  onChange={(e) => setFormData({ ...formData, contraseña: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash className="text-gray-400" /> : <FaEye className="text-gray-400" />}
                </button>
              </div>
            </div>

            {/* Campo de Confirmación de Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Confirmar Contraseña *</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.confirmar_contraseña}
                  onChange={(e) => setFormData({ ...formData, confirmar_contraseña: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash className="text-gray-400" /> : <FaEye className="text-gray-400" />}
                </button>
              </div>
            </div>
            {passwordError && <p className="text-red-500 text-sm mt-1 md:col-span-2">{passwordError}</p>}

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-md transition-colors ${
                  isLoading 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white font-semibold`}
              >
                {isLoading ? 'Creando cuentas...' : `Registrar ${cantidadCuentas} cuenta(s)`}
              </button>
            </div>
          </form>

          <p className="text-center text-gray-400 mt-6">
            ¿Ya tienes una cuenta? <Link to="/login" className="text-blue-400 hover:text-blue-300">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
};