import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Menu, X, ArrowRight } from 'lucide-react';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#06110D]/90 border-b border-emerald-500/15 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-11 w-11 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/10 group-hover:scale-105 group-hover:border-emerald-400 transition-all">
              <Sprout className="h-6 w-6 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-white font-heading leading-tight">
                Granja <span className="text-emerald-400">Raíz de Vida</span>
              </span>

            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            <a
              href="#proyectos"
              className="text-sm font-medium text-slate-300 hover:text-emerald-300 px-3.5 py-2 rounded-lg hover:bg-emerald-500/10 transition-all"
            >
              Proyectos & Modelo
            </a>
            <a
              href="#como-invertir"
              className="text-sm font-medium text-slate-300 hover:text-emerald-300 px-3.5 py-2 rounded-lg hover:bg-emerald-500/10 transition-all"
            >
              Cómo Invertir
            </a>
            <a
              href="#rendimientos"
              className="text-sm font-medium text-slate-300 hover:text-emerald-300 px-3.5 py-2 rounded-lg hover:bg-emerald-500/10 transition-all"
            >
              Plan de Rendimientos
            </a>
            <a
              href="#faq"
              className="text-sm font-medium text-slate-300 hover:text-emerald-300 px-3.5 py-2 rounded-lg hover:bg-emerald-500/10 transition-all"
            >
              Preguntas Frecuentes
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-semibold text-slate-200 hover:text-white px-4 py-2.5 rounded-xl hover:bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/40 transition-all"
            >
              Acceso Inversionistas
            </Link>
            <Link
              to="/register"
              className="group inline-flex items-center gap-2 text-sm font-bold text-slate-950 px-5 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all"
            >
              <span>Comenzar a Invertir</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform text-slate-950" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-emerald-500/10 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-emerald-500/15 bg-[#06110D]/95 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-4">
          <nav className="flex flex-col space-y-2">
            <a
              href="#proyectos"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-slate-300 hover:text-emerald-300 px-3 py-2 rounded-lg hover:bg-emerald-500/10"
            >
              Proyectos & Modelo
            </a>
            <a
              href="#como-invertir"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-slate-300 hover:text-emerald-300 px-3 py-2 rounded-lg hover:bg-emerald-500/10"
            >
              Cómo Invertir
            </a>
            <a
              href="#rendimientos"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-slate-300 hover:text-emerald-300 px-3 py-2 rounded-lg hover:bg-emerald-500/10"
            >
              Plan de Rendimientos
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-slate-300 hover:text-emerald-300 px-3 py-2 rounded-lg hover:bg-emerald-500/10"
            >
              Preguntas Frecuentes
            </a>
          </nav>
          <div className="pt-4 border-t border-emerald-500/15 flex flex-col gap-2.5">
            <Link
              to="/login"
              className="w-full text-center py-2.5 rounded-xl text-sm font-semibold text-slate-200 bg-slate-900 border border-emerald-500/20 hover:bg-slate-800"
            >
              Acceso Inversionistas
            </Link>
            <Link
              to="/register"
              className="w-full text-center py-2.5 rounded-xl text-sm font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-md shadow-emerald-500/20"
            >
              Comenzar a Invertir
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};