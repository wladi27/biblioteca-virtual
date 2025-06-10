import React, { useEffect, useState } from 'react';
import { User } from 'lucide-react';

export const NivelAlcanzadoComponent = () => {
  const [nivelesCompletados, setNivelesCompletados] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const usuario = localStorage.getItem('usuario');
    if (usuario) {
      const userData = JSON.parse(usuario);
      fetchPiramideData(userData._id);
    }
  }, []);

  const fetchPiramideData = async (userId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/usuarios/piramide/${userId}`);
      if (response.ok) {
        const data = await response.json();
        calcularNivelesCompletados(data.hijos || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const calcularNivelesCompletados = (data) => {
    let nivelesCompletados = 0;
    let currentData = data;
    let nextLevelData = currentData.flatMap(usuario => usuario.hijos || []);

    for (let nivel = 1; nivel <= 12; nivel++) {
      const cantidadEsperada = Math.pow(3, nivel);
      
      // Tomar usuarios del siguiente nivel si es necesario para completar
      if (currentData.length < cantidadEsperada && nextLevelData.length > 0) {
        const usuariosFaltantes = cantidadEsperada - currentData.length;
        const usuariosParaTomar = Math.min(usuariosFaltantes, nextLevelData.length);
        currentData = [...currentData, ...nextLevelData.slice(0, usuariosParaTomar)];
        nextLevelData = nextLevelData.slice(usuariosParaTomar);
      }

      // Verificar si el nivel está completo (incluyendo usuarios "prestados")
      if (currentData.length >= cantidadEsperada) {
        nivelesCompletados++;
      } else {
        break; // Si no se cumple, salimos del bucle
      }

      // Preparar datos para el siguiente nivel
      currentData = currentData.flatMap(usuario => usuario.hijos || []);
      nextLevelData = currentData.flatMap(usuario => usuario.hijos || []);
    }

    setNivelesCompletados(nivelesCompletados);
  };

  if (loading) {
    return (
      <div className="mt-6 bg-gray-700 bg-opacity-30 p-6 rounded-lg shadow-md flex items-center">
        <User className="text-3xl mr-4" />
        <div>
          <h2 className="text-xl font-semibold">Nivel alcanzado</h2>
          <p className="text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 bg-gray-700 bg-opacity-30 p-6 rounded-lg shadow-md flex items-center">
      <User className="text-3xl mr-4" />
      <div>
        <h2 className="text-xl font-semibold">Nivel alcanzado</h2>
        <p className="text-gray-400">
          {nivelesCompletados} {nivelesCompletados === 1 ? 'nivel' : 'niveles'} completos
        </p>
      </div>
    </div>
  );
};