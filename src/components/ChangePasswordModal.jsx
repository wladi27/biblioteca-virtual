import React, { useState } from 'react';

const ChangePasswordModal = ({ show, onClose, onChangePassword }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setUpdateMessage('Las contraseñas no coinciden.');
      return;
    }
    onChangePassword(newPassword);
    setNewPassword('');
    setConfirmPassword('');
    onClose();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-800 p-4 rounded-lg shadow-lg text-center max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Cambiar Contraseña</h2>
        {updateMessage && <div className="mb-4 text-green-400">{updateMessage}</div>}
        <form onSubmit={handleChangePassword} className="flex flex-col items-center">
          <label className="text-left w-full mb-1" htmlFor="newPassword">Nueva Contraseña</label>
          <div className="relative w-full mb-4">
            <input
              id="newPassword"
              type={passwordVisible ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="p-2 rounded-md bg-gray-700 text-white w-full"
              required
            />
            <button type="button" className="absolute right-2 top-1/2 transform -translate-y-1/2" onClick={() => setPasswordVisible(!passwordVisible)}>
              {passwordVisible ? '👁️' : '🙈'}
            </button>
          </div>

          <label className="text-left w-full mb-1" htmlFor="confirmPassword">Confirmar Nueva Contraseña</label>
          <div className="relative w-full mb-4">
            <input
              id="confirmPassword"
              type={passwordVisible ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="p-2 rounded-md bg-gray-700 text-white w-full"
              required
            />
            <button type="button" className="absolute right-2 top-1/2 transform -translate-y-1/2" onClick={() => setPasswordVisible(!passwordVisible)}>
              {passwordVisible ? '👁️' : '🙈'}
            </button>
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Cambiar Contraseña
          </button>
        </form>
        <button
          className="mt-4 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
          onClick={onClose}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
