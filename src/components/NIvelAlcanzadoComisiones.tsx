import React, { useEffect, useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { Award, CheckCircle2, Lock, Sprout, DollarSign, Users, Layers, Loader2 } from 'lucide-react';

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

export const NivelAlcanzadoComisiones = () => {
  const [username, setUsername] = useState('');
  const [nivelesCompletados, setNivelesCompletados] = useState(0);
  const [comisionesData, setComisionesData] = useState<any[]>([]);
  const [openAcordeon, setOpenAcordeon] = useState<Record<number, boolean>>({ 1: true });
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');
  const [totalComisiones, setTotalComisiones] = useState(0);

  useEffect(() => {
    const usuario = localStorage.getItem('usuario');
    if (usuario) {
      try {
        const userData = JSON.parse(usuario);
        setUsername(userData.nombre_completo || userData.nombre_usuario);
        setUserId(userData._id);
        cargarDatos(userData._id);
      } catch {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const cargarDatos = async (id: string) => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const apiUrl = import.meta.env.VITE_URL_LOCAL || import.meta.env.VITE_API_URL || 'http://localhost:5005';
    const authHeaders = { Authorization: `Bearer ${token}` };

    try {
      // 1. Obtener niveles de la red del usuario
      const resRed = await fetch(`${apiUrl}/usuarios/piramide-red/${id}`, { headers: authHeaders });
      let completados = 0;
      if (resRed.ok) {
        const dataRed = await resRed.json();
        completados = dataRed.nivelesCompletados || 0;
        setNivelesCompletados(completados);
      }

      // 2. Obtener tabla de comisiones de niveles
      const resNiveles = await fetch(`${apiUrl}/niveles`, { headers: authHeaders });
      if (resNiveles.ok) {
        const dataNiveles = await resNiveles.json();
        setComisionesData(dataNiveles);

        // Calcular total comisiones de niveles completados
        let total = 0;
        dataNiveles.forEach((item: any) => {
          if (item.numero_nivel <= completados) {
            const val = item.comision?.$numberDecimal ? Number(item.comision.$numberDecimal) : (item.comision || 0);
            total += val;
          }
        });
        setTotalComisiones(total);
      }
    } catch (e) {
      console.error('Error cargando comisiones:', e);
    } finally {
      setLoading(false);
    }
  };

  const toggleAcordeon = (nivel: number) => {
    setOpenAcordeon((prev) => ({ ...prev, [nivel]: !prev[nivel] }));
  };

  const rangoActualNumero = nivelesCompletados > 0 ? nivelesCompletados : 1;
  const rangoActualNombre = nombresNiveles[rangoActualNumero] || 'Semilla';

  const renderNivelItem = (nivel: number) => {
    const comisionObj = comisionesData.find(c => c.numero_nivel === nivel);
    const montoComision = comisionObj
      ? (comisionObj.comision?.$numberDecimal ? Number(comisionObj.comision.$numberDecimal) : (comisionObj.comision || 0))
      : (nivel * 25000); // Fallback ilustrativo
    const completado = nivel <= nivelesCompletados;
    const esSiguiente = nivel === nivelesCompletados + 1;
    const cantidadEsperada = Math.pow(3, nivel);
    const nombreNivel = nombresNiveles[nivel] || `Nivel ${nivel}`;

    return (
      <div className="mb-4" key={`comision-nivel-${nivel}`}>
        <div
          className={`p-4 rounded-2xl flex justify-between items-center cursor-pointer border transition-all ${
            completado 
              ? 'bg-[#0E241C]/80 border-emerald-500/40 shadow-lg shadow-emerald-500/5' 
              : esSiguiente
                ? 'bg-[#0A1812]/90 border-amber-500/30 hover:border-amber-500/50'
                : 'bg-slate-900/40 border-slate-800 opacity-60'
          }`}
          onClick={() => toggleAcordeon(nivel)}
        >
          <div className="flex items-center gap-3.5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-sm ${
              completado 
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30' 
                : esSiguiente
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-800 text-slate-500'
            }`}>
              {completado ? <CheckCircle2 className="h-5 w-5" /> : esSiguiente ? nivel : <Lock className="h-4 w-4" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">
                  Nivel {nivel}: <span className={completado ? "text-emerald-400" : esSiguiente ? "text-amber-300" : "text-slate-400"}>{nombreNivel}</span>
                </h3>
                {completado && (
                  <span className="text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Desbloqueado
                  </span>
                )}
                {esSiguiente && (
                  <span className="text-[11px] font-semibold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                    En Progreso
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Estructura de {cantidadEsperada.toLocaleString('es-CO')} cupos requeridos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">Comisión</span>
              <span className={`font-mono font-bold text-sm sm:text-base ${
                completado ? 'text-emerald-400' : esSiguiente ? 'text-amber-300' : 'text-slate-500'
              }`}>
                COP ${montoComision.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white">
              {openAcordeon[nivel] ? <FaChevronUp className="h-3.5 w-3.5" /> : <FaChevronDown className="h-3.5 w-3.5" />}
            </div>
          </div>
        </div>

        {openAcordeon[nivel] && (
          <div className="mt-2 pl-2 sm:pl-4">
            <div className="p-4 rounded-xl bg-[#0D2018]/60 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Sprout className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Rango asignado: <strong className="text-white">{nombreNivel}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Posiciones de matriz: <strong className="text-white">{cantidadEsperada.toLocaleString('es-CO')} miembros</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Rendimiento: <strong className="text-emerald-400">COP ${montoComision.toLocaleString('es-CO')}</strong></span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 3 Tarjetas de Resumen con Skeletons */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={`skel-comis-kpi-${i}`} className="glass-card p-5 rounded-2xl border border-emerald-500/10 bg-[#0A1812]/70 animate-pulse space-y-3">
              <div className="h-3 w-36 bg-emerald-500/20 rounded"></div>
              <div className="h-8 w-44 bg-slate-700 rounded-lg"></div>
              <div className="h-3 w-48 bg-slate-800 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="glass-panel p-5 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-[#0A241A] to-[#0D1C15] shadow-lg">
            <span className="text-xs uppercase font-semibold text-emerald-300 tracking-wider flex items-center gap-1.5">
              <DollarSign className="h-4 w-4 text-emerald-400" />
              Comisiones Desbloqueadas
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-white font-mono mt-2">
              COP ${totalComisiones.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-400 mt-1">Por niveles completados al 100%</p>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-emerald-500/20 bg-[#0A1812]/80">
            <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider flex items-center gap-1.5">
              <Award className="h-4 w-4 text-emerald-400" />
              Rango Agro-Productivo
            </span>
            <p className="text-xl sm:text-2xl font-extrabold text-white font-heading mt-2">
              Nivel {rangoActualNumero}: {rangoActualNombre}
            </p>
            <p className="text-xs text-emerald-400 mt-1">{nivelesCompletados} de 12 niveles completados</p>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-emerald-500/20 bg-[#0A1812]/80">
            <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-emerald-400" />
              Próximo Nivel Objetivo
            </span>
            <p className="text-xl sm:text-2xl font-extrabold text-amber-300 font-heading mt-2">
              Nivel {Math.min(12, nivelesCompletados + 1)}: {nombresNiveles[Math.min(12, nivelesCompletados + 1)]}
            </p>
            <p className="text-xs text-slate-400 mt-1">Completa los cupos de tu red para desbloquearlo</p>
          </div>
        </div>
      )}

      {/* Lista de los 12 Niveles con Skeletons */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={`skel-comis-row-${i}`} className="p-4 rounded-2xl bg-[#0A1812]/70 border border-emerald-500/10 animate-pulse flex justify-between items-center">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20"></div>
                <div className="space-y-2">
                  <div className="h-4 w-48 bg-emerald-500/20 rounded"></div>
                  <div className="h-3 w-36 bg-slate-800 rounded"></div>
                </div>
              </div>
              <div className="text-right space-y-1">
                <div className="h-3 w-16 bg-slate-800 rounded ml-auto"></div>
                <div className="h-5 w-28 bg-emerald-500/20 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {Array.from({ length: 12 }, (_, i) => i + 1).map((nivel) => renderNivelItem(nivel))}
        </div>
      )}
    </div>
  );
};
