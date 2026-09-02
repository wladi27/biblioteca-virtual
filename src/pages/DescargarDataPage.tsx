import React, { useState } from 'react';
import { Background } from '../components/Background';
import { AdminNav } from '../components/AdminNav';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { 
  FileSpreadsheet, 
  Download, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Database,
  Users
} from 'lucide-react';

export const DescargarDatosPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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

  const handleDownload = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/usuarios`, { headers: getHeaders() });
      if (!response.ok) {
        throw new Error('Error al obtener los datos de la base de datos');
      }
      const data = await response.json();

      const filteredData = (Array.isArray(data) ? data : []).map(user => ({
        "ID": user._id,
        "Nombre Completo": user.nombre_completo,
        "Nombre Usuario": user.nombre_usuario,
        "Correo Electrónico": user.correo_electronico,
        "DNI / CC": user.dni,
        "Línea Llamadas": user.linea_llamadas,
        "Línea WhatsApp": user.linea_whatsapp,
        "Banco": user.banco,
        "Cuenta Número": user.cuenta_numero,
        "Titular Cuenta": user.titular_cuenta,
        "Nivel Matriz": user.nivel,
        "ID Padre": user.padre_id,
        "Código Referido": user.codigo_referido,
        "Fecha Registro": user.createdAt ? new Date(user.createdAt).toLocaleDateString('es-ES') : 'N/A'
      }));

      const worksheet = XLSX.utils.json_to_sheet(filteredData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Socios Granja');

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(blob, `granja_raiz_de_vida_socios_${new Date().toISOString().slice(0, 10)}.xlsx`);
      
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Error al exportar archivo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06110D] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      <Background />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 flex-grow w-full flex flex-col items-center justify-center">
        <div className="glass-card rounded-3xl border border-emerald-500/25 bg-[#0A1812]/90 p-8 sm:p-10 shadow-2xl max-w-lg w-full text-center">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 mx-auto mb-4 shadow-lg shadow-emerald-500/20">
            <FileSpreadsheet className="h-8 w-8" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-3">
            <Database className="h-3 w-3" />
            <span>Exportador de Base de Datos</span>
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading mb-2">
            Descargar Reporte de Socios
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-8 max-w-sm mx-auto">
            Genera un archivo Excel (.xlsx) con el padrón completo de co-inversionistas, teléfonos, cuentas bancarias y niveles de matriz.
          </p>

          {success && (
            <div className="mb-6 p-3.5 rounded-2xl bg-[#0E241C] border border-emerald-500 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>¡Archivo descargado correctamente!</span>
            </div>
          )}

          {error && (
            <div className="mb-6 p-3.5 rounded-2xl bg-[#2A0E12] border border-rose-500 text-rose-300 text-xs font-bold flex items-center justify-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleDownload}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm rounded-2xl transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Generando Excel...</span>
              </>
            ) : (
              <>
                <Download className="h-5 w-5" />
                <span>Exportar a Excel (.XLSX)</span>
              </>
            )}
          </button>
        </div>
      </main>

      <br /><br />
      <AdminNav />
    </div>
  );
};
