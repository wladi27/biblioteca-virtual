import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  CreditCard,
  Building2,
  Lock,
  Eye,
  EyeOff,
  Phone,
  MessageSquare,
  Sprout,
  CheckCircle2,
  AlertCircle,
  Copy,
  Layers,
  Loader2,
  Globe,
  Leaf
} from 'lucide-react';
import { countries } from '../lib/countries';

export const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre_completo: '',
    dni: '',
    correo_electronico: '',
    pais: 'Colombia',
    linea_llamadas: '',
    linea_whatsapp: '',
    banco: '',
    cuenta_numero: '',
    titular_cuenta: '',
    nombre_usuario: '',
    contraseña: '',
    confirmar_contraseña: '',
    codigo_referido: '',
    patrocinador_id: '',
  });

  const [phoneCodeLlamadas, setPhoneCodeLlamadas] = useState('57');
  const [phoneCodeWhatsapp, setPhoneCodeWhatsapp] = useState('57');
  const [cantidadCuentas, setCantidadCuentas] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [usuariosCreados, setUsuariosCreados] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const usuariosRef = useRef<HTMLTextAreaElement>(null);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCountry = countries.find((c) => c.name === e.target.value);
    setFormData({ ...formData, pais: e.target.value });
    if (selectedCountry) {
      setPhoneCodeLlamadas(selectedCountry.phone);
      setPhoneCodeWhatsapp(selectedCountry.phone);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (formData.contraseña !== formData.confirmar_contraseña) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    if (formData.contraseña.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);

    let exitos = 0;
    const usuarios: string[] = [];
    const usuariosIds: string[] = [];
    const apiUrl = import.meta.env.VITE_URL_LOCAL || import.meta.env.VITE_API_URL || 'http://localhost:5005';

    for (let i = 0; i < cantidadCuentas; i++) {
      const usuarioNombre = i === 0 ? formData.nombre_usuario.trim() : `${formData.nombre_usuario.trim()}${i}`;
      const datosRegistro = {
        ...formData,
        nombre_completo: formData.nombre_completo.trim(),
        nombre_usuario: usuarioNombre,
        correo_electronico: formData.correo_electronico.trim().toLowerCase(),
        dni: formData.dni.trim(),
        contraseña: formData.contraseña.trim(),
        linea_llamadas: `+${phoneCodeLlamadas}${formData.linea_llamadas.trim()}`,
        linea_whatsapp: `+${phoneCodeWhatsapp}${formData.linea_whatsapp.trim()}`,
        cuenta_numero: formData.cuenta_numero.trim(),
        banco: formData.banco.trim(),
        titular_cuenta: (formData.titular_cuenta || formData.nombre_completo).trim(),
        codigo_referido: formData.codigo_referido?.trim() || undefined,
      };

      try {
        const response = await fetch(`${apiUrl}/usuarios`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(datosRegistro),
        });

        const data = await response.json();

        if (response.ok) {
          exitos++;
          usuarios.push(data.nombre_usuario || usuarioNombre);
          usuariosIds.push(data._id);
        } else {
          setErrorMessage(data.message || 'Error al registrar la cuenta.');
          break;
        }
      } catch (fetchError) {
        console.error('Error de red al registrar usuario:', fetchError);
        setErrorMessage('Error al conectar con el servidor.');
        break;
      }
    }

    setLoading(false);

    if (exitos > 0) {
      setUsuariosCreados(usuarios);
      setShowSuccessModal(true);
      setSuccessMessage(`¡Se han registrado ${exitos} cuenta(s) en la granja con éxito!`);
    }
  };

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(usuariosCreados.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#070D0B] text-slate-100 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-emerald-500 selection:text-white">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-600/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

      {/* Top back button */}
      <div className="max-w-3xl mx-auto mb-6">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-emerald-300 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span>Volver a la página principal</span>
        </Link>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Brand & Header */}
        <div className="text-center mb-10">
          <div className="inline-flex h-14 w-14 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-amber-400 p-[1px] shadow-xl shadow-emerald-500/25 mb-4">
            <div className="h-full w-full bg-[#0A1410] rounded-[15px] flex items-center justify-center">
              <Sprout className="h-7 w-7 text-emerald-400" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-heading">
            Registro de Inversionista
          </h1>
          <p className="mt-2 text-slate-400 text-sm sm:text-base">
            Granja Raíz de Vida • Siembra tu capital en la producción sostenible del campo
          </p>
        </div>

        {/* Register Card */}
        <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-emerald-500/20 shadow-2xl bg-[#0A1410]/80 backdrop-blur-2xl">
          {errorMessage && (
            <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-300 text-sm animate-fadeIn">
              <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 1. Datos Personales */}
            <div>
              <div className="flex items-center gap-2.5 mb-4 pb-2 border-b border-emerald-500/10">
                <div className="h-7 w-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold font-mono">
                  1
                </div>
                <h3 className="text-base font-bold text-white font-heading">Información Personal</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-2">
                    Nombre Completo *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="ej. Mauricio Restrepo"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                      value={formData.nombre_completo}
                      onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-2">
                    Documento de Identidad (DNI) *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="ej. 1098765432"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                      value={formData.dni}
                      onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-2">
                    Correo Electrónico *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      required
                      placeholder="inversionista@ejemplo.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                      value={formData.correo_electronico}
                      onChange={(e) => setFormData({ ...formData, correo_electronico: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-2">
                    País de Residencia *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Globe className="h-4 w-4" />
                    </div>
                    <select
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                      value={formData.pais}
                      onChange={handleCountryChange}
                    >
                      {countries.map((c) => (
                        <option key={c.code} value={c.name} className="bg-slate-900 text-white">
                          {c.name} (+{c.phone})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Información de Contacto */}
            <div>
              <div className="flex items-center gap-2.5 mb-4 pb-2 border-b border-emerald-500/10">
                <div className="h-7 w-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center text-xs font-bold font-mono">
                  2
                </div>
                <h3 className="text-base font-bold text-white font-heading">Teléfono & Notificaciones</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-2">
                    Línea de Llamadas *
                  </label>
                  <div className="flex rounded-xl overflow-hidden shadow-sm border border-slate-700/80 focus-within:ring-2 focus-within:ring-teal-500/50">
                    <span className="inline-flex items-center px-3 bg-slate-800 text-slate-400 text-xs font-mono border-r border-slate-700">
                      +{phoneCodeLlamadas}
                    </span>
                    <input
                      type="tel"
                      required
                      placeholder="3001234567"
                      className="w-full px-3 py-2.5 bg-slate-900/90 text-white placeholder-slate-500 text-sm focus:outline-none"
                      value={formData.linea_llamadas}
                      onChange={(e) => setFormData({ ...formData, linea_llamadas: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-2">
                    Línea WhatsApp *
                  </label>
                  <div className="flex rounded-xl overflow-hidden shadow-sm border border-slate-700/80 focus-within:ring-2 focus-within:ring-teal-500/50">
                    <span className="inline-flex items-center px-3 bg-slate-800 text-slate-400 text-xs font-mono border-r border-slate-700">
                      +{phoneCodeWhatsapp}
                    </span>
                    <input
                      type="tel"
                      required
                      placeholder="3001234567"
                      className="w-full px-3 py-2.5 bg-slate-900/90 text-white placeholder-slate-500 text-sm focus:outline-none"
                      value={formData.linea_whatsapp}
                      onChange={(e) => setFormData({ ...formData, linea_whatsapp: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Datos Bancarios */}
            <div>
              <div className="flex items-center gap-2.5 mb-4 pb-2 border-b border-emerald-500/10">
                <div className="h-7 w-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold font-mono">
                  3
                </div>
                <h3 className="text-base font-bold text-white font-heading">Cuenta Bancaria para Retiro de Rendimientos</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-2">
                    Banco / Billetera *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="ej. Bancolombia / Nequi"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                      value={formData.banco}
                      onChange={(e) => setFormData({ ...formData, banco: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-2">
                    Número de Cuenta *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej. 1234567890"
                    className="w-full px-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 font-mono"
                    value={formData.cuenta_numero}
                    onChange={(e) => setFormData({ ...formData, cuenta_numero: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-2">
                    Titular de la Cuenta *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nombre del titular"
                    className="w-full px-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                    value={formData.titular_cuenta}
                    onChange={(e) => setFormData({ ...formData, titular_cuenta: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* 4. Seguridad y Referido */}
            <div>
              <div className="flex items-center gap-2.5 mb-4 pb-2 border-b border-emerald-500/10">
                <div className="h-7 w-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center text-xs font-bold font-mono">
                  4
                </div>
                <h3 className="text-base font-bold text-white font-heading">Credenciales & Patrocinio</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-2">
                    Nombre de Usuario *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="ej. inversionista_agro"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                      value={formData.nombre_usuario}
                      onChange={(e) => setFormData({ ...formData, nombre_usuario: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-2">
                    Código de Invitación (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Código de tu embajador"
                    className="w-full px-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                    value={formData.codigo_referido}
                    onChange={(e) => setFormData({ ...formData, codigo_referido: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-2">
                    Contraseña *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Mínimo 6 caracteres"
                      className="w-full pl-10 pr-11 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                      value={formData.contraseña}
                      onChange={(e) => setFormData({ ...formData, contraseña: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-2">
                    Confirmar Contraseña *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="Repite tu contraseña"
                      className="w-full pl-10 pr-11 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                      value={formData.confirmar_contraseña}
                      onChange={(e) => setFormData({ ...formData, confirmar_contraseña: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Crear múltiples participaciones simultáneas */}
            <div className="p-4 rounded-2xl bg-[#0D2018]/50 border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Registro de Múltiples Posiciones</h4>
                  <p className="text-xs text-slate-400">Abre varias participaciones simultáneas en la granja</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300">Cantidad:</span>
                <select
                  value={cantidadCuentas}
                  onChange={(e) => setCantidadCuentas(Number(e.target.value))}
                  className="bg-slate-900 border border-emerald-500/30 rounded-lg px-3 py-1.5 text-sm text-white font-bold"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'cuenta' : 'cuentas'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:opacity-95 text-white font-bold text-base shadow-xl shadow-emerald-600/25 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Registrando {cantidadCuentas > 1 ? `${cantidadCuentas} posiciones` : 'inversionista'}...</span>
                  </>
                ) : (
                  <>
                    <Sprout className="h-5 w-5" />
                    <span>Completar Registro de Inversionista</span>
                    <CheckCircle2 className="h-5 w-5 ml-1" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer link */}
          <div className="mt-8 pt-6 border-t border-emerald-500/10 text-center">
            <p className="text-sm text-slate-400">
              ¿Ya tienes una cuenta registrada en la granja?{' '}
              <Link to="/login" className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Modal de Éxito con Lista de Cuentas */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#0A1410] border border-emerald-500/20 rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 text-center">
            <div className="h-16 w-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <h3 className="text-2xl font-extrabold text-white font-heading mb-2">
              ¡Registro Exitoso!
            </h3>
            <p className="text-sm text-slate-300 mb-6">
              Tus participaciones en Granja Raíz de Vida han sido creadas correctamente.
            </p>

            <div className="bg-slate-900/80 border border-emerald-500/20 rounded-xl p-4 mb-6 text-left">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase text-slate-400">Usuarios Creados:</span>
                <button
                  onClick={handleCopy}
                  className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>{copied ? '¡Copiados!' : 'Copiar'}</span>
                </button>
              </div>
              <div className="max-h-40 overflow-y-auto font-mono text-sm text-emerald-400 space-y-1">
                {usuariosCreados.map((u, i) => (
                  <div key={i} className="py-1 px-2 rounded bg-slate-800/60 flex items-center justify-between">
                    <span>{u}</span>
                    <span className="text-[10px] text-slate-400">Posición #{i + 1}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setShowSuccessModal(false);
                navigate('/login');
              }}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-colors"
            >
              Ir a Iniciar Sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
};