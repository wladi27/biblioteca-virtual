import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, User, Lock, Eye, EyeOff, Loader2, Sprout, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const Login = () => {
  const navigate = useNavigate();
  const loginUser = useAuthStore((state) => state.login);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const user = useAuthStore((state) => state.user);
  const isAdmin = useAuthStore((state) => state.isAdmin);

  const [credentials, setCredentials] = useState({
    nombre_usuario: '',
    contraseña: '',
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      if (isAdmin || user?.rol === 'admin' || user?.rol === 'superadmin') {
        navigate('/BV/dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, isAdmin, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_URL_LOCAL || import.meta.env.VITE_API_URL || 'http://localhost:5005';
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre_usuario: credentials.nombre_usuario.trim(),
          contraseña: credentials.contraseña.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        loginUser(data.token, data.usuario);
        const esAdmin = data.usuario?.rol === 'admin' || data.usuario?.rol === 'superadmin' || localStorage.getItem('isAdmin') === 'true';
        if (esAdmin) {
          navigate('/BV/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        setErrorMessage(data.message || 'Credenciales inválidas. Por favor verifica tus datos.');
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      setErrorMessage('No se pudo conectar con el servidor. Revisa tu conexión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070D0B] text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-emerald-500 selection:text-white">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

      {/* Top navigation back button */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 mb-6">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-emerald-300 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span>Volver al inicio</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-amber-400 p-[1px] shadow-xl shadow-emerald-500/25 mb-4">
            <div className="h-full w-full bg-[#0A1410] rounded-[15px] flex items-center justify-center">
              <Sprout className="h-7 w-7 text-emerald-400" />
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
            Granja Raíz de Vida
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Accede a tu panel de inversionista y gestiona tu billetera
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-panel py-8 px-6 sm:px-10 rounded-3xl border border-emerald-500/20 shadow-2xl bg-[#0A1410]/80 backdrop-blur-2xl">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-300 text-sm animate-fadeIn">
              <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Input */}
            <div>
              <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-2">
                Nombre de Usuario
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="ej. inversionista123"
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  value={credentials.nombre_usuario}
                  onChange={(e) => setCredentials({ ...credentials, nombre_usuario: e.target.value })}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-2">
                Contraseña
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  value={credentials.contraseña}
                  onChange={(e) => setCredentials({ ...credentials, contraseña: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:opacity-95 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Iniciando sesión...</span>
                  </>
                ) : (
                  <span>Acceder a mi Panel</span>
                )}
              </button>
            </div>
          </form>

          {/* Bottom links */}
          <div className="mt-8 pt-6 border-t border-emerald-500/10 text-center space-y-3">
            <p className="text-sm text-slate-400">
              ¿Deseas participar en la granja?{' '}
              <Link to="/register" className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
                Regístrate aquí
              </Link>
            </p>
            <p className="text-xs text-slate-500">
              ¿Eres administrador?{' '}
              <Link to="/BV/auth/login" className="text-emerald-400/80 hover:underline">
                Acceso Administrativo
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
