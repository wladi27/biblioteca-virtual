import React from 'react';

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <button onClick={onClose} className="text-white float-right">Cerrar</button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
