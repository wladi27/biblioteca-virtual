import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Background } from '../components/Background';
import { MobileNav } from '../components/MobileNav';
import { 
  User, 
  Mail, 
  Phone, 
  CreditCard, 
  Building2, 
  Clipboard, 
  CheckCircle2, 
  Lock, 
  KeyRound, 
  QrCode, 
  LogOut, 
  Edit3, 
  Trash2, 
  Plus, 
  X, 
  Sparkles, 
  ShieldCheck, 
  Check, 
  Loader2,
  Users
} from 'lucide-react';
import ChangePasswordModal from '../components/ChangePasswordModal';
import { useAuthStore } from '../store/authStore';

export const Perfil = () => {
  const [userData, setUserData] = useState<any>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showCodesModal, setShowCodesModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [codes, setCodes] = useState<any[]>([]);
  const [loadingCodes, setLoadingCodes] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isCopied, setIsCopied] = useState<Record<string, boolean>>({});
  const [aporteVerificado, setAporteVerificado] = useState(false);
  const [estadoAporte, setEstadoAporte] = useState<'verificado' | 'pendiente' | 'sin_aporte'>('sin_aporte');
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const navigate = useNavigate();

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 3500);
  };

  const handleCopyToClipboard = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setIsCopied(prev => ({ ...prev, [id]: true }));
      showNotification('Copiado al portapapeles', 'success');
      setTimeout(() => {
        setIsCopied(prev => ({ ...prev, [id]: false }));
      }, 2000);
    }).catch(() => {
      showNotification('Error al copiar', 'error');
    });
  };

  const checkAporte = async (userId: string) => {
    if (!userId) return;
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_URL_LOCAL || import.meta.env.VITE_API_URL || 'http://localhost:5005';
      const response = await fetch(`${apiUrl}/api/aportes/estado/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAporteVerificado(data.verificado || false);
        setEstadoAporte(data.estado || (data.verificado ? 'verificado' : 'sin_aporte'));
      }
    } catch (error) {
      console.error('Error aporte:', error);
    }
  };

  const fetchCodes = async (userId: string) => {
    if (!userId) return;
    setLoadingCodes(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_URL_LOCAL || import.meta.env.VITE_API_URL || 'http://localhost:5005';
      const response = await fetch(`${apiUrl}/api/referralCodes/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCodes(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching codes:', error);
    } finally {
      setLoadingCodes(false);
    }
  };

  const fetchFreshUser = async (userId: string) => {
    if (!userId) return;
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_URL_LOCAL || import.meta.env.VITE_API_URL || 'http://localhost:5005';
      const response = await fetch(`${apiUrl}/auth/usuario/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setUserData(data);
          setEditFormData(data);
          localStorage.setItem('usuario', JSON.stringify(data));
        }
      }
    } catch (e) {
      console.error('Error fetching fresh user:', e);
    }
  };

  const handleCreateCode = async () => {
    if (!userData?._id) return;
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_URL_LOCAL || import.meta.env.VITE_API_URL || 'http://localhost:5005';
      const response = await fetch(`${apiUrl}/api/referralCodes`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ userId: userData._id }),
      });
      if (response.ok) {
        const newCode = await response.json();
        setCodes(prev => [...prev, newCode]);
        showNotification('Código de referido generado con éxito', 'success');
      } else {
        showNotification('No se pudo generar el código', 'error');
      }
    } catch (error) {
      showNotification('Error al crear código', 'error');
    }
  };

  const handleDeleteCode = async (codeId: string) => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_URL_LOCAL || import.meta.env.VITE_API_URL || 'http://localhost:5005';
      const response = await fetch(`${apiUrl}/api/referralCodes/${codeId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        setCodes(codes.filter(c => c._id !== codeId));
        showNotification('Código eliminado correctamente', 'success');
      } else {
        showNotification('Error al eliminar código', 'error');
      }
    } catch (error) {
      showNotification('Error al eliminar código', 'error');
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData?._id) return;
    setUpdateLoading(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_URL_LOCAL || import.meta.env.VITE_API_URL || 'http://localhost:5005';
      const response = await fetch(`${apiUrl}/auth/usuario/${userData._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editFormData),
      });

      if (response.ok) {
        const updated = await response.json();
        const userObj = updated.usuario || editFormData;
        localStorage.setItem('usuario', JSON.stringify(userObj));
        setUserData(userObj);
        setShowUpdateModal(false);
        showNotification('Perfil actualizado exitosamente', 'success');
      } else {
        showNotification('Error al guardar los cambios', 'error');
      }
    } catch (error) {
      showNotification('Error al conectar con el servidor', 'error');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleChangePassword = async (newPassword: string) => {
    if (!userData?._id) return;
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_URL_LOCAL || import.meta.env.VITE_API_URL || 'http://localhost:5005';
      const response = await fetch(`${apiUrl}/auth/password/${userData._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ nuevaContraseña: newPassword }),
      });
      if (response.ok) {
        setShowChangePasswordModal(false);
        showNotification('Contraseña actualizada con éxito', 'success');
      } else {
        showNotification('Error al cambiar contraseña', 'error');
      }
    } catch (error) {
      showNotification('Error al actualizar contraseña', 'error');
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(false);
    useAuthStore.getState().logout();
    navigate('/login');
  };

  useEffect(() => {
    const raw = localStorage.getItem('usuario');
    if (!raw) {
      navigate('/login');
      return;
    }

    try {
      const user = JSON.parse(raw);
      if (!user || (!user._id && !user.id)) {
        navigate('/login');
        return;
      }

      setUserData(user);
      setEditFormData(user);

      const uId = user._id || user.id;
      Promise.allSettled([
        checkAporte(uId),
        fetchCodes(uId),
        fetchFreshUser(uId)
      ]).finally(() => {
        setLoadingProfile(false);
      });
    } catch (e) {
      console.error(e);
      navigate('/login');
    }
  }, [navigate]);

  const userDisplayName = userData?.nombre_completo || userData?.nombre_usuario || 'Inversionista';
  const userInitial = userDisplayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#06110D] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white pb-24">
      <Background />

      {/* Toast Notification */}
      {notification.message && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-2xl shadow-2xl z-50 flex items-center gap-2 text-sm font-semibold border animate-fade-in ${
          notification.type === 'success' 
            ? 'bg-[#0E241C] border-emerald-500 text-emerald-300 shadow-emerald-950/50' 
            : 'bg-[#2A0E12] border-rose-500 text-rose-300'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <X className="h-4 w-4" />}
          <span>{notification.message}</span>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex-grow w-full">
        {/* Cabecera de Perfil con Skeletons */}
        {loadingProfile || !userData ? (
          <div className="relative rounded-3xl p-6 sm:p-8 mb-8 overflow-hidden border border-emerald-500/20 bg-gradient-to-r from-[#0B251B] via-[#091F17] to-[#071711] shadow-2xl animate-pulse">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-emerald-500/20 shrink-0"></div>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className="h-4 w-24 bg-emerald-500/20 rounded"></div>
                    <div className="h-4 w-32 bg-slate-800 rounded-full"></div>
                  </div>
                  <div className="h-7 w-52 bg-slate-700 rounded-lg"></div>
                  <div className="h-4 w-64 bg-slate-800 rounded"></div>
                </div>
              </div>
              <div className="h-10 w-32 bg-rose-500/20 rounded-xl"></div>
            </div>
          </div>
        ) : (
          <div className="relative rounded-3xl p-6 sm:p-8 mb-8 overflow-hidden border border-emerald-500/25 bg-gradient-to-r from-[#0B251B] via-[#091F17] to-[#071711] shadow-2xl shadow-emerald-950/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-slate-950 font-extrabold text-2xl sm:text-3xl font-mono shadow-xl shadow-emerald-500/20 shrink-0">
                  {userInitial}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-xs uppercase tracking-wider font-semibold text-emerald-400 font-mono">
                      @{userData?.nombre_usuario || 'socio'}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      estadoAporte === 'verificado'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                        : estadoAporte === 'pendiente'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    }`}>
                      {estadoAporte === 'verificado' ? '✓ Inversionista Verificado' : estadoAporte === 'pendiente' ? '⏳ Aporte en Revisión' : '⚠️ Sin Aporte Inicial'}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
                    {userDisplayName}
                  </h1>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400">
                    <span>ID de Socio:</span>
                    <span className="font-mono text-emerald-300 font-bold">{userData?._id || ''}</span>
                    {userData?._id && (
                      <button
                        onClick={() => handleCopyToClipboard(userData._id, 'top-id')}
                        className="text-slate-400 hover:text-emerald-300 ml-1 p-1"
                        title="Copiar ID"
                      >
                        {isCopied['top-id'] ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Clipboard className="h-3.5 w-3.5" />}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Botón de Cerrar Sesión en Cabecera */}
              <button
                onClick={() => setShowLogoutModal(true)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-500/15 border border-rose-500/35 text-rose-300 hover:text-white hover:bg-rose-500/25 hover:border-rose-500/50 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 shrink-0"
              >
                <LogOut className="h-4 w-4 text-rose-400" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        )}

        {/* 2 Bloques de Información: Personal & Bancaria */}
        {loadingProfile || !userData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={`skel-perfil-card-${i}`} className="glass-card p-6 rounded-3xl border border-emerald-500/15 bg-[#0A1812]/70 animate-pulse space-y-4">
                <div className="h-5 w-48 bg-emerald-500/20 rounded"></div>
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={`skel-row-${i}-${j}`} className="flex justify-between items-center p-3 rounded-xl bg-[#0D2018]/40">
                    <div className="h-4 w-28 bg-slate-800 rounded"></div>
                    <div className="h-4 w-36 bg-slate-700 rounded"></div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Bloque 1: Datos Personales y Contacto */}
            <div className="glass-card p-6 rounded-3xl border border-emerald-500/20 bg-[#0A1812]/80 shadow-xl">
              <h2 className="text-lg font-bold text-white font-heading mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-emerald-400" />
                Información de Contacto
              </h2>

              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#0D2018]/60 border border-emerald-500/15">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-emerald-400" />
                    <span className="text-slate-400">Correo Electrónico</span>
                  </div>
                  <span className="font-medium text-white truncate max-w-[200px]">
                    {userData?.correo_electronico || 'No especificado'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#0D2018]/60 border border-emerald-500/15">
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-emerald-400" />
                    <span className="text-slate-400">Línea de Llamadas</span>
                  </div>
                  <span className="font-mono text-white">
                    {userData?.linea_llamadas || 'No registrado'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#0D2018]/60 border border-emerald-500/15">
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-emerald-400" />
                    <span className="text-slate-400">WhatsApp</span>
                  </div>
                  <span className="font-mono text-emerald-300 font-bold">
                    {userData?.linea_whatsapp || 'No registrado'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#0D2018]/60 border border-emerald-500/15">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-4 w-4 text-emerald-400" />
                    <span className="text-slate-400">Documento / Cédula</span>
                  </div>
                  <span className="font-mono text-white">
                    {userData?.dni || 'No registrado'}
                  </span>
                </div>
              </div>
            </div>

            {/* Bloque 2: Datos Bancarios para Retiros */}
            <div className="glass-card p-6 rounded-3xl border border-emerald-500/20 bg-[#0A1812]/80 shadow-xl">
              <h2 className="text-lg font-bold text-white font-heading mb-4 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-emerald-400" />
                Datos Bancarios para Retiros
              </h2>

              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#0D2018]/60 border border-emerald-500/15">
                  <span className="text-slate-400">Entidad Bancaria:</span>
                  <span className="font-bold text-white">
                    {userData?.banco || 'Bancolombia / Nequi'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#0D2018]/60 border border-emerald-500/15">
                  <span className="text-slate-400">Número de Cuenta:</span>
                  <span className="font-mono text-emerald-300 font-bold">
                    {userData?.cuenta_numero || 'Sin cuenta asociada'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#0D2018]/60 border border-emerald-500/15">
                  <span className="text-slate-400">Titular de Cuenta:</span>
                  <span className="font-medium text-white">
                    {userData?.titular_cuenta || userData?.nombre_completo || 'Titular registrado'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#0D2018]/60 border border-emerald-500/15">
                  <span className="text-slate-400">Estado para Retiros:</span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-md">
                    <ShieldCheck className="h-3.5 w-3.5" /> Habilitado
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5 Botones de Acción */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
          {/* 1. Editar Perfil */}
          <button
            onClick={() => {
              setEditFormData({ ...userData });
              setShowUpdateModal(true);
            }}
            className="p-5 rounded-2xl bg-[#0A1812]/90 border border-emerald-500/20 hover:border-emerald-500/40 hover:bg-[#0D2018] transition-all flex items-center gap-4 text-left group"
          >
            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform">
              <Edit3 className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Editar Datos</p>
              <p className="text-xs text-slate-400">Banco o teléfono</p>
            </div>
          </button>

          {/* 2. Referidos Directos */}
          <button
            onClick={() => navigate('/referidos-directos')}
            className="p-5 rounded-2xl bg-[#0A1812]/90 border border-emerald-500/20 hover:border-emerald-500/40 hover:bg-[#0D2018] transition-all flex items-center gap-4 text-left group"
          >
            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Mis Referidos</p>
              <p className="text-xs text-slate-400">Comisiones de $1,400</p>
            </div>
          </button>

          {/* 3. Cambiar Contraseña */}
          <button
            onClick={() => setShowChangePasswordModal(true)}
            className="p-5 rounded-2xl bg-[#0A1812]/90 border border-emerald-500/20 hover:border-emerald-500/40 hover:bg-[#0D2018] transition-all flex items-center gap-4 text-left group"
          >
            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Seguridad</p>
              <p className="text-xs text-slate-400">Cambiar clave</p>
            </div>
          </button>

          {/* 4. Códigos de Invitación */}
          <button
            onClick={() => setShowCodesModal(true)}
            className="p-5 rounded-2xl bg-[#0A1812]/90 border border-emerald-500/20 hover:border-emerald-500/40 hover:bg-[#0D2018] transition-all flex items-center gap-4 text-left group"
          >
            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Códigos</p>
              <p className="text-xs text-slate-400">{codes.length} para invitar</p>
            </div>
          </button>

          {/* 5. Cerrar Sesión Destacado */}
          <button
            onClick={() => setShowLogoutModal(true)}
            className="p-5 rounded-2xl bg-[#1C0D11]/90 border border-rose-500/30 hover:border-rose-500/50 hover:bg-[#251016] transition-all flex items-center gap-4 text-left group active:scale-98 shadow-md"
          >
            <div className="p-3 rounded-xl bg-rose-500/20 text-rose-400 group-hover:scale-105 transition-transform">
              <LogOut className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-rose-200 text-sm">Cerrar Sesión</p>
              <p className="text-xs text-rose-300/70">Salir de tu cuenta</p>
            </div>
          </button>
        </div>
      </main>

      {/* MODAL: Editar Perfil */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0A1812] border border-emerald-500/30 rounded-3xl max-w-lg w-full shadow-2xl p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-white font-heading">Editar Datos de Perfil</h2>
              <button 
                onClick={() => setShowUpdateModal(false)}
                className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Nombre Completo</label>
                <input
                  type="text"
                  value={editFormData.nombre_completo || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, nombre_completo: e.target.value })}
                  className="w-full p-3 bg-slate-900 border border-emerald-500/20 rounded-xl text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Correo Electrónico</label>
                <input
                  type="email"
                  value={editFormData.correo_electronico || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, correo_electronico: e.target.value })}
                  className="w-full p-3 bg-slate-900 border border-emerald-500/20 rounded-xl text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Línea de Llamadas</label>
                  <input
                    type="text"
                    value={editFormData.linea_llamadas || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, linea_llamadas: e.target.value })}
                    className="w-full p-3 bg-slate-900 border border-emerald-500/20 rounded-xl text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">WhatsApp</label>
                  <input
                    type="text"
                    value={editFormData.linea_whatsapp || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, linea_whatsapp: e.target.value })}
                    className="w-full p-3 bg-slate-900 border border-emerald-500/20 rounded-xl text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Cédula / DNI</label>
                <input
                  type="text"
                  value={editFormData.dni || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, dni: e.target.value })}
                  className="w-full p-3 bg-slate-900 border border-emerald-500/20 rounded-xl text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 border-t border-emerald-500/10">
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">Datos Bancarios para Retiros</p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Banco / Billetera</label>
                    <input
                      type="text"
                      placeholder="Ej. Bancolombia, Nequi, Daviplata"
                      value={editFormData.banco || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, banco: e.target.value })}
                      className="w-full p-3 bg-slate-900 border border-emerald-500/20 rounded-xl text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Número de Cuenta</label>
                    <input
                      type="text"
                      value={editFormData.cuenta_numero || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, cuenta_numero: e.target.value })}
                      className="w-full p-3 bg-slate-900 border border-emerald-500/20 rounded-xl text-white text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Titular de la Cuenta</label>
                    <input
                      type="text"
                      value={editFormData.titular_cuenta || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, titular_cuenta: e.target.value })}
                      className="w-full p-3 bg-slate-900 border border-emerald-500/20 rounded-xl text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-sm font-bold hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={updateLoading}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  {updateLoading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Gestionar Códigos de Invitación */}
      {showCodesModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0A1812] border border-emerald-500/30 rounded-3xl max-w-lg w-full shadow-2xl p-6 sm:p-7 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2.5">
                <QrCode className="h-5 w-5 text-emerald-400" />
                <h3 className="text-xl font-bold text-white font-heading">Códigos de Invitación</h3>
              </div>
              <button 
                onClick={() => setShowCodesModal(false)}
                className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Comparte estos enlaces para vincular automáticamente a tus nuevos socios a tu red de <strong className="text-emerald-400">Granja Raíz de Vida</strong>.
            </p>

            <button
              onClick={handleCreateCode}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 mb-4 shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Generar Nuevo Código de Referido</span>
            </button>

            {/* Listado de Códigos */}
            <div className="space-y-3 overflow-y-auto flex-1 pr-1">
              {loadingCodes ? (
                <div className="space-y-2 py-4 animate-pulse">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={`skel-code-${i}`} className="p-3.5 rounded-2xl bg-[#07130E] border border-emerald-500/10 flex justify-between items-center">
                      <div className="h-4 w-32 bg-emerald-500/20 rounded"></div>
                      <div className="h-8 w-20 bg-slate-800 rounded-xl"></div>
                    </div>
                  ))}
                </div>
              ) : codes.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-400 text-xs">No tienes códigos generados todavía.</p>
                </div>
              ) : (
                codes.map((code) => {
                  const registerUrl = `${window.location.origin}/register?code=${code.code}`;
                  return (
                    <div 
                      key={code._id}
                      className="p-3.5 rounded-2xl bg-[#07130E] border border-emerald-500/20 hover:border-emerald-500/40 transition-all flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <span className="font-mono font-extrabold text-sm text-emerald-300 tracking-wider">
                          {code.code}
                        </span>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {registerUrl}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleCopyToClipboard(registerUrl, code._id)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold transition-colors flex items-center gap-1"
                        >
                          {isCopied[code._id] ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Clipboard className="h-3.5 w-3.5" />}
                          <span>{isCopied[code._id] ? 'Copiado' : 'Copiar'}</span>
                        </button>
                        <button
                          onClick={() => handleDeleteCode(code._id)}
                          className="p-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 transition-colors"
                          title="Eliminar código"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Cambiar Contraseña */}
      {showChangePasswordModal && (
        <ChangePasswordModal
          isOpen={showChangePasswordModal}
          onClose={() => setShowChangePasswordModal(false)}
          onSubmit={handleChangePassword}
        />
      )}

      {/* Modal Confirmación Salir */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0A1812] border border-rose-500/30 rounded-3xl max-w-sm w-full shadow-2xl p-6 text-center">
            <div className="h-14 w-14 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-500/30">
              <LogOut className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-bold text-white font-heading mb-2">¿Cerrar Sesión?</h3>
            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              Tendrás que ingresar tus credenciales nuevamente para acceder a tu panel de socio.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs font-bold hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors"
              >
                Sí, Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}

      <MobileNav />
    </div>
  );
};

export default Perfil;