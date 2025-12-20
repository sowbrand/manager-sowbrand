import React from 'react';

const Modules: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <h2 className="text-lg font-bold text-sow-dark mb-2">Módulos</h2>
      <p className="text-sm text-gray-600">
        Os cards foram movidos para a tela inicial após o login. Acesse pelo menu "Módulos" ou diretamente pela rota /home.
      </p>
    </div>
  );
};

export default Modules;

