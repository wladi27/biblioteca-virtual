import React, { useEffect, useState } from "react";
import { Background } from "../components/Background";
import { MobileNav } from "../components/MobileNav";
import { NivelAlcanzadoComisiones } from "../components/NIvelAlcanzadoComisiones";
import { DollarSign, Sprout, ShieldCheck, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const Comisiones = () => {
  const [username, setUsername] = useState("");

  useEffect(() => {
    const usuario = localStorage.getItem("usuario");
    if (usuario) {
      try {
        const userData = JSON.parse(usuario);
        setUsername(userData.nombre_completo || userData.nombre_usuario || "Inversionista");
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#06110D] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      <Background />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow w-full">
        {/* Cabecera de Página */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2">
            <Sprout className="h-3.5 w-3.5" />
            <span>Plan de Rendimientos y Matriz</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-heading">
            Mis Comisiones de Co-Inversión
          </h1>
          <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
            Monitorea el plan de compensación de los 12 niveles de <strong className="text-emerald-400 font-medium">Granja Raíz de Vida</strong>. Cada nivel completado acredita rendimientos directamente a tu billetera digital.
          </p>
        </div>

        {/* Componente de Niveles y Comisiones */}
        <NivelAlcanzadoComisiones />
      </main>

      <br /><br />
      <MobileNav />
    </div>
  );
};