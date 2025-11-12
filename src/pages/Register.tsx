import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Background } from '../components/Background';
import type { RegisterData } from '../types/auth';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Importar íconos para mostrar/ocultar contraseña
import { countries } from '../lib/countries';

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
    confirmar_contraseña: '', // Campo para confirmar contraseña
    codigo_referido: '',
    patrocinador_id: '', // New field for sponsor ID
    pais: '',
  });

  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | null }>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null); // Estado para el mensaje de error de contraseña
  const [showPassword, setShowPassword] = useState(false); // Estado para mostrar/ocultar contraseña
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Estado para mostrar/ocultar confirmación de contraseña
  const [cantidadCuentas, setCantidadCuentas] = useState(1); // Nuevo estado para cantidad de cuentas
  const [usuariosCreados, setUsuariosCreados] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [phoneCodeLlamadas, setPhoneCodeLlamadas] = useState('');
  const [phoneCodeWhatsapp, setPhoneCodeWhatsapp] = useState('');
  const usuariosRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate(); // Hook para redireccionar

// Register.tsx - REEMPLAZAR esta sección completa
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setPasswordError(null);

  if (formData.contraseña !== formData.confirmar_contraseña) {
    setPasswordError('Las contraseñas no coinciden');
    return;
  }

  let exitos = 0;
  let errores = 0;
  const usuarios: string[] = [];

  for (let i = 0; i < cantidadCuentas; i++) {
    const usuarioNombre = i === 0 ? formData.nombre_usuario : `${formData.nombre_usuario}${i}`;
    const datosRegistro = {
      ...formData,
      nombre_usuario: usuarioNombre,
      linea_llamadas: `+${phoneCodeLlamadas}${formData.linea_llamadas}`,
      linea_whatsapp: `+${phoneCodeWhatsapp}${formData.linea_whatsapp}`,
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosRegistro),
      });

      if (response.ok) {
        exitos++;
        const newUser = await response.json();
        usuarios.push(newUser.nombre_usuario);

        // CORRECCIÓN: Crear solicitud de referido con lógica correcta
        if (formData.patrocinador_id) {
          try {
            await fetch(`${import.meta.env.VITE_URL_LOCAL}/api/referralRequests/`, { 
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                // El SOLICITANTE es el patrocinador (existente)
                solicitante_id: formData.patrocinador_id,
                // El REFERIDO es el nuevo usuario
                referido_id: newUser._id,
              }),
            });
            console.log(`Solicitud de referido enviada correctamente para ${newUser.nombre_usuario}`);
          } catch (referralError) {
            console.error(`Error al enviar solicitud de referido:`, referralError);
          }
        }
      } else {
        errores++;
      }
    } catch (fetchError) {
      errores++;
      console.error(`Error de red al registrar usuario ${usuarioNombre}:`, fetchError);
    }
  }

  if (exitos > 0) {
    setUsuariosCreados(usuarios);
    setShowModal(true);
  } else {
    setMessage({ text: 'No se pudo registrar ninguna cuenta.', type: 'error' });
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
            <h3 className="text-xl font-bold mb-4 text-center">Usuarios creados</h3>
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
          <h2 className="text-2xl font-bold mb-6 text-center">Registro</h2>

          {message && (
            <div className={`mb-4 p-4 rounded-md ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
              {message.text}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nuevo campo para cantidad de cuentas */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Cantidad de cuentas a crear</label>
              <input
                type="number"
                min={1}
                max={20}
                value={cantidadCuentas}
                onChange={(e) => setCantidadCuentas(Number(e.target.value))}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

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
              <label className="block text-sm font-medium text-gray-400 mb-2">País de Residencia</label>
              <select
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.pais}
                onChange={(e) => {
                  setFormData({ ...formData, pais: e.target.value });
                  const selectedCountry = countries.find(c => c.name === e.target.value);
                  if (selectedCountry) {
                    setPhoneCodeLlamadas(selectedCountry.phone);
                    setPhoneCodeWhatsapp(selectedCountry.phone);
                  }
                }}
              >
                <option value="">Selecciona un país</option>
                {countries.map((country) => (
                  <option key={country.code} value={country.name}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Documento de Identidad</label>
              <input
                type="text"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.dni}
                onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Línea de Llamadas</label>
              <div className="flex">
                <select
                  value={phoneCodeLlamadas}
                  onChange={(e) => setPhoneCodeLlamadas(e.target.value)}
                  className="w-1/4 px-2 py-2 bg-gray-700 border border-gray-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Código</option>
                  {countries.map((country) => (
                    <option key={`${country.code}-llamadas`} value={country.phone}>
                      +{country.phone}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  className="w-3/4 px-4 py-2 bg-gray-700 border border-gray-600 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.linea_llamadas}
                  onChange={(e) => setFormData({ ...formData, linea_llamadas: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">WhatsApp</label>
              <div className="flex">
                <select
                  value={phoneCodeWhatsapp}
                  onChange={(e) => setPhoneCodeWhatsapp(e.target.value)}
                  className="w-1/4 px-2 py-2 bg-gray-700 border border-gray-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Código</option>
                  {countries.map((country) => (
                    <option key={`${country.code}-whatsapp`} value={country.phone}>
                      +{country.phone}
                    </option>))}
                </select>
                <input
                  type="text"
                  className="w-3/4 px-4 py-2 bg-gray-700 border border-gray-600 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.linea_whatsapp}
                  onChange={(e) => setFormData({ ...formData, linea_whatsapp: e.target.value })}
                />
              </div>
            </div>

            

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Banco o Exchange</label>
              <input
                type="text"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.banco}
                onChange={(e) => setFormData({ ...formData, banco: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Número de Cuenta o Dirección de wallet</label>
              <input
                type="text"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.cuenta_numero}
                onChange={(e) => setFormData({ ...formData, cuenta_numero: e.target.value })}
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

            {/* Campo de Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Contraseña</label>
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
            {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>} {/* Mensaje de error de contraseña */}

            {/* Campo de Confirmación de Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Confirmar Contraseña</label>
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
            {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>} {/* Mensaje de error de contraseña */}

            {/* Campo para ID del Patrocinador */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">ID del Patrocinador (Opcional)</label>
              <input
                type="text"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.patrocinador_id}
                onChange={(e) => setFormData({ ...formData, patrocinador_id: e.target.value })}
                placeholder="Ingresa el ID de tu patrocinador"
              />
              <p className="text-xs text-gray-400 mt-1">Si tienes un patrocinador, ingresa su ID aquí.</p>
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