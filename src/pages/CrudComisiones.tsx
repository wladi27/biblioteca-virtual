import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Background } from '../components/Background';
import { AdminNav } from '../components/AdminNav';
import { 
  DollarSign, 
  Plus, 
  Edit3, 
  Trash2, 
  Award, 
  Sprout, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Loader2, 
  Layers, 
  TrendingUp, 
  ShieldCheck,
  Save
} from 'lucide-react';

const nombresNiveles: Record<number, string> = {
  1: 'Semilla',
  2: 'Brote',
  3: 'Cultivo',
  4: 'Cosecha',
  5: 'Productor',
  6: 'Agro-Líder',
  7: 'Finca Master',
  8: 'Hacienda',
  9: 'Agro-Corporativo',
  10: 'Valle Verde',
  11: 'Raíz de Vida',
  12: 'Raíz de Vida Master'
};

export const CrudComisiones = () => {
  const [formData, setFormData] = useState({
    numero_nivel: '',
    comision: '',
  });

  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | null } | null>(null);
  const [niveles, setNiveles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentNivelId, setCurrentNivelId] = useState<string | null>(null);

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

  const fetchNiveles = async () => {
    setLoading(true);
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/niveles/`, { headers: getHeaders() });
      if (response.ok) {
        const data = await response.json();
        const ordenados = (Array.isArray(data) ? data : []).sort((a, b) => Number(a.numero_nivel) - Number(b.numero_nivel));
        setNiveles(ordenados);
      }
    } catch (error) {
      console.error('Error al obtener niveles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNiveles();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const nivelData = {
      numero_nivel: formData.numero_nivel,
      comision: { $numberDecimal: formData.comision.toString() },
    };

    try {
      const apiUrl = getApiUrl();
      const response = isEdit && currentNivelId
        ? await fetch(`${apiUrl}/niveles/${currentNivelId}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(nivelData),
          })
        : await fetch(`${apiUrl}/niveles/`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(nivelData),
          });

      if (response.ok) {
        setMessage({ text: isEdit ? 'Nivel y comisión actualizados exitosamente' : 'Nivel creado exitosamente', type: 'success' });
        fetchNiveles();
        setIsModalOpen(false);
        setFormData({ numero_nivel: '', comision: '' });
        setIsEdit(false);
      } else {
        const errorData = await response.json();
        setMessage({ text: errorData.message || 'Error al guardar el nivel', type: 'error' });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ text: 'Error al conectar con el servidor', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (nivel: any) => {
    const valorComision = nivel.comision?.$numberDecimal || nivel.comision || '';
    setFormData({
      numero_nivel: nivel.numero_nivel?.toString() || '',
      comision: valorComision.toString(),
    });
    setCurrentNivelId(nivel._id);
    setIsEdit(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este nivel de compensación?')) return;

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/niveles/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      if (response.ok) {
        setMessage({ text: 'Nivel eliminado exitosamente', type: 'success' });
        fetchNiveles();
      } else {
        const errorData = await response.json();
        setMessage({ text: errorData.message || 'Error al eliminar el nivel', type: 'error' });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ text: 'Error al conectar con el servidor', type: 'error' });
    }
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const calcularSociosEsperados = (numNivel: number): number => {
    return Math.pow(3, numNivel);
  };

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
                <DollarSign className="h-3.5 w-3.5" />
                <span>Gestor de Tablas de Compensación • Matriz 3^N</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-heading">
                Planes y Comisiones de Red
              </h1>
              <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
                Configura los montos de pago en COP asignados a cada uno de los 12 rangos agrícolas cuando los socios completan sus matrices ternarias.
              </p>
            </div>

            <button
              onClick={() => { 
                setIsModalOpen(true); 
                setIsEdit(false); 
                setFormData({ numero_nivel: '', comision: '' });
              }}
              className="py-3.5 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs rounded-2xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 shrink-0 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>Nuevo Nivel</span>
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

        {/* Tarjetas de los Niveles de Compensación */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={`skel-com-${i}`} className="glass-card rounded-2xl border border-emerald-500/15 bg-[#0A1812]/80 p-5 space-y-3 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="h-8 w-24 bg-emerald-500/20 rounded-lg"></div>
                  <div className="h-8 w-8 bg-emerald-500/10 rounded-full"></div>
                </div>
                <div className="h-6 w-32 bg-emerald-500/20 rounded"></div>
                <div className="h-4 w-28 bg-slate-800 rounded"></div>
              </div>
            ))}
          </div>
        ) : niveles.length === 0 ? (
          <div className="text-center py-16 glass-card rounded-3xl border border-emerald-500/20 bg-[#0A1812]/80 p-8 shadow-xl">
            <DollarSign className="h-14 w-14 text-emerald-500/30 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white font-heading">No hay niveles de comisiones creados</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto mb-6">
              Configura los 12 niveles de compensación para los rangos de Granja Raíz de Vida.
            </p>
            <button
              onClick={() => { setIsModalOpen(true); setIsEdit(false); }}
              className="px-5 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 font-bold text-xs transition-colors"
            >
              Configurar Primer Nivel
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {niveles.map((nivel) => {
              const numNivel = Number(nivel.numero_nivel) || 1;
              const nombreRango = nombresNiveles[numNivel] || `Nivel ${numNivel}`;
              const sociosEsperados = calcularSociosEsperados(numNivel);
              const comisionMonto = Number(nivel.comision?.$numberDecimal || nivel.comision || 0);

              return (
                <div
                  key={nivel._id}
                  className="glass-card rounded-3xl border border-emerald-500/20 bg-[#0A1812]/85 hover:border-emerald-500/40 transition-all shadow-xl p-6 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center font-mono font-extrabold text-emerald-400 text-sm">
                          {numNivel}
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Rango Oficial</span>
                          <h3 className="text-base font-extrabold text-white font-heading">{nombreRango}</h3>
                        </div>
                      </div>

                      <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                        <Award className="h-5 w-5" />
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#07130E] border border-emerald-500/15 mb-4 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Comisión por Cierre:</span>
                        <span className="font-extrabold font-mono text-emerald-300 text-base">
                          COP ${comisionMonto.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-emerald-500/10">
                        <span className="text-slate-400">Socios Requeridos:</span>
                        <span className="font-semibold text-slate-300">
                          {sociosEsperados.toLocaleString()} socios ($3^{numNivel}$)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Botones de Acción */}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => handleEdit(nivel)}
                      className="flex-1 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={() => handleDelete(nivel._id)}
                      className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 transition-colors"
                      title="Eliminar nivel"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* MODAL: Crear o Editar Nivel */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0A1812] border border-emerald-500/30 rounded-3xl max-w-md w-full shadow-2xl p-6 sm:p-7">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-emerald-500/20">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <DollarSign className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-white font-heading">
                  {isEdit ? 'Editar Nivel de Comisión' : 'Nuevo Nivel de Comisión'}
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
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Número de Nivel (1 a 12)</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  required
                  placeholder="Ej: 1, 2, 3..."
                  value={formData.numero_nivel}
                  onChange={(e) => setFormData({ ...formData, numero_nivel: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-emerald-500/20 text-white text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                {formData.numero_nivel && nombresNiveles[Number(formData.numero_nivel)] && (
                  <p className="text-[11px] text-emerald-400 mt-1 font-semibold">
                    Rango asociado: {nombresNiveles[Number(formData.numero_nivel)]} (Capacidad: {Math.pow(3, Number(formData.numero_nivel)).toLocaleString()} socios)
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Monto de Comisión (COP)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Ej: 50000"
                  value={formData.comision}
                  onChange={(e) => setFormData({ ...formData, comision: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-emerald-500/20 text-white text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

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
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>{isEdit ? 'Actualizar Nivel' : 'Crear Nivel'}</span>
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