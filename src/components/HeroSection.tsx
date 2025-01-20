import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HeroSection = () => {
  return (
    <div className="relative overflow-hidden py-20 sm:py-32">
      <div className="relative">
        <div className="text-center">
          <h1 className="text-4xl sm:text-6xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-blue-500 to-purple-600">
            Transforma tu Futuro<br />con Conocimiento
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Únete a la plataforma educativa multinivel líder en Latinoamérica.
            Accede a contenido exclusivo, construye tu red y alcanza el éxito.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Comenzar Ahora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center px-6 py-3 rounded-lg bg-gray-800/50 backdrop-blur-sm border border-gray-700 hover:bg-gray-800 transition-colors"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};