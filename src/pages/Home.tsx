import React from 'react';
import { Shirt, FileText, Calculator } from 'lucide-react';

const modules = [
  {
    title: 'Gestão de Produção',
    description: 'Controle de chão de fábrica, pedidos, fornecedores e status.',
    icon: <Shirt size={28} />,
    path: '/production',
    accent: 'text-sow-green',
    bg: 'bg-green-50',
    border: 'hover:border-sow-green',
  },
  {
    title: 'Ficha Técnica',
    description: 'Documentos técnicos padronizados para impressão e compartilhamento.',
    icon: <FileText size={28} />,
    path: '/techpack',
    accent: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'hover:border-blue-500',
  },
  {
    title: 'Gerador de Orçamento',
    description: 'Propostas comerciais com cálculo automático de Private Label.',
    icon: <Calculator size={28} />,
    path: '/quote',
    accent: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'hover:border-purple-500',
  },
];

const Home: React.FC = () => {
  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <div className="min-h-full">
      <div className="bg-gradient-to-br from-sow-dark via-sow-dark to-black text-white rounded-2xl p-8 shadow-lg">
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.3em] text-green-300 font-semibold">Sow Brand</p>
          <h1 className="text-3xl sm:text-4xl font-black leading-tight">Hub de Ferramentas</h1>
          <p className="text-sm sm:text-base text-gray-200 max-w-2xl">
            Acesse rapidamente os módulos principais do manager: produção, ficha técnica e geração de orçamentos.
          </p>
        </div>
        <div className="mt-4">
          <button
            onClick={() => navigate('/modules')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-sow-dark text-sm font-semibold hover:bg-gray-100 transition-colors"
          >
            Ver página de módulos
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {modules.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`group bg-white p-6 rounded-2xl shadow-sm border border-gray-200 transition-all duration-300 text-left hover:shadow-xl ${item.border} hover:-translate-y-1`}
          >
            <div className={`w-14 h-14 ${item.bg} rounded-full flex items-center justify-center ${item.accent} mb-5 group-hover:scale-105 transition-transform`}>
              {item.icon}
            </div>
            <h3 className="text-lg font-bold text-sow-dark mb-2">{item.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Home;

