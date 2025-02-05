import React, { useEffect, useState } from "react";
import { Background } from "../components/Background";
import { MobileNav } from "../components/MobileNav";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { NivelAlcanzadoComisiones } from "../components/NivelAlcanzadoComisiones";

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

      <div className="max-w-7xl  px-4 py-16 flex-grow bg-opacity-65 bg-gray-800 rounded-2xl shadow-lg">
        <h1 className="text-4xl font-bold mb-4">Comisiones</h1>
        <hr />

        <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <NivelAlcanzadoComisiones /> {/* Pasar nivelesCompletados */}
          
        </div>

        
      </div>

      <MobileNav />
    </div>
  );
};
