import React, { useEffect, useState } from "react";
import { Background } from "../components/Background";
import { MobileNav } from "../components/MobileNav";
import { NivelAlcanzadoComisiones } from "../components/NIvelAlcanzadoComisiones";

export const Comisiones = () => {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const usuario = localStorage.getItem("usuario");
    if (usuario) {
      const userData = JSON.parse(usuario);
      setUsername(userData.username);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col text-white">
      <Background />
      
      {/* Contenedor principal centrado */}
      <main className="flex-grow flex flex-col items-center justify-start py-8 px-4 sm:px-6 lg:px-8">
        {/* Tarjeta contenedora con ancho máximo y responsive */}
        <div className="w-full max-w-6xl bg-gray-800 bg-opacity-80 rounded-xl shadow-2xl overflow-hidden">
          {/* Encabezado con gradiente */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-center text-white">
              Mis Comisiones
            </h1>
            
          </div>
          
          {/* Contenido principal */}
          <div className="p-6">
            {/* Sección de estadísticas rápidas */}
            

            {/* Sección de niveles de comisiones */}
            <div className="mb-6">
              
              <div className="space-y-4">
                <NivelAlcanzadoComisiones />
              </div>
            </div>

            {/* Mensajes de estado */}
            {loading && (
              <div className="flex justify-center items-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            )}
            {error && (
              <div className="bg-red-500 bg-opacity-20 text-red-200 p-4 rounded-lg border border-red-400">
                {error}
              </div>
            )}
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  );
};