import React, { useEffect, useState } from 'react';
import { Background } from '../components/Background';
import { Navbar } from '../components/Navbar';
import { HeroSection } from '../components/HeroSection';
import { Features } from '../components/Features';
import { Testimonials } from '../components/Testimonials';

export const Home = () => {
  const [publicaciones, setPublicaciones] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchPublicaciones = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_URL_LOCAL}/api/publicaciones`);
        if (response.ok) {
          const data = await response.json();
          const activePosts = data.filter(post => post.status === 'activo');
          setPublicaciones(activePosts);
          if (activePosts.length > 0) {
            setShowModal(true);
          }
        }
      } catch (error) {
        console.error('Error al obtener publicaciones:', error);
      }
    };

    fetchPublicaciones();
  }, []);

  // Usa la URL pública de Cloudinary directamente
  const renderFile = (file) => {
    if (!file) return null;
    const fileExtension = file.split('.').pop().toLowerCase();

    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'webm', 'ogg'].includes(fileExtension)) {
      return <img src={file} alt="Publicación" className="w-full h-auto max-h-64 object-contain my-2 rounded" />;
    } else if (['mp4', 'webm', 'ogg'].includes(fileExtension)) {
      return (
        <video controls className="w-full h-auto max-h-64 my-2 rounded">
          <source src={file} type={`video/${fileExtension}`} />
          Tu navegador no soporta la etiqueta de video.
        </video>
      );
    } else if (['pdf'].includes(fileExtension)) {
      return (
        <a href={file} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline my-2 block">
          Ver PDF
        </a>
      );
    } else {
      return <p className="text-gray-400">Archivo no soportado</p>;
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Background />
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <HeroSection />
        <Features />

        <div className="relative py-16">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-gray-900 px-4 text-sm text-gray-400">
              Únete a miles de profesionales
            </span>
          </div>
        </div>

        <Testimonials />

        {/* Modal para mostrar las publicaciones activas */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden">
              <div className="p-6 max-h-[80vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4">Publicaciones Activas</h2>
                {publicaciones.length > 0 ? (
                  publicaciones.map((post) => (
                    <div key={post._id} className="mb-4">
                      <h3 className="text-lg font-semibold">{post.titulo}</h3>
                      {renderFile(post.file)}
                      <p className="text-gray-300 mb-2 whitespace-pre-line">{post.descripcion}</p>
                      <hr className="border-gray-600 my-2" />
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400">No hay publicaciones activas disponibles.</p>
                )}
                <div className="flex justify-end">
                  <button
                    className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-6 rounded-lg transition-colors"
                    onClick={handleCloseModal}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="py-16">
          <div className="relative rounded-2xl overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
              alt="Library"
              className="w-full h-96 object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/50 to-purple-900/50"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center max-w-2xl px-4">
                <h2 className="text-3xl font-bold mb-4">Comienza tu viaje hoy</h2>
                <p className="text-gray-300 mb-8">
                  Únete a nuestra comunidad y accede a recursos exclusivos que impulsarán tu desarrollo profesional
                </p>
                <a
                  href="/register"
                  className="inline-flex items-center px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  Registrarse Ahora
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-900/50 backdrop-blur-sm border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-gray-400">
            <div>
              <h3 className="font-semibold mb-4">Biblioteca Virtual</h3>
              <p className="text-sm">Transformando el aprendizaje y el networking profesional.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contacto</h3>
              <p className="text-sm">soporte@bibliotecavirtual.com</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <a href="/terminos-y-condiciones" className="text-sm text-gray-400 hover:underline">
                Términos y Condiciones
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>Biblioteca Virtual v0.1 © 2024</p>
          </div>
        </div>
      </footer>
    </div>
  );
};