import React, { useEffect, useState } from "react";
import { Background } from "../components/Background";
import { MobileNav } from "../components/MobileNav";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { User } from "lucide-react";

export const Comisiones = () => {
  const [username, setUsername] = useState("");
  const [nivelUsuario, setNivelUsuario] = useState(0);
  const [nivelMasAltoCompletado, setNivelMasAltoCompletado] = useState(0);
  const [piramideData, setPiramideData] = useState([]);
  const [comisionesData, setComisionesData] = useState([]);
  const [retiros, setRetiros] = useState([]);
  const [openAcordeon, setOpenAcordeon] = useState(null);
  const [mensajeExito, setMensajeExito] = useState("");
  const [montos, setMontos] = useState([]); // Estado para almacenar los montos de retiros

  useEffect(() => {
    const usuario = localStorage.getItem("usuario");
    if (usuario) {
      const userData = JSON.parse(usuario);
      setUsername(userData.nombre_completo);
      setNivelUsuario(userData.nivel || 0);

      const fetchPiramideData = async () => {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_URL_LOCAL}/usuarios/piramide/${
              userData._id
            }`
          );
          if (response.ok) {
            const data = await response.json();
            setPiramideData(data.niveles);
          } else {
            console.error("Error al obtener la data de la pirámide");
          }
        } catch (error) {
          console.error("Error:", error);
        }
      };

      const fetchUserLevel = async () => {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_URL_LOCAL}/usuarios/nivel`
          );
          if (response.ok) {
            const data = await response.json();
            setNivelMasAltoCompletado(data.nivelMasAltoCompletado);
          } else {
            console.error("Error al obtener el nivel del usuario");
          }
        } catch (error) {
          console.error("Error:", error);
        }
      };

      const fetchRetiros = async () => {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_URL_LOCAL}/withdrawals/usuario/${
              userData._id
            }`
          );
          if (response.ok) {
            const data = await response.json();
            setRetiros(data);
            const montosRetiros = data.map((retiro) => Number(retiro.monto));
            setMontos(montosRetiros);
            
          } else {
            console.error("Error al obtener los retiros");
          }
        } catch (error) {
          console.error("Error:", error);
        }
      };

      fetchPiramideData();
      fetchUserLevel();
      fetchRetiros();
    }
  }, []);

  useEffect(() => {
    const fetchComisiones = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_URL_LOCAL}/niveles/`
        );
        if (response.ok) {
          const data = await response.json();
          setComisionesData(data);
        } else {
          console.error("Error al obtener las comisiones");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchComisiones();
  }, []);

  const diferenciaNivel = nivelMasAltoCompletado - nivelUsuario;
  const nivelMostrado = Math.max(diferenciaNivel, 0);

  const toggleAcordeon = (id) => {
    setOpenAcordeon(openAcordeon === id ? null : id);
  };

  const handleRetirar = async (monto) => {
    const usuario = localStorage.getItem("usuario");
    if (usuario) {
      const userData = JSON.parse(usuario);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_URL_LOCAL}/withdrawals`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ usuarioId: userData._id, monto }),
          }
        );
        if (response.ok) {
          const newRetiro = await response.json();
          setRetiros([...retiros, newRetiro]);
          setMontos([...montos, Number(monto)]);
          setMensajeExito("Retiro registrado exitosamente");
          setTimeout(() => setMensajeExito(""), 3000);
        } else {
          console.error("Error al registrar el retiro");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-white">
      <Background />

      <div className="max-w-7xl mx-auto px-4 py-16 flex-grow bg-opacity-65 bg-gray-800 rounded-2xl shadow-lg">
        <h1 className="text-4xl font-bold mb-4">Comisiones</h1>
        <hr />

        {mensajeExito && (
          <div className="bg-green-500 text-white p-4 rounded mb-4">
            {mensajeExito}
          </div>
        )}

        <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div className="bg-gray-700 bg-opacity-30 p-6 rounded-lg shadow-md flex items-center">
            <div>
              <h2 className="text-xl font-semibold">Nivel alcanzado</h2>
              <p className="text-gray-400">{nivelMostrado}</p>
            </div>
          </div>
          <div className="bg-gray-700 bg-opacity-30 p-6 rounded-lg shadow-md flex items-center">
            <div>
              <h2 className="text-xl font-semibold">Nivel Máximo</h2>
              <p className="text-gray-400">12</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-700 bg-opacity-30 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Comisiones por Nivel</h2>
          {nivelMostrado > 0 ? (
            Array.from({ length: nivelMostrado }).map((_, index) => {
              const nivelActual = index + 1;
              const comision = comisionesData.find(
                (c) => c.numero_nivel === nivelActual
              );
              const retiro = retiros.find(
                (r) =>
                  Number(r.monto) === Number(comision?.comision.$numberDecimal)
              );

              return (
                <div key={nivelActual} className="mb-4">
                  <div
                    className="bg-gray-800 p-4 rounded-lg flex justify-between items-center cursor-pointer"
                    onClick={() => toggleAcordeon(nivelActual)}
                  >
                    <h3 className="text-lg font-semibold">
                      Nivel {nivelActual}
                    </h3>
                    {openAcordeon === nivelActual ? (
                      <FaChevronUp />
                    ) : (
                      <FaChevronDown />
                    )}
                  </div>
                  {openAcordeon === nivelActual && (
                    <div className="bg-gray-900 p-4 rounded-lg mt-2">
                      <p className="text-gray-400">
                        Comisión: COP{" "}
                        {comision
                          ? comision.comision.$numberDecimal
                          : "No disponible"}
                      </p>
                      {retiro ? (
                        <p className="text-yellow-400 mt-2">
                          Estado: {retiro.status}
                        </p>
                      ) : (
                        <div className="flex justify-center mt-4">
                          {montos.includes(
                            Number(comision?.comision.$numberDecimal)
                          ) ? (
                            <p className="text-red-500">
                              No se puede retirar, monto ya solicitado.
                            </p>
                          ) : (
                            <button
                              className="bg-blue-500 text-white py-2 px-4 rounded"
                              onClick={() =>
                                handleRetirar(comision.comision.$numberDecimal)
                              }
                            >
                              Retirar
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-gray-400">No hay datos disponibles.</p>
          )}
        </div>
      </div>

      <MobileNav />
    </div>
  );
};
