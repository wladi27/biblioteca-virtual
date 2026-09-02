import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Background } from '../components/Background';
import {
  ShieldCheck,
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Sprout,
  KeyRound
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const LoginAdmin = () => {
  const navigate = useNavigate();
  const loginUser = useAuthStore((state) => state.login);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAdmin = useAuthStore((state) => state.isAdmin);

  const [credentials, setCredentials] = useState({
    nombre_usuario: '',
    contraseña: '',
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      navigate('/BV/dashboard');
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_URL_LOCAL || import.meta.env.VITE_API_URL || 'http://localhost:5005';
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: credentials.nombre_usuario.trim(),
          password: credentials.contraseña.trim(),
          nombre_usuario: credentials.nombre_usuario.trim(),
          contraseña: credentials.contraseña.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        const adminUser = data.usuario || data.admin || { rol: 'admin', nombre_usuario: credentials.nombre_usuario };
        adminUser.rol = 'admin';
        loginUser(data.token, adminUser);
        navigate('/BV/dashboard');
      } else {
        setErrorMessage(data.message || 'Credenciales de administrador inválidas.');
      }
    } catch (error) {
      console.error('Error al iniciar sesión de admin:', error);
      setErrorMessage('Error al conectar con el servidor. Revisa tu conexión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06110D] text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-emerald-500 selection:text-white">
      <Background />

      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl pointer-events-none -z-10"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Link volver */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-emerald-400 mb-6 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span>Volver a la página principal</span>
        </Link>

        {/* Logo y Encabezado */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-[#0B251B] border border-emerald-500/30 text-emerald-400 shadow-xl shadow-emerald-950/50 mb-3.5">
            <ShieldCheck className="h-9 w-9 text-emerald-400" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold uppercase tracking-wider mb-2">
            <KeyRound className="h-3 w-3" />
            <span>Acceso Administrativo</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading">
            Granja Raíz de Vida
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Panel central de control, validaciones y supervisión general
          </p>
        </div>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="glass-card bg-[#0A1812]/90 border border-emerald-500/25 p-7 sm:p-9 rounded-3xl shadow-2xl shadow-emerald-950/60 backdrop-blur-xl">
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Usuario Administrador
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={credentials.nombre_usuario}
                  onChange={(e) => setCredentials({ ...credentials, nombre_usuario: e.target.value })}
                  placeholder="admin / usuario de gestión"
                  className="w-full pl-10 pr-4 py-3 bg-[#06110D]/90 border border-emerald-500/25 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Contraseña de Seguridad
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={credentials.contraseña}
                  onChange={(e) => setCredentials({ ...credentials, contraseña: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-11 py-3 bg-[#06110D]/90 border border-emerald-500/25 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Verificando credenciales...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    <span>Ingresar al Panel Administrativo</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-emerald-500/15 text-center text-xs text-slate-400 flex flex-col gap-2">
            <p>
              ¿Eres socio inversionista?{' '}
              <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors">
                Ingresa al portal de usuarios aquí
              </Link>
            </p>
          </div>
        </div>


      </div>
    </div>
  );
};