import React, { useState } from 'react';
import { Red } from './Red'; // Asegúrate de tener la ruta correcta
import WalletApp from './Billetera'; // Asegúrate de tener la ruta correcta

const ParentComponent: React.FC = () => {
  const [totalUsuarios, setTotalUsuarios] = useState<number>(0); // Estado para el total de usuarios

  return (
    <div>
      <Red setTotalUsuarios={setTotalUsuarios} /> {/* Pasar la función para actualizar el total */}
      <WalletApp totalUsuarios={totalUsuarios} /> {/* Pasar el total de usuarios */}
    </div>
  );
};

export default ParentComponent;
