import React, { useEffect, useState } from 'react';
import { Award, Sprout, Loader2 } from 'lucide-react';

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

export const NivelAlcanzadoComponent = () => {
  const [nivelesCompletados, setNivelesCompletados] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const usuario = localStorage.getItem('usuario');
    if (usuario) {
      try {
        const userData = JSON.parse(usuario);
        fetchPiramideData(userData._id);
      } catch {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchPiramideData = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_URL_LOCAL || import.meta.env.VITE_API_URL || 'http://localhost:5005';
      const response = await fetch(`${apiUrl}/usuarios/piramide-red/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setNivelesCompletados(data.nivelesCompletados || 0);
      }
    } catch (error) {
      console.error('Error fetching piramide data:', error);
    } finally {
      setLoading(false);
    }
  };

  const rangoActualNumero = nivelesCompletados > 0 ? nivelesCompletados : 1;
  const rangoActualNombre = nombresNiveles[rangoActualNumero] || 'Semilla';

  if (loading) {
    return (
      <div className="mt-6 glass-card p-6 rounded-2xl border border-emerald-500/20 bg-[#0A1812]/70 flex items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
        <div>
          <h2 className="text-base font-bold text-white">Rango Agro-Productivo</h2>
          <p className="text-xs text-slate-400">Consultando progreso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 glass-card p-6 rounded-2xl border border-emerald-500/20 bg-[#0A1812]/70 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <Award className="h-6 w-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">
              Nivel {rangoActualNumero}: <span className="text-emerald-400">{rangoActualNombre}</span>
            </h2>
            <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
              {nivelesCompletados} {nivelesCompletados === 1 ? 'nivel completo' : 'niveles completos'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {nivelesCompletados === 12 
              ? '¡Máximo rango alcanzado en la granja!' 
              : `Progreso: ${nivelesCompletados} de 12 niveles completados`}
          </p>
        </div>
      </div>
    </div>
  );
};