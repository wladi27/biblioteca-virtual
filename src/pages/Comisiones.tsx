import React, { useEffect, useState } from "react";
import { Background } from "../components/Background";
import { MobileNav } from "../components/MobileNav";
import { NivelAlcanzadoComisiones } from "../components/NIvelAlcanzadoComisiones";


export const Comisiones = () => {
  const [username, setUsername] = useState("");

  useEffect(() => {
    const usuario = localStorage.getItem("usuario");
    if (usuario) {
      const userData = JSON.parse(usuario);
      setUsername(userData.nombre_completo);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col text-white">
      <Background />

      <div className="max-w-7xl mx-auto px-4 py-16 flex-grow bg-opacity-65 bg-gray-800 rounded-2xl shadow-lg">
        <h1 className="text-4xl font-bold mb-4 text-center">Comisiones</h1>
        <hr className="mb-6" />

        <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          <NivelAlcanzadoComisiones />
        </div>
      </div>

      <MobileNav />
    </div>
  );
};
