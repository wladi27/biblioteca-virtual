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
import { CreatePublication } from './pages/Post';
import { Validar } from './pages/Validar';
import { TotalUsuarios } from './pages/TotalUsuarios';
import { TotalReferralCodes } from './pages/TotalCodigos';
import { TotalWithdrawals } from './pages/TotalRetiros';
import { TotalApprovedContributions } from './pages/TotalAportes';
import { CrudComisiones } from './pages/CrudComisiones';
import WalletApp from './pages/Billetera';
import { CambiarContrasena } from './pages/Rpass';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/billetera" element={<WalletApp />} />
        <Route path="/perfil" element={<Perfil/>} />
        <Route path="/red" element={<Red/>} />
        <Route path="/terminos-y-condiciones" element={<Terminos/>} />
        <Route path="/comisiones" element={<Comisiones/>} />
        <Route path="/BV/auth/login" element={<LoginAdmin />} />
        <Route path="/BV/dashboard" element={<Admin />} />
        <Route path="/BV/red" element={<RedAdmin />} />
        <Route path="/BV/perfil" element={<PerfilAdmin />} />
        <Route path="/BV/post" element={<CreatePublication />} />
        <Route path="/BV/validar" element={<Validar />} />
        <Route path="/BV/usuarios" element={<TotalUsuarios />} />
        <Route path="/BV/codes" element={ <TotalReferralCodes />} />
        <Route path="/BV/retiros" element={ <TotalWithdrawals />} />
        <Route path="/BV/comisiones" element={<CrudComisiones />} />
        <Route path="/BV/aportes" element={<TotalApprovedContributions />} />
        <Route path="/BV/restaurar-password" element={<CambiarContrasena />} />

      </Routes>
    </Router>
  );
}

export default App;