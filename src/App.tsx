import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Perfil } from './pages/Perfil';
import { Red } from './pages/Red';
import { Comisiones } from './pages/Comisiones';
import { Terminos } from './pages/Terminos';
import { LoginAdmin } from './pages/LoginAdmin';
import { Admin } from './pages/Admin';
import { RedAdmin } from './pages/RedAdmin';
import { PerfilAdmin } from './pages/PerfilAdmin';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/perfil" element={<Perfil/>} />
        <Route path="/red" element={<Red/>} />
        <Route path="/terminos-y-condiciones" element={<Terminos/>} />
        <Route path="/comisiones" element={<Comisiones/>} />
        <Route path="/BV/auth/login" element={<LoginAdmin />} />
        <Route path="/BV/dashboard" element={<Admin />} />
        <Route path="/BV/red" element={<RedAdmin />} />
        <Route path="/BV/perfil" element={<PerfilAdmin />} />
      </Routes>
    </Router>
  );
}

export default App;