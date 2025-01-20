import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Perfil } from './pages/Perfil';
import { Red } from './pages/Red';
import { Comisiones } from './pages/Comisiones';

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
        <Route path="/comisiones" element={<Comisiones/>} />
      </Routes>
    </Router>
  );
}

export default App;