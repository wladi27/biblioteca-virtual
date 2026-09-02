import React, { useState, useEffect } from 'react';
import { Background } from '../components/Background';
import { AdminNav } from '../components/AdminNav';
import { 
  KeyRound, 
  Eye, 
  EyeOff, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ShieldCheck, 
  Lock,
  Save
} from 'lucide-react';

export const CambiarContrasena = () => {
  const [id, setId] = useState('');
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [mensaje, setMensaje] = useState<{ text: string; type: 'success' | 'error' | null } | null>(null);
  const [usuarioInfo, setUsuarioInfo] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [saving, setSaving] = useState(false);

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

  const fetchUsuarioInfo = async (userId: string) => {
    if (!userId.trim()) {
      setUsuarioInfo(null);
      return;
    }

    setLoadingUser(true);
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/usuarios/${userId.trim()}`, { headers: getHeaders() });
      if (response.ok) {
        const data = await response.json();
        setUsuarioInfo(data);
      } else {
        setUsuarioInfo(null);
      }
    } catch (error) {
      setUsuarioInfo(null);
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    fetchUsuarioInfo(id);
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje(null);

    if (nuevaContrasena !== confirmarContrasena) {
      setMensaje({ text: 'Las contraseñas no coinciden.', type: 'error' });
      return;
    }

    if (nuevaContrasena.length < 4) {
      setMensaje({ text: 'La contraseña debe tener al menos 4 caracteres.', type: 'error' });
      return;
    }

    setSaving(true);
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/auth/password/${id.trim()}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ nuevaContraseña: nuevaContrasena }),
      });

      if (response.ok) {
        setMensaje({ text: '✅ Contraseña restaurada y actualizada exitosamente.', type: 'success' });
        setNuevaContrasena('');
        setConfirmarContrasena('');
      } else {
        const err = await response.json().catch(() => ({}));
        setMensaje({ text: err.message || 'Error al actualizar la contraseña.', type: 'error' });
      }
    } catch (error) {
      setMensaje({ text: 'Error de conexión con el servidor.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06110D] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      <Background />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 flex-grow w-full flex flex-col items-center justify-center">
        <div className="glass-card rounded-3xl border border-emerald-500/25 bg-[#0A1812]/90 p-8 sm:p-10 shadow-2xl max-w-lg w-full">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-emerald-500/20">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <KeyRound className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Soporte Técnico</span>
              <h1 className="text-xl font-extrabold text-white font-heading">Restaurar Clave de Socio</h1>
            </div>
          </div>

          {mensaje && (
            <div className={`mb-6 p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 ${
              mensaje.type === 'success' 
                ? 'bg-[#0E241C] border border-emerald-500 text-emerald-300' 
                : 'bg-[#2A0E12] border border-rose-500 text-rose-300'
            }`}>
              {mensaje.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
              <span>{mensaje.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">ID del Inversionista</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Ingresa el ID del usuario..."
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-emerald-500/20 text-white text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                {loadingUser && (
                  <Loader2 className="absolute right-3 top-3.5 h-4 w-4 animate-spin text-emerald-400" />
                )}
              </div>
            </div>

            {usuarioInfo && (
              <div className="p-3.5 rounded-2xl bg-[#07130E] border border-emerald-500/20 text-xs space-y-1">
                <p className="font-bold text-white text-sm">{usuarioInfo.nombre_completo}</p>
                <p className="text-slate-400">Usuario: <strong className="text-emerald-300">@{usuarioInfo.nombre_usuario}</strong></p>
                {usuarioInfo.correo_electronico && (
                  <p className="text-slate-400">Correo: {usuarioInfo.correo_electronico}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nueva Contraseña</label>
              <div className="relative">
                <input
                  type={mostrarContrasena ? 'text' : 'password'}
                  required
                  placeholder="Escribe la nueva clave..."
                  value={nuevaContrasena}
                  onChange={(e) => setNuevaContrasena(e.target.value)}
                  className="w-full p-3 pr-10 rounded-xl bg-slate-900 border border-emerald-500/20 text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setMostrarContrasena(!mostrarContrasena)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
                >
                  {mostrarContrasena ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Confirmar Nueva Contraseña</label>
              <input
                type={mostrarContrasena ? 'text' : 'password'}
                required
                placeholder="Repite la nueva clave..."
                value={confirmarContrasena}
                onChange={(e) => setConfirmarContrasena(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-900 border border-emerald-500/20 text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving || !usuarioInfo}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span>Guardar Nueva Contraseña</span>
              </button>
            </div>
          </form>
        </div>
      </main>

      <br /><br />
      <AdminNav />
    </div>
  );
};