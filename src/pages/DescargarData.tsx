import React, { useState } from 'react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

const DescargarDatos = () => {
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
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

      // Filtrar por rango de fechas si se especifica
      const filteredData = data.filter(user => {
        const createdAt = new Date(user.createdAt); // Asumiendo que tienes una propiedad createdAt
        return (
          (!fechaInicio || createdAt >= new Date(fechaInicio)) &&
          (!fechaFin || createdAt <= new Date(fechaFin))
        );
      });

      // Crear un libro de trabajo de Excel
      const worksheet = XLSX.utils.json_to_sheet(filteredData);
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
    <div className="p-6 bg-gray-800 rounded-lg shadow-md text-white">
      <h2 className="text-xl font-semibold mb-4">Descargar Datos de Usuarios</h2>
      <div className="mb-4">
        <label className="block mb-2">Fecha Inicio:</label>
        <input
          type="date"
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
          className="bg-gray-700 border border-gray-600 rounded-lg p-2 w-full"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2">Fecha Fin:</label>
        <input
          type="date"
          value={fechaFin}
          onChange={(e) => setFechaFin(e.target.value)}
          className="bg-gray-700 border border-gray-600 rounded-lg p-2 w-full"
        />
      </div>
      <button
        onClick={handleDownload}
        className="bg-blue-600 py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        disabled={loading}
      >
        {loading ? 'Cargando...' : 'Descargar Datos'}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default DescargarDatos;
