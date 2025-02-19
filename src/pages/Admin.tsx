import React, { useEffect, useState, useCallback } from 'react';
import { Background } from '../components/Background';
import { FaHistory, FaUsers, FaCode, FaClipboard } from 'react-icons/fa';
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
  const [usuariosReferidos, setUsuariosReferidos] = useState([]);
  const [todosLosUsuarios, setTodosLosUsuarios] = useState([]);
  const [aportes, setAportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usuariosResponse, codigosResponse, retirosResponse, aportesResponse] = await Promise.all([
          fetch(`${import.meta.env.VITE_URL_LOCAL}/usuarios`),
          fetch(`${import.meta.env.VITE_URL_LOCAL}/api/referralCodes`),
          fetch(`${import.meta.env.VITE_URL_LOCAL}/withdrawals`),
          fetch(`${import.meta.env.VITE_URL_LOCAL}/api/aportes`)
        ]);

        if (!usuariosResponse.ok) throw new Error('Error al cargar usuarios');
        const usuariosData = await usuariosResponse.json();
        setTotalUsuarios(usuariosData.length);
        setTodosLosUsuarios(usuariosData);

        if (!codigosResponse.ok) throw new Error('Error al cargar códigos');
        const codigosData = await codigosResponse.json();
        setTotalCodigosCreados(codigosData.length);

        if (!retirosResponse.ok) throw new Error('Error al cargar retiros');
        const retirosData = await retirosResponse.json();
        setTotalRetiros(retirosData.length);
        setListaRetiros(retirosData);

        if (!aportesResponse.ok) throw new Error('Error al cargar aportes');
        const aportesData = await aportesResponse.json();
        setAportes(aportesData);
        const aportesValidados = aportesData.filter(aporte => aporte.aporte);
        setTotalAportesValidados(aportesValidados.length);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const obtenerDatosUsuario = useCallback(async (usuarioId, retiroId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/usuarios/${usuarioId}`);
      if (!response.ok) throw new Error('Error al obtener los datos del usuario');
      const usuarioData = await response.json();
      setUsuarioSeleccionado(usuarioData);
      setRetiroSeleccionado(retiroId);
      // Llamar a obtenerReferidos después de obtener el usuario
      await obtenerReferidos(usuarioId);
      setModalVisible(true);
    } catch (error) {
      setError(error.message);
    }
  }, [todosLosUsuarios, aportes]); // Asegurarse de que estos datos estén disponibles

  const obtenerReferidos = async (usuarioId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/api/referralCodes/user/${usuarioId}`);
      if (!response.ok) throw new Error('Error al obtener los códigos de referido');
      const codigosData = await response.json();
      const codigosReferidos = codigosData.map(codigo => codigo.code);

      if (todosLosUsuarios.length > 0) {
        const usuariosReferidosFiltrados = todosLosUsuarios.filter(usuario =>
          codigosReferidos.includes(usuario.codigo_referido)
        );

        const usuariosReferidosConNombres = usuariosReferidosFiltrados.map(usuario => {
          const aporte = aportes.find(aporte => aporte.usuarioId === usuario._id);
          return {
            id: usuario._id,
            nombre: usuario.nombre_usuario,
            validado: aporte ? aporte.aporte : false
          };
        });

        setUsuariosReferidos(usuariosReferidosConNombres);
      } else {
        setUsuariosReferidos([]);
      }
    } catch (error) {
      setError('Error al obtener los referidos');
    }
  };

  const filtrarRetiros = () => {
    if (!busqueda) return listaRetiros;
    return listaRetiros.filter(retiro => 
      retiro.usuarioId._id.toLowerCase().includes(busqueda.toLowerCase()) || 
      retiro.usuarioId.nombre_completo.toLowerCase().includes(busqueda.toLowerCase())
    );
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setUsuarioSeleccionado(null);
    setRetiroSeleccionado(null);
    setUsuariosReferidos([]);
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nuevoEstado })
      });

      if (!response.ok) throw new Error('Error al cambiar el estado del retiro');

      const retirosResponse = await fetch(`${import.meta.env.VITE_URL_LOCAL}/withdrawals`);
      const retirosData = await retirosResponse.json();
      setListaRetiros(retirosData);
      cerrarModal();
    } catch (error) {
      setError(error.message);
    }
  };

  const eliminarRetiro = async () => {
    if (!retiroSeleccionado) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/withdrawals/${retiroSeleccionado}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Error al eliminar el retiro');

      const retirosResponse = await fetch(`${import.meta.env.VITE_URL_LOCAL}/withdrawals`);
      const retirosData = await retirosResponse.json();
      setListaRetiros(retirosData);
      cerrarModal();
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-white">
      <Background />
      
      <div className="max-w-7xl px-4 py-16 flex-grow bg-opacity-65 bg-gray-800 rounded-2xl shadow-lg">
        <h1 className="text-4xl font-bold mb-4">Administración</h1>
        <hr />

        {loading && <p>Cargando datos...</p>}
        {error && <p className="text-red-500">{error}</p>}

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
            {filtrarRetiros().map((retiro) => (
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
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 overflow-y-auto">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Detalles del Usuario</h2>
            {['nombre_completo', 'dni', 'linea_llamadas', 'linea_whatsapp', 'banco', 'cuenta_numero', 'titular_cuenta', 'correo_electronico'].map((field, index) => (
              <div key={index} className="mb-2 flex justify-between items-center">
                <span><strong>{field.replace('_', ' ').toUpperCase()}:</strong> {usuarioSeleccionado[field]}</span>
                <FaClipboard 
                  className="cursor-pointer text-green-500"
                  onClick={() => copiarAlPortapapeles(usuarioSeleccionado[field])}
                />
              </div>
            ))}
            <hr />
            <h3 className="text-xl font-semibold mt-4">Usuarios Referidos</h3>
            {usuariosReferidos.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 mt-2">
                {usuariosReferidos.map(({ id, nombre, validado }, index) => (
                  <div key={index} className="p-4 rounded-lg bg-gray-700">
                    <p className="font-semibold">ID Usuario: {id}</p>
                    <p className="font-semibold">Nombre: {nombre}</p>
                    <p className={`font-semibold ${validado ? 'text-green-500' : 'text-red-500'}`}>
                      Validado: {validado ? 'Sí' : 'No'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No hay usuarios referidos.</p>
            )}

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
            <br /><br />
          </div>
        </div>
      )}

      <AdminNav />
    </div>
  );
};
