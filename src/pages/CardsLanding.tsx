import React from 'react';
import { Shirt, FileText, Calculator } from 'lucide-react';

const modules = [
  {
    title: 'Gestão de Produção',
    description: 'Controle de chão de fábrica, pedidos, fornecedores e status.',
    path: '/production',
    icon: <Shirt size={32} />,
    accent: 'text-sow-green',
    bg: 'bg-green-50',
    border: 'hover:border-sow-green',
  },
  {
    title: 'Ficha Técnica',
    description: 'Documentos técnicos padronizados para impressão e compartilhamento.',
    path: '/techpack',
    icon: <FileText size={32} />,
    accent: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'hover:border-blue-500',
  },
  {
    title: 'Gerador de Orçamento',
    description: 'Propostas comerciais com cálculo automático de Private Label.',
    path: '/quote',
    icon: <Calculator size={32} />,
    accent: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'hover:border-purple-500',
  },
];

const CardsLanding: React.FC = () => {
  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl space-y-8">
        <div className="text-center space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-green-500 font-semibold">Sow Brand</p>
          <h1 className="text-3xl sm:text-4xl font-black text-sow-dark">Selecione um módulo</h1>
          <p className="text-sm sm:text-base text-gray-500">Escolha abaixo o fluxo que deseja abrir.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {modules.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`group bg-white p-8 rounded-2xl shadow-sm border border-gray-200 transition-all duration-300 text-left hover:shadow-xl ${item.border} hover:-translate-y-1 flex flex-col items-center text-center`}
            >
              <div className={`w-16 h-16 ${item.bg} rounded-full flex items-center justify-center ${item.accent} mb-6 group-hover:scale-105 transition-transform`}>
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-sow-dark mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CardsLanding;

