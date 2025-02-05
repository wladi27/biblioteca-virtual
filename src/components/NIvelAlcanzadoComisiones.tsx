import React, { useEffect, useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

export const NivelAlcanzadoComisiones = () => {
  const [username, setUsername] = useState('');
  const [nivelUsuario, setNivelUsuario] = useState(0);
  const [nivelesCompletados, setNivelesCompletados] = useState(0);
  const [comisionesData, setComisionesData] = useState([]);
  const [openAcordeon, setOpenAcordeon] = useState({});
  const [loading, setLoading] = useState(true);
  const [retiros, setRetiros] = useState([]);
  const [userId, setUserId] = useState('');
  const [mensajeRetiro, setMensajeRetiro] = useState('');

  useEffect(() => {
    const usuario = localStorage.getItem('usuario');
    if (usuario) {
      const userData = JSON.parse(usuario);
      setUsername(userData.nombre_completo);
      setNivelUsuario(userData.nivel || 0);
      setUserId(userData._id); // Guardar el ID de usuario
      calcularNivelesCompletados(userData._id);
      fetchRetiros(userData._id); // Obtener retiros del usuario
    }
  }, []);

  useEffect(() => {
    const fetchComisiones = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/niveles`);
        if (response.ok) {
          const data = await response.json();
          setComisionesData(data);
        } else {
          console.error('Error al obtener las comisiones');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchComisiones();
  }, []);

  const fetchRetiros = async (userId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/withdrawals/usuario/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setRetiros(data);
      } else {
        console.error('Error al obtener los retiros');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const calcularNivelesCompletados = async (userId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/usuarios/piramide/${userId}`);
      if (response.ok) {
        const data = await response.json();
        const hijos = data.hijos || [];
        let nivelesCompletados = 0;
        let currentNivelData = hijos;

        for (let nivel = 1; nivel <= 12; nivel++) {
          const cantidadEsperada = Math.pow(3, nivel);
          if (currentNivelData.length === cantidadEsperada) {
            nivelesCompletados++;
          } else {
            break;
          }
          currentNivelData = currentNivelData.flatMap(usuario => usuario.hijos || []);
        }

        setNivelesCompletados(nivelesCompletados);
      } else {
        console.error('Error al obtener la data de la pirámide');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAcordeon = (nivel) => {
    setOpenAcordeon((prev) => ({ ...prev, [nivel]: !prev[nivel] }));
  };

  const handleRetirar = async (monto) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/withdrawals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioId: userId, monto }),
      });

      if (response.ok) {
        const nuevoRetiro = await response.json();
        setRetiros([...retiros, nuevoRetiro]);
        setMensajeRetiro('Retiro registrado exitosamente');
        setTimeout(() => setMensajeRetiro(''), 3000); // Limpiar mensaje después de 3 segundos
        fetchRetiros(userId); // Actualizar la lista de retiros
      } else {
        console.error('Error al registrar el retiro');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const isRetiroPendiente = (monto) => {
    return retiros.some(retiro => retiro.monto === monto && retiro.status === 'pendiente');
  };

  const renderAcordeon = (nivel) => {
    if (nivel > nivelesCompletados || nivel > 12) return null;

    const comision = comisionesData.find(c => c.numero_nivel === nivel);
    const montoComision = comision ? Number(comision.comision.$numberDecimal) : 0;

    return (
      <div className="mb-4" key={`nivel-${nivel}`}>
        <div
          className="bg-gray-800 p-2 rounded-lg flex justify-between items-center cursor-pointer"
          onClick={() => toggleAcordeon(nivel)}
        >
          <h3 className="text-lg font-semibold">{`Nivel ${nivel}`}</h3>
          <span className="text-sm text-green-500">
            {comision ? `Comisión: COP ${montoComision}` : 'No disponible'}
          </span>
          {openAcordeon[nivel] ? <FaChevronUp /> : <FaChevronDown />}
        </div>
        {openAcordeon[nivel] && (
          <div className="bg-gray-900 p-4 rounded-lg mt-2 flex justify-between">
            <p className="text-gray-400">
              Comisión: COP {montoComision}
            </p>
            {isRetiroPendiente(montoComision) ? (
              <span className="text-yellow-500">
                {`Estado: Pendiente`}
              </span>
            ) : (
              <button
                className="bg-blue-500 text-white py-1 px-3 rounded"
                onClick={() => handleRetirar(montoComision)}
              >
                Retirar
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderTodosLosNiveles = () => {
    const niveles = [];
    for (let nivel = 1; nivel <= 12; nivel++) {
      niveles.push(renderAcordeon(nivel));
    }
    return niveles;
  };

  return (
    <div>
      <div className="mt-6 bg-gray-700 bg-opacity-30 p-6 rounded-lg shadow-md flex items-center">
        <div>
          <h2 className="text-xl font-semibold">Nivel alcanzado</h2>
          <p className="text-gray-400">{nivelesCompletados}</p>
        </div>
      </div>
      <div className="mt-4 bg-gray-700 bg-opacity-30 p-6 rounded-lg shadow-md flex items-center">           
            <div>
              <h2 className="text-xl font-semibold">Nivel Máximo</h2>
              <p className="text-gray-400">12</p>
            </div>
            <br />
          </div>
      {mensajeRetiro && (
        <div className="mt-4 p-2 bg-green-500 text-white rounded">
          {mensajeRetiro}
        </div>
      )}

      {loading ? (
        <p className="text-gray-400">Cargando...</p>
      ) : (
        <div className="mt-4">
          {renderTodosLosNiveles()}
        </div>
      )}
    </div>
  );
};
