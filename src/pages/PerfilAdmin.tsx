import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Background } from '../components/Background';
import { AdminNav } from '../components/AdminNav';
import { 
  ShieldCheck, 
  User, 
  Edit3, 
  DollarSign, 
  Wallet, 
  TrendingUp, 
  KeyRound, 
  Download, 
  LogOut, 
  CheckCircle2, 
  Users, 
  X, 
  Search, 
  Loader2, 
  Save, 
  Layers,
  ArrowUpRight,
  Shield,
  FileSpreadsheet
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const PerfilAdmin = () => {
  const [username, setUsername] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUserId, setEditUserId] = useState('');
  const [editUserData, setEditUserData] = useState<any>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  const navigate = useNavigate();

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    };
  };

  const getApiUrl = () => {
    return import.meta.env.VITE_URL_LOCAL || import.meta.env.VITE_API_URL || 'http://localhost:5005';
  };

  useEffect(() => {
    const usuario = localStorage.getItem('usuario');
    if (usuario) {
      try {
        const userData = JSON.parse(usuario);
        setUsername(userData.nombre_completo || userData.nombre_usuario || 'Super-Administrador');
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleLogout = () => {
    setShowLogoutModal(false);
    useAuthStore.getState().logout();
    navigate('/BV/auth/login');
  };

  const handleEditUserSearch = async () => {
    if (!editUserId.trim()) return;
    setEditLoading(true);
    setEditError('');
    setEditSuccess('');
    setEditUserData(null);
    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/usuarios/${editUserId.trim()}`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Usuario no encontrado con ese ID.');
      const data = await res.json();
      setEditUserData(data);
    } catch (err: any) {
      setEditError(err.message || 'Error al buscar usuario');
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditUserData({ ...editUserData, [e.target.name]: e.target.value });
  };

  const handleEditUserSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');
    setEditSuccess('');
    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/api/usuario/${editUserId.trim()}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(editUserData),
      });
      if (!res.ok) throw new Error('Error al guardar los cambios del usuario');
      setEditSuccess('¡Usuario actualizado exitosamente!');
      setTimeout(() => {
        setShowEditModal(false);
        setEditSuccess('');
      }, 1500);
    } catch (err: any) {
      setEditError(err.message || 'Error al guardar');
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06110D] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      <Background />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex-grow w-full">
        {/* Cabecera del Perfil de Administrador */}
        <div className="relative rounded-3xl p-6 sm:p-8 mb-8 overflow-hidden border border-emerald-500/25 bg-gradient-to-r from-[#0B251B] via-[#091F17] to-[#071711] shadow-2xl shadow-emerald-950/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-slate-950 font-extrabold text-2xl sm:text-3xl font-mono shadow-xl shadow-emerald-500/20 shrink-0">
                {username ? username.charAt(0).toUpperCase() : 'A'}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs uppercase tracking-wider font-semibold text-emerald-400 font-mono">
                    @{username || 'admin'}
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    <span>Super-Administrador</span>
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
                  {username || 'Administrador'}
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Acceso con privilegios totales sobre la plataforma Granja Raíz de Vida
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowLogoutModal(true)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-500/15 border border-rose-500/35 text-rose-300 hover:text-white hover:bg-rose-500/25 hover:border-rose-500/50 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 shrink-0"
            >
              <LogOut className="h-4 w-4 text-rose-400" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>

        {/* Módulos y Herramientas Administrativas */}
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 font-heading">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block"></span>
          Herramientas de Gestión y Configuración
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {/* 1. Editar Usuario */}
          <div
            onClick={() => {
              setShowEditModal(true);
              setEditUserId('');
              setEditUserData(null);
              setEditError('');
              setEditSuccess('');
            }}
            className="glass-card p-5 rounded-2xl border border-emerald-500/20 bg-[#0A1812]/80 hover:border-emerald-500/45 hover:bg-[#0D2018] transition-all cursor-pointer group shadow-lg flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform">
                <Edit3 className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">Editar Inversionista</p>
                <p className="text-xs text-slate-400">Modificar datos de cualquier usuario</p>
              </div>
            </div>
            <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
          </div>

          {/* 2. Validar Aportes */}
          <Link
            to="/BV/validar"
            className="glass-card p-5 rounded-2xl border border-emerald-500/20 bg-[#0A1812]/80 hover:border-emerald-500/45 hover:bg-[#0D2018] transition-all group shadow-lg flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">Validar Aportes</p>
                <p className="text-xs text-slate-400">Aprobar solicitudes pendientes</p>
              </div>
            </div>
            <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
          </Link>

          {/* 3. Recarga Masiva */}
          <Link
            to="/BV/recarga-masiva"
            className="glass-card p-5 rounded-2xl border border-emerald-500/20 bg-[#0A1812]/80 hover:border-emerald-500/45 hover:bg-[#0D2018] transition-all group shadow-lg flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">Recarga Masiva Diaria</p>
                <p className="text-xs text-slate-400">Abonos y rendimientos programados</p>
              </div>
            </div>
            <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
          </Link>

          {/* 4. Comisiones */}
          <Link
            to="/BV/comisiones"
            className="glass-card p-5 rounded-2xl border border-emerald-500/20 bg-[#0A1812]/80 hover:border-emerald-500/45 hover:bg-[#0D2018] transition-all group shadow-lg flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">Planes de Compensación</p>
                <p className="text-xs text-slate-400">Gestionar tablas de pagos por rango</p>
              </div>
            </div>
            <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
          </Link>

          {/* 5. Recargar Billetera Individual */}
          <Link
            to="/BV/recarga"
            className="glass-card p-5 rounded-2xl border border-emerald-500/20 bg-[#0A1812]/80 hover:border-emerald-500/45 hover:bg-[#0D2018] transition-all group shadow-lg flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">Recargar Billetera</p>
                <p className="text-xs text-slate-400">Abonar saldo a socio individual</p>
              </div>
            </div>
            <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
          </Link>

          {/* 6. Billeteras Faltantes */}
          <Link
            to="/admin/billeteras-faltantes"
            className="glass-card p-5 rounded-2xl border border-emerald-500/20 bg-[#0A1812]/80 hover:border-emerald-500/45 hover:bg-[#0D2018] transition-all group shadow-lg flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">Billeteras Faltantes</p>
                <p className="text-xs text-slate-400">Control de billeteras pendientes</p>
              </div>
            </div>
            <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
          </Link>

          {/* 7. Resetear Contraseñas */}
          <Link
            to="/BV/restaurar-password"
            className="glass-card p-5 rounded-2xl border border-emerald-500/20 bg-[#0A1812]/80 hover:border-emerald-500/45 hover:bg-[#0D2018] transition-all group shadow-lg flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">Restaurar Contraseñas</p>
                <p className="text-xs text-slate-400">Soporte y desbloqueo de acceso</p>
              </div>
            </div>
            <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
          </Link>

          {/* 8. Descargar Reportes */}
          <Link
            to="/BV/descargar-datos"
            className="glass-card p-5 rounded-2xl border border-emerald-500/20 bg-[#0A1812]/80 hover:border-emerald-500/45 hover:bg-[#0D2018] transition-all group shadow-lg flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">Descargar Reportes</p>
                <p className="text-xs text-slate-400">Exportar base de datos a Excel/CSV</p>
              </div>
            </div>
            <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
          </Link>

          {/* 9. Red Global */}
          <Link
            to="/BV/red"
            className="glass-card p-5 rounded-2xl border border-emerald-500/20 bg-[#0A1812]/80 hover:border-emerald-500/45 hover:bg-[#0D2018] transition-all group shadow-lg flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">Red Global de Inversión</p>
                <p className="text-xs text-slate-400">Inspeccionar matriz de 12 niveles</p>
              </div>
            </div>
            <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
          </Link>
        </div>
      </main>

      {/* MODAL: Editar Usuario */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0A1812] border border-emerald-500/30 rounded-3xl max-w-lg w-full shadow-2xl p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-emerald-500/20">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Edit3 className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-white font-heading">Editar Inversionista</h3>
              </div>
              <button 
                onClick={() => setShowEditModal(false)}
                className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Buscador de usuario por ID */}
            <div className="flex gap-2 mb-5">
              <input
                type="text"
                placeholder="ID del usuario a modificar..."
                value={editUserId}
                onChange={(e) => setEditUserId(e.target.value)}
                className="flex-1 p-2.5 bg-slate-900/90 border border-emerald-500/20 rounded-xl text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={handleEditUserSearch}
                disabled={editLoading || !editUserId.trim()}
                className="px-4 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 font-bold text-xs rounded-xl transition-colors disabled:opacity-50"
              >
                {editLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Buscar'}
              </button>
            </div>

            {editError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                {editError}
              </div>
            )}

            {editSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs">
                {editSuccess}
              </div>
            )}

            {editUserData && (
              <form onSubmit={handleEditUserSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    name="nombre_completo"
                    value={editUserData.nombre_completo || ''}
                    onChange={handleEditUserChange}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-emerald-500/20 text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre de Usuario</label>
                    <input
                      type="text"
                      name="nombre_usuario"
                      value={editUserData.nombre_usuario || ''}
                      onChange={handleEditUserChange}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-emerald-500/20 text-white text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">DNI / Documento</label>
                    <input
                      type="text"
                      name="dni"
                      value={editUserData.dni || ''}
                      onChange={handleEditUserChange}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-emerald-500/20 text-white text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    name="correo_electronico"
                    value={editUserData.correo_electronico || ''}
                    onChange={handleEditUserChange}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-emerald-500/20 text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Teléfono Llamadas</label>
                    <input
                      type="text"
                      name="linea_llamadas"
                      value={editUserData.linea_llamadas || ''}
                      onChange={handleEditUserChange}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-emerald-500/20 text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">WhatsApp</label>
                    <input
                      type="text"
                      name="linea_whatsapp"
                      value={editUserData.linea_whatsapp || ''}
                      onChange={handleEditUserChange}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-emerald-500/20 text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Banco</label>
                    <input
                      type="text"
                      name="banco"
                      value={editUserData.banco || ''}
                      onChange={handleEditUserChange}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-emerald-500/20 text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Número de Cuenta</label>
                    <input
                      type="text"
                      name="cuenta_numero"
                      value={editUserData.cuenta_numero || ''}
                      onChange={handleEditUserChange}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-emerald-500/20 text-white text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                  >
                    {editLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    <span>Guardar Cambios</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Cerrar Sesión */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0A1812] border border-emerald-500/30 rounded-3xl max-w-sm w-full shadow-2xl p-6 sm:p-7 text-center">
            <div className="h-14 w-14 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-3.5">
              <LogOut className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold text-white font-heading">¿Cerrar Sesión Admin?</h3>
            <p className="text-xs text-slate-300 mt-1.5 mb-6 leading-relaxed">
              Tu sesión de administración se cerrará de forma segura.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-lg shadow-rose-600/30 active:scale-95"
              >
                Sí, Salir
              </button>
            </div>
          </div>
        </div>
      )}

      <br /><br />
      <AdminNav />
    </div>
  );
};