import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<Home />} /> {/* Esta línea redirige todas las rutas a Home */}
      </Routes>
    </Router>
  );
}

export default App;
