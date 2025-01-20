import React from 'react';
import { Link } from 'react-router-dom';
import { Library } from 'lucide-react';

export const Navbar = () => {
  return (
    <nav className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Library className="h-8 w-8 text-blue-400" />
            <span className="text-xl font-bold text-white">Biblioteca Virtual</span>
          </Link>
          <div className="flex space-x-4">
            <Link to="/login" className="text-gray-300 hover:text-white px-3 py-2 rounded-md">
              Iniciar Sesión
            </Link>
            <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              Registrarse
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};