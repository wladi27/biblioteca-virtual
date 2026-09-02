import React, { useState, useEffect } from 'react';
import { Background } from '../components/Background';
import { AdminNav } from '../components/AdminNav';
import { 
  FileText, 
  Plus, 
  Edit3, 
  Trash2, 
  Image as ImageIcon, 
  Video, 
  FileCheck, 
  ExternalLink, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Eye, 
  UploadCloud,
  Megaphone,
  Calendar
} from 'lucide-react';

export const CreatePublication = () => {
  const [formData, setFormData] = useState<{
    titulo: string;
    descripcion: string;
    file: File | null;
    status: string;
  }>({
    titulo: '',
    descripcion: '',
    file: null,
    status: 'activo',
  });

  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | null } | null>(null);
  const [publicaciones, setPublicaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentPubId, setCurrentPubId] = useState<string | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

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

  const fetchPublicaciones = async () => {
    setLoading(true);
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/publicaciones`, { headers: getHeaders() });
      if (response.ok) {
        const data = await response.json();
        setPublicaciones(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error al cargar publicaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicaciones();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({ ...prev, file }));
      
      // Previsualización si es imagen
      if (file.type.startsWith('image/')) {
        setFilePreview(URL.createObjectURL(file));
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setMessage(null);

    let fileUrl = '';
    if (formData.file) {
      const formDataCloudinary = new FormData();
      formDataCloudinary.append('file', formData.file);
      formDataCloudinary.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'default_preset');

      try {
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        if (cloudName) {
          const cloudinaryResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
            method: 'POST',
            body: formDataCloudinary,
          });

          if (cloudinaryResponse.ok) {
            const cloudinaryData = await cloudinaryResponse.json();
            fileUrl = cloudinaryData.secure_url;
          }
        }
      } catch (error: any) {
        console.warn('Subida a Cloudinary omitida o con error:', error);
      }
    }

    const publicacionData = {
      titulo: formData.titulo,
      descripcion: formData.descripcion,
      status: formData.status,
      ...(fileUrl ? { file: fileUrl } : {}),
    };

    try {
      const apiUrl = getApiUrl();
      const response = isEdit && currentPubId
        ? await fetch(`${apiUrl}/api/publicaciones/${currentPubId}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(publicacionData),
          })
        : await fetch(`${apiUrl}/api/publicaciones`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(publicacionData),
          });

      if (response.ok) {
        setMessage({
          text: isEdit ? 'Publicación actualizada exitosamente' : 'Publicación creada exitosamente',
          type: 'success',
        });
        fetchPublicaciones();
        setIsModalOpen(false);
        setFormData({ titulo: '', descripcion: '', file: null, status: 'activo' });
        setFilePreview(null);
        setIsEdit(false);
      } else {
        const errorData = await response.json();
        setMessage({ text: errorData.message || 'Error al guardar la publicación', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Error al conectar con el servidor', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (pub: any) => {
    setFormData({
      titulo: pub.titulo || '',
      descripcion: pub.descripcion || '',
      file: null,
      status: pub.status || 'activo',
    });
    setFilePreview(pub.file || null);
    setCurrentPubId(pub._id);
    setIsEdit(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este comunicado?')) return;

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/publicaciones/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      if (response.ok) {
        setMessage({ text: 'Publicación eliminada exitosamente', type: 'success' });
        fetchPublicaciones();
      } else {
        const errorData = await response.json();
        setMessage({ text: errorData.message || 'Error al eliminar la publicación', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Error al conectar con el servidor', type: 'error' });
    }
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="min-h-screen bg-[#06110D] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      <Background />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex-grow w-full">
        {/* Banner Superior */}
        <div className="relative rounded-3xl p-6 sm:p-8 mb-8 overflow-hidden border border-emerald-500/25 bg-gradient-to-r from-[#0B251B] via-[#091F17] to-[#071711] shadow-2xl shadow-emerald-950/40">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-3">
                <Megaphone className="h-3.5 w-3.5" />
                <span>Gestor de Contenido Oficial</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-heading">
                Avisos y Publicaciones
              </h1>
              <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
                Crea y administra comunicados, novedades de la granja, comprobantes y reportes visuales para mantener informada a toda la comunidad de inversionistas.
              </p>
            </div>

            <button
              onClick={() => { 
                setIsModalOpen(true); 
                setIsEdit(false); 
                setFormData({ titulo: '', descripcion: '', file: null, status: 'activo' });
                setFilePreview(null);
              }}
              className="py-3.5 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs rounded-2xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 shrink-0 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>Nueva Publicación</span>
            </button>
          </div>
        </div>

        {/* Notificación Toast */}
        {message && (
          <div className={`mb-6 p-4 rounded-2xl text-center font-bold text-sm border shadow-2xl flex items-center justify-center gap-2.5 animate-fade-in ${
            message.type === 'success' 
              ? 'bg-[#0E241C] border-emerald-500 text-emerald-300 shadow-emerald-950/50' 
              : 'bg-[#2A0E12] border-rose-500 text-rose-300'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Listado de Publicaciones */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={`skel-post-${i}`} className="glass-card rounded-2xl border border-emerald-500/15 bg-[#0A1812]/80 p-5 space-y-4 animate-pulse">
                <div className="h-44 bg-emerald-500/10 rounded-xl"></div>
                <div className="h-5 w-3/4 bg-emerald-500/20 rounded"></div>
                <div className="h-3 w-full bg-slate-800 rounded"></div>
                <div className="h-3 w-2/3 bg-slate-800 rounded"></div>
              </div>
            ))}
          </div>
        ) : publicaciones.length === 0 ? (
          <div className="text-center py-16 glass-card rounded-3xl border border-emerald-500/20 bg-[#0A1812]/80 p-8 shadow-xl">
            <FileText className="h-14 w-14 text-emerald-500/30 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white font-heading">No hay publicaciones registradas</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto mb-6">
              Comienza compartiendo el primer aviso o actualización para los socios de Granja Raíz de Vida.
            </p>
            <button
              onClick={() => { setIsModalOpen(true); setIsEdit(false); }}
              className="px-5 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 font-bold text-xs transition-colors"
            >
              Crear Primer Aviso
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicaciones.map((pub) => (
              <div
                key={pub._id}
                className="glass-card rounded-3xl border border-emerald-500/20 bg-[#0A1812]/85 hover:border-emerald-500/40 transition-all shadow-xl overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Media adjunta */}
                  {pub.file && (
                    <div className="relative w-full h-48 bg-slate-950 overflow-hidden border-b border-emerald-500/15">
                      {/\.(jpg|jpeg|png|gif|webp)$/i.test(pub.file) ? (
                        <img
                          src={pub.file}
                          alt={pub.titulo}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : /\.(mp4|webm|ogg)$/i.test(pub.file) ? (
                        <video
                          src={pub.file}
                          controls
                          className="w-full h-full object-contain bg-black"
                        />
                      ) : /\.(pdf)$/i.test(pub.file) ? (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-[#07130E] text-emerald-400 p-4">
                          <FileCheck className="h-12 w-12 mb-2" />
                          <a
                            href={pub.file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs underline flex items-center gap-1 font-bold"
                          >
                            <span>Abrir Documento PDF</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      ) : null}
                    </div>
                  )}

                  {/* Contenido del post */}
                  <div className="p-5 sm:p-6">
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                        pub.status === 'activo'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {pub.status || 'Activo'}
                      </span>
                      {pub.createdAt && (
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(pub.createdAt).toLocaleDateString('es-ES')}</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-white font-heading mb-2 line-clamp-2">
                      {pub.titulo}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                      {pub.descripcion}
                    </p>
                  </div>
                </div>

                {/* Acciones del Administrador */}
                <div className="p-5 pt-0 border-t border-emerald-500/10 mt-4 flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(pub)}
                    className="flex-1 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => handleDelete(pub._id)}
                    className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 transition-colors"
                    title="Eliminar publicación"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* MODAL: Crear o Editar Publicación */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0A1812] border border-emerald-500/30 rounded-3xl max-w-lg w-full shadow-2xl p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-emerald-500/20">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Megaphone className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-white font-heading">
                  {isEdit ? 'Editar Publicación' : 'Nueva Publicación Oficial'}
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Título del Comunicado</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Actualización de rendimientos y cosecha..."
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-emerald-500/20 text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Descripción o Mensaje</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Escribe los detalles completos de la noticia o actualización..."
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-emerald-500/20 text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Estado</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-emerald-500/20 text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="activo">Activo (Visible para todos)</option>
                  <option value="inactivo">Inactivo / Borrador</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Adjuntar Imagen o Video</label>
                <div className="relative border-2 border-dashed border-emerald-500/30 hover:border-emerald-500/60 rounded-2xl p-4 text-center cursor-pointer transition-colors bg-[#07130E]/60">
                  <input
                    type="file"
                    accept="image/*,video/*,application/pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <UploadCloud className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-300 font-semibold">
                    {formData.file ? formData.file.name : 'Haz clic o arrastra un archivo aquí'}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">PNG, JPG, MP4, WebM o PDF</p>
                </div>
              </div>

              {filePreview && (
                <div className="p-2 rounded-xl bg-slate-900 border border-emerald-500/20">
                  <p className="text-[10px] text-slate-400 mb-1">Vista previa:</p>
                  <img src={filePreview} alt="Preview" className="max-h-36 rounded-lg mx-auto object-cover" />
                </div>
              )}

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs font-bold hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>{isEdit ? 'Actualizar Aviso' : 'Publicar Ahora'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <br /><br />
      <AdminNav />
    </div>
  );
};
