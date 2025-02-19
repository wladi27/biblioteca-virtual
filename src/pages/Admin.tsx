import React, { useEffect, useState } from 'react';
import { Background } from '../components/Background';
import { FaHistory, FaUsers, FaDollarSign, FaCode, FaClipboard } from 'react-icons/fa';
import { AdminNav } from '../components/AdminNav';
import { Link } from 'react-router-dom';

export const Admin = () => {
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [totalCodigosCreados, setTotalCodigosCreados] = useState(0);
  const [totalRetiros, setTotalRetiros] = useState(0);
  const [totalAportesValidados, setTotalAportesValidados] = useState(0);
  const [listaRetiros, setListaRetiros] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [retiroSeleccionado, setRetiroSeleccionado] = useState(null);
  const [aportesHijos, setAportesHijos] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usuariosResponse, codigosResponse, retirosResponse, aportesResponse] = await Promise.all([
          fetch(`${import.meta.env.VITE_URL_LOCAL}/usuarios`),
          fetch(`${import.meta.env.VITE_URL_LOCAL}/api/referralCodes`),
          fetch(`${import.meta.env.VITE_URL_LOCAL}/withdrawals`),
          fetch(`${import.meta.env.VITE_URL_LOCAL}/api/aportes`)
        ]);

        if (usuariosResponse.ok) {
          const usuariosData = await usuariosResponse.json();
          setTotalUsuarios(usuariosData.length);
        }

        if (codigosResponse.ok) {
          const codigosData = await codigosResponse.json();
          setTotalCodigosCreados(codigosData.length);
        }

        if (retirosResponse.ok) {
          const retirosData = await retirosResponse.json();
          setTotalRetiros(retirosData.length);
          setListaRetiros(retirosData);
        }

        if (aportesResponse.ok) {
          const aportesData = await aportesResponse.json();
          const aportesValidados = aportesData.filter(aporte => aporte.aporte === true);
          setTotalAportesValidados(aportesValidados.length);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchData();
  }, []);

  const obtenerDatosUsuario = async (usuarioId, retiroId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/usuarios/${usuarioId}`);
      if (response.ok) {
        const usuarioData = await response.json();
        setUsuarioSeleccionado(usuarioData);
        setRetiroSeleccionado(retiroId);
        await obtenerAportes(usuarioData); // Obtener aportes de usuario y sus hijos
        setModalVisible(true);
      } else {
        console.error('Error al obtener los datos del usuario:', response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const obtenerAportes = async (usuario) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/api/aportes`);
      if (response.ok) {
        const aportesData = await response.json();

        // Filtrar los IDs de los hijos
        const hijosIds = [usuario.hijo1_id, usuario.hijo2_id, usuario.hijo3_id].filter(id => id);

        // Crear un objeto para almacenar los aportes de los hijos
        const aportesHijosData = hijosIds.map(id => {
          const aporte = aportesData.find(aporte => aporte.usuarioId === id);
          return {
            hijoId: id,
            aporte: aporte ? aporte.aporte : false // Si no hay aporte, se considera como false
          };
        });

        // Guardar los datos de los aportes de los hijos en el estado
        setAportesHijos(aportesHijosData);
      }
    } catch (error) {
      console.error('Error al obtener los aportes:', error);
    }
  };

  const filtrarRetiros = () => {
    if (!busqueda) return listaRetiros;

    return listaRetiros.filter(retiro => 
      retiro.usuarioId._id.includes(busqueda) || 
      retiro.usuarioId.nombre_completo.toLowerCase().includes(busqueda.toLowerCase())
    );
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setUsuarioSeleccionado(null);
    setRetiroSeleccionado(null);
    setAportesHijos([]); // Limpiar aportes al cerrar el modal
  };

  const copiarAlPortapapeles = (texto) => {
    navigator.clipboard.writeText(texto)
      .then(() => alert('Datos copiados al portapapeles'))
      .catch(err => console.error('Error al copiar:', err));
  };

  const cambiarEstadoRetiro = async (nuevoEstado) => {
    if (!retiroSeleccionado) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/withdrawals/${retiroSeleccionado}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: nuevoEstado })
      });

      if (!response.ok) {
        throw new Error('Error al cambiar el estado del retiro');
      }

      const retirosResponse = await fetch(`${import.meta.env.VITE_URL_LOCAL}/withdrawals`);
      const retirosData = await retirosResponse.json();
      setListaRetiros(retirosData);
      cerrarModal();
    } catch (error) {
      console.error('Error al cambiar el estado del retiro:', error);
    }
  };

  const eliminarRetiro = async () => {
    if (!retiroSeleccionado) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/withdrawals/${retiroSeleccionado}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el retiro');
      }

      const retirosResponse = await fetch(`${import.meta.env.VITE_URL_LOCAL}/withdrawals`);
      const retirosData = await retirosResponse.json();
      setListaRetiros(retirosData);
      cerrarModal();
    } catch (error) {
      console.error('Error al eliminar el retiro:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-white">
      <Background />
      
      <div className="max-w-7xl px-4 py-16 flex-grow bg-opacity-65 bg-gray-800 rounded-2xl shadow-lg">
        <h1 className="text-4xl font-bold mb-4">Administración</h1>
        <hr />

        <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <Link to="/BV/usuarios" className="bg-gray-700 bg-opacity-30 p-6 rounded-lg shadow-md flex items-center">
            <FaUsers className="text-3xl mr-4" />
            <div>
              <h2 className="text-xl font-semibold">Total de Usuarios</h2>
              <p className="text-gray-400">{totalUsuarios}</p>
            </div>
          </Link>

          <Link to="/BV/codes" className="bg-gray-700 bg-opacity-30 p-6 rounded-lg shadow-md flex items-center">
            <FaCode className="text-3xl mr-4" />
            <div>
              <h2 className="text-xl font-semibold">Total de Códigos Creados</h2>
              <p className="text-gray-400">{totalCodigosCreados}</p>
            </div>
          </Link>

          {/* <Link to="/BV/retiros" className="bg-gray-700 bg-opacity-30 p-6 rounded-lg shadow-md flex items-center">
            <FaDollarSign className="text-3xl mr-4" />
            <div>
              <h2 className="text-xl font-semibold">Total de Retiros</h2>
              <p className="text-gray-400">{totalRetiros}</p>
            </div>
          </Link>
 */}
          <Link to="/BV/aportes" className="bg-gray-700 bg-opacity-30 p-6 rounded-lg shadow-md flex items-center">
            <FaClipboard className="text-3xl mr-4" />
            <div>
              <h2 className="text-xl font-semibold">Total de Aportes Validados</h2>
              <p className="text-gray-400">{totalAportesValidados}</p>
            </div>
          </Link>
        </div>

        <div className="bg-gray-700 bg-opacity-30 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <FaHistory className="mr-2" /> Lista de Retiros
          </h2>
          <input
            type="text"
            placeholder="Buscar por ID o Nombre"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="mb-4 p-2 rounded bg-gray-600 text-white w-full"
          />
          <ul className="space-y-4">
            {filtrarRetiros().map((retiro) => ( // Mostrar todos los retiros
              <li key={retiro._id} className="bg-gray-600 p-4 rounded-lg flex justify-between items-center">
                <div className="flex-grow">
                  <p className="font-semibold">ID Usuario: {retiro.usuarioId._id}</p>
                  <p className="font-semibold">Nombre: {retiro.usuarioId.nombre_completo}</p>
                  <p className="font-semibold">Monto: ${retiro.monto}</p>
                  <p className="text-gray-400">Estado: {retiro.status}</p>
                  <p className="text-gray-400">Fecha: {new Date(retiro.fecha).toLocaleDateString()}</p>
                </div>
                <button 
                  onClick={() => obtenerDatosUsuario(retiro.usuarioId._id, retiro._id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200 ease-in-out"
                >
                  Ver
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {modalVisible && usuarioSeleccionado && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4">Detalles del Usuario</h2>
            <div className="mb-2 flex justify-between items-center">
              <span><strong>Nombre Completo:</strong> {usuarioSeleccionado.nombre_completo}</span>
              <FaClipboard 
                className="cursor-pointer text-green-500"
                onClick={() => copiarAlPortapapeles(usuarioSeleccionado.nombre_completo)}
              />
            </div>
            
            <div className="mb-2 flex justify-between items-center">
              <span><strong>CC:</strong> {usuarioSeleccionado.dni}</span>
              <FaClipboard 
                className="cursor-pointer text-green-500"
                onClick={() => copiarAlPortapapeles(usuarioSeleccionado.dni)}
              />
            </div>
            <div className="mb-2 flex justify-between items-center">
              <span><strong>Teléfono:</strong> {usuarioSeleccionado.linea_llamadas}</span>
              <FaClipboard 
                className="cursor-pointer text-green-500"
                onClick={() => copiarAlPortapapeles(usuarioSeleccionado.linea_llamadas)}
              />
            </div>
            <div className="mb-2 flex justify-between items-center">
              <span><strong>WhatsApp:</strong> {usuarioSeleccionado.linea_whatsapp}</span>
              <FaClipboard 
                className="cursor-pointer text-green-500"
                onClick={() => copiarAlPortapapeles(usuarioSeleccionado.linea_whatsapp)}
              />
            </div>
            <div className="mb-2 flex justify-between items-center">
              <span><strong>Banco:</strong> {usuarioSeleccionado.banco}</span>
              <FaClipboard 
                className="cursor-pointer text-green-500"
                onClick={() => copiarAlPortapapeles(usuarioSeleccionado.banco)}
              />
            </div>
            <div className="mb-2 flex justify-between items-center">
              <span><strong>Número de Cuenta:</strong> {usuarioSeleccionado.cuenta_numero}</span>
              <FaClipboard 
                className="cursor-pointer text-green-500"
                onClick={() => copiarAlPortapapeles(usuarioSeleccionado.cuenta_numero)}
              />
            </div>
            <div className="mb-2 flex justify-between items-center">
              <span><strong>Titular de la Cuenta:</strong> {usuarioSeleccionado.titular_cuenta}</span>
              <FaClipboard 
                className="cursor-pointer text-green-500"
                onClick={() => copiarAlPortapapeles(usuarioSeleccionado.titular_cuenta)}
              />
            </div>
            <div className="mb-2 flex justify-between items-center">
              <span><strong>Correo Electrónico:</strong> {usuarioSeleccionado.correo_electronico}</span>
              <FaClipboard 
                className="cursor-pointer text-green-500"
                onClick={() => copiarAlPortapapeles(usuarioSeleccionado.correo_electronico)}
              />
            </div>
            <hr />
            {/* Mostrar aportes de los hijos */}
            <h3 className="text-xl font-semibold mt-4">Aportes de los Hijos</h3>
            {aportesHijos.map((aporte, index) => (
              <div key={index} className="mb-2 flex justify-between items-center">
                <span><strong>Hijo ID:</strong> {aporte.hijoId}</span>
                <span className={aporte.aporte ? 'text-green-500' : 'text-red-500'}>
                  {aporte.aporte ? 'Validado' : 'No Validado'}
                </span>
              </div>
            ))}

            <div className="mt-4 flex justify-between">
              <button 
                onClick={() => cambiarEstadoRetiro('aceptado')}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-200 ease-in-out mr-2"
              >
                Aceptar
              </button>
              <button 
                onClick={() => cambiarEstadoRetiro('pagado')}
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded transition duration-200 ease-in-out mr-2"
              >
                Pagar
              </button>
              <button 
                onClick={eliminarRetiro}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-200 ease-in-out"
              >
                Rechazar
              </button>
            </div>

            <button 
              onClick={cerrarModal}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-200 ease-in-out"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      <AdminNav />
    </div>
  );
};
