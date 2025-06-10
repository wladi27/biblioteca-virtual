import React, { useState } from 'react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

export const DescargarDatosPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDownload = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/usuarios`);
      if (!response.ok) {
        throw new Error('Error al obtener los datos');
      }
      const data = await response.json();

      // Filtrar y renombrar los datos
      const filteredData = data.map(user => ({
        id: user._id,
        "Nombre Completo": user.nombre_completo,
        "Línea Llamadas": user.linea_llamadas,
        "Línea WhatsApp": user.linea_whatsapp,
        "Cuenta Número": user.cuenta_numero,
        "Banco": user.banco,
        "Titular Cuenta": user.titular_cuenta,
        "Correo Electrónico": user.correo_electronico,
        "CC": user.dni,
        "Nombre Usuario": user.nombre_usuario,
        "ID del Padre": user.padre_id,
        "Número de Registro": user.nivel,
        "Hijo 1 ID": user.hijo1_id,
        "Hijo 2 ID": user.hijo2_id,
        "Hijo 3 ID": user.hijo3_id,
        "Código Referido": user.codigo_referido,
      }));

      // Crear un libro de trabajo de Excel
      const worksheet = XLSX.utils.json_to_sheet(filteredData);

      // Estilo de encabezados
      const headerCellStyle = {
        fill: { fgColor: { rgb: "4F81BD" } },
        font: { bold: true, color: { rgb: "FFFFFF" } },
        alignment: { horizontal: "center" }
      };

      // Aplicar estilo a los encabezados
      const headers = worksheet['A1'].s = headerCellStyle;
      for (let col in worksheet) {
        if (col[0] === '!') continue; // Ignorar metadatos
        worksheet[col].s = headerCellStyle;
      }

      // Ajustar ancho de columnas
      const columnWidths = [
        { wpx: 200 }, // id
        { wpx: 250 }, // Nombre Completo
        { wpx: 150 }, // Línea Llamadas
        { wpx: 150 }, // Línea WhatsApp
        { wpx: 150 }, // Cuenta Número
        { wpx: 150 }, // Banco
        { wpx: 200 }, // Titular Cuenta
        { wpx: 250 }, // Correo Electrónico
        { wpx: 100 }, // CC
        { wpx: 150 }, // Nombre Usuario
        { wpx: 150 }, // ID del Padre
        { wpx: 150 }, // Número de Registro
        { wpx: 100 }, // Hijo 1 ID
        { wpx: 100 }, // Hijo 2 ID
        { wpx: 100 }, // Hijo 3 ID
        { wpx: 150 }, // Código Referido
      ];

      worksheet['!cols'] = columnWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Usuarios');

      // Generar el archivo Excel
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(blob, 'usuarios.xlsx');
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-6">
      <h2 className="text-2xl font-semibold mb-4">Descargar Todos los Datos de Usuarios</h2>
      <button
        onClick={handleDownload}
        className="bg-blue-600 py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
        disabled={loading}
      >
        {loading ? 'Cargando...' : 'Descargar Datos'}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

