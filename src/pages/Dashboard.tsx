import React, { useEffect, useState } from 'react';
import { Background } from '../components/Background';
import { MobileNav } from '../components/MobileNav';
import { FaDollarSign, FaCode, FaHistory } from 'react-icons/fa';
import { NivelAlcanzadoComponent } from '../components/NIvelAlcanzado';


export const Dashboard = () => {
  const [comisiones, setComisiones] = useState(0);
  const [codigosCreados, setCodigosCreados] = useState(0);
  const [retiros, setRetiros] = useState([]);
  const [aporteDado, setAporteDado] = useState(() => {
    return localStorage.getItem('aporteDado') === 'true';
  });
  const [comprobanteSubido, setComprobanteSubido] = useState(() => {
    return localStorage.getItem('comprobanteSubido') === 'true';
  });
  const [postActivo, setPostActivo] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);

  useEffect(() => {
    const fetchPostActivo = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/api/publicaciones`);
        if (response.ok) {
          const data = await response.json();
          const post = data.find(post => post.status === 'activo');
          setPostActivo(post);
          if (post) {
            setShowPostModal(true);
          }
        } else {
          console.error('Error al obtener publicaciones');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchPostActivo();

    const usuario = localStorage.getItem('usuario');
    if (usuario) {
      const userData = JSON.parse(usuario);
      setComisiones(userData.comisiones || 0);
      fetchRetiros(userData._id);
      fetchCodigosCreados(userData._id);
    }
  }, []);

  const fetchRetiros = async (userId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/withdrawals/usuario/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setRetiros(data.length > 0 ? data : []);
      } else {
        console.error('Error al obtener los retiros');
        setRetiros([]);
      }
    } catch (error) {
      console.error('Error:', error);
      setRetiros([]);
    }
  };

  const fetchCodigosCreados = async (userId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/api/referralCodes/user/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setCodigosCreados(data.length);
      } else {
        console.error('Error al obtener los códigos creados');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleAporteClick = async () => {
    const usuario = localStorage.getItem('usuario');
    if (usuario) {
      const userData = JSON.parse(usuario);
      const aporteData = { usuarioId: userData._id };

      try {
        const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/api/aportes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(aporteData),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Aporte enviado:', data);
          setAporteDado(true);
          localStorage.setItem('aporteDado', 'true'); // Guardar estado en localStorage

          // Enviar mensaje a WhatsApp después de dar aporte
          const mensaje = `Hola!
Me gustaría hacer una contribución a la biblioteca virtual. ¿Podrías proporcionarme la cuenta para realizar el aporte?`;
          const telefono = "+573137862938"; // Reemplaza con el número de WhatsApp deseado
          const urlWhatsApp = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
          window.open(urlWhatsApp, '_blank');
        } else {
          console.error('Error al enviar el aporte');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const handleSubirComprobanteClick = () => {
    const usuario = localStorage.getItem('usuario');
    if (usuario) {
      const userData = JSON.parse(usuario);
      const mensaje = `Hola, aquí está mi comprobante de aporte. Mi ID es: ${userData._id} y mi nombre es: ${userData.nombre_completo}.`;
      const telefono = "+573137862938"; // Reemplaza con el número de WhatsApp deseado
      const urlWhatsApp = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
      window.open(urlWhatsApp, '_blank');

      setComprobanteSubido(true);
      localStorage.setItem('comprobanteSubido', 'true'); // Guardar estado en localStorage
    }
  };

  const handleClosePostModal = () => {
    setShowPostModal(false);
  };

  return (
    <div className="min-h-screen flex flex-col text-white">
      <Background />
      <div className="max-w-7xl mx-auto px-4 py-16 flex-grow bg-opacity-65 bg-gray-800 rounded-2xl shadow-lg">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Home</h1>
        <hr className="mb-6" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <NivelAlcanzadoComponent />
          <div className="bg-gray-700 bg-opacity-30 p-6 rounded-lg shadow-md flex items-center transition-transform transform hover:scale-105">
            <FaCode className="text-3xl mr-4" />
            <div>
              <h2 className="text-xl font-semibold">Códigos Creados</h2>
              <p className="text-gray-400">{codigosCreados}</p>
            </div>
          </div>
        </div>

        <button
          onClick={comprobanteSubido ? null : (aporteDado ? handleSubirComprobanteClick : handleAporteClick)}
          className={`mt-6 py-3 px-6 rounded-lg shadow-md transition-colors ${
            aporteDado && !comprobanteSubido ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-600 opacity-50 cursor-not-allowed'
          } text-white font-semibold`}
          disabled={aporteDado && comprobanteSubido}
        >
          {comprobanteSubido ? 'Comprobante Enviado' : aporteDado ? 'Subir Comprobante de Aporte' : 'Dar Aporte'}
        </button>

        <div className="bg-gray-700 bg-opacity-30 p-6 rounded-lg shadow-md transition-transform transform hover:scale-105 mt-6">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <FaHistory className="mr-2" /> Lista de Retiros
          </h2>
          {retiros.length > 0 ? (
            <ul className="list-none space-y-4">
              {retiros.map((retiro) => (
                <li key={retiro._id} className="flex flex-col sm:flex-row justify-between items-center p-4 bg-gray-900 rounded-md shadow-sm transition-colors hover:bg-gray-800">
                  <span className="text-gray-300">Monto: ${retiro.monto}</span>
                  <span className="text-gray-300">{retiro.status}</span>
                  <span className="text-gray-300">{new Date(retiro.fecha).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">No hay retiros disponibles.</p>
          )}
        </div>
      </div>

      {/* Modal para mostrar el post activo */}
      {postActivo && showPostModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-semibold mb-4">{postActivo.titulo}</h2>
            <img style={{maxHeight: '350px'}} src={`${import.meta.env.VITE_URL_LOCAL}/${postActivo.file}`} alt={postActivo.titulo} className="mb-4 w-full h-auto rounded-md" />
            <p className="text-gray-300 mb-4">{postActivo.descripcion}</p>
            <button
              className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
              onClick={handleClosePostModal}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      <MobileNav />
    </div>
  );
};
